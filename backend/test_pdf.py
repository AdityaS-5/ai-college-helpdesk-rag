from app.rag.pdf_loader import extract_text_from_pdf

pdf_path = "sample_docs/college_rules.pdf"

pages = extract_text_from_pdf(pdf_path)

for page in pages:
    print("Page:", page["page_number"])
    print(page["text"])
    print("-" * 50)