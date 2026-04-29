import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://insighta-backend-production-301c.up.railway.app';

// We keep a mutable reference to auth context helpers so interceptors can access them
// without causing circular dependency issues. Call initAxiosAuth() after mounting AuthProvider.
let _getTokens = () => ({ accessToken: null, refreshToken: null });
let _updateTokens = () => {};
let _onAuthFailure = () => {};

export function initAxiosAuth({ getTokens, updateTokens, onAuthFailure }) {
  _getTokens = getTokens;
  _updateTokens = updateTokens;
  _onAuthFailure = onAuthFailure;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-API-Version': '1',
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = _getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with token refresh
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = _getTokens();

      if (!refreshToken) {
        isRefreshing = false;
        _onAuthFailure();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken }, {
          headers: { 'X-API-Version': '1', 'Content-Type': 'application/json' },
        });

        const { access_token, refresh_token } = response.data;
        _updateTokens({ accessToken: access_token, refreshToken: refresh_token });

        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        _onAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
