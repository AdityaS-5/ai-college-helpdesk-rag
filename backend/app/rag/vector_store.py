import chromadb
from sentence_transformers import SentenceTransformer

# ChromaDB
client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_or_create_collection(
    name="college_docs"
)

# Lazy-loaded embedding model
model = None


def get_model():
    global model

    if model is None:
        print("Loading embedding model...")
        model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Embedding model loaded.")

    return model


def add_chunks_to_vector_db(chunks, document_name):
    embedding_model = get_model()

    for i, chunk in enumerate(chunks):
        embedding = embedding_model.encode(
            chunk["text"]
        ).tolist()

        collection.upsert(
            ids=[f"{document_name}_{i}"],
            embeddings=[embedding],
            documents=[chunk["text"]],
            metadatas=[{
                "document_name": document_name,
                "page_number": chunk["page_number"]
            }]
        )


def search_similar_chunks(query, top_k=3):
    embedding_model = get_model()

    query_embedding = embedding_model.encode(
        query
    ).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results


def reset_vector_db():
    global collection

    try:
        client.delete_collection(
            name="college_docs"
        )
    except Exception:
        pass

    collection = client.get_or_create_collection(
        name="college_docs"
    )

    return True


def list_indexed_documents():
    results = collection.get(
        include=["metadatas"]
    )

    metadatas = results.get(
        "metadatas",
        []
    )

    documents = {}

    for meta in metadatas:
        document_name = meta.get(
            "document_name"
        )

        page_number = meta.get(
            "page_number"
        )

        if document_name:
            if document_name not in documents:
                documents[document_name] = {
                    "document_name": document_name,
                    "total_chunks": 0,
                    "pages": set()
                }

            documents[document_name]["total_chunks"] += 1

            if page_number is not None:
                documents[document_name]["pages"].add(
                    page_number
                )

    final_documents = []

    for doc in documents.values():
        final_documents.append({
            "document_name": doc["document_name"],
            "total_chunks": doc["total_chunks"],
            "total_pages_indexed": len(doc["pages"])
        })

    return final_documents