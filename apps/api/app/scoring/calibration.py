"""Gaze calibration for front-camera tasks (SCREENING_SPEC §4.3). Fitted here, not in the
browser, so the gaze tasks and their tests share one implementation; the API returns the status
so the browser can retry once."""

from collections.abc import Sequence
from statistics import median
from typing import Literal

import numpy as np
from pydantic import BaseModel, ConfigDict

from app.scoring.config import ScoringConfig
from app.scoring.inputs import Frame, Marker
from app.scoring.signals import Timeline

TARGETS = {"left": -1.0, "centre": 0.0, "right": 1.0}


class Calibration(BaseModel):
    """gaze_x = a·yaw + b·iris_x + c in screen space (-1 = screen left as the child sees it).
    `fallback` means gaze_x = yaw / fallback_yaw_deg, clamped, and gaze tasks are low quality."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    status: Literal["ok", "fallback"]
    a: float = 0.0
    b: float = 0.0
    c: float = 0.0
    reason: Literal["face_not_visible", "wrong_direction", "missing_targets"] | None = None


FALLBACK = Calibration(status="fallback")


def fit_calibration(
    frames: Sequence[Frame], markers: Sequence[Marker], cfg: ScoringConfig
) -> Calibration:
    c = cfg.calibration
    tl = Timeline(frames, cfg.signals)
    starts = sorted((m for m in markers if m.type == "target" and m.position), key=lambda m: m.t)
    if {m.position for m in starts} != set(TARGETS):
        return FALLBACK.model_copy(update={"reason": "missing_targets"})

    rows: list[tuple[float, float, float, float]] = []  # yaw, iris_x, nose_dx, target
    for i, marker in enumerate(starts):
        end = starts[i + 1].t if i + 1 < len(starts) else marker.t + c.segment_ms
        tail = [f for f in tl.between(end - c.median_ms, end) if f.face and f.yaw is not None]
        if not tail or tl.share(lambda f: f.face, marker.t, end) < c.min_face_share:
            return FALLBACK.model_copy(update={"reason": "face_not_visible"})
        assert marker.position is not None
        rows.append(
            (
                median(f.yaw for f in tail if f.yaw is not None),
                median(f.iris_x or 0.0 for f in tail),
                median(f.nose_dx or 0.0 for f in tail),
                TARGETS[marker.position],
            )
        )

    left = [r for r in rows if r[3] < 0]
    right = [r for r in rows if r[3] > 0]
    # Looking to screen left (the child's own left) turns the head toward image right on the
    # front camera (nose_dx up) or moves the irises toward image right (iris_x up).
    head = median(r[2] for r in left) > median(r[2] for r in right)
    eyes = median(r[1] for r in left) > median(r[1] for r in right)
    if not (head or eyes):
        return FALLBACK.model_copy(update={"reason": "wrong_direction"})

    data = np.array(rows)
    design = np.column_stack([data[:, 0], data[:, 1], np.ones(len(data))])
    (a, b, offset), *_ = np.linalg.lstsq(design, data[:, 3], rcond=None)
    fitted = Calibration(status="ok", a=float(a), b=float(b), c=float(offset))
    if gaze_x(_point(left), fitted, cfg) >= gaze_x(_point(right), fitted, cfg):
        return FALLBACK.model_copy(update={"reason": "wrong_direction"})
    return fitted


def _point(rows: list[tuple[float, float, float, float]]) -> Frame:
    return Frame(t=0, face=True, yaw=median(r[0] for r in rows), iris_x=median(r[1] for r in rows))


def gaze_x(frame: Frame, calibration: Calibration, cfg: ScoringConfig) -> float | None:
    """Screen-space horizontal gaze, or None when the face wasn't tracked."""
    if not frame.face or frame.yaw is None:
        return None
    if calibration.status == "fallback":
        return max(-1.0, min(1.0, frame.yaw / cfg.calibration.fallback_yaw_deg))
    return calibration.a * frame.yaw + calibration.b * (frame.iris_x or 0.0) + calibration.c
