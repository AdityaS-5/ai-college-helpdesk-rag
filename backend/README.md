# AI College Helpdesk RAG Bot - Backend

This is the backend for an AI-powered college helpdesk chatbot. It uses Retrieval-Augmented Generation to answer student queries from uploaded college PDF documents.

## Features

- Upload college PDF documents
- Extract text from PDFs
- Split documents into chunks
- Generate embeddings using Sentence Transformers
- Store and search chunks using ChromaDB
- Generate answers using Gemini API
- Fallback answer generation when LLM API fails
- Return source document and page number

## Tech Stack

- FastAPI
- Python
- PyMuPDF
- Sentence Transformers
- ChromaDB
- Gemini API
- Uvicorn

## API Endpoints

### Health Check

GET /health

### Upload PDF

POST /upload

### Ask Question

POST /chat

Request:

```json
{
  "question": "What is the attendance requirement?"
}
Response:

{
  "question": "What is the attendance requirement?",
  "answer": "Students must maintain 75% attendance to appear for semester examinations.",
  "sources": [
    {
      "document_name": "college_rules.pdf",
      "page_number": 1
    }
  ]
}
List Documents

GET /documents

How to Run
py -m venv venv
.\venv\Scripts\activate
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload
Environment Variables

Create a .env file:

GEMINI_API_KEY=your_api_key_here

---

# Step 6: Current project milestone

You can now write in your resume later:

```text id="qme6x6"
Built the backend of an AI College Helpdesk RAG Bot using FastAPI, ChromaDB, Sentence Transformers, and Gemini API to answer student queries from uploaded college PDFs with source citations.
## Dataset

This project uses publicly available college documents from the official Mepco Schlenk Engineering College website for demonstration, including:

- UG Regulations 2023
- Code of Conduct Handbook
- UG Regulations 2019

The documents are used only for educational and project demonstration purposes.