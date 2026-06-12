def chunk_text(pages, chunk_size=1200, overlap=400):
    chunks = []

    for page in pages:
        text = page["text"]
        words = text.split()

        start = 0

        while start < len(words):
            end = start + chunk_size
            chunk_words = words[start:end]
            chunk = " ".join(chunk_words)

            if chunk.strip():
                chunks.append({
                    "text": chunk,
                    "page_number": page["page_number"]
                })

            start += chunk_size - overlap

    return chunks