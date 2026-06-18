from fastapi import APIRouter
from backend.minetteIA.minette import ask_minette

router = APIRouter()

@router.post("/chat")
async def chat(data: dict):
    answer = ask_minette(
        data.get("message", ""),
        student_context=data.get("student_context") or data.get("contexte_etudiant"),
        conversation_history=data.get("conversation_history"),
    )
    return {"response": answer}
