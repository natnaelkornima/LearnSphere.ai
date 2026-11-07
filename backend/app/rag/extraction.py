import pymupdf
from typing import List, Tuple
from app.core.exceptions import ValidationException


class ExtractedPage:
    def __init__(self, page_number: int, text: str):
        self.page_number = page_number
        self.text = text


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[List[ExtractedPage], int]:
    """
    Extracts text page-by-page from a PDF byte buffer using PyMuPDF.
    Returns a tuple of (extracted_pages, total_page_count).
    """
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise ValidationException(f"Failed to parse PDF document: {str(e)}")

    total_pages = len(doc)
    if total_pages == 0:
        raise ValidationException("PDF document has 0 pages.")

    pages: List[ExtractedPage] = []
    has_text = False

    for page_idx in range(total_pages):
        page = doc[page_idx]
        text = page.get_text("text").strip()
        if text:
            has_text = True
        # Page numbers in user-facing context are 1-based
        pages.append(ExtractedPage(page_number=page_idx + 1, text=text))

    doc.close()

    if not has_text:
        raise ValidationException(
            "No extractable text found in this PDF. Scanned or image-only PDFs are not supported in MVP."
        )

    return pages, total_pages
