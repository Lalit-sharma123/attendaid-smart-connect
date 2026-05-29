import smtplib
from email.message import EmailMessage

from app.core.config import get_settings


def send_email(to_email: str, subject: str, body: str):
    settings = get_settings()

    if not settings.SMTP_USERNAME:
        raise RuntimeError("SMTP_USERNAME is empty in .env")

    if not settings.SMTP_PASSWORD:
        raise RuntimeError("SMTP_PASSWORD is empty in .env")

    if not settings.SMTP_FROM_EMAIL:
        raise RuntimeError("SMTP_FROM_EMAIL is empty in .env")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, int(settings.SMTP_PORT), timeout=30) as smtp:
            smtp.set_debuglevel(1)
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(msg)

        print(f"OTP email sent successfully to {to_email}")

    except Exception as e:
        print("SMTP EMAIL ERROR:", repr(e))
        raise RuntimeError(f"Failed to send email: {e}") from e
