from fastapi import APIRouter, HTTPException
import asyncio
from backend.modeles.modeles import Circuits
from backend.routers import utils

router = APIRouter(prefix="/circuits", tags=["circuits"])


def _format_circuit_row(row):
    return {"id_circuit": row[0], "type_requete": row[1], "titre": row[2]}


def ajouter_circuit(circuit: Circuits):
    try:
        utils.execute_commit(
            "INSERT INTO circuits(id_type_requete, titre) VALUES (%s, %s)",
            (circuit.id_type_requete, circuit.titre),
        )
    except Exception:
        return {"error": "Circuit déjà existant ou type de requête invalide."}


def recuperer_tous_les_circuits():
    rows = utils.query_all(
        "SELECT c.id_circuit, tr.titre, c.titre FROM circuits c JOIN type_requetes tr ON c.id_type_requete = tr.id_type_requete"
    )
    return [_format_circuit_row(row) for row in rows]


def recuperer_circuit_par_id(circuit_id: int):
    row = utils.query_one(
        "SELECT c.id_circuit, tr.titre, c.titre FROM circuits c JOIN type_requetes tr ON c.id_type_requete = tr.id_type_requete WHERE c.id_circuit = %s",
        (circuit_id,),
    )
    return _format_circuit_row(row) if row else None


def modifier_circuit(circuit_id: int, circuit: Circuits):
    utils.execute_commit(
        "UPDATE circuits SET id_type_requete = %s, titre = %s WHERE id_circuit = %s",
        (circuit.id_type_requete, circuit.titre, circuit_id),
    )


def supprimer_circuit(circuit_id: int):
    utils.execute_commit("DELETE FROM circuits WHERE id_circuit = %s", (circuit_id,))


@router.post("/add_circuit/")
async def creer_circuit(circuit: Circuits):
    message = ajouter_circuit(circuit)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "Circuit ajouté avec succès."}


@router.get("/get_all_circuits/")
async def get_all_circuits():
    loop = asyncio.get_running_loop()
    circuits_list = await loop.run_in_executor(None, recuperer_tous_les_circuits)
    if not circuits_list:
        raise HTTPException(status_code=404, detail="Aucun circuit trouvé")
    return circuits_list


@router.get("/get_circuit_by_id/{circuit_id}")
async def get_circuit(circuit_id: int):
    circuit = recuperer_circuit_par_id(circuit_id)
    if circuit is None:
        raise HTTPException(status_code=404, detail="Circuit non trouvé")
    return circuit


@router.put("/update_circuit/{circuit_id}")
async def update_circuit(circuit_id: int, circuit: Circuits):
    existing = recuperer_circuit_par_id(circuit_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Circuit non trouvé")
    modifier_circuit(circuit_id, circuit)
    return {"message": "Circuit mis à jour avec succès."}


@router.delete("/delete_circuit/{circuit_id}")
async def delete_circuit(circuit_id: int):
    existing = recuperer_circuit_par_id(circuit_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Circuit non trouvé")
    supprimer_circuit(circuit_id)
    return {"message": "Circuit supprimé avec succès."}
