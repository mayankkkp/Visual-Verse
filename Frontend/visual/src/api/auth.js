// api/auth.js
export const logoutUser = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies (like session ID) are sent with the request
      });
  
      if (!response.ok) {
        throw new Error('Failed to log out');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };
  