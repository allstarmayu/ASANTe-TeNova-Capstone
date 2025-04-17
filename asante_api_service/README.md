# ASANTe-Capstone Backend APIs integration Using Docker Containers &amp; Postgres

# test the GetCustomer method with the correct service name:
grpcurl -plaintext -d '{\"user_id\": \"U00001\"}' localhost:50051 app.protos.CustomerService/GetCustomer

# Let's also test the ListCustomers method to see what customers you have in your database:
grpcurl -plaintext -d '{\"page_size\": 5, \"page_number\": 1}' localhost:50051 app.protos.CustomerService/ListCustomers

# If you want to create a new customer, you can test the CreateCustomer method:
grpcurl -plaintext -d '{
  \"name\": \"Sai Krishna\",
  \"email\": \"sai\",
  \"phone_number\": \"123-456-7890\",
  \"city\": \"Denver\",
  \"state\": \"Colorado\",
  \"zipcode\": \"80202\",
  \"age\": 30,
  \"gender\": \"Male\",
  \"income_level\": \"High\",
  \"interests\": \"Technology, Sports\"
}' localhost:50051 app.protos.CustomerService/CreateCustomer