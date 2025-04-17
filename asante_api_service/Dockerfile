FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Generate gRPC code
RUN python -m grpc_tools.protoc \
    -I./app/protos \
    --python_out=./app/protos \
    --grpc_python_out=./app/protos \
    ./app/protos/customer.proto \
    && touch ./app/protos/__init__.py \
    && sed -i 's/^import customer_pb2 as/from . import customer_pb2 as/' ./app/protos/customer_pb2_grpc.py

# Make init file
RUN touch ./app/protos/__init__.py
RUN touch ./app/services/__init__.py

# Expose port
EXPOSE 50051

# Start server
CMD ["python", "-m", "app.server"]