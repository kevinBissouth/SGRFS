from fastapi import APIRouter, HTTPException
import asyncio
from backend.modeles.modeles import exigences_types_requetes
from backend.routers import utils

router = APIRouter(prefix="/exigence_type_requete", tags=["exigence_type_requete"])


def _format_relation_row(row):
    return {"id_type_exigence": row[0], "id_type_requete": row[1], "id_exigence": row[2]}


def ajouter_relation(relation: exigences_types_requetes):
    try:
        utils.execute_commit(
            "INSERT INTO exigences_types_requetes(id_type_exigence, id_type_requete, id_exigence) VALUES (%s, %s, %s)",
            (relation.id_type_exigence, relation.id_type_requete, relation.id_exigence),
        )
    except Exception:
        return {"error": "Relation déjà existante ou référence invalide."}


def recuperer_toutes_les_relations():
    rows = utils.query_all("SELECT id_type_exigence, id_type_requete, id_exigence FROM exigences_types_requetes")
    return [_format_relation_row(row) for row in rows]


def recuperer_relation_par_ids(id_type_exigence: int, id_type_requete: int):
    row = utils.query_one(
        "SELECT id_type_exigence, id_type_requete, id_exigence FROM exigences_types_requetes WHERE id_type_exigence = %s AND id_type_requete = %s",
        (id_type_exigence, id_type_requete),
    )
    return _format_relation_row(row) if row else None


def supprimer_relation(id_type_exigence: int, id_type_requete: int):
    utils.execute_commit(
        "DELETE FROM exigences_types_requetes WHERE id_type_exigence = %s AND id_type_requete = %s",
        (id_type_exigence, id_type_requete),
    )


@router.post("/add_relation/")
async def creer_relation(relation: exigences_types_requetes):
    message = ajouter_relation(relation)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "Relation exigence / type requête ajoutée avec succès."}


@router.get("/get_all_relations/")
async def get_all_relations():
    loop = asyncio.get_running_loop()
    relations = await loop.run_in_executor(None, recuperer_toutes_les_relations)
    if not relations:
        raise HTTPException(status_code=404, detail="Aucune relation trouvée")
    return relations


@router.get("/get_relation/{id_type_exigence}/{id_type_requete}")
async def get_relation(id_type_exigence: int, id_type_requete: int):
    relation = recuperer_relation_par_ids(id_type_exigence, id_type_requete)
    if relation is None:
        raise HTTPException(status_code=404, detail="Relation non trouvée")
    return relation


@router.delete("/delete_relation/{id_type_exigence}/{id_type_requete}")
async def delete_relation(id_type_exigence: int, id_type_requete: int):
    existing = recuperer_relation_par_ids(id_type_exigence, id_type_requete)
    if existing is None:
        raise HTTPException(status_code=404, detail="Relation non trouvée")
    supprimer_relation(id_type_exigence, id_type_requete)
    return {"message": "Relation supprimée avec succès."}


@router.get("/relations_by_type_exigence/{id_type_exigence}")
async def relations_par_type_exigence(id_type_exigence: int):
    rows = utils.query_all(
        "SELECT id_type_exigence, id_type_requete, id_exigence FROM exigences_types_requetes WHERE id_type_exigence = %s",
        (id_type_exigence,),
    )
    return [_format_relation_row(row) for row in rows]
    