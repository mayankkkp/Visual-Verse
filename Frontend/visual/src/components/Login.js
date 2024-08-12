import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, CircularProgress, TextField, Typography } from "@mui/material";
import axios from "axios";

import { setUser } from "../actions";
import "../css/login.css";

function Login() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Track if user is in "Forgot Password" mode
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    axios.get("https://visual-verse-1.onrender.com/user", { withCredentials: true })
      .then(response => {
        const user = response.data;
        if (user) {
          dispatch(setUser(user));
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error checking auth status:", error);
        setIsLoading(false);
      });
  }, [dispatch]);

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
        email: formData.email,
        password: formData.password
      });
      alert("Signup successful! Please log in.");
      setIsSignup(false);
      setFormData({ email: '', password: '', confirmPassword: '' });
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await axios.post("https://visual-verse-1.onrender.com/login", {
        email: formData.email,
        password: formData.password
      });
      alert("Login successful!");
      // Fetch user data after successful login
      const response = await axios.get("https://visual-verse-1.onrender.com/user", { withCredentials: true });
      dispatch(setUser(response.data));
    } catch (error) {
      setAuthError("Login failed. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get("https://visual-verse-1.onrender.com/api/auth/google"); // Backend endpoint for Google login
      window.location.href = response.data.url; // Redirect to Google's OAuth URL
    } catch (error) {
      setAuthError(error.message);
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
        <CircularProgress />
      ) : (
        <div className="login-box">
          <img
            src="https://cdn-icons-png.flaticon.com/128/3004/3004613.png"
            alt="VisualVerse"
          />
          {isForgotPassword ? (
            <>
              <Typography variant="h6">Forgot Password</Typography>
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <Button onClick={handleForgotPassword} variant="contained" color="primary">
                Send Reset Link
              </Button>
              <Button onClick={() => setIsForgotPassword(false)} variant="outlined" color="secondary">
                Back to Login
              </Button>
            </>
          ) : isSignup ? (
            <>
              <Typography variant="h6">Sign Up</Typography>
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <Button onClick={handleSignup} variant="contained" color="primary">
                Sign Up
              </Button>
              <Button onClick={() => setIsSignup(false)} variant="outlined" color="secondary">
                Back to Login
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6">Login</Typography>
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <Button onClick={handleLogin} variant="contained" color="primary">
                Login
              </Button>
              <Button onClick={handleGoogleLogin} variant="contained" color="primary">
                Sign In With Google
              </Button>
              <Button onClick={() => setIsSignup(true)} variant="outlined" color="secondary">
                Sign Up
              </Button>
              <Button onClick={() => setIsForgotPassword(true)} variant="text" color="primary" className="forgot-password-link">
                Forgot Password?
              </Button>
            </>
          )}
          {authError && <p className="auth-error">{authError}</p>}
        </div>
      )}
    </div>
  );
}

export default Login;
