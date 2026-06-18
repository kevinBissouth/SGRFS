from fastapi import APIRouter, HTTPException
import asyncio
from backend.modeles.modeles import exigences
from backend.routers import utils

router = APIRouter(prefix="/exigence", tags=["exigence"])


def _format_exigence_row(row):
    return {"id_exigence": row[0], "titre": row[1]}


def ajouter_exigence(exigence: exigences):
    try:
        utils.execute_commit("INSERT INTO exigences(titre) VALUES (%s)", (exigence.titre,))
    except Exception:
        return {"error": "Exigence déjà existante ou type d'exigence invalide."}


def recuperer_toutes_les_exigences():
    rows = utils.query_all("SELECT id_exigence, titre FROM exigences")
    return [_format_exigence_row(row) for row in rows]


def recuperer_exigence_par_id(exigence_id: int):
    row = utils.query_one("SELECT id_exigence, titre FROM exigences WHERE id_exigence = %s", (exigence_id,))
    return _format_exigence_row(row) if row else None


def modifier_exigence(exigence_id: int, exigence: exigences):
    utils.execute_commit("UPDATE exigences SET titre = %s WHERE id_exigence = %s", (exigence.titre, exigence_id))


def supprimer_exigence(exigence_id: int):
    utils.execute_commit("DELETE FROM exigences WHERE id_exigence = %s", (exigence_id,))


@router.post("/add_exigence/")
async def creer_exigence(exigence: exigences):
    message = ajouter_exigence(exigence)
    if message:
        return message
    return {"message": "Exigence ajoutée avec succès."}


@router.get("/get_all_exigences/")
async def get_all_exigences():
    loop = asyncio.get_running_loop()
    exigences_list = await loop.run_in_executor(None, recuperer_toutes_les_exigences)
    if exigences_list is None:
        raise HTTPException(status_code=404, detail="Aucune exigence trouvée")
    return exigences_list


@router.get("/get_exigence_by_id/{exigence_id}")
async def get_exigence(exigence_id: int):
    exigence = recuperer_exigence_par_id(exigence_id)
    if exigence is None:
        raise HTTPException(status_code=404, detail="Exigence non trouvée")
    return exigence


@router.put("/update_exigence/{exigence_id}")
async def update_exigence(exigence_id: int, exigence: exigences):
    existing = recuperer_exigence_par_id(exigence_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Exigence non trouvée")
    modifier_exigence(exigence_id, exigence)
    return {"message": "Exigence mise à jour avec succès."}


@router.delete("/delete_exigence/{exigence_id}")
async def delete_exigence(exigence_id: int):
    existing = recuperer_exigence_par_id(exigence_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Exigence non trouvée")
    supprimer_exigence(exigence_id)
    return {"message": "Exigence supprimée avec succès."}


@router.get("/by_type_exigence/{type_exigence_id}")
async def get_exigences_par_type(type_exigence_id: int):
    rows = utils.query_all(
        "SELECT id_exigence, titre FROM exigences WHERE id_type_exigence = %s",
        (type_exigence_id,),
    )
    return [{"id_exigence": row[0], "titre": row[1]} for row in rows]