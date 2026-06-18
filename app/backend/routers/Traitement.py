from fastapi import HTTPException, APIRouter
from datetime import date
import asyncio
import psycopg2
from typing import List
from backend.database.database import get_db_connection
from backend.modeles.modeles import Traitement

router = APIRouter(prefix="/traitement", tags=["traitement"])


def ajouter_traitement(traitement: Traitement):
    conn, cursor = get_db_connection()
    try:
        cursor.execute(
            "INSERT INTO traitements(id_requete, id_administration, date_traitement, statut) VALUES (%s, %s, %s, %s)",
            (
                traitement.id_requete,
                traitement.id_administration,
                traitement.date_traitement.isoformat() if hasattr(traitement.date_traitement, "isoformat") else traitement.date_traitement,
                traitement.statut,
            ),
        )
        conn.commit()
    except psycopg2.IntegrityError:
        conn.rollback()
        return {"error": "Traitement déjà existant ou référence invalide."}
    finally:
        conn.close()


def recuperer_tous_les_traitements():
    conn, cursor = get_db_connection()
    cursor.execute("SELECT id_traitement, id_requete, id_administration, date_traitement, statut FROM traitements")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id_traitement": row[0],
            "id_requete": row[1],
            "id_administration": row[2],
            "date_traitement": row[3],
            "statut": row[4],
        }
        for row in rows
    ]


def recuperer_traitement_par_id(traitement_id: int):
    conn, cursor = get_db_connection()
    cursor.execute(
        "SELECT id_traitement, id_requete, id_administration, date_traitement, statut FROM traitements WHERE id_traitement = %s",
        (traitement_id,),
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id_traitement": row[0],
        "id_requete": row[1],
        "id_administration": row[2],
        "date_traitement": row[3],
        "statut": row[4],
    }


def modifier_traitement(traitement_id: int, traitement: Traitement):
    conn, cursor = get_db_connection()
    cursor.execute(
        "UPDATE traitements SET id_requete = %s, id_administration = %s, date_traitement = %s, statut = %s WHERE id_traitement = %s",
        (
            traitement.id_requete,
            traitement.id_administration,
            traitement.date_traitement.isoformat() if hasattr(traitement.date_traitement, "isoformat") else traitement.date_traitement,
            traitement.statut,
            traitement_id,
        ),
    )
    conn.commit()
    conn.close()


def supprimer_traitement(traitement_id: int):
    conn, cursor = get_db_connection()
    cursor.execute("DELETE FROM traitements WHERE id_traitement = %s", (traitement_id,))
    conn.commit()
    conn.close()


@router.post("/add_traitement/")
async def creer_traitement(traitement: Traitement):
    message = ajouter_traitement(traitement)
    if message:
        return message
    return {"message": "Traitement ajouté avec succès."}


@router.get("/get_all_traitements/")
async def get_all_traitements():
    loop = asyncio.get_running_loop()
    traitements = await loop.run_in_executor(None, recuperer_tous_les_traitements)
    if traitements is None:
        raise HTTPException(status_code=404, detail="Aucun traitement trouvé")
    return traitements


@router.get("/get_traitement_by_id/{traitement_id}")
async def get_traitement(traitement_id: int):
    traitement = recuperer_traitement_par_id(traitement_id)
    if traitement is None:
        raise HTTPException(status_code=404, detail="Traitement non trouvé")
    return traitement


@router.put("/update_traitement/{traitement_id}")
async def update_traitement(traitement_id: int, traitement: Traitement):
    existing = recuperer_traitement_par_id(traitement_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Traitement non trouvé")
    modifier_traitement(traitement_id, traitement)
    return {"message": "Traitement mis à jour avec succès."}


@router.delete("/delete_traitement/{traitement_id}")
async def delete_traitement(traitement_id: int):
    existing = recuperer_traitement_par_id(traitement_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Traitement non trouvé")
    supprimer_traitement(traitement_id)
    return {"message": "Traitement supprimé avec succès."}


@router.get("/by_requete/{id_requete}")
async def get_traitements_par_requete(id_requete: int):
    conn, cursor = get_db_connection()
    cursor.execute("SELECT id_traitement, id_requete, id_administration, date_traitement, statut FROM traitements WHERE id_requete = %s", (id_requete,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id_traitement": row[0],
            "id_requete": row[1],
            "id_administration": row[2],
            "date_traitement": row[3],
            "statut": row[4],
        }
        for row in rows
    ]