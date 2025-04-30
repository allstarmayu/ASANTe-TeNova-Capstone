// src/services/ml-service.js
import { MLServiceClient } from './grpc/generated/ml_service_grpc_web_pb';
import { RecommendationRequest } from './grpc/generated/ml_service_pb';

// Point at Envoy’s gRPC-Web port
const client = new MLServiceClient('http://localhost:8080');

console.log('[ml-service] client initialized, endpoint =', client.hostname_);

export function getRecommendations(userId) {
  return new Promise((resolve, reject) => {
    const req = new RecommendationRequest();
    req.setUserId(userId);

    client.getRecommendations(req, {}, (err, resp) => {
      if (err) return reject(err);
      const data = {
        product_ids: resp.getProductIdsList(),
        business_ids: resp.getBusinessIdsList(),
        nonprofit_ids: resp.getNonprofitIdsList(),
      };
      console.log('[ml-service] got data', data);
      resolve(data);
    });
  });
}