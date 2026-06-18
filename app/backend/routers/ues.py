from fastapi import HTTPException, APIRouter
import asyncio
import psycopg2
from typing import List
from backend.database.database import get_db_connection
from backend.modeles.modeles import Ues

router = APIRouter(prefix="/ues", tags=["ues"])


def ajouter_ue(ue: Ues):
    conn, cursor = get_db_connection()
    try:
        cursor.execute(
            "INSERT INTO ues(code_ues, intitule, id_niveau, id_professeur) VALUES (%s, %s, %s, %s)",
            (ue.code_ues, ue.intitule, ue.id_niveau, ue.id_professeur),
        )
        conn.commit()
    except psycopg2.IntegrityError:
        conn.rollback()
        return {"error": "UE déjà existante ou référence invalide."}
    finally:
        conn.close()


def recuperer_toutes_les_ues():
    conn, cursor = get_db_connection()
    cursor.execute("""SELECT id_ues, intitule, n.niveau , f.nom, a.*
                   FROM ues u
                   JOIN niveaux n ON u.id_niveau = n.id_niveau
                   JOIN filieres f ON n.id_filiere = f.id_filiere
                   JOIN administration a ON u.id_professeur = a.id_administration
                   """)
    rows = cursor.fetchall()
    conn.close()
    return [
        {"id_ues": row[0], "intitule": row[1], "niveau": row[2], "filiere": row[3], "nom_professeur": row[5], "prenom_professeur": row[6], "email_professeur":row[8] } for row in rows
    ]
    

def recuperer_ue_par_niveau(id_niveau: int):
    conn, cursor = get_db_connection()
    
    cursor.execute("""SELECT id_ues, intitule, n.niveau , f.nom, a.*
                   FROM ues u
                   JOIN niveaux n ON u.id_niveau = n.id_niveau
                   JOIN filieres f ON n.id_filiere = f.id_filiere
                   JOIN administration a ON u.id_professeur = a.id_administration
                   WHERE u.id_niveau = %s
                   """, (id_niveau,))
    rows = cursor.fetchall()
    conn.close()
    if not rows:
        return None
    return [
        {
            "id_ues": row[0], 
            "intitule": row[1], 
            "niveau": row[2], 
            "filiere": row[3], 
            "nom_professeur": row[5], 
            "prenom_professeur": row[6], 
            "email_professeur":row[8] 
        } 
        for row in rows
    ]



def recuperer_ue_par_id(ue_id: int):
    conn, cursor = get_db_connection()
    
    cursor.execute("""SELECT id_ues, intitule, n.niveau , f.nom, a.*
                   FROM ues u
                   JOIN niveaux n ON u.id_niveau = n.id_niveau
                   JOIN filieres f ON n.id_filiere = f.id_filiere
                   JOIN administration a ON u.id_professeur = a.id_administration
                   WHERE id_ues = %s
                   """, (ue_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return [
        {"id_ues": row[0], "intitule": row[1], "niveau": row[2], "filiere": row[3], "nom_professeur": row[5], "prenom_professeur": row[6], "email_professeur":row[8] }
    ]

def modifier_ue(ue_id: int, ue: Ues):
    conn, cursor = get_db_connection()
    cursor.execute(
        "UPDATE ues SET intitule = %s, id_niveau = %s, id_professeur = %s WHERE id_ues = %s",
        (ue.intitule, ue.id_niveau, ue.id_professeur, ue_id),
    )
    conn.commit()
    conn.close()


def supprimer_ue(ue_id: int):
    conn, cursor = get_db_connection()
    cursor.execute("DELETE FROM ues WHERE id_ues = %s", (ue_id,))
    conn.commit()
    conn.close()


@router.post("/add_ue/")
async def creer_ue(ue: Ues):
    message = ajouter_ue(ue)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "UE ajoutée avec succès."}


@router.get("/get_all_ues/")
async def get_all_ues():
    loop = asyncio.get_running_loop()
    ues = await loop.run_in_executor(None, recuperer_toutes_les_ues)
    if ues is None:
        raise HTTPException(status_code=404, detail="Aucune UE trouvée")
    return ues


@router.get("/get_ue_by_id/{ue_id}")
async def get_ue(ue_id: int):
    ue = recuperer_ue_par_id(ue_id)
    if ue is None:
        raise HTTPException(status_code=404, detail="UE non trouvée")
    return ue


@router.get("/get_ue_by_level/{id_niveau}")
async def get_ue(id_niveau: int):
    ue = recuperer_ue_par_niveau(id_niveau)
    if ue is None:
        raise HTTPException(status_code=404, detail="ues non trouvées")
    return ue


@router.put("/update_ue/{ue_id}")
async def update_ue(ue_id: int, ue: Ues):
    existing = recuperer_ue_par_id(ue_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="UE non trouvée")
    modifier_ue(ue_id, ue)
    return {"message": "UE mise à jour avec succès."}


@router.delete("/delete_ue/{ue_id}")
async def delete_ue(ue_id: int):
    existing = recuperer_ue_par_id(ue_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="UE non trouvée")
    supprimer_ue(ue_id)
    return {"message": "UE supprimée avec succès."}


@router.get("/by_niveau/{id_niveau}")
async def get_ues_par_niveau(id_niveau: int):
    conn, cursor = get_db_connection()
    cursor.execute("SELECT id_ues, intitule, id_niveau, id_professeur FROM ues WHERE id_niveau = %s", (id_niveau,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {"id_ues": row[0], "intitule": row[1], "id_niveau": row[2], "id_professeur": row[3]} for row in rows
    ]
