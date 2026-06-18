# backend/routers/documents_reponse_requete.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from typing import List, Optional
from datetime import date, datetime
import os
import shutil
import psycopg2
from backend.database.database import get_db_connection
# from backend.modeles.modeles import DocumentReponseRequete

router = APIRouter(prefix="/documents_reponse_requete", tags=["Documents Reponse Requete"])

# Configuration du dossier de stockage
UPLOAD_DIR = "uploads/documents_reponses"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# 1. Upload d'un document réponse
@router.post("/upload")
async def upload_document_reponse(
    id_requete: int = Form(...),
    id_etudiant: int = Form(...),
    titre: str = Form(...),
    description: str = Form(None),
    date_emission: str = Form(...),
    file: UploadFile = File(...)
):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        # Vérifier si la requête existe
        cursor.execute("SELECT id_requete FROM requetes WHERE id_requete = %s", (id_requete,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Requête non trouvée")
        
        # Vérifier si l'étudiant existe
        cursor.execute("SELECT id_etudiant FROM etudiants WHERE id_etudiant = %s", (id_etudiant,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        # Générer un nom de fichier unique
        extension = os.path.splitext(file.filename)[1]
        unique_filename = f"doc_reponse_{id_requete}_{id_etudiant}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Sauvegarder le fichier
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_path)
        
        # Insérer dans la base de données
        cursor.execute("""
            INSERT INTO document_reponse_requete 
            (id_requete, id_etudiant, titre, description, chemin_fichier, type_fichier, taille, date_emission)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id_document
        """, (id_requete, id_etudiant, titre, description, unique_filename, file.content_type, file_size, date_emission))
        
        id_document = cursor.fetchone()[0]
        conn.commit()
        
        return {"message": "Document uploadé avec succès", "id_document": id_document}
    
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 2. Récupérer tous les documents d'un étudiant
@router.get("/etudiant/{id_etudiant}")
async def get_documents_by_etudiant(id_etudiant: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        cursor.execute("""
            SELECT d.*, r.id_type_requete as requete_type
            FROM document_reponse_requete d
            JOIN requetes r ON d.id_requete = r.id_requete
            WHERE d.id_etudiant = %s AND (d.statut = 'disponible' OR d.statut IS NULL)
            ORDER BY d.date_emission DESC
        """, (id_etudiant,))
        
        rows = cursor.fetchall()
        
        # Récupérer les noms des colonnes
        colnames = [desc[0] for desc in cursor.description]
        
        documents = []
        for row in rows:
            doc_dict = {}
            for i, col in enumerate(colnames):
                doc_dict[col] = row[i]
            documents.append(doc_dict)
        
        return documents
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 3. Récupérer les documents d'une requête spécifique
@router.get("/requete/{id_requete}")
async def get_documents_by_requete(id_requete: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        cursor.execute("""
            SELECT * FROM document_reponse_requete 
            WHERE id_requete = %s AND (statut = 'disponible' OR statut IS NULL)
            ORDER BY date_emission DESC
        """, (id_requete,))
        
        rows = cursor.fetchall()
        colnames = [desc[0] for desc in cursor.description]
        
        documents = []
        for row in rows:
            doc_dict = {}
            for i, col in enumerate(colnames):
                doc_dict[col] = row[i]
            documents.append(doc_dict)
        
        return documents
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 4. Télécharger un document
@router.get("/download/{id_document}")
async def download_document(id_document: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        cursor.execute("""
            SELECT chemin_fichier, titre, type_fichier FROM document_reponse_requete 
            WHERE id_document = %s AND (statut = 'disponible' OR statut IS NULL)
        """, (id_document,))
        
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Document non trouvé")
        
        chemin_fichier = row[0]
        titre = row[1]
        type_fichier = row[2]
        
        file_path = os.path.join(UPLOAD_DIR, chemin_fichier)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Fichier non trouvé sur le serveur")
        
        extension = os.path.splitext(chemin_fichier)[1]
        download_name = f"{titre.replace(' ', '_')}{extension}"
        
        return FileResponse(
            path=file_path,
            media_type=type_fichier,
            filename=download_name
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 5. Supprimer un document (soft delete)
@router.delete("/{id_document}")
async def delete_document(id_document: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        cursor.execute("""
            UPDATE document_reponse_requete 
            SET statut = 'supprime', updated_at = CURRENT_TIMESTAMP
            WHERE id_document = %s
            RETURNING id_document
        """, (id_document,))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Document non trouvé")
        
        conn.commit()
        return {"message": "Document supprimé avec succès"}
    
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 6. Obtenir les statistiques des documents par étudiant
@router.get("/statistiques/{id_etudiant}")
async def get_documents_statistiques(id_etudiant: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN EXTRACT(YEAR FROM date_emission) = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) as cette_annee,
                COUNT(CASE WHEN EXTRACT(MONTH FROM date_emission) = EXTRACT(MONTH FROM CURRENT_DATE) THEN 1 END) as ce_mois
            FROM document_reponse_requete 
            WHERE id_etudiant = %s AND (statut = 'disponible' OR statut IS NULL)
        """, (id_etudiant,))
        
        row = cursor.fetchone()
        
        # Récupérer les stats par type de fichier
        cursor.execute("""
            SELECT type_fichier, COUNT(*) as count
            FROM document_reponse_requete 
            WHERE id_etudiant = %s AND (statut = 'disponible' OR statut IS NULL)
            GROUP BY type_fichier
        """, (id_etudiant,))
        
        type_rows = cursor.fetchall()
        
        stats = {
            "total": row[0] or 0,
            "cette_annee": row[1] or 0,
            "ce_mois": row[2] or 0,
            "par_type": {}
        }
        
        for type_row in type_rows:
            stats["par_type"][type_row[0]] = type_row[1]
        
        return stats
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# 1. Upload d'un document réponse
@router.post("/upload")
async def upload_document_reponse(
    id_requete: int = Form(...),
    id_etudiant: int = Form(...),
    titre: str = Form(...),
    description: str = Form(None),
    date_emission: str = Form(...),
    file: UploadFile = File(...)
):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        # Vérifier si la requête existe
        cursor.execute("SELECT id_requete FROM requetes WHERE id_requete = %s", (id_requete,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Requête non trouvée")
        
        # Vérifier si l'étudiant existe
        cursor.execute("SELECT id_etudiant FROM etudiants WHERE id_etudiant = %s", (id_etudiant,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        # Vérifier la date d'émission
        try:
            emission_date = datetime.strptime(date_emission, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide. Utilisez YYYY-MM-DD")
        
        # Générer un nom de fichier unique
        extension = os.path.splitext(file.filename)[1]
        unique_filename = f"doc_reponse_{id_requete}_{id_etudiant}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Sauvegarder le fichier
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_path)
        
        # Insérer dans la base de données
        cursor.execute("""
            INSERT INTO document_reponse_requete 
            (id_requete, id_etudiant, titre, description, chemin_fichier, type_fichier, taille, date_emission)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id_document
        """, (id_requete, id_etudiant, titre, description, unique_filename, file.content_type, file_size, emission_date))
        
        id_document = cursor.fetchone()[0]
        conn.commit()
        
        return {
            "message": "Document uploadé avec succès", 
            "id_document": id_document,
            "filename": unique_filename,
            "size": file_size,
            "date_emission": emission_date.isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 2. Récupérer tous les documents d'un étudiant avec détails de la requête
@router.get("/etudiant/{id_etudiant}")
async def get_documents_by_etudiant(id_etudiant: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        cursor.execute("""
            SELECT 
                d.id_document,
                d.id_requete,
                d.id_etudiant,
                d.titre,
                d.description,
                d.chemin_fichier,
                d.type_fichier,
                d.taille,
                d.statut,
                d.date_emission,
                d.date_upload,
                d.created_at,
                d.updated_at,
                r.type_requete as requete_type,
                r.statut as requete_statut,
                r.date_requete,
                t.titre as type_requete_titre
            FROM document_reponse_requete d
            JOIN requetes r ON d.id_requete = r.id_requete
            JOIN type_requetes t ON r.id_type_requete = t.id_type_requete
            WHERE d.id_etudiant = %s AND (d.statut = 'disponible' OR d.statut IS NULL)
            ORDER BY d.date_emission DESC
        """, (id_etudiant,))
        
        rows = cursor.fetchall()
        
        documents = []
        for row in rows:
            documents.append({
                "id_document": row[0],
                "id_requete": row[1],
                "id_etudiant": row[2],
                "titre": row[3],
                "description": row[4],
                "chemin_fichier": row[5],
                "type_fichier": row[6],
                "taille": row[7],
                "statut": row[8],
                "date_emission": row[9].isoformat() if row[9] else None,
                "date_upload": row[10].isoformat() if row[10] else None,
                "created_at": row[11].isoformat() if row[11] else None,
                "updated_at": row[12].isoformat() if row[12] else None,
                "requete_type": row[13],
                "requete_statut": row[14],
                "date_requete": row[15].isoformat() if row[15] else None,
                "type_requete_titre": row[16]
            })
        
        return documents
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 3. Récupérer les documents d'une requête spécifique
@router.get("/requete/{id_requete}")
async def get_documents_by_requete(id_requete: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        # Vérifier si la requête existe
        cursor.execute("SELECT id_requete FROM requetes WHERE id_requete = %s", (id_requete,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Requête non trouvée")
        
        cursor.execute("""
            SELECT 
                d.id_document,
                d.id_requete,
                d.id_etudiant,
                d.titre,
                d.description,
                d.chemin_fichier,
                d.type_fichier,
                d.taille,
                d.statut,
                d.date_emission,
                d.date_upload,
                d.created_at,
                d.updated_at,
                e.nom as etudiant_nom,
                e.prenom as etudiant_prenom,
                e.matricule
            FROM document_reponse_requete d
            JOIN etudiants e ON d.id_etudiant = e.id_etudiant
            WHERE d.id_requete = %s AND (d.statut = 'disponible' OR d.statut IS NULL)
            ORDER BY d.date_emission DESC
        """, (id_requete,))
        
        rows = cursor.fetchall()
        
        documents = []
        for row in rows:
            documents.append({
                "id_document": row[0],
                "id_requete": row[1],
                "id_etudiant": row[2],
                "titre": row[3],
                "description": row[4],
                "chemin_fichier": row[5],
                "type_fichier": row[6],
                "taille": row[7],
                "statut": row[8],
                "date_emission": row[9].isoformat() if row[9] else None,
                "date_upload": row[10].isoformat() if row[10] else None,
                "created_at": row[11].isoformat() if row[11] else None,
                "updated_at": row[12].isoformat() if row[12] else None,
                "etudiant_nom": row[13],
                "etudiant_prenom": row[14],
                "etudiant_matricule": row[15]
            })
        
        return documents
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 4. Télécharger un document
@router.get("/download/{id_document}")
async def download_document(id_document: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        cursor.execute("""
            SELECT chemin_fichier, titre, type_fichier FROM document_reponse_requete 
            WHERE id_document = %s AND (statut = 'disponible' OR statut IS NULL)
        """, (id_document,))
        
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Document non trouvé")
        
        chemin_fichier = row[0]
        titre = row[1]
        type_fichier = row[2]
        
        file_path = os.path.join(UPLOAD_DIR, chemin_fichier)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Fichier non trouvé sur le serveur")
        
        # Nettoyer le nom du fichier pour le téléchargement
        clean_title = "".join(c for c in titre if c.isalnum() or c in "._- ").strip()
        extension = os.path.splitext(chemin_fichier)[1]
        download_name = f"{clean_title.replace(' ', '_')}{extension}"
        
        return FileResponse(
            path=file_path,
            media_type=type_fichier,
            filename=download_name,
            headers={"Content-Disposition": f"attachment; filename={download_name}"}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du téléchargement: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 5. Supprimer un document (soft delete)
@router.delete("/{id_document}")
async def delete_document(id_document: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        # Vérifier si le document existe et récupérer son statut actuel
        cursor.execute("""
            SELECT statut FROM document_reponse_requete 
            WHERE id_document = %s
        """, (id_document,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document non trouvé")
        
        # Soft delete: marquer comme supprimé
        cursor.execute("""
            UPDATE document_reponse_requete 
            SET statut = 'supprime', updated_at = CURRENT_TIMESTAMP
            WHERE id_document = %s
            RETURNING id_document
        """, (id_document,))
        
        conn.commit()
        
        return {
            "message": "Document supprimé avec succès", 
            "id_document": id_document,
            "ancien_statut": row[0]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 6. Obtenir les statistiques des documents par étudiant
@router.get("/statistiques/{id_etudiant}")
async def get_documents_statistiques(id_etudiant: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        # Vérifier si l'étudiant existe
        cursor.execute("SELECT id_etudiant FROM etudiants WHERE id_etudiant = %s", (id_etudiant,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        # Statistiques générales
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN EXTRACT(YEAR FROM date_emission) = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) as cette_annee,
                COUNT(CASE WHEN EXTRACT(MONTH FROM date_emission) = EXTRACT(MONTH FROM CURRENT_DATE) THEN 1 END) as ce_mois,
                COUNT(CASE WHEN EXTRACT(WEEK FROM date_emission) = EXTRACT(WEEK FROM CURRENT_DATE) THEN 1 END) as cette_semaine
            FROM document_reponse_requete 
            WHERE id_etudiant = %s AND (statut = 'disponible' OR statut IS NULL)
        """, (id_etudiant,))
        
        row = cursor.fetchone()
        
        # Statistiques par type de requête
        cursor.execute("""
            SELECT 
                t.titre as type_requete,
                COUNT(*) as count
            FROM document_reponse_requete d
            JOIN requetes r ON d.id_requete = r.id_requete
            JOIN type_requetes t ON r.id_type_requete = t.id_type_requete
            WHERE d.id_etudiant = %s AND (d.statut = 'disponible' OR d.statut IS NULL)
            GROUP BY t.titre
            ORDER BY count DESC
        """, (id_etudiant,))
        
        type_rows = cursor.fetchall()
        
        # Statistiques par type de fichier
        cursor.execute("""
            SELECT 
                type_fichier, 
                COUNT(*) as count,
                SUM(taille) as total_size
            FROM document_reponse_requete 
            WHERE id_etudiant = %s AND (statut = 'disponible' OR statut IS NULL)
            GROUP BY type_fichier
            ORDER BY count DESC
        """, (id_etudiant,))
        
        file_rows = cursor.fetchall()
        
        # Statistiques par année
        cursor.execute("""
            SELECT 
                EXTRACT(YEAR FROM date_emission) as annee,
                COUNT(*) as count
            FROM document_reponse_requete 
            WHERE id_etudiant = %s AND (statut = 'disponible' OR statut IS NULL)
            GROUP BY EXTRACT(YEAR FROM date_emission)
            ORDER BY annee DESC
        """, (id_etudiant,))
        
        year_rows = cursor.fetchall()
        
        stats = {
            "total": row[0] or 0,
            "cette_annee": row[1] or 0,
            "ce_mois": row[2] or 0,
            "cette_semaine": row[3] or 0,
            "par_type_requete": {type_rows[i][0]: type_rows[i][1] for i in range(len(type_rows))},
            "par_type_fichier": {file_rows[i][0]: {
                "count": file_rows[i][1],
                "total_size": file_rows[i][2]
            } for i in range(len(file_rows))},
            "par_annee": {int(year_rows[i][0]): year_rows[i][1] for i in range(len(year_rows))}
        }
        
        return stats
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des statistiques: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 7. Obtenir un document par son ID (pour aperçu)
@router.get("/{id_document}")
async def get_document_by_id(id_document: int):
    conn = None
    cursor = None
    try:
        conn, cursor = get_db_connection()
        
        cursor.execute("""
            SELECT 
                d.id_document,
                d.id_requete,
                d.id_etudiant,
                d.titre,
                d.description,
                d.chemin_fichier,
                d.type_fichier,
                d.taille,
                d.statut,
                d.date_emission,
                d.date_upload,
                d.created_at,
                d.updated_at,
                r.type_requete as requete_type,
                r.statut as requete_statut,
                t.titre as type_requete_titre,
                e.nom as etudiant_nom,
                e.prenom as etudiant_prenom
            FROM document_reponse_requete d
            JOIN requetes r ON d.id_requete = r.id_requete
            JOIN type_requetes t ON r.id_type_requete = t.id_type_requete
            JOIN etudiants e ON d.id_etudiant = e.id_etudiant
            WHERE d.id_document = %s AND (d.statut = 'disponible' OR d.statut IS NULL)
        """, (id_document,))
        
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Document non trouvé")
        
        return {
            "id_document": row[0],
            "id_requete": row[1],
            "id_etudiant": row[2],
            "titre": row[3],
            "description": row[4],
            "chemin_fichier": row[5],
            "type_fichier": row[6],
            "taille": row[7],
            "statut": row[8],
            "date_emission": row[9].isoformat() if row[9] else None,
            "date_upload": row[10].isoformat() if row[10] else None,
            "created_at": row[11].isoformat() if row[11] else None,
            "updated_at": row[12].isoformat() if row[12] else None,
            "requete_type": row[13],
            "requete_statut": row[14],
            "type_requete_titre": row[15],
            "etudiant_nom": row[16],
            "etudiant_prenom": row[17]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()