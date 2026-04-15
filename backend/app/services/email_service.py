import random
import smtplib
import string
from datetime import datetime, timedelta, timezone
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import OTPCode


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def create_and_send_otp(db: Session, email: str, purpose: str = "register") -> None:
    """Generate a 6-digit OTP, store it, and email it to the user."""
    # Invalidate previous unused codes for this email + purpose
    db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.purpose == purpose,
        OTPCode.used == False,
    ).update({"used": True})

    code = generate_otp()
    otp = OTPCode(
        email=email,
        code=code,
        purpose=purpose,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    db.add(otp)
    db.commit()

    _send_otp_email(email, code, purpose)


def verify_otp(db: Session, email: str, code: str, purpose: str = "register") -> bool:
    """Check if the OTP is valid and mark it as used."""
    otp = (
        db.query(OTPCode)
        .filter(
            OTPCode.email == email,
            OTPCode.code == code,
            OTPCode.purpose == purpose,
            OTPCode.used == False,
        )
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    if otp is None:
        return False
    if otp.expires_at < datetime.now(timezone.utc):
        return False
    otp.used = True
    db.commit()
    return True


def _send_otp_email(to_email: str, code: str, purpose: str) -> None:
    """Send the OTP code via SMTP."""
    subject = "Your BuildFlow verification code"

    purpose_text = "Enter this code to verify your account" if purpose == "register" else "Enter this code to log in"

    # Gmail strips <link> and <style> tags, so web fonts cannot load.
    # Use the best system font stack that visually matches Plus Jakarta Sans.
    F = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"

    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;font-family:{F};-webkit-font-smoothing:antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-image:url(cid:email_bg);background-size:cover;background-position:center;background-color:#faf9ff;font-family:{F};">
        <tr><td style="height:56px;"></td></tr>
        <tr>
          <td align="center" style="padding:0 24px;">
            <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;font-family:{F};">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom:48px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:10px;">
                        <img src="cid:buildflow_logo" width="36" height="36" alt="BuildFlow" style="display:block;border-radius:9px;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <span style="font-family:{F};font-size:20px;font-weight:800;color:#1e1b4b;letter-spacing:-0.5px;">Bu</span><span style="font-family:{F};font-size:20px;font-weight:800;color:#2d1a6e;letter-spacing:-0.5px;">il</span><span style="font-family:{F};font-size:20px;font-weight:800;color:#3f1d88;letter-spacing:-0.5px;">dF</span><span style="font-family:{F};font-size:20px;font-weight:800;color:#4c1d95;letter-spacing:-0.5px;">lo</span><span style="font-family:{F};font-size:20px;font-weight:800;color:#0369a1;letter-spacing:-0.5px;">w</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Thin gradient accent line -->
              <tr>
                <td style="padding:0 60px;">
                  <div style="height:2px;background:linear-gradient(90deg,#7c3aed,#0ea5e9);border-radius:2px;"></div>
                </td>
              </tr>

              <!-- Purpose text -->
              <tr>
                <td align="center" style="padding:40px 0 12px 0;">
                  <p style="font-family:{F};font-size:14px;color:#64748b;margin:0;font-weight:500;">
                    {purpose_text}
                  </p>
                </td>
              </tr>

              <!-- OTP Code — raw digits, letter-spacing for visual gaps, copies clean -->
              <tr>
                <td align="center" style="padding:16px 0 40px 0;">
                  <span style="font-family:{F};font-size:44px;font-weight:800;letter-spacing:18px;color:#1e1b4b;">{code}</span>
                </td>
              </tr>

              <!-- Expires note -->
              <tr>
                <td align="center" style="padding:0 40px 56px 40px;">
                  <p style="font-family:{F};font-size:12px;color:#94a3b8;margin:0;line-height:1.6;font-weight:400;">
                    This code expires in 10 minutes.<br/>If you didn't request this, you can safely ignore it.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding:0 0 48px 0;">
                  <p style="font-family:{F};font-size:11px;color:#c4b5fd;margin:0;font-weight:500;">
                    &copy; BuildFlow &mdash; AI Project Mentor
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    # Build MIME: related > alternative > (plain + html) + inline image
    msg = MIMEMultipart("related")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from_email or settings.smtp_user
    msg["To"] = to_email

    alt = MIMEMultipart("alternative")
    alt.attach(MIMEText(f"Your verification code is: {code}", "plain"))
    alt.attach(MIMEText(body_html, "html"))
    msg.attach(alt)

    # Attach logo as inline CID image
    logo_path = Path(__file__).resolve().parent.parent / "static" / "logo.png"
    with open(logo_path, "rb") as f:
        logo_img = MIMEImage(f.read(), _subtype="png")
    logo_img.add_header("Content-ID", "<buildflow_logo>")
    logo_img.add_header("Content-Disposition", "inline", filename="logo.png")
    msg.attach(logo_img)

    # Attach background as inline CID image
    bg_path = Path(__file__).resolve().parent.parent / "static" / "email_bg.jpg"
    with open(bg_path, "rb") as f:
        bg_img = MIMEImage(f.read(), _subtype="jpeg")
    bg_img.add_header("Content-ID", "<email_bg>")
    bg_img.add_header("Content-Disposition", "inline", filename="email_bg.jpg")
    msg.attach(bg_img)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(msg["From"], [to_email], msg.as_string())
