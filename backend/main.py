from fastapi import FastAPI
from app.routes.chat import router as chat_router
from app.routes.documents import router as documents_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI College Helpdesk RAG Bot",
    description="Backend API for college document question answering",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat_router)
app.include_router(documents_router)


@app.get("/")
def home():
    return {
        "message": "AI College Helpdesk RAG Bot Backend Running"
    }
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "AI College Helpdesk RAG Bot"
    }
