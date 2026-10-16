"""Names shared by the config, the detectors and the stored result."""

from enum import StrEnum


class TaskName(StrEnum):
    rtn = "rtn"
    joint_attention = "joint_attention"
    imitation = "imitation"
    gaze_preference = "gaze_preference"
    free_play = "free_play"


class RiskClass(StrEnum):
    """In ascending order: floors compare by position."""

    low = "low"
    moderate = "moderate"
    elevated = "elevated"
    high = "high"

    @property
    def rank(self) -> int:
        return list(RiskClass).index(self)
