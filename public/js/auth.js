const API_BASE = '/api/v1/auth';

function isLoggedIn() {
  return localStorage.getItem('accessToken') !== null;
}

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = '/start';
  }
}

function initAuthNav() {
  const navAuth = document.getElementById('navAuth');
  if (!navAuth) return;

  if (isLoggedIn()) {
    navAuth.innerHTML = `
      <a href="/dashboard" class="user-avatar" title="Dashboard">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </a>
    `;
  } else {
    navAuth.innerHTML = `
      <a href="/login" class="btn btn-outline">Sign In</a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', initAuthNav);

function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function hideError() {
  const errorEl = document.getElementById('errorMessage');
  errorEl.style.display = 'none';
}

function setLoading(loading) {
  const btn = document.getElementById('submitBtn');
  if (loading) {
    btn.disabled = true;
    btn.classList.add('loading');
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

function storeTokens(accessToken, refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

async function handleApiResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

async function login(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleApiResponse(response);
}

async function register(email, password) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleApiResponse(response);
}

const path = window.location.pathname;

if (path === '/login' || path === '/pages/login.html') {
  redirectIfLoggedIn();

  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    setLoading(true);

    try {
      const data = await login(email, password);
      storeTokens(data.data.accessToken, data.data.refreshToken);
      window.location.href = '/start';
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  });
}

if (path === '/register' || path === '/pages/register.html') {
  redirectIfLoggedIn();

  const form = document.getElementById('registerForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      window.location.href = '/login';
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  });
}