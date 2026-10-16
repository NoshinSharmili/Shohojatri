from datetime import date, datetime, timedelta, timezone

# Every user is in Bangladesh, which has no daylight saving, so a fixed offset is exact.
BD_TZ = timezone(timedelta(hours=6))


def today_bd() -> date:
    """Today's date for the user, whatever the server's own timezone."""
    return datetime.now(BD_TZ).date()


def age_in_months(dob: date, today: date) -> int:
    """Completed months, as a parent counts them: 15 Dec → 14 Feb is 1 month, → 15 Feb is 2."""
    months = (today.year - dob.year) * 12 + (today.month - dob.month)
    if today.day < dob.day:
        months -= 1
    return max(months, 0)
