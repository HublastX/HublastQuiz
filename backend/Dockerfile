FROM python:3.13-slim


RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3010", "--reload"]