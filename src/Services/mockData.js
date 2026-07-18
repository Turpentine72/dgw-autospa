// src/services/mockData.js
export const mockAPI = {
  dashboard: {
    getRecentBookings: async () => {
      return [
        { id: 1, customer: 'John Doe', service: 'Premium Car Wash', date: '2025-08-20', status: 'Completed' },
        { id: 2, customer: 'Jane Smith', service: 'Full Detailing', date: '2025-08-19', status: 'Pending' },
        { id: 3, customer: 'Mike Johnson', service: 'Tyre Services', date: '2025-08-18', status: 'In Progress' },
      ];
    },
    getStats: async () => {
      return {
        totalBookings: 3,
        totalCustomers: 3,
        totalRevenue: 0,
        pendingBookings: 1,
      };
    }
  },
  services: {
    getAll: async () => {
      return [
        { id: 1, name: 'Premium Car Wash', description: 'Complete exterior and interior cleaning', category: 'Wash' },
        { id: 2, name: 'Full Detailing', description: 'Comprehensive detailing service', category: 'Detailing' },
        { id: 3, name: 'Tyre Services', description: 'Quality tyre fitting and balancing', category: 'Tyres' },
      ];
    }
  },
  gallery: {
    getAll: async () => {
      return [];
    }
  },
  reviews: {
    getAll: async () => {
      return [];
    },
    getPublic: async () => {
      return [];
    }
  }
};