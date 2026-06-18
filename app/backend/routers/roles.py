from fastapi import HTTPException, APIRouter
import asyncio
import psycopg2
from backend.routers import utils
from backend.modeles.modeles import Roles

router = APIRouter(prefix="/role", tags=["role"])


def ajouter_role(role: Roles):
    try:
        utils.execute_commit(
            "INSERT INTO roles(titre_role) VALUES (%s)",
            (role.titre_role,),
        )
    except psycopg2.IntegrityError:
        return {"error": "Rôle déjà existant."}


def recuperer_tous_les_roles():
    rows = utils.query_all("SELECT id_role, titre_role FROM roles")
    return [{"id_role": row[0], "titre_role": row[1]} for row in rows]


def recuperer_role_par_id(role_id: int):
    row = utils.query_one(
        "SELECT id_role, titre_role FROM roles WHERE id_role = %s",
        (role_id,),
    )
    if not row:
        return None
    return {"id_role": row[0], "titre_role": row[1]}


def modifier_role(role_id: int, role: Roles):
    utils.execute_commit(
        "UPDATE roles SET titre_role = %s WHERE id_role = %s",
        (role.titre_role, role_id),
    )


def supprimer_role(role_id: int):
    utils.execute_commit("DELETE FROM roles WHERE id_role = %s", (role_id,))


@router.post("/add_role/")
async def creer_role(role: Roles):
    message = ajouter_role(role)
    if message:
        return message
    return {"message": "Rôle ajouté avec succès."}


@router.get("/get_all_roles/")
async def get_all_roles():
    loop = asyncio.get_running_loop()
    roles = await loop.run_in_executor(None, recuperer_tous_les_roles)
    if roles is None:
        raise HTTPException(status_code=404, detail="Aucun rôle trouvé")
    return roles


@router.get("/get_role_by_id/{role_id}")
async def get_role(role_id: int):
    role = recuperer_role_par_id(role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Rôle non trouvé")
    return role


@router.put("/update_role/{role_id}")
async def update_role(role_id: int, role: Roles):
    existing = recuperer_role_par_id(role_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Rôle non trouvé")
    modifier_role(role_id, role)
    return {"message": "Rôle mis à jour avec succès."}


@router.delete("/delete_role/{role_id}")
async def delete_role(role_id: int):
    existing = recuperer_role_par_id(role_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Rôle non trouvé")
    supprimer_role(role_id)
    return {"message": "Rôle supprimé avec succès."}


@router.get("/search_role/")
async def rechercher_role_par_titre(query: str):
    rows = utils.query_all(
        "SELECT id_role, titre_role FROM roles WHERE titre_role ILIKE %s",
        (f"%{query}%",),
    )
    return [{"id_role": row[0], "titre_role": row[1]} for row in rows]