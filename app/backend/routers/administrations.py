from fastapi import HTTPException, APIRouter
import asyncio
from backend.modeles.modeles import Administration, LoginRequest_administration
from backend.routers import utils


router = APIRouter(prefix="/administrations", tags=["administrations"])


def _format_admin_row(row):
    return {
        "id_administration": row[0],
        "nom": row[1],
        "prenom": row[2],
        "email": row[3],
        "telephone": row[4],
        "id_role": row[5],
    }


def login_administration(email: str, password: str):
    row = utils.query_one(
        "SELECT id_administration, nom, prenom, email, telephone, mot_de_passe, r.titre_role FROM administration a JOIN roles r ON r.id_role = a.id_role WHERE a.email = %s",
        (email,)
    )
    if not row or not utils.verify_password(password, row[5]):
        raise ValueError("wrong password or email")
    return _format_admin_row(row[:6])


def ajouter_administration(administration: Administration):
    hashed = utils.hash_password(administration.mot_de_passe)
    try:
        utils.execute_commit(
            "INSERT INTO administration(nom, prenom, email, telephone, mot_de_passe, id_role) VALUES (%s,%s,%s,%s,%s,%s)",
            (administration.nom, administration.prenom, administration.email, administration.telephone, hashed, administration.id_role),
        )
    except Exception:
        return {"error": "Administration déjà ajoutée ou email déjà utilisé."}


def recuperer_toutes_les_administrations():
    rows = utils.query_all("SELECT id_administration, nom, prenom, email, telephone, r.titre_role FROM administration a JOIN roles r ON r.id_role = a.id_role")
    return [_format_admin_row(r) for r in rows]


def recuperer_administration_par_id(administration_id: int):
    row = utils.query_one("SELECT id_administration, nom, prenom, email, telephone, r.titre_role FROM administration a JOIN roles r ON r.id_role = a.id_role WHERE a.id_administration = %s", (administration_id,))
    return _format_admin_row(row) if row else None


def modifier_administration(administration_id: int, administration: Administration):
    hashed = utils.hash_password(administration.mot_de_passe)
    utils.execute_commit(
        "UPDATE administration SET nom=%s, prenom=%s, email=%s, telephone=%s, mot_de_passe=%s, id_role=%s WHERE id_administration=%s",
        (administration.nom, administration.prenom, administration.email, administration.telephone, hashed, administration.id_role, administration_id),
    )


def supprimer_administration(administration_id: int):
    utils.execute_commit("DELETE FROM administration WHERE id_administration = %s", (administration_id,))


@router.post("/add_administration/")
async def creer_administration(administration: Administration):
    message = ajouter_administration(administration)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "Administration ajoutée avec succès."}


@router.get("/get_all_administrations/")
async def recuperer_administrations():
    loop = asyncio.get_running_loop()
    administrations = await loop.run_in_executor(None, recuperer_toutes_les_administrations)
    if administrations is None:
        raise HTTPException(status_code=404, detail="Aucune administration trouvée")
    return administrations


@router.get("/get_administration_by_id/{administration_id}")
async def recuperer_administration(administration_id: int):
    administration = recuperer_administration_par_id(administration_id)
    if administration is None:
        raise HTTPException(status_code=404, detail="Administration non trouvée")
    return administration


@router.put("/update_administration/{administration_id}")
async def modifier_administration_data(administration_id: int, administration: Administration):
    administration_existant = recuperer_administration_par_id(administration_id)
    if administration_existant is None:
        raise HTTPException(status_code=404, detail="Administration non trouvée")
    modifier_administration(administration_id, administration)
    return {"message": "Administration modifiée avec succès."}


@router.delete("/delete_administration/{administration_id}")
async def supprimer_administration_data(administration_id: int):
    administration_existant = recuperer_administration_par_id(administration_id)
    if administration_existant is None:
        raise HTTPException(status_code=404, detail="Administration non trouvée")
    supprimer_administration(administration_id)
    return {"message": "Administration supprimée avec succès."}


@router.get("/search_by_email/")
async def rechercher_administration_par_email(email: str):
    row = utils.query_one("SELECT id_administration, nom, prenom, email, telephone, id_role FROM administration WHERE email = %s", (email,))
    if not row:
        raise HTTPException(status_code=404, detail="Administration non trouvée")
    return _format_admin_row(row)


@router.post("/login/")
async def login(data: LoginRequest_administration):
    try:
        return login_administration(data.email, data.mot_de_passe)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
