import axiosInstance from "../axios-instance";

// Registers a new user by sending their details to the `/register/` endpoint
export const signup = async (data) => {
  try {
    const response = await axiosInstance.post(`/register/`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;  // Re-throw the error for further handling if needed
  }
};

// Authenticates an existing user by sending their credentials to the `/login/` endpoint
export const login = async (credentials) => {
  try {
    console.log('Login data:', credentials);  // Debugging
    const response = await axiosInstance.post(`/login/`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 200) {
      const token = response.data.access;  // Assuming the token is under the `access` key
      localStorage.setItem("token", token);  // Store the token
    }

    return response;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;  // Re-throw the error for further handling if needed
  }
};

// Accesses a protected resource by sending a GET request to the `/protected/` endpoint
export const Protected = async () => {
  try {
    const response = await axiosInstance.get(`/protected/`);
    return response;
  } catch (error) {
    console.error('Protected resource access error:', error.response?.data || error.message);
    throw error;  // Re-throw the error for further handling if needed
  }
};

// Logs out the current user by removing the token from local storage
export const logout = () => {
  localStorage.removeItem("token");  // Remove the token
};

// Retrieves the current user’s data from the `/protected/` endpoint if authenticated
export const getCurrentUser = async () => {
  try {
    const response = await Protected();  // Reusing the Protected function
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error.response?.data || error.message);
    throw error;  // Re-throw the error for further handling if needed
  }
};
