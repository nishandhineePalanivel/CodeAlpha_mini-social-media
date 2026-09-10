const API_URL = '/api';

// Utility for fetching data
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  // Auto-logout if unauthorized (token expired)
  if (response.status === 401 && token) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }

  return { status: response.status, data };
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Redirect if not logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  const path = window.location.pathname;
  
  if (!token && !path.includes('login.html') && !path.includes('register.html')) {
    window.location.href = 'login.html';
  } else if (token && (path.includes('login.html') || path.includes('register.html'))) {
    window.location.href = 'index.html';
  }
}

// Global logout handler
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  }
});
