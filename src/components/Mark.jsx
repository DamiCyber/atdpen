import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, 
  faCalendar, 
  faChalkboard, 
  faBook, 
  faGear,
  faClipboardUser,
  faChartColumn,
  faUser,
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import "../assets/style/dashboard.css";
import "../assets/style/mark.css";

const BASE_URL = "https://attendipen-d65abecaffe3.herokuapp.com";

const Mark = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve the user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${BASE_URL}/classes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (response.data && Array.isArray(response.data)) {
          setClasses(response.data);
        } else {
          throw new Error("Invalid classes data received");
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to fetch classes. Please try again.",
          icon: "error",
        });
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAttendance = () => {
    setIsAttendanceOpen(!isAttendanceOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profilePicture");
    navigate("/login");
  };

  const fetchStudents = async (classId) => {
    if (!classId) return;
    
    setIsLoadingStudents(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/classes/${classId}/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        throw new Error("Invalid students data received");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch students. Please try again.",
        icon: "error",
      });
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const validationSchema = yup.object({
    class_id: yup.number().required("Class is required"),
    student_id: yup.number().required("Student is required"),
    status: yup.string().oneOf(['present', 'absent'], "Please select a valid status").required("Status is required"),
  });

  const formik = useFormik({
    initialValues: {
      class_id: "",
      student_id: "",
      status: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire({
            title: "Session Expired",
            text: "Please login again to continue",
            icon: "warning",
          });
          navigate("/login");
          return;
        }

        const attendanceData = {
          class_id: parseInt(values.class_id),
          student_id: parseInt(values.student_id),
          status: values.status
        };

        const response = await axios.post(
          `${BASE_URL}/attendance/mark`,
          attendanceData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status >= 200 && response.status < 300) {
          await Swal.fire({
            title: "Success",
            text: "Attendance marked successfully",
            icon: "success",
          });
          formik.resetForm();
          setStudents([]);
        }
      } catch (error) {
        console.error("Error marking attendance:", error);
        
        let errorMessage = "Failed to mark attendance";
        
        if (error.response?.data?.error === 'Attendance closed for today') {
          errorMessage = "Attendance marking is closed for today. Please try again during the allowed time period.";
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        "Invalid data format. Please check your input.";
        } else if (error.response?.status === 403) {
          errorMessage = "You don't have permission to mark attendance.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src="https://res.cloudinary.com/dgxvuw8wd/image/upload/v1745508053/1f4177ed-47e3-4a5a-b5f3-0e8adf1595c3-removebg-preview_celvbn.png" alt="" />
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/Teachers/Dashboard" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faHouse} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link to="/school/invitation" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faChalkboard} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Accept Invite</span>}
              </Link>
            </li>
            <li>
              <Link to="/teachers/scan" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faChalkboard} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Scan QR Code</span>}
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
                    <Link to="/attendance/mark" className="dropdown-link">
                      <span className="icon"><FontAwesomeIcon icon={faClipboardUser} className="nav-icon" /></span>
                      <span className="text">Mark Attendance</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link to="/teachers/profile/details" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faUser} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Profile</span>}
              </Link>
            </li>
            <li>
              <Link to="/teachers/profile/edit" className="nav-link">
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
            <button className="menu-toggle" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
            </button>
            <h1 className="dashboard-title">Mark Attendance</h1>
          </div>
          <div className="user">
            <div className="profile-picture">
              {user?.profile_picture ? (
                <img 
                  src={user.profile_picture}
                  alt="Profile" 
                  onError={(e) => {
                    e.target.onerror = null;
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
              <h5>Teacher</h5>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>

        <div className="content-body">
          <div className="form-container">
            {isLoadingClasses ? (
              <div className="loading">Loading classes...</div>
            ) : (
              <form onSubmit={formik.handleSubmit} className='forall'>
                <div className="form-group">
                  <label htmlFor="class_id">Select Class</label>
                  <select
                    id="class_id"
                    name="class_id"
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value) {
                        fetchStudents(e.target.value);
                        formik.setFieldValue('student_id', '');
                        formik.setFieldValue('status', '');
                      }
                    }}
                    onBlur={formik.handleBlur}
                    value={formik.values.class_id}
                    disabled={isSubmitting}
                    className={formik.touched.class_id && formik.errors.class_id ? 'error' : ''}
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.class_id && formik.errors.class_id && (
                    <div className="error-message">{formik.errors.class_id}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="student_id">Select Student</label>
                  <select
                    id="student_id"
                    name="student_id"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.student_id}
                    disabled={!formik.values.class_id || isLoadingStudents || isSubmitting}
                    className={formik.touched.student_id && formik.errors.student_id ? 'error' : ''}
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.student_id && formik.errors.student_id && (
                    <div className="error-message">{formik.errors.student_id}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="status">Attendance Status</label>
                  <select
                    id="status"
                    name="status"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.status}
                    disabled={!formik.values.student_id || isSubmitting}
                    className={formik.touched.status && formik.errors.status ? 'error' : ''}
                  >
                    <option value="">Select status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                  {formik.touched.status && formik.errors.status && (
                    <div className="error-message">{formik.errors.status}</div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting || !formik.isValid || !formik.dirty}
                >
                  {isSubmitting ? "Marking..." : "Mark Attendance"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mark;