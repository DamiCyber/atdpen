import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; 
import "../assets/style/register.css";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "school", // Default role
  });

  const [message, setMessage] = useState("");

  // ✅ Added missing handleChange function
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add password validation regex from Login component
    const passwordRegex = /^[a-zA-Z0-9]+$/;
    if (!passwordRegex.test(formData.password)) {
      setMessage("Password must contain only letters and numbers");
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 20) {
      setMessage("Password must be between 8 and 20 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setIsLoading(true); // Set loading before making the request

    try {
      const response = await axios.post(
        "https://attendipen-backend-staging.onrender.com/api/auth/signup",
        {
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        // Check if we got a token in the response
        if (response.data?.access_token) {
          localStorage.setItem("token", response.data.access_token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        }

        // Store user data if provided
        if (response.data?.user) {
          const userData = {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            role: formData.role,
            profile_picture: response.data.user.profile_picture || null
          };
          localStorage.setItem("user", JSON.stringify(userData));
        }

        Swal.fire({
          title: "Registration Successful",
          text: "Your account has been created successfully!",
          icon: "success",
          confirmButtonText: "Thank You",
        });

        setMessage("Registration successful! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        title: "Registration Failed",
        text: error.response?.data?.message || "An error occurred during registration. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });

      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="whole-cont">
      <form className="padi" onSubmit={handleSubmit}>
        <div className="first-cont">
          <div className="first-text">
            <h2>Register</h2>
          </div>

          {/* User Type Selection */}
          <div className="register-second">
            <label>User Type</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="choose"
            >
              <option value="school">School</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          {/* Name Fields */}
          <div className="register-flex">
            <div className="register-first">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="register-first leftu">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="register-second">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email ID"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Fields */}
          <div className="password-flex">
            <div className="password-first">
              <label>Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span 
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  style={{ cursor: 'pointer' }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </span>
              </div>
            </div>
            <div className="password-first leftu">
              <label>Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <span 
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  style={{ cursor: 'pointer' }}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Display error/success message */}
          {message && <p className="message">{message}</p>}

          <div className="button-Reg">
            <button className="Reg-btn" type="submit" disabled={isLoading}>
              {isLoading ? "REGISTERING..." : "REGISTER"}
            </button>
          </div>

          {/* Redirect to Login */}
          <div className="Reg-account">
            <p>Already have an account? </p>
            <Link to="/login" className="inka">
              Login here
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
