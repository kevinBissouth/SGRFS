from fastapi import HTTPException, APIRouter
import asyncio
import psycopg2
from backend.routers import utils
from backend.modeles.modeles import Type_requetes

router = APIRouter(prefix="/type_requetes", tags=["type_requetes"])


def ajouter_type_requete(type_requete: Type_requetes):
    try:
        utils.execute_commit(
            "INSERT INTO type_requetes(titre, description) VALUES (%s, %s)",
            (type_requete.titre, type_requete.description),
        )
    except psycopg2.IntegrityError:
        return {"error": "Type de requête déjà existant."}


def recuperer_tous_les_type_requetes():
    rows = utils.query_all("SELECT id_type_requete, titre, description FROM type_requetes")
    return [
        {"id_type_requete": row[0], "titre": row[1], "description": row[2]} for row in rows
    ]


def recuperer_type_requete_par_id(type_requete_id: int):
    row = utils.query_one(
        "SELECT id_type_requete, titre, description FROM type_requetes WHERE id_type_requete = %s",
        (type_requete_id,),
    )
    if not row:
        return None
    return {"id_type_requete": row[0], "titre": row[1], "description": row[2]}


def modifier_type_requete(type_requete_id: int, type_requete: Type_requetes):
    utils.execute_commit(
        "UPDATE type_requetes SET titre = %s, description = %s WHERE id_type_requete = %s",
        (type_requete.titre, type_requete.description, type_requete_id),
    )


def supprimer_type_requete(type_requete_id: int):
    utils.execute_commit("DELETE FROM type_requetes WHERE id_type_requete = %s", (type_requete_id,))


@router.post("/add_type_requete/")
async def creer_type_requete(type_requete: Type_requetes):
    message = ajouter_type_requete(type_requete)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "Type de requête ajouté avec succès."}


@router.get("/get_all_type_requetes/")
async def get_all_type_requetes():
    loop = asyncio.get_running_loop()
    types = await loop.run_in_executor(None, recuperer_tous_les_type_requetes)
    if types is None:
        raise HTTPException(status_code=404, detail="Aucun type de requête trouvé")
    return types


@router.get("/get_type_requete_by_id/{type_requete_id}")
async def get_type_requete(type_requete_id: int):
    type_requete = recuperer_type_requete_par_id(type_requete_id)
    if type_requete is None:
        raise HTTPException(status_code=404, detail="Type de requête non trouvé")
    return type_requete


@router.put("/update_type_requete/{type_requete_id}")
async def update_type_requete(type_requete_id: int, type_requete: Type_requetes):
    existing = recuperer_type_requete_par_id(type_requete_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Type de requête non trouvé")
    modifier_type_requete(type_requete_id, type_requete)
    return {"message": "Type de requête mis à jour avec succès."}


@router.delete("/delete_type_requete/{type_requete_id}")
async def delete_type_requete(type_requete_id: int):
    existing = recuperer_type_requete_par_id(type_requete_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Type de requête non trouvé")
    supprimer_type_requete(type_requete_id)
    return {"message": "Type de requête supprimé avec succès."}


@router.get("/search_type_requete/")
async def rechercher_type_requete(query: str):
    rows = utils.query_all(
        "SELECT id_type_requete, titre, description FROM type_requetes WHERE titre ILIKE %s",
        (f"%{query}%",),
    )
    if not rows:
        return "type de requete non trouve"
    return [
        {"id_type_requete": row[0], "titre": row[1], "description": row[2]} for row in rows
    ]
    
    
@router.get("/get_all_exigence/{id_type_requete}")
async def get_exigences_par_type_requete(id_type_requete: int):
    rows = utils.query_all(
        """
            SELECT
                e.id_exigence,
                e.titre_exigence
            FROM exigences e
            INNER JOIN exigences_types_requetes etr
                ON e.id_exigence = etr.id_exigence
            WHERE etr.id_type_requete = %s
            ORDER BY e.titre_exigence
        """,
        (id_type_requete,),
    )

    return [
        {
            "id_exigence": row[0],
            "titre": row[1]
        }
        for row in rows
    ]