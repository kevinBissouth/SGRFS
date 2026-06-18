"""
Router `etudiant` - endpoints and simple helpers.
Principles applied: KISS, DRY, minimal comments.
"""
from fastapi import APIRouter, HTTPException
import asyncio
from typing import Optional
from backend.modeles.modeles import Etudiant, Login_request_etudiant, Profils_etudiants
from backend.routers import utils


router = APIRouter(prefix="/etudiant", tags=["etudiant"])


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
    if utils.query_one("SELECT 1 FROM etudiants WHERE LOWER(matricule)=LOWER(%s)", (matricule,)):
        return {"error": "Ce matricule est refusé."}
    if utils.query_one("SELECT 1 FROM etudiants WHERE LOWER(email)=LOWER(%s)", (etudiant.email,)):
        return {"error": "Cet email est refusé."}

    hashed = utils.hash_password(etudiant.mot_de_passe)
    try:
        utils.execute_commit(
            "INSERT INTO etudiants(matricule, nom, prenom, date_naissance, email, mot_de_passe, telephone, id_niveau) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (matricule, etudiant.nom, etudiant.prenom, etudiant.date_naissance.isoformat(), etudiant.email, hashed, etudiant.telephone, etudiant.id_niveau),
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
    hashed = utils.hash_password(etudiant.mot_de_passe)
    utils.execute_commit(
        "UPDATE etudiants SET matricule=%s, nom=%s, prenom=%s, date_naissance=%s, email=%s, mot_de_passe=%s, telephone=%s, id_niveau=%s WHERE id_etudiant=%s",
        (etudiant.matricule, etudiant.nom, etudiant.prenom, etudiant.date_naissance.isoformat(), etudiant.email, hashed, etudiant.telephone, etudiant.id_niveau, etudiant_id),
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
    message = ajouter_etudiant(etudiant)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "Etudiant ajouté avec succès."}


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
