from app.rag.pdf_loader import extract_text_from_pdf
from app.rag.chunker import chunk_text
from app.rag.vector_store import add_chunks_to_vector_db, search_similar_chunks

print("Program started")

pdf_path = "sample_docs/college_rules.pdf"
document_name = "college_rules.pdf"

print("Extracting PDF text...")
pages = extract_text_from_pdf(pdf_path)
print("Total pages:", len(pages))

print("Creating chunks...")
chunks = chunk_text(pages)
print("Total chunks:", len(chunks))

print("Adding chunks to ChromaDB...")
add_chunks_to_vector_db(chunks, document_name)
print("Chunks added successfully")

query = "What is the attendance requirement?"

print("Searching for:", query)
results = search_similar_chunks(query)

print("\nSearch Results:")
print("-" * 50)

for i, doc in enumerate(results["documents"][0], start=1):
    print("Result:", i)
    print("Text:", doc)
    print("Metadata:", results["metadatas"][0][i - 1])
    print("-" * 50)

print("Program finished")