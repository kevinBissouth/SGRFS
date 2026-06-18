from fastapi import HTTPException, APIRouter
import asyncio
import psycopg2
from backend.routers import utils
from backend.modeles.modeles import Profils_etudiants

router = APIRouter(prefix="/profil_etudiant", tags=["profil_etudiant"])


def ajouter_profil(profil: Profils_etudiants):
    try:
        utils.execute_commit(
            "INSERT INTO profils_etudiants(id_etudiant, niveau_2, poste) VALUES (%s, %s, %s)",
            (profil.id_etudiant, profil.niveau_2, profil.poste),
        )
    except psycopg2.IntegrityError:
        return {"error": "Profil déjà existant ou étudiant invalide."}


def recuperer_tous_les_profils():
    rows = utils.query_all("SELECT id_etudiant, niveau_2, poste FROM profils_etudiants")
    return [{"id_etudiant": row[0], "niveau_2": row[1], "poste": row[2]} for row in rows]


def recuperer_profil_par_etudiant(id_etudiant: int):
    row = utils.query_one(
        "SELECT id_etudiant, niveau_2, poste FROM profils_etudiants WHERE id_etudiant = %s",
        (id_etudiant,),
    )
    if not row:
        return None
    return {"id_etudiant": row[0], "niveau_2": row[1], "poste": row[2]}


def modifier_profil(id_etudiant: int, profil: Profils_etudiants):
    utils.execute_commit(
        "UPDATE profils_etudiants SET niveau_2 = %s, poste = %s WHERE id_etudiant = %s",
        (profil.niveau_2, profil.poste, id_etudiant),
    )


def supprimer_profil(id_etudiant: int):
    utils.execute_commit("DELETE FROM profils_etudiants WHERE id_etudiant = %s", (id_etudiant,))


@router.post("/add_profil/")
async def creer_profil(profil: Profils_etudiants):
    message = ajouter_profil(profil)
    if message:
        return message
    return {"message": "Profil étudiant ajouté avec succès."}


@router.get("/get_all_profils/")
async def get_all_profils():
    loop = asyncio.get_running_loop()
    profils = await loop.run_in_executor(None, recuperer_tous_les_profils)
    if profils is None:
        raise HTTPException(status_code=404, detail="Aucun profil trouvé")
    return profils


@router.get("/get_profil_by_etudiant/{id_etudiant}")
async def get_profil(id_etudiant: int):
    profil = recuperer_profil_par_etudiant(id_etudiant)
    if profil is None:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    return profil


@router.put("/update_profil/{id_etudiant}")
async def update_profil(id_etudiant: int, profil: Profils_etudiants):
    existing = recuperer_profil_par_etudiant(id_etudiant)
    if existing is None:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    modifier_profil(id_etudiant, profil)
    return {"message": "Profil mis à jour avec succès."}


@router.delete("/delete_profil/{id_etudiant}")
async def delete_profil(id_etudiant: int):
    existing = recuperer_profil_par_etudiant(id_etudiant)
    if existing is None:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    supprimer_profil(id_etudiant)
    return {"message": "Profil supprimé avec succès."}


@router.get("/search_by_poste/")
async def rechercher_par_poste(poste: str):
    rows = utils.query_all(
        "SELECT id_etudiant, niveau_2, poste FROM profils_etudiants WHERE poste ILIKE %s",
        (f"%{poste}%",),
    )
    return [{"id_etudiant": row[0], "niveau_2": row[1], "poste": row[2]} for row in rows]