import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { Link } from "react-router-dom";
import * as yup from 'yup';
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, 
  faSchool, 
  faGraduationCap, 
  faCalendar, 
  faChalkboard, 
  faBook, 
  faHandsHoldingChild,
  faGear,
  faEye,
  faClipboardUser,
  faChartColumn,
  faPlus,
  faLinesLeaning
} from '@fortawesome/free-solid-svg-icons';
import "../assets/style/dashboard.css";
import "../assets/style/addteacher.css";

const AddTeachers = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [user, setUser] = useState(null);

  const validationSchema = yup.object({
    firstName: yup.string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters"),
    lastName: yup.string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters"),
    email: yup.string()
      .email("Invalid email format")
      .required("Email is required")
      .max(28)
      .min(8),
    gender: yup.string()
      .required("Gender is required")
      .oneOf(["male", "female", "other"], "Please select a valid gender"),
    salary: yup.number()
      .typeError("Salary must be a number")
      .required("Salary is required")
      .min(0, "Salary cannot be negative"),
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAttendance = () => {
    setIsAttendanceOpen(!isAttendanceOpen);
  };

  const toggleClassroom = () => {
    setIsClassroomOpen(!isClassroomOpen);
  };

  const toggleAssign = () => {
    setIsAssignOpen(!isAssignOpen);
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      gender: "",
      salary: "",
    },
    validationSchema: validationSchema,

    onSubmit: async (values) => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) {
          throw new Error('School ID not found');
        }

        const schoolId = userData.id;
        const response = await axios.post(
          `https://attendipen-backend-staging.onrender.com/api/school/${schoolId}/teacher/invite`,
          {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            gender: values.gender,
            salary: values.salary
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            }
          }
        );

        if (response.data.message === "Teacher invite sent successfully") {
          Swal.fire({
            title: "Success!",
            text: "Teacher invite sent successfully",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => navigate("/teachers"));
        } else {
          throw new Error(response.data.message || "Failed to send invite");
        }
      } catch (error) {
        console.error('Error sending teacher invite:', error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || error.message || "Failed to send teacher invite",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    },
  });

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo"><div className="logo">
            <img src="https://res.cloudinary.com/dgxvuw8wd/image/upload/v1745508053/1f4177ed-47e3-4a5a-b5f3-0e8adf1595c3-removebg-preview_celvbn.png" alt="" />
          </div></div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/dashboard" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faHouse} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link to="/teachers" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faSchool} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Teachers</span>}
              </Link>
            </li>
            <li>
              <Link to="/students" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faGraduationCap} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Students</span>}
              </Link>
            </li>
            <li className="dropdown-container">
              <div className="nav-link dropdown-header" onClick={toggleAttendance}>
                <span className="icon">
                  <FontAwesomeIcon icon={faCalendar} className="nav-icon" />
                </span>
                {isSidebarOpen && (
                  <>
                    <span className="text">Attendance</span>
                    <span className={`dropdown-arrow ${isAttendanceOpen ? 'open' : ''}`}>▼</span>
                  </>
                )}
              </div>
              {isSidebarOpen && isAttendanceOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/settings" className="dropdown-link">
                      <span className="icon"><FontAwesomeIcon icon={faClipboardUser} className="nav-icon" /></span>
                      <span className="text">Attendance Setting</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/attendance/view" className="dropdown-link">
                      <span className="icon"><FontAwesomeIcon icon={faChartColumn} className="nav-icon" /></span>
                      <span className="text">View Attendance</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="dropdown-container">
              <div className="nav-link dropdown-header" onClick={toggleClassroom}>
                <span className="icon">
                  <FontAwesomeIcon icon={faChalkboard} className="nav-icon" />
                </span>
                {isSidebarOpen && (
                  <>
                    <span className="text">Classroom</span>
                    <span className={`dropdown-arrow ${isClassroomOpen ? 'open' : ''}`}>▼</span>
                  </>
                )}
              </div>
              {isSidebarOpen && isClassroomOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/classroom/create" className="dropdown-link">
                      <span className="icon">
                        <FontAwesomeIcon icon={faPlus} className="nav-icon" />
                      </span>
                      <span className="text">Create Class</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/classroom/list" className="dropdown-link">
                      <span className="icon"><FontAwesomeIcon icon={faLinesLeaning} className="nav-icon" /></span>
                      <span className="text">Class List</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="dropdown-container">
              <div className="nav-link dropdown-header" onClick={toggleAssign}>
                <span className="icon">
                  <FontAwesomeIcon icon={faBook} className="nav-icon" />
                </span>
                {isSidebarOpen && (
                  <>
                    <span className="text">Assign</span>
                    <span className={`dropdown-arrow ${isAssignOpen ? 'open' : ''}`}>▼</span>
                  </>
                )}
              </div>
              {isSidebarOpen && isAssignOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/teachers/assign" className="dropdown-link">
                      <span className="icon"><FontAwesomeIcon icon={faPlus} className="nav-icon" /></span>
                      <span className="text">Assign Teacher</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/students/assign" className="dropdown-link">
                      <span className="icon"><FontAwesomeIcon icon={faPlus} className="nav-icon" /></span>
                      <span className="text">Assign Student</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/subjects/assign-to-class" className="dropdown-link">
                      <span className="icon"><FontAwesomeIcon icon={faPlus} className="nav-icon" /></span>
                      <span className="text">Assign Subject</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link to="/parents/list" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faHandsHoldingChild} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Parents</span>}
              </Link>
            </li>
            <li>
              <Link to="/school/profile" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faGear} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="header">
          <div className="header-left">
            <h1 className="dashboard-title">Send Teacher Invite</h1>
          </div>
          <form className="search-form">
            <button type="button">
              <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
                <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
            <input className="search-input" placeholder="Search..." required type="text" />
            <button className="reset" type="reset">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </form>
          <div className="user">
            <div className="profile-picture">
              {user?.profile_picture ? (
                <img 
                  src={user.profile_picture}
                  alt="Profile" 
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = null;
                    e.target.parentElement.innerHTML = `<div class="profile-placeholder">${user?.name?.charAt(0)?.toUpperCase() || '?'}</div>`;
                  }}
                />
              ) : (
                <div className="profile-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="user-info">
              <h4 className="welcome-message">{user?.name || "Loading..."}</h4>
              <h5>Admin</h5>
            </div>
          </div>
        </div>

        <div className="content-body">
       
          <form onSubmit={formik.handleSubmit} className='context'>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter first name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                className="form-input"
              />
              {formik.errors.firstName && <p className="error">{formik.errors.firstName}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter last name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                className="form-input"
              />
              {formik.errors.lastName && <p className="error">{formik.errors.lastName}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                className="form-input"
              />
              {formik.errors.email && <p className="error">{formik.errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                className="form-input"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {formik.errors.gender && <p className="error">{formik.errors.gender}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                type="number"
                name="salary"
                placeholder="Enter salary amount"
                value={formik.values.salary}
                onChange={formik.handleChange}
                className="form-input"
              />
              {formik.errors.salary && <p className="error">{formik.errors.salary}</p>}
            </div>

            <button type="submit" className="submit-btn">Send Invite</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeachers;