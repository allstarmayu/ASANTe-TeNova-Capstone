# rest_server.py
from flask import Flask, request, jsonify
import grpc

# import the gRPC stubs you already generated
from app.protos import customer_pb2, customer_pb2_grpc

app = Flask(__name__)

# point this at your gRPC server (which is listening on 50051)
channel = grpc.insecure_channel('localhost:50051')
stub    = customer_pb2_grpc.CustomerServiceStub(channel)

@app.route('/api/customers', methods=['POST'])
def create_customer():
    data = request.get_json() or {}
    req = customer_pb2.CreateCustomerRequest(
        name                   = data.get('name', ''),
        email                  = data.get('email', ''),
        phone_number           = data.get('phone_number', ''),
        city                   = data.get('city', ''),
        state                  = data.get('state', ''),
        zipcode                = data.get('zipcode', ''),
        age                    = data.get('age', 0),
        gender                 = data.get('gender', ''),
        income_level           = data.get('income_level', ''),
        interests              = data.get('interests', []),
        cause_preferences      = data.get('cause_preferences', []),
        discount_sensitivity   = data.get('discount_sensitivity', ''),
        signup_referral_source = data.get('signup_referral_source', '')
    )
    resp = stub.CreateCustomer(req)
    return jsonify({ 'user_id': resp.user_id }), 201

if __name__ == '__main__':
    # run on port 3001 so it doesn’t clash with gRPC on 50051
    app.run(port=3001, debug=True)