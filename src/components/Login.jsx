import React, { useState } from "react";
import "../assets/style/login.css";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";

const Login = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();

  const validationSchema = yup.object({
    email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email is required")
      .trim()
      .max(40, "Email must not exceed 40 characters")
      .min(3, "Email must be at least 3 characters"),
    password: yup
      .string()
      .matches(/^[a-zA-Z0-9]+$/, "Password must contain only letters and numbers")
      .required("Password is required")
      .trim()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password cannot exceed 20 characters"),
    role: yup
      .string()
      .required("Please select a user type")
      .oneOf(["school", "teacher", "parent"], "Invalid user type"),
  });

  const { handleChange, handleSubmit, handleBlur, values, errors, touched } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
        role: "school", // default value
      },
      validationSchema: validationSchema,
      onSubmit: async (values) => {
        if (!values.email.trim() || !values.password.trim()) {
          setErrorMessage("Please fill in all fields");
          return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
          const response = await axios.post(
            "https://attendipen-backend-staging.onrender.com/api/auth/signin",
            {
              role: values.role,
              email: values.email.trim(),
              password: values.password.trim()
            },
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          console.log("Login Response:", {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers
          });

          if (response.status === 200) {
            // Log the exact API response
            console.log("Login API Response:", {
              message: response.data.message,
              data: {
                token: response.data.data.token,
                user: response.data.data.user
              }
            });

            // Save token to localStorage
            if (response.data.data.token) {
              localStorage.setItem("token", response.data.data.token);
              console.log("Token saved to localStorage");
            }

            // Save user details to localStorage
            const userData = {
              id: response.data.data.user.id,
              firstName: response.data.data.user.firstName,
              lastName: response.data.data.user.lastName,
              email: response.data.data.user.email,
              role: response.data.data.user.role
            };
            
            localStorage.setItem("user", JSON.stringify(userData));
            console.log("User details saved to localStorage");

            // Navigate based on role
            const userRole = userData.role.toLowerCase();
            switch (userRole) {
              case "school":
                navigate("/Dashboard");
                break;
              case "teacher":
                navigate("/Teachers/Dashboard");
                break;
              case "parent":
                navigate("/ParentDashboard");
                break;
              default:
                setErrorMessage("Invalid user role");
                return;
            }

            // Show success message
            Swal.fire({
              title: "Success",
              text: response.data.message,
              icon: "success",
              confirmButtonText: "OK"
            });
          } else {
            console.log("Unexpected response status:", response.status);
            setErrorMessage("Unexpected response from server. Please try again.");
          }
        } catch (error) {
          console.error("Login error:", error);
          if (error.response) {
            console.log("Error response:", error.response);
            switch (error.response.status) {
              case 401:
                setErrorMessage("Invalid email or password. Please try again.");
                break;
              case 422:
                setErrorMessage(
                  error.response.data.message ||
                  "Invalid input. Please check your credentials."
                );
                break;
              case 429:
                setErrorMessage("Too many login attempts. Please try again later.");
                break;
              case 500:
                setErrorMessage("Server error. Please try again later.");
                break;
              default:
                setErrorMessage(error.response.data.message || "Login failed. Please try again.");
            }
          } else if (error.request) {
            console.log("No response received:", error.request);
            setErrorMessage("No response from server. Please check your internet connection.");
          } else {
            console.log("Error setting up request:", error.message);
            setErrorMessage("An error occurred. Please try again.");
          }
        } finally {
          setIsLoading(false);
        }
      },
    });

  return (
    <div>
      <div className="whole-con">
        <form onSubmit={handleSubmit} noValidate>
          <div className="first-con">
            <div className="text">
              <h2>Login</h2>
              <h4>Welcome Back</h4>
              <p>Please enter your credentials to login.</p>
            </div>
            <div className="login">
              <div className="drop">
                <label htmlFor="role">User Type</label>
                <div style={{ color: "red" }} className="err">
                  {touched.role && errors.role}
                </div>
                <select
                  name="role"
                  id="role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="dropdown"
                  disabled={isLoading}
                >
                  <option value="school">School</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              <label htmlFor="email">Email ID</label>
              <div style={{ color: "red" }} className="err">
                {touched.email && errors.email}
              </div>
              <input
                type="email"
                placeholder="Enter Email ID"
                onChange={handleChange}
                onBlur={handleBlur}
                name="email"
                value={values.email}
                id="email"
                disabled={isLoading}
                autoComplete="email"
              />

              <label htmlFor="password">Password</label>
              <div style={{ color: "red" }} className="err">
                {touched.password && errors.password}
              </div>
              <input
                type="password"
                onChange={handleChange}
                onBlur={handleBlur}
                name="password"
                value={values.password}
                id="password"
                placeholder="Password"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {errorMessage && (
              <div style={{ color: "red" }} className="error-message">
                {errorMessage}
              </div>
            )}

            <div className="button-container">
              <button 
                type="submit" 
                className="login-btn" 
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? "LOGGING IN..." : "LOGIN"}
              </button>
            </div>

            <div className="account">
              <p>Don't have an account?</p>
              <Link to="/Register" className="ink">
                Register here
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
