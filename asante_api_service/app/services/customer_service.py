import grpc
from concurrent import futures
import psycopg2
from psycopg2 import sql

# Import generated protobuf code (this will be generated later)
from app.protos import customer_pb2, customer_pb2_grpc
from app.db import get_connection, release_connection

class CustomerServicer(customer_pb2_grpc.CustomerServiceServicer):
    
    def GetCustomer(self, request, context):
        """Get a customer by user_id"""
        user_id = request.user_id
        
        conn = None
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            query = """
                SELECT *
                FROM asante_customers
                WHERE user_id = %s
            """
            
            cursor.execute(query, (user_id,))
            result = cursor.fetchone()
            
            if not result:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details(f"Customer with ID {user_id} not found")
                return customer_pb2.Customer()
            
            # Map result to response object
            return customer_pb2.Customer(
                user_id=result[0],
                name=result[1],
                email=result[2],
                phone_number=result[3],
                city=result[4],
                state=result[5],
                zipcode=result[6],
                age=result[7],
                gender=result[8],
                income_level=result[9],
                interests=result[10]
            )
            
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error retrieving customer: {str(e)}")
            return customer_pb2.Customer()
        finally:
            if conn:
                release_connection(conn)
    
    def ListCustomers(self, request, context):
        """List customers with pagination"""
        page_size = request.page_size if request.page_size > 0 else 10
        page_number = request.page_number if request.page_number > 0 else 1
        offset = (page_number - 1) * page_size
        
        conn = None
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Get total count
            cursor.execute("SELECT COUNT(*) FROM asante_customers")
            total_count = cursor.fetchone()[0]
            
            # Get paginated results
            query = """
                SELECT user_id, name, email, phone_number, city, state, zipcode, 
                       age, gender, income_level, interests
                FROM asante_customers
                ORDER BY user_id
                LIMIT %s OFFSET %s
            """
            
            cursor.execute(query, (page_size, offset))
            results = cursor.fetchall()
            
            # Map results to response objects
            customers = []
            for row in results:
                customer = customer_pb2.Customer(
                    user_id=row[0],
                    name=row[1],
                    email=row[2],
                    phone_number=row[3],
                    city=row[4],
                    state=row[5],
                    zipcode=row[6],
                    age=row[7],
                    gender=row[8],
                    income_level=row[9],
                    interests=row[10]
                )
                customers.append(customer)
            
            return customer_pb2.ListCustomersResponse(
                customers=customers,
                total_count=total_count
            )
            
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error listing customers: {str(e)}")
            return customer_pb2.ListCustomersResponse()
        finally:
            if conn:
                release_connection(conn)
    
    def CreateCustomer(self, request, context):
        """Create a new customer and return its user_id."""
        conn = None
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # 1) figure next numeric ID
            cursor.execute(
                "SELECT MAX(CAST(SUBSTRING(user_id,2) AS INTEGER)) FROM asante_customers"
            )
            max_id = cursor.fetchone()[0] or 0
            new_id = f"U{max_id + 1:05d}"

            # 2) insert
            cursor.execute("""
                INSERT INTO asante_customers (
                  user_id,
                  name, email, phone_number,
                  city, state, zipcode,
                  age, gender,
                  income_level, interests, cause_preferences,
                  discount_sensitivity, signup_referral_source,
                  browsing_behavior, transaction_history, nonprofits_donations_history,
                  total_loyalty_rewards_received, membership_tier,
                  business_engagement_score, location_based_purchase_pattern,
                  cause_donation_alignment_score
                ) VALUES (
                  %s, %s, %s, %s,
                  %s, %s, %s,
                  %s, %s,
                  %s, %s, %s,
                  %s, %s,
                  %s, %s, %s,
                  %s, %s,
                  %s, %s,
                  %s
                )
            """, (
                new_id,
                request.name,
                request.email,
                request.phone_number,
                request.city,
                request.state,
                request.zipcode,
                request.age,
                request.gender,
                request.income_level,
                # if you want to store as JSON, convert to Python list; otherwise CSV:
                list(request.interests),
                list(request.cause_preferences),
                request.discount_sensitivity,
                request.signup_referral_source,
                # brand new customer: empty JSON lists
                [], [], [],
                0,    # total_loyalty_rewards_received
                "",   # membership_tier
                0.0,  # business_engagement_score
                "",   # location_based_purchase_pattern
                0.0   # cause_donation_alignment_score
            ))
            conn.commit()

            # 3) return only the new ID
            return customer_pb2.CreateCustomerResponse(user_id=new_id)

        except Exception as e:
            if conn:
                conn.rollback()
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error creating customer: {e}")
            return customer_pb2.CreateCustomerResponse()

        finally:
            if conn:
                release_connection(conn)
    
    def UpdateCustomer(self, request, context):
        """Update an existing customer"""
        conn = None
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Check if customer exists
            cursor.execute("SELECT 1 FROM asante_customers WHERE user_id = %s", (request.user_id,))
            if cursor.fetchone() is None:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details(f"Customer with ID {request.user_id} not found")
                return customer_pb2.Customer()
            
            query = """
                UPDATE asante_customers
                SET name = %s, email = %s, phone_number = %s, city = %s, 
                    state = %s, zipcode = %s, age = %s, gender = %s, 
                    income_level = %s, interests = %s
                WHERE user_id = %s
            """
            
            values = (
                request.name,
                request.email,
                request.phone_number,
                request.city,
                request.state,
                request.zipcode,
                request.age,
                request.gender,
                request.income_level,
                request.interests,
                request.user_id
            )
            
            cursor.execute(query, values)
            conn.commit()
            
            # Return the updated customer
            return self.GetCustomer(customer_pb2.CustomerRequest(user_id=request.user_id), context)
            
        except Exception as e:
            if conn:
                conn.rollback()
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error updating customer: {str(e)}")
            return customer_pb2.Customer()
        finally:
            if conn:
                release_connection(conn)
    
    def DeleteCustomer(self, request, context):
        """Delete a customer by user_id"""
        user_id = request.user_id
        
        conn = None
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Check if customer exists
            cursor.execute("SELECT 1 FROM asante_customers WHERE user_id = %s", (user_id,))
            if cursor.fetchone() is None:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details(f"Customer with ID {user_id} not found")
                return customer_pb2.DeleteResponse(success=False, message=f"Customer with ID {user_id} not found")
            
            # Delete the customer
            cursor.execute("DELETE FROM asante_customers WHERE user_id = %s", (user_id,))
            conn.commit()
            
            return customer_pb2.DeleteResponse(
                success=True,
                message=f"Customer with ID {user_id} deleted successfully"
            )
            
        except Exception as e:
            if conn:
                conn.rollback()
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error deleting customer: {str(e)}")
            return customer_pb2.DeleteResponse(success=False, message=str(e))
        finally:
            if conn:
                release_connection(conn)