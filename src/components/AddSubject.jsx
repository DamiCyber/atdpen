import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
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
  faLinesLeaning,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import "../assets/style/dashboard.css";
import "../assets/style/createsubject.css";

const BASE_URL = "https://attendipen-backend-staging.onrender.com/api";

const AddSubject = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchClasses(parsedUser.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchClasses = async (schoolId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/school/${schoolId}/classes`,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      
      if (response.data.message === "Classes retrieved successfully") {
        setClasses(response.data.data.classes);
      } else {
        throw new Error(response.data.message || "Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch classes",
        icon: "error",
      });
    }
  };

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

  const validationSchema = yup.object({
    name: yup.string().required("Subject name is required"),
    description: yup.string().required("Description is required"),
    classId: yup.string().required("Please select a class"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      classId: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) {
          Swal.fire({
            title: "Authentication Required",
            text: "Please login to continue",
            icon: "warning",
            confirmButtonText: "OK",
          }).then(() => {
            navigate("/login");
          });
          return;
        }

        setLoading(true);
        const response = await axios.post(
          `${BASE_URL}/school/${userData.id}/classes/${values.classId}/subjects`,
          {
            name: values.name,
            description: values.description
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            }
          }
        );

        if (response.data.message === "Subject created successfully") {
          Swal.fire({
            title: "Success",
            text: "Subject created successfully",
            icon: "success",
          }).then(() => {
            navigate("/subjects/list");
          });
        } else {
          throw new Error(response.data.message || "Failed to create subject");
        }
      } catch (error) {
        console.error("Error creating subject:", error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || error.message || "Failed to create subject",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
          <div className="logo">
            <img src="https://res.cloudinary.com/dgxvuw8wd/image/upload/v1745508053/1f4177ed-47e3-4a5a-b5f3-0e8adf1595c3-removebg-preview_celvbn.png" alt="" />
          </div>
          </div>
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
            <h1 className="dashboard-title">Add Subject</h1>
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
              <img 
                src={user?.profile_picture || "https://via.placeholder.com/40"} 
                alt="Profile" 
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/40";
                }}
              />
            </div>
            <div className="user-info">
              <h4 className="welcome-message">{user?.name || "Admin"}</h4>
              <h5>Admin</h5>
            </div>
          </div>
        </div>

        <div className="content-body">
          <div className="contents">
            <div className="student-details">
              <h2>Create New Subject</h2>
            </div>
            <form onSubmit={formik.handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="classId">Select Class</label>
                <select
                  id="classId"
                  name="classId"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.classId}
                  className={formik.touched.classId && formik.errors.classId ? "error-input" : ""}
                >
                  <option value="">Select a class</option>
                  {classes.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
                {formik.touched.classId && formik.errors.classId && (
                  <div className="error">{formik.errors.classId}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="name">Subject Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.name}
                  placeholder="Enter subject name"
                  className={formik.touched.name && formik.errors.name ? "error-input" : ""}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="error">{formik.errors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.description}
                  placeholder="Enter subject description"
                  className={formik.touched.description && formik.errors.description ? "error-input" : ""}
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="error">{formik.errors.description}</div>
                )}
              </div>

              <div className="button-group">
                <Link to="/subjects/list" className="cancel-btn">
                  <FontAwesomeIcon icon={faArrowLeft} className="button-icon" />
                  Back to Subjects
                </Link>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSubject;
