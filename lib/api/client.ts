import axios, { AxiosInstance } from 'axios';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    // Request interceptor to proxy requests through Next.js API route
    this.client.interceptors.request.use(
      async (config) => {
        // If it's the auth endpoint, let it pass through
        if (config.url?.includes('/api/auth')) {
          return config;
        }

        // If it's already a proxy request, update the token in the data
        if (config.url?.includes('/api/proxy')) {
          // If data is a JSON string, parse it, update token, and stringify it back
          if (typeof config.data === 'string') {
            try {
              const parsedData = JSON.parse(config.data);
              parsedData.token = this.token;
              config.data = JSON.stringify(parsedData);
            } catch (e) {
              console.error('Failed to parse config.data:', e);
            }
          } else if (config.data && typeof config.data === 'object' && 'token' in config.data) {
            config.data.token = this.token;
          }
          return config;
        }

        // First time request - wrap it for proxy
        const endpoint = config.url || '';
        const method = (config.method || 'POST').toUpperCase();
        
        // Use Next.js API proxy to add origin header server-side
        const proxyData = {
          endpoint,
          method,
          data: config.data,
          token: this.token,
        };

        // Replace the request config to go through local Next.js proxy
        config.url = '/api/proxy';
        config.method = 'POST';
        config.data = proxyData;
        config.baseURL = ''; // Remove baseURL so it uses localhost
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Check if we're already in an auth loop
          if (error.config._retryCount) {
            error.config._retryCount++;
            if (error.config._retryCount > 3) {
              return Promise.reject(error);
            }
          } else {
            error.config._retryCount = 1;
          }

          // Token expired, re-authenticate
          await this.authenticate();
          // Retry the original request
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  async authenticate() {
    try {
      const payload = {
        userId: process.env.NEXT_PUBLIC_API_USER_ID,
        password: process.env.NEXT_PUBLIC_API_PASSWORD,
        isOtp: false,
        salesChannelUserId: process.env.NEXT_PUBLIC_API_SALES_CHANNEL,
      };

      // Use Next.js API route to proxy authentication (adds origin header server-side)
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      this.token = data.accessToken;
      return this.token;
    } catch (error: any) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  getClient() {
    return this.client;
  }

  getToken() {
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
  }
}

export const apiClient = new APIClient();

