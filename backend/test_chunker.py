from app.rag.pdf_loader import extract_text_from_pdf
from app.rag.chunker import chunk_text

pdf_path = "sample_docs/college_rules.pdf"

pages = extract_text_from_pdf(pdf_path)
chunks = chunk_text(pages)

print("Total pages:", len(pages))
print("Total chunks:", len(chunks))
print("-" * 50)

for i, chunk in enumerate(chunks, start=1):
    print("Chunk:", i)
    print("Page:", chunk["page_number"])
    print(chunk["text"])
    print("-" * 50)