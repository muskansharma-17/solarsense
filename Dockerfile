FROM python:3.13

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    poppler-utils

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

CMD uvicorn main:app --host 0.0.0.0 --port $PORT