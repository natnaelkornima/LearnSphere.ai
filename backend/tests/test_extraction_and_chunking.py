import pymupdf
import pytest
from app.rag.chunking import chunk_extracted_pages
from app.rag.extraction import extract_text_from_pdf


def create_sample_pdf_bytes() -> bytes:
    doc = pymupdf.open()

    # Page 1
    page1 = doc.new_page()
    page1.insert_text(
        (50, 72),
        "Photosynthesis in Plants.\n\n"
        "Photosynthesis is the biological process by which green plants convert light energy into chemical energy. "
        "Chlorophyll in the plant leaves captures sunlight, which drives the reaction between carbon dioxide and water to produce glucose and oxygen.",
        fontsize=12,
    )

    # Page 2
    page2 = doc.new_page()
    page2.insert_text(
        (50, 72),
        "Cellular Respiration.\n\n"
        "Cellular respiration is the biochemical pathway by which cells release energy from glucose. "
        "It takes place within the mitochondria of eukaryotic cells.",
        fontsize=12,
    )

    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_pdf_extraction():
    pdf_bytes = create_sample_pdf_bytes()
    pages, total_pages = extract_text_from_pdf(pdf_bytes)

    assert total_pages == 2
    assert len(pages) == 2
    assert pages[0].page_number == 1
    assert "Photosynthesis" in pages[0].text
    assert pages[1].page_number == 2
    assert "Cellular Respiration" in pages[1].text


def test_chunking_preserves_page_numbers():
    pdf_bytes = create_sample_pdf_bytes()
    pages, _ = extract_text_from_pdf(pdf_bytes)
    chunks = chunk_extracted_pages(pages, target_chunk_chars=150, overlap_chars=20)

    assert len(chunks) >= 2
    assert chunks[0].page_start == 1
    assert "Photosynthesis" in chunks[0].content
    assert chunks[-1].page_end == 2
