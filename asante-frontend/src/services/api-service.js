// src/services/grpc/api-service.js
import mlService from './ml-service';

/**
 * Service for fetching data from APIs and connecting to ML recommendations
 */
class ApiService {
  constructor() {
    // Base URL for REST API endpoints
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  /**
   * Fetch recommendations for a user and their details
   * @param {string} userId - User ID like 'U00001'
   * @returns {Promise} - Promise resolving with detailed recommendations
   */
  async getUserRecommendations(userId) {
    try {
      console.log(`Getting recommendations for user: ${userId}`);
      
      // Get recommendation IDs from ML service via gRPC
      const recommendations = await mlService.getRecommendations(userId);
      
      // Fetch details for each type of recommendation
      const [products, businesses, nonprofits] = await Promise.all([
        this.fetchProductDetails(recommendations.productIds),
        this.fetchBusinessDetails(recommendations.businessIds),
        this.fetchNonprofitDetails(recommendations.nonprofitIds)
      ]);

      return {
        products,
        businesses,
        nonprofits,
        userId
      };
    } catch (error) {
      console.error('Error in getUserRecommendations:', error);
      throw error;
    }
  }

  /**
   * Fetch product details by IDs
   * @param {Array} productIds - Array of product IDs
   * @returns {Promise} - Promise resolving with product details
   */
  async fetchProductDetails(productIds) {
    if (!productIds?.length) return [];
    
    try {
      // For development, we can use a mock implementation
      // In production, this would call your actual API
      console.log(`Fetching product details for: ${productIds.join(', ')}`);
      
      // Simulated API call with mock data
      return this._getMockProducts(productIds);
      
      // Real API call would look like this:
      // const response = await fetch(`${this.baseUrl}/products?ids=${productIds.join(',')}`);
      // if (!response.ok) throw new Error('Failed to fetch product details');
      // return await response.json();
    } catch (error) {
      console.error('Error fetching product details:', error);
      return [];
    }
  }

  /**
   * Fetch business details by IDs
   * @param {Array} businessIds - Array of business IDs
   * @returns {Promise} - Promise resolving with business details
   */
  async fetchBusinessDetails(businessIds) {
    if (!businessIds?.length) return [];
    
    try {
      console.log(`Fetching business details for: ${businessIds.join(', ')}`);
      
      // Simulated API call with mock data
      return this._getMockBusinesses(businessIds);
    } catch (error) {
      console.error('Error fetching business details:', error);
      return [];
    }
  }

  /**
   * Fetch nonprofit details by EINs
   * @param {Array} nonprofitIds - Array of nonprofit EINs
   * @returns {Promise} - Promise resolving with nonprofit details
   */
  async fetchNonprofitDetails(nonprofitIds) {
    if (!nonprofitIds?.length) return [];
    
    try {
      console.log(`Fetching nonprofit details for: ${nonprofitIds.join(', ')}`);
      
      // Simulated API call with mock data
      return this._getMockNonprofits(nonprofitIds);
    } catch (error) {
      console.error('Error fetching nonprofit details:', error);
      return [];
    }
  }

  /**
   * Mock product data for development
   * @private
   */
  _getMockProducts(ids) {
    const allProducts = [
      {
        id: "1",
        name: "Eco-Friendly Water Bottle",
        description: "Reusable stainless steel water bottle with vacuum insulation to keep drinks hot or cold.",
        price: 24.99,
        category: "Sustainable Products",
        image_url: "https://via.placeholder.com/300x200?text=WaterBottle",
        rating: 4.7
      },
      {
        id: "2",
        name: "Organic Cotton T-Shirt",
        description: "Made from 100% organic cotton, produced with sustainable methods.",
        price: 19.99,
        category: "Clothing",
        image_url: "https://via.placeholder.com/300x200?text=TShirt",
        rating: 4.5
      },
      {
        id: "3",
        name: "Bamboo Toothbrush Set",
        description: "Pack of biodegradable bamboo toothbrushes with charcoal-infused bristles.",
        price: 12.99,
        category: "Personal Care",
        image_url: "https://via.placeholder.com/300x200?text=Toothbrush",
        rating: 4.3
      }
    ];
    
    return allProducts.filter(product => ids.includes(product.id));
  }

  /**
   * Mock business data for development
   * @private
   */
  _getMockBusinesses(ids) {
    const allBusinesses = [
      {
        id: "101",
        business_name: "EcoLife Solutions",
        short_description: "A B-Corp certified company creating sustainable alternatives to everyday products.",
        industry: "Sustainable Goods",
        logo_url: "https://via.placeholder.com/300x200?text=EcoLife",
        impact_score: 4.8
      },
      {
        id: "102",
        business_name: "Green Harvest Farm",
        short_description: "Family-owned organic farm using regenerative agriculture practices.",
        industry: "Agriculture",
        logo_url: "https://via.placeholder.com/300x200?text=GreenHarvest",
        impact_score: 4.9
      }
    ];
    
    return allBusinesses.filter(business => ids.includes(business.id));
  }

  /**
   * Mock nonprofit data for development
   * @private
   */
  _getMockNonprofits(ids) {
    const allNonprofits = [
      {
        id: "201",
        ein: "12-3456789",
        organization_name: "Ocean Cleanup Initiative",
        mission_statement: "Developing technologies to remove plastic pollution from the world's oceans.",
        cause: "Environmental Conservation",
        logo_url: "https://via.placeholder.com/300x200?text=OceanCleanup",
        impact_rating: 4.7
      },
      {
        id: "202",
        ein: "98-7654321",
        organization_name: "Global Education Fund",
        mission_statement: "Providing access to quality education for children in underserved communities.",
        cause: "Education",
        logo_url: "https://via.placeholder.com/300x200?text=GlobalEducation",
        impact_rating: 4.8
      },
      {
        id: "203",
        ein: "45-6789123",
        organization_name: "Renewable Energy Access",
        mission_statement: "Bringing clean, renewable energy solutions to communities without electricity.",
        cause: "Clean Energy",
        logo_url: "https://via.placeholder.com/300x200?text=RenewableEnergy",
        impact_rating: 4.6
      }
    ];
    
    return allNonprofits.filter(nonprofit => ids.includes(nonprofit.id) || ids.includes(nonprofit.ein));
  }
}

// Export singleton instance
export default new ApiService();