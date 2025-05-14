import os
from typing import Tuple

import fitz


def extract_pdf_data(
    pdf_path: str,
) -> Tuple[str, dict]:
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"The PDF file was not found: {pdf_path}")

    extracted_text = ""
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            extracted_text += page.get_text()
        doc.close()
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

    return extracted_text, {}
