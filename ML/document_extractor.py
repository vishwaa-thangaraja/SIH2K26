import os
import re
import json

import fitz
import spacy
from docx import Document

nlp = spacy.load("en_core_web_sm")


def extract_pdf(file_path):
    text = ""
    pdf = fitz.open(file_path)

    for page_number, page in enumerate(pdf, start=1):
        page_text = page.get_text()
        text += f"\n--- PAGE {page_number} ---\n"
        text += page_text

    pdf.close()
    return text


def extract_docx(file_path):
    document = Document(file_path)
    text = ""

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text += paragraph.text + "\n"

    return text


def read_document(file_path):
    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return extract_pdf(file_path)

    elif extension == ".docx":
        return extract_docx(file_path)

    else:
        raise ValueError("Unsupported file type. Use PDF or DOCX.")


def extract_emails(text):
    pattern = r"""
        [A-Za-z0-9._%+-]+
        @
        [A-Za-z0-9.-]+
        \.
        [A-Za-z]{2,}
    """

    emails = re.findall(pattern, text, re.VERBOSE)
    return list(dict.fromkeys(emails))


def extract_phone_numbers(text):
    pattern = r"""
        (?:
            \+91[\s-]?
        )?
        [6-9]\d{9}
    """

    phones = re.findall(pattern, text, re.VERBOSE)
    return list(dict.fromkeys(phones))


def analyse_text(text):
    print("\nRunning NLP model...")

    doc = nlp(text)

    result = {
        "PERSON": [],
        "ORGANIZATION": [],
        "LOCATION": [],
        "DATE": [],
        "MONEY": [],
        "EMAIL": [],
        "PHONE": []
    }

    for entity in doc.ents:
        if entity.label_ == "PERSON":
            result["PERSON"].append(entity.text)

        elif entity.label_ == "ORG":
            result["ORGANIZATION"].append(entity.text)

        elif entity.label_ in ["GPE", "LOC"]:
            result["LOCATION"].append(entity.text)

        elif entity.label_ == "DATE":
            result["DATE"].append(entity.text)

        elif entity.label_ == "MONEY":
            result["MONEY"].append(entity.text)

    result["EMAIL"] = extract_emails(text)
    result["PHONE"] = extract_phone_numbers(text)

    for category in result:
        result[category] = list(
            dict.fromkeys(result[category])
        )

    return result


def display_results(result):
    print("\n")
    print("=" * 60)
    print("              EXTRACTED INFORMATION")
    print("=" * 60)

    for category, values in result.items():
        print(f"\n{category}")
        print("-" * 30)

        if len(values) == 0:
            print("No information found.")
        else:
            for value in values:
                print(f"  • {value}")


def save_results(result):
    output_file = "extracted_data.json"

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(
            result,
            file,
            indent=4,
            ensure_ascii=False
        )

    print(f"\nResults saved to: {output_file}")


def main():
    print("=" * 60)
    print("       INTELLIGENT DOCUMENT INFORMATION EXTRACTOR")
    print("=" * 60)

    file_path = input(
        "\nEnter PDF/DOCX path: "
    ).strip()

    if not os.path.exists(file_path):
        print("\nERROR: File does not exist.")
        return

    print("\nDocument found.")
    print("\nExtracting text...")

    try:
        text = read_document(file_path)
    except Exception as error:
        print(
            f"\nERROR while reading document: {error}"
        )
        return

    if not text.strip():
        print("\nERROR: No text could be extracted.")
        print(
            "If this is a scanned PDF, OCR is required."
        )
        return

    print(
        f"\nExtracted {len(text)} characters."
    )

    result = analyse_text(text)

    display_results(result)
    save_results(result)


if __name__ == "__main__":
    main()
