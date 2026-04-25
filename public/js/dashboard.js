const API_BASE = '/api/v1/auth';

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/';
}

function showError(msg) {
  const el = document.getElementById('userEmail');
  if (el) el.textContent = msg;
}

async function fetchUser() {
  const token = getAccessToken();
  if (!token) {
    window.location.href = '/login';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      logout();
      return;
    }

    const data = await response.json();
    const user = data.data;
    
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userPlan').textContent = `Plan: ${user.plan || 'Free'}`;
  } catch (err) {
    showError('Error loading user');
  }
}

function initDashboard() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  fetchUser();
}

document.addEventListener('DOMContentLoaded', initDashboard);