
from fastapi import HTTPException, APIRouter
import asyncio
import psycopg2
from backend.routers import utils
from backend.modeles.modeles import Niveau


router = APIRouter(prefix="/niveau", tags=["niveau"])


# ============================ FONCTIONS ET ENDPOINTS POUR LES Niveaux ===========================

# =============================== FONCTIONS ==============================


# Fonction pour ajouter un niveau
def ajouter_niveau(niveau: Niveau):
    try:
        utils.execute_commit(
            "INSERT INTO niveaux(niveau, id_filiere) VALUES (%s, %s)",
            (niveau.niveau, niveau.id_filiere),
        )
    except psycopg2.IntegrityError:
        return {"error": "Niveau déjà ajouté ou référence de filière invalide."}



# Fonction pour récupérer tous les niveaux
def recuperer_tous_les_niveaux():
    rows = utils.query_all(
        "SELECT n.id_niveau, n.niveau, n.id_filiere, f.nom FROM niveaux n JOIN filieres f ON n.id_filiere = f.id_filiere"
    )
    return [
        {"id_niveau": row[0], "niveau": row[1], "id_filiere": row[2], "filiere": row[3]} for row in rows
    ]



# Fonction pour récupérer un niveau par ID
def recuperer_niveau_par_id(niveau_id: int):
    row = utils.query_one(
        "SELECT id_niveau, niveau, id_filiere FROM niveaux WHERE id_niveau = %s",
        (niveau_id,),
    )
    if not row:
        return None
    return {"id_niveau": row[0], "niveau": row[1], "id_filiere": row[2]}


# Fonction pour mettre à jour un Niveau
def modifier_niveau(niveau_id: int, niveau: Niveau):
    utils.execute_commit(
        "UPDATE niveaux SET niveau = %s, id_filiere = %s WHERE id_niveau = %s",
        (niveau.niveau, niveau.id_filiere, niveau_id),
    )



# Fonction pour supprimer un Niveau
def supprimer_niveau(niveau_id: int):
    utils.execute_commit("DELETE FROM niveaux WHERE id_niveau = %s", (niveau_id,))



    # =============================== ENDPOINTS ==============================
    

# Route pour ajouter un niveau
@router.post("/add_niveau/")
async def creer_niveau(niveau: Niveau):
    message = ajouter_niveau(niveau)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "Niveau ajouté avec succès."}



# Route pour obtenir tous les niveaux
@router.get("/get_all_niveau/")
async def get_all_niveaux():
    loop = asyncio.get_running_loop()
    niveaux = await loop.run_in_executor(None, recuperer_tous_les_niveaux)
    if niveaux is None:
        raise HTTPException(status_code=404, detail="Aucun niveau trouvé")
    return niveaux
    


# Route pour obtenir un niveau par ID
@router.get("/get_niveau_by_id/{niveau_id}")
async def get_niveau(niveau_id: int):
    niveau = recuperer_niveau_par_id(niveau_id)
    if niveau is None:
        raise HTTPException(status_code=404, detail="Niveau non trouvé")
    return niveau



# Route pour mettre à jour un niveau
@router.put("/update_niveau/{niveau_id}")
async def update_niveau(niveau_id: int, niveau: Niveau):
    existing = recuperer_niveau_par_id(niveau_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Niveau non trouvé")
    modifier_niveau(niveau_id, niveau)
    return {"message": "Niveau mis à jour avec succès."}



# Route pour supprimer un niveau
@router.delete("/delete_niveau/{niveau_id}")
async def delete_niveau(niveau_id: int):
    existing = recuperer_niveau_par_id(niveau_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Niveau non trouvé")
    supprimer_niveau(niveau_id)
    return {"message": "Niveau supprimé avec succès."}


@router.get("/by_filiere/{id_filiere}")
async def get_niveaux_par_filiere(id_filiere: int):
    rows = utils.query_all(
        "SELECT id_niveau, niveau, id_filiere FROM niveaux WHERE id_filiere = %s",
        (id_filiere,),
    )
    return [
        {"id_niveau": row[0], "niveau": row[1], "id_filiere": row[2]} for row in rows
    ]


# ================================================================================================================


# ================================================================================================================
