from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import psycopg2
from backend.routers import (
    etudiants,
    filieres,
    niveaux,
    administrations,
    ues,
    type_requetes,
    circuits,
    etapes_circuits,
    requetes,
    documents,
    documents_reponse_requete, 
    minetteIA,
)

from fastapi.staticfiles import StaticFiles


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# À mettre TOUT EN BAS du fichier main.py, après tous les include_router
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.exception_handler(psycopg2.IntegrityError)
async def integrity_error_handler(request: Request, exc: psycopg2.IntegrityError):
    return JSONResponse(
        status_code=409,
        content={"detail": "Cette donnée existe déjà ou une référence est invalide."},
    )


@app.exception_handler(psycopg2.Error)
async def database_error_handler(request: Request, exc: psycopg2.Error):
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur base de données. Veuillez réessayer.", "detail2": f"{exc}"},
    )


app.include_router(etudiants.router)
app.include_router(filieres.router)
app.include_router(niveaux.router)
app.include_router(administrations.router)
app.include_router(ues.router)
app.include_router(type_requetes.router)
app.include_router(circuits.router)
app.include_router(etapes_circuits.router)
app.include_router(requetes.router)
app.include_router(documents.router)
app.include_router(documents_reponse_requete.router)
app.include_router(minetteIA.router,prefix="/ai")
