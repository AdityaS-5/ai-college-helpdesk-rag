import os
import google.generativeai as genai
from dotenv import load_dotenv
from app.rag.vector_store import search_similar_chunks

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None


def generate_simple_answer(question, documents):
    """
    Fallback answer when Gemini API is unavailable/quota exceeded.
    For now, return the most relevant retrieved chunk.
    """
    if not documents:
        return "I could not find this information in the uploaded college documents."

    return documents[0]


def generate_answer(question):
    results = search_similar_chunks(question, top_k=3)

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0] if "distances" in results else []

    if not documents:
        return {
            "answer": "I could not find this information in the uploaded college documents.",
            "sources": []
        }

    sources = []
    for index, meta in enumerate(metadatas):
        source = {
            "document_name": meta["document_name"],
            "page_number": meta["page_number"]
        }

        if distances:
            source["distance"] = round(distances[index], 4)

        if source not in sources:
            sources.append(source)

    context = "\n\n".join(documents)

    prompt = f"""
You are an AI College Helpdesk assistant.

Your task is to answer the user's question using only the provided context from uploaded college documents.

Instructions:
- Give a direct and concise answer.
- Do not return the raw context.
- Do not copy large paragraphs unless necessary.
- If the answer is present in the context, extract and rewrite it clearly.
- If the context contains headings, tables, labels, or bullet points, interpret them carefully.
- If multiple chunks are provided, combine only the relevant information.
- If the answer is not available in the context, say:
  "I could not find this information in the uploaded college documents."

Question:
{question}

Context:
{context}

Answer:
"""

    try:
        if model is None:
            print("Gemini model is None")
            answer = generate_simple_answer(question, documents)
        else:
            print("Calling Gemini...")
            response = model.generate_content(prompt)
            answer = response.text.strip()

            print("GEMINI ANSWER:")
            print(answer)
            print("Gemini success!")

    except Exception as e:
        print("Gemini API error:", e)
        answer = generate_simple_answer(question, documents)
    return {
        "answer": answer,
        "sources": sources
    }