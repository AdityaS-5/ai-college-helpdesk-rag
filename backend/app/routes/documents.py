import os
from pathlib import Path
from fastapi import APIRouter, UploadFile, File
from app.rag.pdf_loader import extract_text_from_pdf
from app.rag.chunker import chunk_text
from app.rag.vector_store import (
    add_chunks_to_vector_db,
    reset_vector_db,
    list_indexed_documents
)

router = APIRouter()
BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "uploads"


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        return {
            "error": "Only PDF files are allowed"
        }

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    already_exists = os.path.exists(file_path)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    pages = extract_text_from_pdf(file_path)
    chunks = chunk_text(pages)

    if not chunks:
        return {
            "error": "No readable text found in PDF. Please upload a text-based PDF."
        }

    add_chunks_to_vector_db(chunks, file.filename)

    return {
    "message": "PDF uploaded and indexed successfully",
    "file_name": file.filename,
    "already_existed": already_exists,
    "total_pages": len(pages),
    "total_chunks": len(chunks)
}
@router.get("/documents")
def list_documents():
    if not os.path.exists(UPLOAD_DIR):
        return {
            "documents": []
        }

    files = []

    for file_name in os.listdir(UPLOAD_DIR):
        if file_name.lower().endswith(".pdf"):
            file_path = os.path.join(UPLOAD_DIR, file_name)
            files.append({
                "file_name": file_name,
                "size_kb": round(os.path.getsize(file_path) / 1024, 2)
            })

    return {
        "documents": files
    }
@router.delete("/reset-vector-db")
def reset_database():
    reset_vector_db()

    return {
        "message": "Vector database reset successfully. Please re-upload documents."
    }


@router.delete("/documents/{file_name:path}")
def delete_document(file_name: str):
    file_path = UPLOAD_DIR / file_name

    print("DELETE REQUEST FILE NAME:", file_name)
    print("CHECKING FILE PATH:", file_path)
    print("FILE EXISTS:", file_path.exists())

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"File not found: {file_path}"
        )

    file_path.unlink()

    return {
        "message": "Document deleted successfully",
        "file_name": file_name
    }
@router.get("/vector-documents")
def get_vector_documents():
    return {
        "indexed_documents": list_indexed_documents()
    }
@router.post("/reindex-all")
def reindex_all_documents():
    reset_vector_db()
    if not UPLOAD_DIR.exists():
        return {
            "message": "Uploads folder not found",
            "indexed_documents": []
        }

    indexed_documents = []

    for file_path in UPLOAD_DIR.iterdir():
        if file_path.is_file() and file_path.name.lower().endswith(".pdf"):
            pages = extract_text_from_pdf(str(file_path))
            chunks = chunk_text(pages)

            if chunks:
                add_chunks_to_vector_db(chunks, file_path.name)

                indexed_documents.append({
                    "file_name": file_path.name,
                    "total_pages": len(pages),
                    "total_chunks": len(chunks)
                })

    return {
        "message": "All uploaded PDFs re-indexed successfully",
        "indexed_documents": indexed_documents
    }