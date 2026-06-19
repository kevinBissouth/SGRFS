from email.message import EmailMessage
from html import escape
import smtplib
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from backend.core.config import settings


router = APIRouter(prefix="/contact", tags=["contact"])


class ContactMessage(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=80)
    lastName: str = Field(..., min_length=1, max_length=80)
    email: str = Field(..., min_length=3, max_length=254)
    phone: str | None = Field(default="", max_length=40)
    message: str = Field(..., min_length=5, max_length=3000)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            raise ValueError("Adresse email invalide")
        return email


def _require_smtp_config():
    missing = [
        key
        for key, value in {
            "SMTP_HOST": settings.SMTP_HOST,
            "SMTP_USERNAME": settings.SMTP_USERNAME,
            "SMTP_PASSWORD": settings.SMTP_PASSWORD,
        }.items()
        if not value
    ]
    if missing:
        raise HTTPException(
            status_code=503,
            detail=f"Configuration email manquante: {', '.join(missing)}",
        )


def _build_plain_text(payload: ContactMessage, full_name: str) -> str:
    return "\n".join(
        [
            "SGRFS - Nouveau message de contact",
            "",
            "Un nouveau message a ete envoye depuis le formulaire de contact.",
            "",
            "EXPEDITEUR",
            f"Nom complet : {full_name}",
            f"Email       : {payload.email}",
            f"Telephone   : {payload.phone or 'Non renseigne'}",
            "",
            "MESSAGE",
            "--------------------------------------------------",
            payload.message.strip(),
            "--------------------------------------------------",
            "",
            f"Pour repondre, utilisez directement l'adresse : {payload.email}",
            "Message automatique envoye depuis la plateforme SGRFS.",
        ]
    )


def _build_html(payload: ContactMessage, full_name: str) -> str:
    safe_name = escape(full_name)
    safe_email = escape(str(payload.email))
    safe_phone = escape(payload.phone or "Non renseigne")
    safe_message = escape(payload.message.strip()).replace("\n", "<br />")
    mailto_link = f"mailto:{safe_email}"

    return f"""\
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nouveau message SGRFS</title>
  </head>
  <body style="margin:0;padding:0;background:#eff6ff;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#eff6ff;padding:34px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe3ef;box-shadow:0 22px 60px rgba(17,24,39,0.12);">
            <tr>
              <td style="background:#1d4ed8;padding:0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:30px 34px 28px;color:#ffffff;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:#dbeafe;">Plateforme SGRFS</p>
                            <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:800;color:#ffffff;">Nouveau message de contact</h1>
                            <p style="margin:12px 0 0;max-width:520px;font-size:14px;line-height:1.7;color:#eff6ff;">Un visiteur vient d'envoyer une demande depuis le formulaire de contact. Les informations utiles sont rassemblees ci-dessous.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:30px 34px 8px;">
                <p style="margin:0 0 16px;font-size:12px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;">Expediteur</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 12px;">
                  <tr>
                    <td style="width:138px;padding:13px 16px;background:#f8fafc;border:1px solid #e5e7eb;border-right:0;border-radius:12px 0 0 12px;font-size:12px;font-weight:800;color:#64748b;text-transform:uppercase;">Nom</td>
                    <td style="padding:13px 16px;background:#ffffff;border:1px solid #e5e7eb;border-left:0;border-radius:0 12px 12px 0;font-size:15px;font-weight:700;color:#111827;">{safe_name}</td>
                  </tr>
                  <tr>
                    <td style="width:138px;padding:13px 16px;background:#f8fafc;border:1px solid #e5e7eb;border-right:0;border-radius:12px 0 0 12px;font-size:12px;font-weight:800;color:#64748b;text-transform:uppercase;">Email</td>
                    <td style="padding:13px 16px;background:#ffffff;border:1px solid #e5e7eb;border-left:0;border-radius:0 12px 12px 0;font-size:15px;font-weight:700;color:#1d4ed8;"><a href="{mailto_link}" style="color:#1d4ed8;text-decoration:none;">{safe_email}</a></td>
                  </tr>
                  <tr>
                    <td style="width:138px;padding:13px 16px;background:#f8fafc;border:1px solid #e5e7eb;border-right:0;border-radius:12px 0 0 12px;font-size:12px;font-weight:800;color:#64748b;text-transform:uppercase;">Telephone</td>
                    <td style="padding:13px 16px;background:#ffffff;border:1px solid #e5e7eb;border-left:0;border-radius:0 12px 12px 0;font-size:15px;font-weight:700;color:#111827;">{safe_phone}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 34px 32px;">
                <p style="margin:0 0 14px;font-size:12px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;">Message</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #bfdbfe;border-left:5px solid #2563eb;border-radius:14px;">
                  <tr>
                    <td style="padding:20px 22px;font-size:15px;line-height:1.75;color:#1f2937;">
                      {safe_message}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 34px 34px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="background:#1d4ed8;border-radius:10px;">
                      <a href="{mailto_link}" style="display:inline-block;padding:13px 20px;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;">Repondre a ce message</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 34px;background:#f8fafc;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;">La reponse sera adressee a <strong style="color:#111827;">{safe_email}</strong>. Ce message a ete genere automatiquement depuis le formulaire de contact SGRFS.</p>
                <p style="margin:8px 0 0;font-size:11px;line-height:1.6;color:#94a3b8;">Merci de traiter cette demande depuis votre messagerie institutionnelle.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


@router.post("/send")
def send_contact_message(payload: ContactMessage):
    _require_smtp_config()

    sender = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
    full_name = f"{payload.firstName.strip()} {payload.lastName.strip()}".strip()

    email = EmailMessage()
    email["Subject"] = f"[SGRFS] Nouveau message de contact - {full_name}"
    email["From"] = sender
    email["To"] = settings.CONTACT_RECIPIENT_EMAIL
    email["Reply-To"] = str(payload.email)

    email.set_content(_build_plain_text(payload, full_name))
    email.add_alternative(_build_html(payload, full_name), subtype="html")

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(email)
    except smtplib.SMTPException as exc:
        raise HTTPException(
            status_code=502,
            detail="Impossible d'envoyer l'email pour le moment.",
        ) from exc
    except OSError as exc:
        raise HTTPException(
            status_code=502,
            detail="Serveur SMTP injoignable pour le moment.",
        ) from exc

    return {"message": "Message envoye avec succes."}
