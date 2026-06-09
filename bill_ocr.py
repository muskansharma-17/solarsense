import os
import re
import math
import io
import fitz
import pytesseract

from PIL import Image, ImageEnhance, ImageFilter


pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


SUPPORTED_IMAGES = (
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp"
)


def preprocess_image(image):

    image = image.convert("L")

    image = ImageEnhance.Contrast(
        image
    ).enhance(2.5)

    image = image.filter(
        ImageFilter.SHARPEN
    )

    return image


def ocr_image(image):

    image = preprocess_image(image)

    text = pytesseract.image_to_string(
        image,
        lang="eng+hin",
        config="--oem 3 --psm 6"
    )

    return text


def extract_text_from_image(file_path: str):

    image = Image.open(file_path)

    return ocr_image(image)


def extract_text_from_pdf(file_path: str):

    final_text = ""

    doc = fitz.open(file_path)

    for page in doc:

        # normal pdf text
        normal_text = page.get_text("text")

        if normal_text and len(
            normal_text.strip()
        ) > 10:

            final_text += (
                normal_text + "\n"
            )

        # scanned pdf OCR
        pix = page.get_pixmap(
            dpi=400
        )

        img_bytes = pix.tobytes("png")

        image = Image.open(
            io.BytesIO(img_bytes)
        )

        ocr_text = ocr_image(image)

        final_text += (
            ocr_text + "\n"
        )

    doc.close()

    return final_text


def extract_text(file_path: str):

    if not file_path:
        return ""

    if not os.path.exists(file_path):
        return ""

    ext = os.path.splitext(
        file_path
    )[1].lower()

    if ext == ".pdf":
        return extract_text_from_pdf(
            file_path
        )

    if ext in SUPPORTED_IMAGES:
        return extract_text_from_image(
            file_path
        )

    return ""


def extract_current_units(text: str):

    patterns = [

        r"विद्युत खपत\s*[:\-]?\s*(\d+)",

        r"िवद्ुयत खपत\s*[:\-]?\s*(\d+)",

        r"Electricity Consumption\s*[:\-]?\s*(\d+)",

        r"Units Consumed\s*[:\-]?\s*(\d+)",

        r"Current Consumption\s*[:\-]?\s*(\d+)",

        r"CONSUMPTION\s*[:\-]?\s*(\d+)",

        r"(\d+)\s*kWh",

        r"(\d+)\s*Units",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            units = int(
                match.group(1)
            )

            if units > 20:
                return units

    return 0


def extract_last_6_month_units(text: str):

    monthly_units = []

    pattern = (
        r"(\d{4}/\d{2})\s+\d+\s+(\d+)"
    )

    matches = re.findall(
        pattern,
        text
    )

    for month, units in matches[:6]:

        monthly_units.append({

            "month": month,

            "units": int(units)
        })

    return monthly_units


def calculate_solar_kw(
    current_units,
    monthly_units
):

    units = []

    if current_units:
        units.append(current_units)

    for item in monthly_units:
        units.append(item["units"])

    if not units:
        return 0

    average_units = (
        sum(units) / len(units)
    )

    solar_kw = math.ceil(
        average_units / 120
    )

    return solar_kw


def process_single_bill(
    file_path: str
):

    text = extract_text(file_path)

    current_units = (
        extract_current_units(text)
    )

    monthly_units = (
        extract_last_6_month_units(text)
    )

    recommended_kw = (
        calculate_solar_kw(
            current_units,
            monthly_units
        )
    )

    return {
      "success": True,

      "current_units": current_units,

      "last_6_month_units": monthly_units,

      "recommended_ac_kw": recommended_kw,

      "recommended_solar_kw": recommended_kw,

      "extracted_text": text
   }


def process_multiple_bills(
    file_paths: list
):

    all_data = []

    for path in file_paths:

        result = process_single_bill(
            path
        )

        all_data.append(result)

    return all_data