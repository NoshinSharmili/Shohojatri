"""Write the synthetic screening sessions (app/seed/screening_fixtures.py) as JSON task
payloads, one file per profile and task, for inspecting the payload shape or replaying them
by hand. Tests and demo mode build the same sessions in memory.

    cd apps/api && uv run python -m scripts.make_fixtures [--out fixtures/screening]
"""

import argparse
import json
from pathlib import Path

from app.seed.screening_fixtures import FIXTURE_TASKS, PROFILES, fixture


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", type=Path, default=Path("fixtures/screening"))
    args = parser.parse_args()
    for profile in PROFILES:
        folder = args.out / profile
        folder.mkdir(parents=True, exist_ok=True)
        for task in FIXTURE_TASKS:
            path = folder / f"{task}.json"
            data = fixture(profile, task).to_json()
            path.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
            print(f"{path}  {len(data['frames'])} frames")


if __name__ == "__main__":
    main()
