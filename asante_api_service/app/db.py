import os
import psycopg2
from psycopg2 import pool

# Database connection pool
connection_pool = None

def init_db_pool():
    """Initialize the database connection pool"""
    global connection_pool
    
    try:
        # Get connection details from environment variables
        db_host = os.environ.get('DB_HOST', 'asante-postgres')
        db_port = os.environ.get('DB_PORT', '5432')
        db_name = os.environ.get('DB_NAME', 'postgres')
        db_user = os.environ.get('DB_USER', 'postgres')
        db_password = os.environ.get('DB_PASSWORD', 'ASANTe@cu')
        
        # Create connection pool
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            host=db_host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_password
        )
        
        print("Database connection pool created successfully")
        
        # Test the connection
        conn = get_connection()
        if conn:
            print("Database connection successful")
            release_connection(conn)
            
    except Exception as e:
        print(f"Error creating database connection pool: {e}")
        raise

def get_connection():
    """Get a connection from the pool"""
    if connection_pool:
        return connection_pool.getconn()
    else:
        raise Exception("Connection pool not initialized")

def release_connection(conn):
    """Release a connection back to the pool"""
    if connection_pool:
        connection_pool.putconn(conn)
    else:
        print("Warning: Connection pool not initialized")

def close_all_connections():
    """Close all connections in the pool"""
    if connection_pool:
        connection_pool.closeall()
        print("All database connections closed")