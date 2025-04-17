import grpc
from concurrent import futures

from ml_service import model
import ml_service.ml_service_pb2 as pb2
import ml_service.ml_service_pb2_grpc as pb2_grpc
from grpc_reflection.v1alpha import reflection

class MLServiceServicer(pb2_grpc.MLServiceServicer):
    def __init__(self):
        self.rec = model.RecommendationModel()

    def GetRecommendations(self, request, context):
        out = self.rec.get_recommendations(request.user_id)
        return pb2.RecommendationResponse(
            product_ids=out['product_ids'],
            business_ids=out['business_ids'],
            nonprofit_ids=out['nonprofit_ids']
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_MLServiceServicer_to_server(MLServiceServicer(), server)

    SERVICE_NAMES = [
        pb2.DESCRIPTOR.services_by_name['MLService'].full_name,
        reflection.SERVICE_NAME,
    ]
    reflection.enable_server_reflection(SERVICE_NAMES, server)

    server.add_insecure_port('[::]:50052')
    server.start()
    print("ML service listening on 50052")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
