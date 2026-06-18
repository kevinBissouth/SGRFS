from fastapi import APIRouter, HTTPException
import asyncio
from backend.modeles.modeles import Etape_circuits
from backend.routers import utils

router = APIRouter(prefix="/etapes_circuits", tags=["etapes_circuits"])


def _format_etape_row(row):
    return {"id_etape_circuit": row[0], "id_circuit": row[1], "order": row[2], "id_administration": row[3]}


def ajouter_etape(etape: Etape_circuits):
    try:
        utils.execute_commit(
            "INSERT INTO etapes_circuits(id_circuit, ordre, id_administration) VALUES (%s, %s, %s)",
            (etape.id_circuit, etape.order, etape.id_administration),
        )
    except Exception:
        return {"error": "Étape déjà existante ou référence invalide."}


def recuperer_toutes_les_etapes():
    rows = utils.query_all("SELECT id_etape_circuit, id_circuit, ordre, id_administration FROM etapes_circuits")
    return [_format_etape_row(row) for row in rows]


def recuperer_etape_par_id(etape_id: int):
    row = utils.query_one(
        "SELECT id_etape_circuit, id_circuit, ordre, id_administration FROM etapes_circuits WHERE id_etape_circuit = %s",
        (etape_id,),
    )
    return _format_etape_row(row) if row else None


def modifier_etape(etape_id: int, etape: Etape_circuits):
    utils.execute_commit(
        "UPDATE etapes_circuits SET id_circuit = %s, ordre = %s, id_administration = %s WHERE id_etape_circuit = %s",
        (etape.id_circuit, etape.order, etape.id_administration, etape_id),
    )


def supprimer_etape(etape_id: int):
    utils.execute_commit("DELETE FROM etapes_circuits WHERE id_etape_circuit = %s", (etape_id,))


@router.post("/add_etape_circuit/")
async def creer_etape(etape: Etape_circuits):
    message = ajouter_etape(etape)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "Étape de circuit ajoutée avec succès."}


@router.get("/get_all_etapes/")
async def get_all_etapes():
    loop = asyncio.get_running_loop()
    etapes = await loop.run_in_executor(None, recuperer_toutes_les_etapes)
    if not etapes:
        raise HTTPException(status_code=404, detail="Aucune étape trouvée")
    return etapes


@router.get("/get_etape_by_id/{etape_id}")
async def get_etape(etape_id: int):
    etape = recuperer_etape_par_id(etape_id)
    if etape is None:
        raise HTTPException(status_code=404, detail="Étape non trouvée")
    return etape


@router.put("/update_etape/{etape_id}")
async def update_etape_data(etape_id: int, etape: Etape_circuits):
    existing = recuperer_etape_par_id(etape_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Étape non trouvée")
    modifier_etape(etape_id, etape)
    return {"message": "Étape mise à jour avec succès."}


@router.delete("/delete_etape/{etape_id}")
async def delete_etape(etape_id: int):
    existing = recuperer_etape_par_id(etape_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Étape non trouvée")
    supprimer_etape(etape_id)
    return {"message": "Étape supprimée avec succès."}


@router.get("/by_circuit/{circuit_id}")
async def get_etapes_par_circuit(circuit_id: int):
    rows = utils.query_all(
        "SELECT id_etape_circuit, id_circuit, ordre, id_administration FROM etapes_circuits WHERE id_circuit = %s",
        (circuit_id,),
    )
    return [_format_etape_row(row) for row in rows]
