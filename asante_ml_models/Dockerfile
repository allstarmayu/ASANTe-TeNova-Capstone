FROM python:3.9-slim

WORKDIR /app

# Install system deps for psycopg2
RUN apt-get update && \
    apt-get install -y build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy proto definitions and service code
COPY protos/ protos/
COPY ml_service/ ml_service/


# Compile protobuf definitions and fix imports
RUN python -m grpc_tools.protoc \
      -I protos \
      --python_out=ml_service \
      --grpc_python_out=ml_service \
      protos/ml_service.proto && \
    sed -i 's/^import ml_service_pb2/from . import ml_service_pb2/' ml_service/ml_service_pb2_grpc.py

EXPOSE 50052

CMD ["python", "-u", "-m", "ml_service.server"]