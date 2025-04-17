import os
import grpc
import time
from concurrent import futures
import signal
import sys

# Import reflection support
from grpc_reflection.v1alpha import reflection

# Import generated protobuf code
from app.protos import customer_pb2_grpc, customer_pb2
from app.services.customer_service import CustomerServicer
from app.db import init_db_pool, close_all_connections

def serve():
    # Initialize database connection pool
    init_db_pool()
    
    # Create gRPC server
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # Add services to the server
    customer_pb2_grpc.add_CustomerServiceServicer_to_server(CustomerServicer(), server)
    
    # Enable server reflection
    SERVICE_NAMES = (
        customer_pb2.DESCRIPTOR.services_by_name['CustomerService'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)
    
    # Get port from environment or use default
    port = os.environ.get('PORT', '50051')
    server.add_insecure_port(f'[::]:{port}')
    
    # Start server
    server.start()
    print(f"Server started. Listening on port {port}")
    
    # Handle graceful shutdown
    def handle_shutdown(signum, frame):
        print("Shutting down server...")
        server.stop(grace=5)  # 5 seconds grace period
        close_all_connections()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)
    
    # Keep server running
    try:
        while True:
            time.sleep(86400)  # Sleep for a day
    except KeyboardInterrupt:
        server.stop(grace=5)
        close_all_connections()

if __name__ == '__main__':
    serve()