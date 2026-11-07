from typing import List, Optional
from app.rag.extraction import ExtractedPage


class ChunkItem:
    def __init__(
        self,
        chunk_index: int,
        content: str,
        page_start: int,
        page_end: int,
        token_count: int,
    ):
        self.chunk_index = chunk_index
        self.content = content
        self.page_start = page_start
        self.page_end = page_end
        self.token_count = token_count


def chunk_extracted_pages(
    pages: List[ExtractedPage],
    target_chunk_chars: int = 2400,
    overlap_chars: int = 300,
) -> List[ChunkItem]:
    """
    Chunks extracted pages while preserving page ranges and boundaries.
    """
    chunks: List[ChunkItem] = []
    current_content = ""
    current_page_start: Optional[int] = None
    current_page_end: Optional[int] = None
    chunk_index = 0

    for page in pages:
        if not page.text:
            continue

        paragraphs = [p.strip() for p in page.text.split("\n\n") if p.strip()]
        if not paragraphs:
            paragraphs = [page.text]

        for p in paragraphs:
            if current_page_start is None:
                current_page_start = page.page_number
            current_page_end = page.page_number

            if len(current_content) + len(p) + 2 <= target_chunk_chars:
                if current_content:
                    current_content += "\n\n" + p
                else:
                    current_content = p
            else:
                # Flush existing chunk
                if current_content:
                    est_tokens = max(1, len(current_content.split()))
                    chunks.append(
                        ChunkItem(
                            chunk_index=chunk_index,
                            content=current_content,
                            page_start=current_page_start or page.page_number,
                            page_end=current_page_end or page.page_number,
                            token_count=est_tokens,
                        )
                    )
                    chunk_index += 1

                # Start next chunk with overlap from end of previous content
                overlap_text = current_content[-overlap_chars:] if len(current_content) > overlap_chars else ""
                current_content = (overlap_text + "\n\n" + p).strip() if overlap_text else p
                current_page_start = page.page_number
                current_page_end = page.page_number

    # Flush last remaining chunk
    if current_content:
        est_tokens = max(1, len(current_content.split()))
        chunks.append(
            ChunkItem(
                chunk_index=chunk_index,
                content=current_content,
                page_start=current_page_start or 1,
                page_end=current_page_end or 1,
                token_count=est_tokens,
            )
        )

    return chunks

