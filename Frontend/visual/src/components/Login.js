import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/login.css"; // Import the CSS file for styling

function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();  // Get the navigate function

  useEffect(() => {
    axios.get("https://visual-verse-1.onrender.com/user", { withCredentials: true })
      .then(response => {
        const user = response.data;
        if (user) {
          navigate("/home");  // Redirect to HomePage if user is already logged in
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error checking auth status:", error);
        setIsLoading(false);
      });
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    try {
      await axios.post("https://visual-verse-1.onrender.com/signup", {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      alert("Signup successful! Please log in.");
      setIsSignup(false);
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      setAuthError("Signup Failed");
    }
  };

  const handleLogin = async () => {
    try {
      await axios.post("https://visual-verse-1.onrender.com/login", {
        email: formData.email,
        password: formData.password
      });
      alert("Login successful!");
      navigate("./pages/HomePage");  // Redirect to HomePage after successful login
    } catch (error) {
      setAuthError("Login failed. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
        // Request the URL to redirect to Google's OAuth service
        const response = await axios.get("https://visual-verse-1.onrender.com/api/auth/google");
        
        // Redirect the user to the URL provided by the backend
        window.location.href = response.data.url;
    } catch (error) {
        // Handle errors (e.g., show a message to the user)
        setAuthError("Failed to initiate Google login. Please try again.");
    }
};

  const handleForgotPassword = async () => {
    try {
      await axios.post("https://visual-verse-1.onrender.com/forgot-password", { email: formData.email });
      alert("Password reset email sent. Please check your inbox.");
      setIsForgotPassword(false);
      setFormData({ ...formData, email: '' });
    } catch (error) {
      setAuthError("Failed to send password reset email. Please try again.");
    }
  };

  return (
    <div className="login-container">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="login-box">
          <img
            src="https://cdn-icons-png.flaticon.com/128/3004/3004613.png"
            alt="VisualVerse"
          />
          {isForgotPassword ? (
            <>
              <h3>Forgot Password</h3>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <button onClick={handleForgotPassword}>Send Reset Link</button>
              <button onClick={() => setIsForgotPassword(false)}>Back to Login</button>
            </>
          ) : isSignup ? (
            <>
              <h3>Sign Up</h3>
              <input
                name="username"
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button onClick={handleSignup}>Sign Up</button>
              <button onClick={() => setIsSignup(false)}>Back to Login</button>
            </>
          ) : (
            <>
              <h3>VisualVerse</h3>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button onClick={handleLogin}>Login</button>
              <button onClick={handleGoogleLogin}>Sign In With Google</button>
              <button onClick={() => setIsSignup(true)}>Sign Up</button>
              <button variant="text" onClick={() => setIsForgotPassword(true)}>Forgot Password?</button>
            </>
          )}
          {authError && <p className="auth-error">{authError}</p>}
        </div>
      )}
    </div>
  );
}

export default Login;
