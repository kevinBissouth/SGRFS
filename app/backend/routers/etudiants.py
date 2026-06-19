"""
Router `etudiant` - endpoints and simple helpers.
Principles applied: KISS, DRY, minimal comments.
"""
import asyncio
from datetime import date
from email.message import EmailMessage
from html import escape
import re
import secrets
import smtplib
import time
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.core.config import settings
from backend.modeles.modeles import Etudiant, Login_request_etudiant, Profils_etudiants
from backend.routers import utils


router = APIRouter(prefix="/etudiant", tags=["etudiant"])

NAME_RE = re.compile(r"^(?=.*[A-Za-zÀ-ÖØ-öø-ÿ])[\wÀ-ÖØ-öø-ÿ' -]{2,100}$", re.UNICODE)
MATRICULE_RE = re.compile(r"^\d{2}[A-Z]{1,4}\d{4}FS$", re.IGNORECASE)
PHONE_RE = re.compile(r"^(?:\+?237)?6[2-9]\d{7}$")
PASSWORD_RE = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$")
VERIFICATION_TTL_SECONDS = 10 * 60
CAPTCHA_TTL_SECONDS = 5 * 60
REGISTRATION_RATE_LIMIT_SECONDS = 60

_pending_registrations: dict[str, dict] = {}
_captcha_challenges: dict[str, dict] = {}
_registration_rate_limits: dict[str, float] = {}


class RegistrationStartRequest(BaseModel):
    etudiant: Etudiant


class CaptchaVerifyRequest(BaseModel):
    token: str
    answer: str


class RegistrationVerifyRequest(BaseModel):
    verification_token: str
    code: str
    captcha: CaptchaVerifyRequest


def _format_student_row(row):
    return {
        "id_etudiant": row[0],
        "matricule": row[1],
        "nom": row[2],
        "prenom": row[3],
        "date_naissance": row[4],
        "email": row[6],
        "telephone": row[7],
        "id_niveau": {"filiere": row[9], "niveau": row[10]},
        "profil": {
            "niveau_rattrape": row[12] if row[12] else "Non défini",
            "poste_campus": row[13] if row[13] else "Non défini",
        },
    }


def _normalize_phone(phone: int | str) -> str:
    digits = re.sub(r"\D", "", str(phone))
    return digits[3:] if digits.startswith("237") else digits


def _validate_registration_data(etudiant: Etudiant):
    matricule = etudiant.matricule.strip().upper()
    email = str(etudiant.email).strip().lower()
    phone = _normalize_phone(etudiant.telephone)
    today = date.today()
    min_birth_date = date(today.year - 15, today.month, today.day)

    if not NAME_RE.match(etudiant.nom.strip()):
        raise HTTPException(status_code=422, detail="Le nom doit contenir au moins une lettre et ne peut pas etre uniquement numerique.")
    if not NAME_RE.match(etudiant.prenom.strip()):
        raise HTTPException(status_code=422, detail="Le prenom doit contenir au moins une lettre et ne peut pas etre uniquement numerique.")
    if etudiant.date_naissance > min_birth_date:
        raise HTTPException(status_code=422, detail="L'age doit etre superieur ou egal a 15 ans.")
    if not MATRICULE_RE.match(matricule):
        raise HTTPException(status_code=422, detail="Le matricule doit respecter le format annee + lettres + 4 chiffres + FS, ex: 24I0013FS.")
    if not PHONE_RE.match(phone):
        raise HTTPException(status_code=422, detail="Entrez un numero camerounais valide, ex: 690000000 ou +237690000000.")
    if not PASSWORD_RE.match(etudiant.mot_de_passe):
        raise HTTPException(status_code=422, detail="Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule et un chiffre.")
    if utils.query_one("SELECT 1 FROM etudiants WHERE LOWER(matricule)=LOWER(%s)", (matricule,)):
        raise HTTPException(status_code=409, detail="Ce matricule est deja utilise.")
    if utils.query_one("SELECT 1 FROM etudiants WHERE LOWER(email)=LOWER(%s)", (email,)):
        raise HTTPException(status_code=409, detail="Cet email est deja utilise.")


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


def _check_registration_rate_limit(email: str):
    now = time.time()
    if email in _registration_rate_limits:
        if _registration_rate_limits[email] > now:
            raise HTTPException(
                status_code=429,
                detail="Trop de tentatives d'inscription. Veuillez patienter quelques instants avant de reessayer.",
            )
        _registration_rate_limits.pop(email, None)


def _send_registration_code(email_address: str, full_name: str, code: str):
    _require_smtp_config()
    sender = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
    safe_full_name = escape(full_name)

    message = EmailMessage()
    message["Subject"] = "Code de verification SGRFS"
    message["From"] = sender
    message["To"] = email_address
    message.set_content(
        "\n".join(
            [
                "SGRFS - Verification de votre inscription",
                "",
                f"Bonjour {full_name},",
                "",
                f"Votre code de verification est : {code}",
                "Ce code expire dans 10 minutes.",
                "",
                "Si vous n'etes pas a l'origine de cette demande, ignorez ce message.",
            ]
        )
    )
    message.add_alternative(
        f"""\
<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#eff6ff;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eff6ff;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dbeafe;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#1d4ed8;padding:24px 28px;color:#ffffff;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#dbeafe;">Plateforme SGRFS</p>
                <h1 style="margin:0;font-size:22px;line-height:1.3;">Verification de votre inscription</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Bonjour <strong>{safe_full_name}</strong>,</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Saisissez ce code pour confirmer que cette adresse email vous appartient.</p>
                <div style="padding:18px 20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;text-align:center;font-size:30px;font-weight:800;letter-spacing:8px;color:#1d4ed8;">{code}</div>
                <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#64748b;">Ce code expire dans 10 minutes. Si vous n'etes pas a l'origine de cette demande, ignorez ce message.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
""",
        subtype="html",
    )

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    except smtplib.SMTPException as exc:
        raise HTTPException(status_code=502, detail="Impossible d'envoyer le code de verification.") from exc
    except OSError as exc:
        raise HTTPException(status_code=502, detail="Serveur SMTP injoignable pour le moment.") from exc


def _cleanup_expired_entries():
    now = time.time()
    for token, item in list(_pending_registrations.items()):
        if item["expires_at"] <= now:
            _pending_registrations.pop(token, None)
    for token, item in list(_captcha_challenges.items()):
        if item["expires_at"] <= now:
            _captcha_challenges.pop(token, None)
    for email, allowed_at in list(_registration_rate_limits.items()):
        if allowed_at <= now:
            _registration_rate_limits.pop(email, None)


def _verify_captcha(captcha: CaptchaVerifyRequest):
    challenge = _captcha_challenges.pop(captcha.token, None)
    if not challenge or challenge["expires_at"] <= time.time():
        raise HTTPException(status_code=400, detail="La verification anti-robot a expire. Rechargez le challenge.")
    if not secrets.compare_digest(str(captcha.answer).strip(), str(challenge["answer"])):
        raise HTTPException(status_code=400, detail="La verification anti-robot est incorrecte.")


# --- (pure functions) ------------------------------------
def login_etudiant(matricule: str, mot_de_passe: str):
    row = utils.query_one(
        """
        SELECT e.*, f.nom AS filieres, n.niveau AS niveaux, p.*
        FROM etudiants e
        JOIN niveaux n ON e.id_niveau = n.id_niveau
        JOIN filieres f ON n.id_filiere = f.id_filiere
        LEFT JOIN profils_etudiants p ON e.id_etudiant = p.id_etudiant
        WHERE LOWER(e.matricule) = LOWER(%s)
        """,
        (matricule,)
    )
    if not row or not utils.verify_password(mot_de_passe, row[8]):
        raise ValueError("Matricule ou mot de passe incorrect")
    return _format_student_row(row)


def ajouter_etudiant(etudiant: Etudiant):
    matricule = etudiant.matricule.strip().upper()
    email = str(etudiant.email).strip().lower()
    telephone = _normalize_phone(etudiant.telephone)

    if utils.query_one("SELECT 1 FROM etudiants WHERE LOWER(matricule)=LOWER(%s)", (matricule,)):
        return {"error": "Ce matricule est deja utilise."}
    if utils.query_one("SELECT 1 FROM etudiants WHERE LOWER(email)=LOWER(%s)", (email,)):
        return {"error": "Cet email est deja utilise."}

    hashed = utils.hash_password(etudiant.mot_de_passe)
    try:
        utils.execute_commit(
            "INSERT INTO etudiants(matricule, nom, prenom, date_naissance, email, mot_de_passe, telephone, id_niveau) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (matricule, etudiant.nom.strip(), etudiant.prenom.strip(), etudiant.date_naissance.isoformat(), email, hashed, telephone, etudiant.id_niveau),
        )
        utils.execute_commit(
            "INSERT INTO profils_etudiants (id_etudiant) SELECT id_etudiant FROM etudiants WHERE matricule = %s",
            (matricule,)
        )
    except Exception:
        return {"error": "Erreur lors de l'inscription."}
    return None


def recuperer_tous_les_etudiants():
    rows = utils.query_all(
        "SELECT e.*, f.nom AS filieres, n.niveau AS niveaux, p.* FROM etudiants e JOIN niveaux n ON e.id_niveau = n.id_niveau JOIN filieres f ON n.id_filiere = f.id_filiere LEFT JOIN profils_etudiants p ON e.id_etudiant = p.id_etudiant"
    )
    return [_format_student_row(r) for r in rows]


def recuperer_etudiant_par_id(etudiant_id: int) -> Optional[dict]:
    row = utils.query_one(
        "SELECT e.*, f.nom AS filieres, n.niveau AS niveaux, p.* FROM etudiants e JOIN niveaux n ON e.id_niveau = n.id_niveau JOIN filieres f ON n.id_filiere = f.id_filiere LEFT JOIN profils_etudiants p ON e.id_etudiant = p.id_etudiant WHERE e.id_etudiant = %s",
        (etudiant_id,)
    )
    return _format_student_row(row) if row else None


def recuperer_etudiant_par_matricule(matricule: str) -> Optional[dict]:
    row = utils.query_one(
        "SELECT e.*, f.nom AS filieres, n.niveau AS niveaux, p.* FROM etudiants e JOIN niveaux n ON e.id_niveau = n.id_niveau JOIN filieres f ON n.id_filiere = f.id_filiere LEFT JOIN profils_etudiants p ON e.id_etudiant = p.id_etudiant WHERE LOWER(e.matricule) = LOWER(%s)",
        (matricule,)
    )
    return _format_student_row(row) if row else None


def modifier_etudiant(etudiant_id: int, etudiant: Etudiant):
    matricule = etudiant.matricule.strip().upper()
    email = str(etudiant.email).strip().lower()
    telephone = _normalize_phone(etudiant.telephone)
    hashed = utils.hash_password(etudiant.mot_de_passe)
    utils.execute_commit(
        "UPDATE etudiants SET matricule=%s, nom=%s, prenom=%s, date_naissance=%s, email=%s, mot_de_passe=%s, telephone=%s, id_niveau=%s WHERE id_etudiant=%s",
        (matricule, etudiant.nom.strip(), etudiant.prenom.strip(), etudiant.date_naissance.isoformat(), email, hashed, telephone, etudiant.id_niveau, etudiant_id),
    )


def supprimer_etudiant(etudiant_id: int):
    utils.execute_commit("DELETE FROM etudiants WHERE id_etudiant = %s", (etudiant_id,))


def create_profil(profil: Profils_etudiants):
    utils.execute_commit("INSERT INTO profils_etudiants (id_etudiant, niveau_2, poste) VALUES (%s,%s,%s)", (profil.id_etudiant, profil.niveau_2, profil.poste))
    return {"message": "Profil créé avec succès"}


def update_profil(profil: Profils_etudiants):
    utils.execute_commit("UPDATE profils_etudiants SET niveau_2=%s, poste=%s WHERE id_etudiant=%s", (profil.niveau_2, profil.poste, profil.id_etudiant))
    return {"message": "Profil mis à jour"}


def get_profil_student_details(id_etudiant: int):
    row = utils.query_one("SELECT n.niveau, poste FROM profils_etudiants p JOIN niveaux n ON n.id_niveau = p.niveau_2 WHERE id_etudiant = %s", (id_etudiant,))
    if not row:
        return None
    return {"niveau_2": row[0] if row[0] else "Non defini", "poste": row[1] if row[1] else "Non defini"}


# --- Endpoints -----------------------------------------------------------
@router.get("/profil/{id_etudiant}")
async def get_profile(id_etudiant: int):
    profil = get_profil_student_details(id_etudiant)
    if not profil:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    return profil


@router.post("/profil/")
async def create_profile(profil: Profils_etudiants):
    return create_profil(profil)


@router.put("/profil/")
async def update_profile(profil: Profils_etudiants):
    return update_profil(profil)


@router.post("/add_student/")
async def creer_Etudiant(etudiant: Etudiant):
    _validate_registration_data(etudiant)
    message = ajouter_etudiant(etudiant)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "Etudiant ajouté avec succès."}


@router.post("/registration/start")
async def start_registration(data: RegistrationStartRequest):
    _cleanup_expired_entries()
    etudiant = data.etudiant
    _validate_registration_data(etudiant)

    token = secrets.token_urlsafe(32)
    code = f"{secrets.randbelow(900000) + 100000}"
    full_name = f"{etudiant.prenom.strip()} {etudiant.nom.strip()}".strip()
    email = str(etudiant.email).strip().lower()

    _check_registration_rate_limit(email)
    _send_registration_code(email, full_name, code)
    _registration_rate_limits[email] = time.time() + REGISTRATION_RATE_LIMIT_SECONDS
    _pending_registrations[token] = {
        "etudiant": etudiant,
        "code": code,
        "expires_at": time.time() + VERIFICATION_TTL_SECONDS,
        "attempts": 0,
    }

    return {
        "verification_token": token,
        "expires_in": VERIFICATION_TTL_SECONDS,
        "message": "Un code de verification a ete envoye a votre adresse email.",
    }


@router.get("/registration/captcha")
async def get_registration_captcha():
    _cleanup_expired_entries()
    a = secrets.randbelow(8) + 2
    b = secrets.randbelow(8) + 2
    token = secrets.token_urlsafe(24)
    _captcha_challenges[token] = {
        "answer": a + b,
        "expires_at": time.time() + CAPTCHA_TTL_SECONDS,
    }
    return {
        "token": token,
        "question": f"{a} + {b} = ?",
        "expires_in": CAPTCHA_TTL_SECONDS,
    }


@router.post("/registration/verify")
async def verify_registration(data: RegistrationVerifyRequest):
    _cleanup_expired_entries()
    pending = _pending_registrations.get(data.verification_token)
    if not pending or pending["expires_at"] <= time.time():
        _pending_registrations.pop(data.verification_token, None)
        raise HTTPException(status_code=400, detail="Le code de verification a expire. Recommencez l'inscription.")

    pending["attempts"] += 1
    if pending["attempts"] > 5:
        _pending_registrations.pop(data.verification_token, None)
        raise HTTPException(status_code=429, detail="Trop de tentatives. Recommencez l'inscription.")

    if str(data.code).strip() != pending["code"]:
        raise HTTPException(status_code=400, detail="Code de verification incorrect.")

    _verify_captcha(data.captcha)

    etudiant = pending["etudiant"]
    _validate_registration_data(etudiant)
    message = ajouter_etudiant(etudiant)
    _pending_registrations.pop(data.verification_token, None)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])

    return login_etudiant(etudiant.matricule, etudiant.mot_de_passe)


@router.get("/get_all_students/")
async def recuperer_tous_les_Etudiants():
    loop = asyncio.get_running_loop()
    etudiants = await loop.run_in_executor(None, recuperer_tous_les_etudiants)
    if not etudiants:
        raise HTTPException(status_code=404, detail="Aucun Etudiant")
    return etudiants


@router.get("/get_student_by_id/{etudiant_id}")
async def rucuperer_Etudiant_par_id(etudiant_id: int):
    etudiant = recuperer_etudiant_par_id(etudiant_id)
    if etudiant is None:
        raise HTTPException(status_code=404, detail="Etudiant non trouvé")
    return etudiant


@router.get("/get_student_by_matricule/{matricule}")
async def recuperer_Etudiant_par_matricule(matricule: str):
    etudiant = recuperer_etudiant_par_matricule(matricule)
    if etudiant is None:
        raise HTTPException(status_code=404, detail="Etudiant non trouvé")
    return etudiant


@router.put("/update_student/{etudiant_id}")
async def modifier_etudiant_data(etudiant_id: int, etudiant: Etudiant):
    etudiant_existant = recuperer_etudiant_par_id(etudiant_id)
    if etudiant_existant is None:
        raise HTTPException(status_code=404, detail="Etudiant non trouvé")
    modifier_etudiant(etudiant_id, etudiant)
    return {"message": f"Etudiant {etudiant.nom} modifié."}


@router.delete("/delete_student/{etudiant_id}")
async def supprimer_etudiant_data(etudiant_id: int):
    etudiant_existant = recuperer_etudiant_par_id(etudiant_id)
    if etudiant_existant is None:
        raise HTTPException(status_code=404, detail="Etudiant non trouvé")
    supprimer_etudiant(etudiant_id)
    return {"message": "Etudiant supprimé avec succès."}


@router.post("/login/")
async def login(data: Login_request_etudiant):
    try:
        return login_etudiant(data.matricule, data.mot_de_passe)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/etudiant/{id_etudiant}/ues")
async def get_ues_etudiant(id_etudiant: int):
    # Récupération du niveau principal
    row = utils.query_one("SELECT id_niveau FROM etudiants WHERE id_etudiant = %s", (id_etudiant,))
    if not row:
        raise HTTPException(status_code=404, detail="Étudiant introuvable")
    niveaux = [row[0]]
    profil = utils.query_one("SELECT niveau_2 FROM profils_etudiants WHERE id_etudiant = %s", (id_etudiant,))
    if profil and profil[0]:
        niveaux.append(profil[0])
    niveaux = list(set(niveaux))

    rows = utils.query_all("SELECT id_ues, code_ues, intitule, id_niveau FROM ues WHERE id_niveau = ANY(%s) ORDER BY id_niveau, intitule", (niveaux,))
    return {
        "id_etudiant": id_etudiant,
        "niveaux": niveaux,
        "ues": [{"id_ue": r[0], "code": r[1], "intitule": r[2], "id_niveau": r[3]} for r in rows],
    }
