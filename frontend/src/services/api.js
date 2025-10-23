import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchProducts = async (query) => {
  try {
    const response = await api.get('/products/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error buscando productos:', error);
    throw error;
  }
};

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    throw error;
  }
};


export const getAllProducts = async (category = null) => {
  try {
    const params = category ? { category } : {};
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

export const createShoppingList = async (name = "Mi Lista de Compras", budget = null) => {
  const response = await fetch(`${API_URL}/shopping-lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, budget }),
  });
  return response.json();
};

export const getShoppingList = async (listId) => {
  const response = await fetch(`${API_URL}/shopping-lists/${listId}`);
  return response.json();
};

export const addItemToList = async (listId, productId, quantity = 1) => {
  const response = await fetch(`${API_URL}/shopping-lists/${listId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  return response.json();
};

export const removeItemFromList = async (listId, itemId) => {
  const response = await fetch(`${API_URL}/shopping-lists/${listId}/items/${itemId}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const optimizeList = async (listId, budget) => {
  const response = await fetch(`${API_URL}/shopping-lists/${listId}/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ budget }),
  });
  return response.json();
};

export const getProductByBarcode = async (barcode) => {
  const response = await fetch(`${API_URL}/products/barcode/${barcode}`);
  return response.json();
};

export const clearShoppingList = async (listId) => {
  const response = await fetch(`${API_URL}/shopping-lists/${listId}/clear`, {
    method: 'DELETE',
  });
  return response.json();
};

export default api;