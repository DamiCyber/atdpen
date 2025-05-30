import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import "../assets/style/dashboard.css";
import "../assets/style/addstudent.css";
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

const AddStudents = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setSchoolId(parsedUser.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem("token");
      if (!token || !schoolId) {
        navigate("/login");
        return;        
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `https://attendipen-backend-staging.onrender.com/api/school/${schoolId}/classes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Classes API Response:', response.data);
        
        // Handle the correct response structure
        let classesData = [];
        if (response.data && response.data.data && response.data.data.classes) {
          classesData = response.data.data.classes;
        }

        // Sort classes by name if available
        classesData.sort((a, b) => {
          const nameA = (a.name || a.className || '').toLowerCase();
          const nameB = (b.name || b.className || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setClasses(classesData);
      } catch (error) {
        console.error("Error fetching classes:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        // Show error message to user
        Swal.fire({
          title: "Error",
          text: "Failed to fetch classes. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) {
      fetchClasses();
    }
  }, [navigate, schoolId]);

  const validationSchema = yup.object({
    firstName: yup
      .string()
      .required("First Name is required")
      .min(2, "First Name must be at least 2 characters"),
    lastName: yup
      .string()
      .required("Last Name is required")
      .min(2, "Last Name must be at least 2 characters"),
    dateOfBirth: yup
      .string()
      .required("Date of Birth is required"),
    classId: yup
      .string()
      .required("Class is required"),
    gender: yup.string().oneOf(["male", "female", "other"], "Invalid gender").required("Gender is required"),
    parentEmail: yup
      .string()
      .email("Invalid email format")
      .required("Parent Email is required")
      .max(50, "Email must be at most 50 characters"),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      classId: "",
      parentEmail: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const token = localStorage.getItem("token");

      if (!token || !schoolId) {
        Swal.fire({
          title: "Authentication Error",
          text: "Please log in to continue.",
          icon: "error",
          confirmButtonText: "OK",
        });
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        // Format the data according to the API requirements
        const studentData = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          dateOfBirth: values.dateOfBirth,
          gender: values.gender.toLowerCase(),
          parentEmail: values.parentEmail.trim().toLowerCase(),
          classId: values.classId
        };

        console.log('Submitting student data:', studentData); // Debug log

        const response = await axios.post(
          `https://attendipen-backend-staging.onrender.com/api/school/${schoolId}/student`,
          studentData,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Student creation response:', response.data); // Debug log

        if (response.status === 200 || response.status === 201) {
          Swal.fire({
            title: "Success!",
            text: "Student has been added successfully.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            // Reset form after successful submission
            formik.resetForm();
            navigate("/students");
          });
        }
      } catch (error) {
        console.error("Error creating student:", error);
        let errorMessage = "Failed to add student. Please try again.";

        if (error.response) {
          // Handle specific error messages from the API
          errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;

          if (error.response.status === 401) {
            errorMessage = "Your session has expired. Please log in again.";
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }

          if (error.response.status === 400) {
            errorMessage = "Please check your input and try again.";
          }

          if (error.response.status === 409) {
            errorMessage = "A student with this email already exists.";
          }
        }

        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    },
  });

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
            <h1 className="dashboard-title">Add Student</h1>
          </div>
          <div className="user">
            <div className="profile-picture">
              <img 
                src={user?.profile_picture || null} 
                alt="Profile" 
                onError={(e) => {
                  e.target.src = null;
                }}
              />
            </div>
            <div className="user-info">
              <h4 className="welcome-message">{user?.name || "User"}</h4>
              <h5>Admin</h5>
            </div>
          </div>
        </div>

        <div className="content-body">
          <form onSubmit={formik.handleSubmit} className="student-form">
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="form-input"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="error">{formik.errors.firstName}</p>
              )}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="form-input"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="error">{formik.errors.lastName}</p>
              )}
            </div>

            <div className="form-group">
              <input
                type="email"
                name="parentEmail"
                placeholder="Parent Email"
                value={formik.values.parentEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="form-input"
              />
              {formik.touched.parentEmail && formik.errors.parentEmail && (
                <p className="error">{formik.errors.parentEmail}</p>
              )}
            </div>

            <div className="form-group">
              <input
                type="date"
                name="dateOfBirth"
                placeholder="Date of Birth"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="form-input"
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <p className="error">{formik.errors.dateOfBirth}</p>
              )}
            </div>

            <div className="form-group">
              <select
                id="classId"
                name="classId"
                onChange={formik.handleChange}
                value={formik.values.classId}
                disabled={loading}
                className={`form-input ${loading ? 'loading' : ''}`}
              >
                <option value="">{loading ? "Loading classes..." : "Select a class"}</option>
                {Array.isArray(classes) && classes.length > 0 ? (
                  classes.map((cls) => (
                    <option 
                      key={cls._id} 
                      value={cls._id}
                    >
                      {cls.name || 'Unnamed Class'}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No classes available</option>
                )}
              </select>
              {loading && <p className="loading-text">Loading classes...</p>}
              {!loading && classes.length === 0 && (
                <p className="error">No classes found. Please create a class first.</p>
              )}
              {formik.touched.classId && formik.errors.classId && (
                <p className="error">{formik.errors.classId}</p>
              )}
            </div>

            <div className="wrap">
              <div className="sel">
                <select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="form-input"
                  disabled={loading}
                >
                  <option value="" label="Select gender" />
                  <option value="male" label="Male" />
                  <option value="female" label="Female" />
                  <option value="other" label="Other" />
                </select>
                {formik.touched.gender && formik.errors.gender && (
                  <p className="error">{formik.errors.gender}</p>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Adding Student..." : "Add Student"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudents;


