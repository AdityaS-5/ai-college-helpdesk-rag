from fastapi import APIRouter
from pydantic import BaseModel
from app.rag.chatbot import generate_answer

router = APIRouter()


class ChatRequest(BaseModel):
    question: str


@router.post("/chat")
def chat(request: ChatRequest):
    response = generate_answer(request.question)

    return {
        "question": request.question,
        "answer": response["answer"],
        "sources": response["sources"]
    }