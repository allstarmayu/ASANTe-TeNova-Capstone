
# ASANTe‑ML‑Service Product, Business & Non‑profit Recommendations via gRPC

# Load the MLService proto from .\protos/ml_service.proto, connect (without TLS) to localhost:50052, and list all the services defined in that proto.
grpcurl.exe -plaintext -import-path .\protos -proto ml_service.proto localhost:50052 list

# Build docker-compose.yml file using
docker-compose up --build

## 1. List available services
grpcurl -plaintext localhost:50052 list
# → ml_service.MLService

# Describe the MLService
grpcurl -plaintext localhost:50052 describe ml_service.MLService

# Test the GetRecommendation method with the correct service name:
grpcurl -plaintext -d "{ \"user_id\": \"U00001\" }" localhost:50052 ml_service.MLService/GetRecommendations
grpcurl -plaintext -d '{\"user_id\": \"U00001\"}' localhost:50052 ml_service.MLService/GetRecommendations

