
# ASANTe‑ML‑Service Product, Business & Non‑profit Recommendations via gRPC

# Load the MLService proto from .\protos/ml_service.proto, connect (without TLS) to localhost:50052, and list all the services defined in that proto.
grpcurl.exe -plaintext -import-path .\protos -proto ml_service.proto localhost:50052 list

# Build docker-compose.yml file using
docker-compose up -d --build

## 1. List available services
grpcurl -plaintext localhost:50052 list
# → ml_service.MLService

# Describe the MLService
grpcurl -plaintext localhost:50052 describe ml_service.MLService

# Test the GetRecommendation method with the correct service name:
grpcurl -plaintext -d '{\"user_id\": \"U00001\"}' localhost:50052 ml_service.MLService/GetRecommendations

# Envoy 
grpcurl -plaintext -import-path protos --proto protos/ml_service.proto -d '{ \"user_id\": \"U00001\" }' 127.0.0.1:8080 ml_service.MLService/GetRecommendations
>>
<!-- {
  "product_ids": [
    "BPZ7EC8399",
    "BUV2Q9TOBO",
    "BB44Y4QKAA",
    "BH0LANXEIT",
    "BPSGPW6Q7V",
    "BK7JWOAI6F",
    "B7YW4SC01L",
    "BBJGFU8QE3",
    "B9ODHJBP9R",
    "B01IT9NLHW"
  ],
  "business_ids": [
    "ASANTe_B1819",
    "ASANTe_B1261",
    "ASANTe_B546",
    "ASANTe_B2147",
    "ASANTe_B1777"
  ]
} -->

# for executing scripts to update in the table
docker exec -it asante_ml_service python ml_service/fix_browsing_behavior.py
