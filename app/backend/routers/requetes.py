from fastapi import HTTPException, APIRouter
import asyncio
from backend.modeles.modeles import Requetes
from backend.routers import utils
from backend.database.database import get_db_connection


router = APIRouter(prefix="/requete", tags=["requete"])


def _format_requete_row(row):
    return {
        "id_requete": row[0],
        "id_etudiant": row[1],
        "date_requete": row[2],
        "id_type_requete": row[3],
        "type_requete": row[4],
        "id_ues": row[5],
        "statut": row[6],
    }


def ajouter_requete(requete: Requetes):
    conn, cursor = get_db_connection()
    try:
        cursor.execute(
            "INSERT INTO requetes(id_etudiant, date_requete, id_type_requete, id_ues, statut) VALUES (%s, %s, %s, %s, %s) RETURNING id_requete",
            (
                requete.id_etudiant,
                requete.date_requete.isoformat() if hasattr(requete.date_requete, "isoformat") else requete.date_requete,
                requete.id_type_requete,
                requete.id_ues,
                requete.statut,
            ),
        )
        result = cursor.fetchone()
        conn.commit()
        return result[0] if result else None
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


@router.post("/add_requete/")
async def creer_requete(requete: Requetes):
    id_requete = ajouter_requete(requete)
    if id_requete is None:
        raise HTTPException(status_code=409, detail="Requête déjà existante ou référence invalide.")
    return {"message": "Requête ajoutée avec succès.", "id_requete": id_requete}


def recuperer_toutes_les_requetes():
    rows = utils.query_all(
        "SELECT r.id_requete, r.id_etudiant, r.date_requete, r.id_type_requete, tr.titre, r.id_ues, r.statut FROM requetes r JOIN type_requetes tr ON r.id_type_requete = tr.id_type_requete"
    )
    return [_format_requete_row(row) for row in rows]


def recuperer_requete_par_id(requete_id: int):
    row = utils.query_one(
        "SELECT r.id_requete, r.id_etudiant, r.date_requete, r.id_type_requete, tr.titre, r.id_ues, r.statut FROM requetes r JOIN type_requetes tr ON r.id_type_requete = tr.id_type_requete WHERE r.id_requete = %s",
        (requete_id,),
    )
    return _format_requete_row(row) if row else None


def modifier_requete(requete_id: int, requete: Requetes):
    utils.execute_commit(
        "UPDATE requetes SET id_etudiant = %s, date_requete = %s, id_type_requete = %s, id_ues = %s, statut = %s WHERE id_requete = %s",
        (
            requete.id_etudiant,
            requete.date_requete.isoformat() if hasattr(requete.date_requete, "isoformat") else requete.date_requete,
            requete.id_type_requete,
            requete.id_ues,
            requete.statut,
            requete_id,
        ),
    )


def supprimer_requete(requete_id: int):
    utils.execute_commit("DELETE FROM requetes WHERE id_requete = %s", (requete_id,))


@router.get("/get_all_requetes/")
async def get_all_requetes():
    loop = asyncio.get_running_loop()
    requetes = await loop.run_in_executor(None, recuperer_toutes_les_requetes)
    if not requetes:
        raise HTTPException(status_code=404, detail="Aucune requête trouvée")
    return requetes


@router.get("/get_requete_by_id/{requete_id}")
async def get_requete(requete_id: int):
    requete = recuperer_requete_par_id(requete_id)
    if requete is None:
        raise HTTPException(status_code=404, detail="Requête non trouvée")
    return requete


@router.put("/update_requete/{requete_id}")
async def update_requete(requete_id: int, requete: Requetes):
    existing = recuperer_requete_par_id(requete_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Requête non trouvée")
    modifier_requete(requete_id, requete)
    return {"message": "Requête mise à jour avec succès."}


@router.delete("/delete_requete/{requete_id}")
async def delete_requete(requete_id: int):
    existing = recuperer_requete_par_id(requete_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Requête non trouvée")
    supprimer_requete(requete_id)
    return {"message": "Requête supprimée avec succès."}


@router.get("/by_etudiant/{id_etudiant}")
async def get_requetes_par_etudiant(id_etudiant: int):
    rows = utils.query_all(
        "SELECT r.id_requete, r.id_etudiant, r.date_requete, r.id_type_requete, tr.titre, r.id_ues, r.statut FROM requetes r JOIN type_requetes tr ON r.id_type_requete = tr.id_type_requete WHERE r.id_etudiant = %s ORDER BY r.date_requete DESC, r.id_requete DESC",
        (id_etudiant,),
    )
    return [_format_requete_row(row) for row in rows]


@router.get("/by_statut/{statut}")
async def get_requetes_par_statut(statut: str):
    rows = utils.query_all(
        "SELECT id_requete, id_etudiant, date_requete, id_type_requete, id_ues, statut FROM requetes WHERE statut ILIKE %s",
        (f"%{statut}%",),
    )
    return [
        {
            "id_requete": row[0],
            "id_etudiant": row[1],
            "date_requete": row[2],
            "id_type_requete": row[3],
            "id_ues": row[4],
            "statut": row[5],
        }
        for row in rows
    ]


@router.get("/{id_requete}/details")
async def get_details_requete(id_requete: int):
    req = utils.query_one(
        "SELECT r.id_requete, r.date_requete, r.statut, r.id_type_requete, r.id_ues, tr.titre FROM requetes r JOIN type_requetes tr ON tr.id_type_requete = r.id_type_requete WHERE r.id_requete = %s",
        (id_requete,),
    )
    if not req:
        raise HTTPException(status_code=404, detail="Requête introuvable")

    id_req, date_requete, statut_requete, id_type_requete, id_ue, type_requete = req

    ue = None
    if id_ue:
        ue_row = utils.query_one("SELECT id_ues, code_ues, intitule FROM ues WHERE id_ues = %s", (id_ue,))
        if ue_row:
            ue = {"id_ue": ue_row[0], "code": ue_row[1], "intitule": ue_row[2]}

    circuit = utils.query_one("SELECT id_circuit FROM circuits WHERE id_type_requete = %s", (id_type_requete,))
    if not circuit:
        raise HTTPException(status_code=404, detail="Aucun circuit associé à ce type de requête")
    id_circuit = circuit[0]

    etapes = utils.query_all(
        """
        SELECT ec.ordre, a.id_administration, a.nom, a.prenom, r.titre_role
        FROM etapes_circuits ec
        JOIN administration a ON a.id_administration = ec.id_administration
        JOIN roles r ON r.id_role = a.id_role
        WHERE ec.id_circuit = %s ORDER BY ec.ordre ASC
        """,
        (id_circuit,),
    )

    traitements = utils.query_all(
        "SELECT id_administration, statut, commentaire, date_traitement FROM traitements WHERE id_requete = %s",
        (id_requete,),
    )
    traitements_map = {t[0]: {"statut": t[1], "commentaire": t[2], "date_traitement": t[3]} for t in traitements}

    parcours = []
    premier_non_traite_trouve = False
    for etape in etapes:
        ordre, id_admin, nom, prenom, role = etape
        traitement = traitements_map.get(id_admin)
        if traitement:
            parcours.append(
                {
                    "ordre": ordre,
                    "id_administration": id_admin,
                    "nom": nom,
                    "prenom": prenom,
                    "role": role,
                    "etat": traitement["statut"],
                    "commentaire": traitement["commentaire"],
                    "date_traitement": traitement["date_traitement"],
                }
            )
        else:
            if not premier_non_traite_trouve:
                etat = "En cours"
                premier_non_traite_trouve = True
            else:
                etat = "En attente"
            parcours.append(
                {
                    "ordre": ordre,
                    "id_administration": id_admin,
                    "nom": nom,
                    "prenom": prenom,
                    "role": role,
                    "etat": etat,
                    "commentaire": None,
                    "date_traitement": None,
                }
            )

    return {
        "id_requete": id_req,
        "type_requete": type_requete,
        "date_requete": date_requete,
        "statut_requete": statut_requete,
        "ue": ue,
        "parcours": parcours,
    }
