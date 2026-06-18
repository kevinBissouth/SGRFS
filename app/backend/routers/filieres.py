
from fastapi import HTTPException, APIRouter
from datetime import date
import asyncio
import psycopg2
from backend.routers import utils
from backend.modeles.modeles import Filiere


router = APIRouter(prefix="/filiere", tags=["filiere"])


# ============================ FONCTIONS ET ENDPOINTS POUR LES Filieres ===========================


    # =============================== FONCTIONS ==============================
    

    

# Fonction pour ajouter un Filiere
def ajouter_filiere(filiere: Filiere):
    try:
        utils.execute_commit(
            """
        INSERT INTO filieres(nom, description) 
        VALUES (%s, %s)
        """,
            (filiere.nom, filiere.description),
        )
    except psycopg2.IntegrityError:
        return {"error": "Cette filière existe déjà."}
    except psycopg2.Error:
        return {"error": "Erreur base de données lors de l'ajout de la filière."}



# Fonction pour récupérer tous les Filieres
def recuperer_toutes_les_filieresF():
    rows = utils.query_all("SELECT * FROM filieres")
    return [
        {
            "id_filiere": row[0],
            "nom": row[1],
            "description": row[2]
        }
        for row in rows 
    ]



# Fonction pour récupérer un Filiere par ID
def recuperer_filiere_par_idF(filiere_id: int):
    row = utils.query_one(
        "SELECT * FROM filieres WHERE id_filiere = %s",
        (filiere_id,),
    )

    if not row:
        return None

    return {
        "id_filiere": row[0],
        "nom": row[1],
        "description": row[2],
    }



# Fonction pour mettre à jour un Filiere
def modifier_filiere_id(id_filiere: int, filiere: Filiere):
    utils.execute_commit(
        '''
    UPDATE filieres SET nom = %s, description = %s
    WHERE id_filiere = %s
    ''',
        (filiere.nom, filiere.description, id_filiere),
    )



# Fonction pour supprimer un Filiere
def supprimer_filiere(id_filiere: int):
    utils.execute_commit('DELETE FROM filieres WHERE id_filiere = %s', (id_filiere,))



    # =============================== ENDPOINTS ==============================
    

# Route pour ajouter uen filiere
@router.post("/add_filiere/")
async def creer_filiere(filiere: Filiere):
    message = ajouter_filiere(filiere)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "filiere ajoutée avec succès."}



# Route pour obtenir tous les Filieres
@router.get("/get_all_filiere/")
async def recuperer_toutes_les_filieres():
    loop = asyncio.get_running_loop()
    filieres = await loop.run_in_executor(None, recuperer_toutes_les_filieresF)
    if filieres is None:
        raise HTTPException(status_code=404, detail="Aucune Filiere")
    return filieres
    


# Route pour obtenir un Filiere par ID
@router.get("/get_filiere_by_id/{filiere_id}")
async def rucuperer_filiere_par_id(filiere_id: int):
    Filiere = recuperer_filiere_par_idF(filiere_id)
    if Filiere is None:
        raise HTTPException(status_code=404, detail= "Filiere non trouvée")
    return Filiere



# Route pour mettre à jour un Filiere
@router.put("/update_filiere/{filiere_id}")
async def modifier_filiere_data(filiere_id: int, filiere: Filiere):
    filiere_existant = recuperer_filiere_par_idF(filiere_id)
    if filiere_existant is None:
        raise HTTPException(status_code=404, detail= "Filiere non trouvé")
    modifier_filiere_id(filiere_id, filiere)
    return f"'Detail:' Ok  {filiere.nom} a ete modifier"



# Route pour supprimer un Filiere
@router.delete("/delete_filiere/{filiere_id}")
async def supprimer_filiere_data(filiere_id: int):
    filiere_existant = recuperer_filiere_par_idF(filiere_id)
    if filiere_existant is None:
        raise HTTPException(status_code=404, detail= "Filiere non trouvée")
    supprimer_filiere(filiere_id)
    return {"message":  "Filiere supprimé avec succès."}


# ================================================================================================================
