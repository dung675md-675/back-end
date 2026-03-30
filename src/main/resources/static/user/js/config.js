// ===================================
// API CONFIGURATION
// ===================================

const API_BASE_URL = '/api';

const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,

    // Categories
    CATEGORIES: `${API_BASE_URL}/categories`,
    CATEGORIES_ACTIVE: `${API_BASE_URL}/categories/active`,

    // Products
    PRODUCTS: `${API_BASE_URL}/products`,
    PRODUCTS_AVAILABLE: `${API_BASE_URL}/products/available`,
    PRODUCTS_LATEST: `${API_BASE_URL}/products/latest`,
    PRODUCTS_BY_CATEGORY: (categoryId) => `${API_BASE_URL}/products/category/${categoryId}`,
    PRODUCTS_SEARCH: (keyword) => `${API_BASE_URL}/products/search?keyword=${keyword}`,

    // Orders
    ORDERS: `${API_BASE_URL}/orders`,
    ORDERS_BY_CUSTOMER: (customerId) => `${API_BASE_URL}/orders/customer/${customerId}`,
    
    // Customers
    CUSTOMERS: `${API_BASE_URL}/customers`,
    CUSTOMER_BY_USER: (userId) => `${API_BASE_URL}/customers/user/${userId}`
};

// Format tiền VND
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format ngày
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}