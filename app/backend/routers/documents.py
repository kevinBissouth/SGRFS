from fastapi import HTTPException, APIRouter
import asyncio
import psycopg2
from typing import List
import os
import uuid
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from backend.database.database import get_db_connection
from backend.modeles.modeles import Documents

router = APIRouter(prefix="/documents", tags=["documents"])


# Dossier où stocker les fichiers
UPLOAD_DIR = "uploads/documents"

# Créer le dossier s'il n'existe pas
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    id_exigence: int = Form(...),
    id_requete: int = Form(...)
):
    """
    Upload un document (PDF, JPG, PNG) lié à une exigence et une requête.
    """
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Type de fichier non autorisé. Utilisez JPG, PNG ou PDF."
        )

    content = await file.read()
    max_size = 10 * 1024 * 1024  
    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Fichier trop volumineux. Maximum 10 Mo."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(content)

    conn, cursor = get_db_connection()

    try:
        cursor.execute(
            """
            INSERT INTO documents (
                id_exigence,
                id_requete,
                nom_original,
                chemin,
                type_fichier
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id_document
            """,
            (
                id_exigence,
                id_requete,
                file.filename,
                file_path,
                file.content_type
            )
        )

        id_document = cursor.fetchone()[0]
        conn.commit()

        return {
            "message": "Document uploadé avec succès",
            "id_document": id_document,
            "nom_original": file.filename,
            "chemin": file_path,
            "type_fichier": file.content_type
        }

    except Exception as e:
        conn.rollback()
        # Supprimer le fichier si l'enregistrement échoue
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'enregistrement : {str(e)}"
        )

    finally:
        cursor.close()
        conn.close()

def ajouter_document(document: Documents):
    conn, cursor = get_db_connection()

    try:
        cursor.execute(
            """
            INSERT INTO documents(
                id_exigence,
                id_requete,
                nom_original,
                chemin,
                type_fichier
            )
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                document.id_exigence,
                document.id_requete,
                document.nom_original,
                document.chemin,
                document.type_fichier
            ),
        )

        conn.commit()

    except psycopg2.IntegrityError:
        conn.rollback()
        return {
            "error": "Document déjà existant ou référence invalide."
        }

    finally:
        cursor.close()
        conn.close()
        
        
def recuperer_tous_les_documents():
    conn, cursor = get_db_connection()

    cursor.execute("""
        SELECT
            id_document,
            id_exigence,
            id_requete,
            nom_original,
            chemin,
            type_fichier
        FROM documents
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "id_document": row[0],
            "id_exigence": row[1],
            "id_requete": row[2],
            "nom_original": row[3],
            "chemin": row[4],
            "type_fichier": row[5]
        }
        for row in rows
    ]

def recuperer_document_par_id(document_id: int):
    conn, cursor = get_db_connection()

    cursor.execute(
        """
        SELECT
            id_document,
            id_exigence,
            id_requete,
            nom_original,
            chemin,
            type_fichier
        FROM documents
        WHERE id_document = %s
        """,
        (document_id,),
    )

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if not row:
        return None

    return {
        "id_document": row[0],
        "id_exigence": row[1],
        "id_requete": row[2],
        "nom_original": row[3],
        "chemin": row[4],
        "type_fichier": row[5]
    }
    
    
def modifier_document(document_id: int, document: Documents):
    conn, cursor = get_db_connection()

    cursor.execute(
        """
        UPDATE documents
        SET
            id_exigence = %s,
            id_requete = %s,
            nom_original = %s,
            chemin = %s,
            type_fichier = %s
        WHERE id_document = %s
        """,
        (
            document.id_exigence,
            document.id_requete,
            document.nom_original,
            document.chemin,
            document.type_fichier,
            document_id
        ),
    )

    conn.commit()

    cursor.close()
    conn.close()
    
    
def supprimer_document(document_id: int):
    conn, cursor = get_db_connection()

    cursor.execute(
        "DELETE FROM documents WHERE id_document = %s",
        (document_id,)
    )

    conn.commit()

    cursor.close()
    conn.close()
    
    

@router.post("/add_document/")
async def creer_document(document: Documents):
    message = ajouter_document(document)
    if message:
        raise HTTPException(status_code=409, detail=message["error"])
    return {"message": "Document ajouté avec succès."}


@router.get("/get_all_documents/")
async def get_all_documents():
    loop = asyncio.get_running_loop()
    documents = await loop.run_in_executor(None, recuperer_tous_les_documents)
    if documents is None:
        raise HTTPException(status_code=404, detail="Aucun document trouvé")
    return documents


@router.get("/get_document_by_id/{document_id}")
async def get_document(document_id: int):
    document = recuperer_document_par_id(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    return document


@router.put("/update_document/{document_id}")
async def update_document(document_id: int, document: Documents):
    existing = recuperer_document_par_id(document_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    modifier_document(document_id, document)
    return {"message": "Document mis à jour avec succès."}


@router.delete("/delete_document/{document_id}")
async def delete_document(document_id: int):
    existing = recuperer_document_par_id(document_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    supprimer_document(document_id)
    return {"message": "Document supprimé avec succès."}


@router.get("/by_requete/{id_requete}")
async def get_documents_par_requete(id_requete: int):
    conn, cursor = get_db_connection()
    cursor.execute("SELECT id_document, id_exigence, id_requete, nom_original, chemin, type_fichier FROM documents WHERE id_requete = %s", (id_requete,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id_document": row[0],
            "id_exigence": row[1],
            "id_requete": row[2],
            "nom_original": row[3],
            "chemin": row[4],        # ← Vérifie que c'est bien row[4]
            "type_fichier": row[5]
        }
        for row in rows
    ]


@router.get("/by_requete/{id_requete}")
async def get_documents_par_requete(id_requete: int):

    conn, cursor = get_db_connection()

    cursor.execute(
        """
        SELECT
            id_document,
            id_exigence,
            id_requete,
            nom_original,
            chemin,
            type_fichier
        FROM documents
        WHERE id_requete = %s
        """,
        (id_requete,)
    )

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "id_document": row[0],
            "id_exigence": row[1],
            "id_requete": row[2],
            "nom_original": row[3],
            "chemin": row[4],
            "type_fichier": row[5]
        }
        for row in rows
    ]