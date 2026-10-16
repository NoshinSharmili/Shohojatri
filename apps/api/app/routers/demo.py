"""Demo screening mode (SCREENING_SPEC §9): recorded sample sessions the browser replays through
the normal task upload, so the whole flow runs without a camera."""

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.deps import require_roles
from app.core.screening_results import TaskSlug
from app.models import Role, User
from app.schemas.screenings import CaptureQuality, DeviceInfo, TaskUpload
from app.seed.screening_fixtures import GOOD_ROOM, NOISY_ROOM, FixtureTask, Profile, fixture

router = APIRouter(tags=["demo"])

ParentUser = Annotated[User, Depends(require_roles(Role.parent))]

DEVICE = DeviceInfo(
    camera="front", device_type="laptop", width=640, height=480, fps=15, user_agent="demo replay"
)
# The light the browser would have measured: the noisy profile is filmed in a dim room.
MEAN_LUMA: dict[Profile, float] = {"typical": 128, "elevated": 128, "noisy": 48}


class DemoTask(BaseModel):
    """`upload` is posted unchanged to `POST /screenings/{id}/tasks/{task}`."""

    task: TaskSlug
    upload: TaskUpload


@router.get("/demo/screening-tasks/{fixture_task}", operation_id="getDemoTask")
def get_demo_task(
    fixture_task: FixtureTask, _: ParentUser, profile: Profile = "elevated"
) -> DemoTask:
    """A sample session for one activity. It holds no child data, so any parent may fetch it;
    the upload marks the screening as a demo. `elevated` by default (OPEN_QUESTIONS #13)."""
    session = fixture(profile, fixture_task)
    live = fixture_task == "joint_attention_live"
    room = NOISY_ROOM if profile == "noisy" else GOOD_ROOM
    return DemoTask(
        task="joint_attention" if live else fixture_task,  # type: ignore[arg-type]
        upload=TaskUpload(
            frames=list(session.frames),
            markers=list(session.markers),
            audio_events=list(session.audio_events),
            variant="live" if live else None,
            device=DEVICE,
            quality=CaptureQuality(mean_luma=MEAN_LUMA[profile], noise_db=room.background_db),
            demo=True,
        ),
    )
