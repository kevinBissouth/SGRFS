from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import date
from datetime import date, datetime

from typing import Optional

# PYDANTIC MODELE POUR LA VALIDATION DES DONNEES

class Roles(BaseModel):
    id_role: int
    titre_role: str = Field(min_length=2, max_lenght=50)
    

class Administration(BaseModel):
    id_administration : int
    nom: str = Field(min_length=2, max_lenght=20)
    prenom: str = Field(min_length=2, max_lenght=100)
    email: EmailStr
    telephone: int
    mot_de_passe : str = Field(min_length=8)
    id_role: int
    
    
class Filiere(BaseModel):
    id_filiere: int
    nom: str = Field(min_length=2, max_lenght=20)
    description: str = Field(min_lenght=8)
    
    
class Niveau(BaseModel):
    id_niveau: int
    niveau : str = Field(min_length=2, max_length=2)
    id_filiere: int


class Profils_etudiants(BaseModel):
    # id_profil: int
    id_etudiant: int
    niveau_2: int
    poste: str
    
    
class Etudiant(BaseModel):
    # id_etudiant: int
    matricule: str = Field(min_length=9, max_length=12)
    nom: str = Field(min_length=2, max_length=20)
    prenom: str = Field(min_length=2, max_length=100)
    date_naissance : date
    email: EmailStr
    mot_de_passe: str = Field(min_length=8)
    telephone: int
    id_niveau: int
    
    
class Type_requetes(BaseModel):
    id_type_requete: int
    titre: str = Field(min_length=2, max_lenght=50)
    description: str
    
    
class Circuits(BaseModel):
    id_circuit: int
    id_type_requete: int
    titre: str
    
    
class Etape_circuits(BaseModel):
    id_etape_circuit: int
    id_circuit: int
    order: int
    id_administration: int
    
    
class exigences(BaseModel):
    id_exigence: int
    titre: str = Field(min_length=2, max_lenght=50)
    
    
    
class exigences_types_requetes(BaseModel):
    id_type_exigence: int
    id_type_requete: int
    id_exigence: int
    
    
class Ues(BaseModel):
    id_ues: int
    code_ues: str
    intitule: str = Field(min_length=2, max_lenght=50)
    id_niveau: int
    id_professeur: int
    

class Requetes(BaseModel):
    id_requete:  Optional[int] = None
    id_etudiant: int
    date_requete: date
    id_type_requete: int
    id_ues: int | None
    statut: str = Field(min_length=2, max_lenght=20)
    
    
class Documents(BaseModel):
    id_document: Optional[int] = None
    id_exigence: int
    id_requete: int

    nom_original: str
    chemin: str

    type_fichier: str
    
class Traitement(BaseModel):
    id_traitement: int
    id_requete: int
    id_administration: int
    date_traitement: date
    commentaire: str | None
    statut: str = Field(min_length=2, max_lenght=50)
    


class Login_request_etudiant(BaseModel):
    matricule: str
    mot_de_passe: str
    
class LoginRequest_administration(BaseModel):
    email: str
    mot_de_passe: str
    

# Modèles Pydantic
class DocumentReponseBase(BaseModel):
    id_requete: int
    id_etudiant: int
    titre: str
    description: Optional[str] = None
    type_fichier: str
    taille: int
    date_emission: date

class DocumentReponseCreate(DocumentReponseBase):
    pass

class DocumentReponseUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    statut: Optional[str] = None

class DocumentReponse(DocumentReponseBase):
    id_document: int
    chemin_fichier: str
    statut: str
    date_upload: datetime
    created_at: datetime
    updated_at: datetime
