import datetime
from typing import Tuple

def compute_sla_metrics(received_on: datetime.date, status_code: str) -> Tuple[int, str, bool, str]:
    """
    Returns: (age_days, aging_bucket, is_sla_breached, next_action_due)
    """
    today = datetime.date.today()
    age_days = (today - received_on).days
    if age_days < 0:
        age_days = 0

    if age_days <= 15:
        aging_bucket = "< 15 Days"
    elif age_days <= 30:
        aging_bucket = "15-30 Days"
    elif age_days <= 60:
        aging_bucket = "30-60 Days"
    else:
        aging_bucket = "> 60 Days (Breached)"

    # Statutory SLA for AICTE grievances is 45 calendar days
    is_breached = (age_days > 45) and (status_code not in ["DISPOSED", "TRANSFERRED"])

    if status_code == "PENDING":
        next_action = "Initial Scrutiny & Bureau Verification"
    elif status_code == "UNDER_PROCESS":
        next_action = "Fact-Finding Hearing / Joint Coordination Review"
    elif status_code == "ESCALATED":
        next_action = "Competent Authority / SAC Final Determination"
    elif status_code == "DISPOSED":
        next_action = "Disposal Order Issued & Digitally Archived"
    elif status_code == "TRANSFERRED":
        next_action = "Awaiting Transferee Bureau Intake Acknowledgment"
    else:
        next_action = "Action Pending Assignment"

    return age_days, aging_bucket, is_breached, next_action
