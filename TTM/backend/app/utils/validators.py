from email_validator import validate_email, EmailNotValidError


def is_valid_email(email: str) -> tuple[bool, str]:
    """Validate email format"""
    try:
        valid = validate_email(email)
        return True, valid.email
    except EmailNotValidError as e:
        return False, str(e)
