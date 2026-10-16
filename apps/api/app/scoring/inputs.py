"""What the browser sends for a task (SCREENING_SPEC §4.1): per-frame features, markers and
audio events. Plain data; validated at the API boundary and read by the detectors.

Coordinates are image coordinates as captured (un-mirrored): x right, y down, 0-1.
Sign conventions the detectors rely on (lib/cv/README.md documents how they were verified):
- `yaw` > 0 when the child turns toward their own right. In an un-mirrored frame of a camera
  facing the child, that moves the nose toward image left, so `nose_dx` < 0.
- `iris_x` > 0 when the irises sit toward image right within the eyes.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict

Side = Literal["left", "right"]
# x, y (normalised image coordinates) and MediaPipe visibility 0-1.
Keypoint = tuple[float, float, float]


class _Input(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")


class Pose(_Input):
    nose: Keypoint | None = None
    l_ear: Keypoint | None = None
    r_ear: Keypoint | None = None
    l_shoulder: Keypoint | None = None
    r_shoulder: Keypoint | None = None
    l_elbow: Keypoint | None = None
    r_elbow: Keypoint | None = None
    l_wrist: Keypoint | None = None
    r_wrist: Keypoint | None = None
    l_hip: Keypoint | None = None
    r_hip: Keypoint | None = None


class Frame(_Input):
    t: float  # ms since task start
    face: bool = False
    yaw: float | None = None  # degrees
    pitch: float | None = None
    nose_dx: float | None = None
    iris_x: float | None = None
    iris_y: float | None = None
    eye_open: float | None = None
    iod: float | None = None
    pose: Pose | None = None
    # RMS of the most recent 50 ms of audio at this frame, dBFS.
    rms_db: float | None = None


MarkerType = Literal[
    "prompt",  # rtn: "Call [name] now" shown (trial, pre_state)
    "engage",  # joint_attention on-screen: engage phase starts (trial, side)
    "cue",  # joint_attention: on-screen cue / live tap on the toy's side (trial, side)
    "response_window",  # imitation: response window opens (action, attempt)
    "target",  # calibration: star moves to a position (position)
    "stimulus",  # gaze_preference: stimulus starts or sides swap (social_side)
    "end",  # end of the stimulus / task
    "something_wrong",  # parent tapped "Something went wrong" (trial or action)
]


class Marker(_Input):
    """One event in the task's timeline. Which fields are set depends on `type` (above)."""

    t: float
    type: MarkerType
    trial: int | None = None
    side: Side | None = None  # target side: screen side as the child sees it, or image side (live)
    pre_state: Literal["away", "facing"] | None = None
    action: Literal["arms_up", "clap", "wave", "touch_head"] | None = None
    attempt: int | None = None
    position: Literal["left", "centre", "right"] | None = None
    social_side: Side | None = None


class AudioEvent(_Input):
    """A YAMNet class for one 1-s window."""

    t: float
    label: str
    score: float
