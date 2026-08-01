// Use the deployed backend URL if VITE_API_URL is set, otherwise default to local
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const fetchFeed = async (limit = 12) => {
  const response = await fetch(`${API_BASE_URL}/papers/feed?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch daily digest');
  }
  return response.json();
};

export const fetchPaperDetails = async (arxivId) => {
  const response = await fetch(`${API_BASE_URL}/papers/${encodeURIComponent(arxivId)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch paper details');
  }
  return response.json();
};

export const searchPapers = async (query, limit = 12) => {
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to search papers');
  }
  return response.json();
};

export const fetchAllPapers = async (page = 1, limit = 20) => {
  const response = await fetch(`${API_BASE_URL}/papers/all?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch papers');
  }
  return response.json();
};
