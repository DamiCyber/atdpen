import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import "../assets/style/dashboard.css";
import "../assets/style/assignsubject.css";
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
const BASE_URL = "https://attendipen-d65abecaffe3.herokuapp.com";

const AssignSubjectToClass = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [user, setUser] = useState(null);

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

  const validationSchema = yup.object({
    subject_id: yup.number().required("Subject is required"),
    class_id: yup.number().required("Class is required"),
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch subjects
      const subjectsResponse = await axios.get(
        `${BASE_URL}/subjects/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubjects(subjectsResponse.data);

      // Fetch classes
      const classesResponse = await axios.get(
        `${BASE_URL}/classes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClasses(classesResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch data. Please try again later.",
        icon: "error",
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnassignSubject = async () => {
    if (!formik.values.subject_id || !formik.values.class_id) {
      Swal.fire({
        title: "Error",
        text: "Please select both subject and class",
        icon: "error",
      });
      return;
    }

    try {
      setUnassignLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.delete(
        `${BASE_URL}/subjects/unassign_from_class`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            subject_id: parseInt(formik.values.subject_id),
            class_id: parseInt(formik.values.class_id)
          }
        }
      );

      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          title: "Success",
          text: "Subject unassigned from class successfully",
          icon: "success",
        });
        formik.resetForm();
      }
    } catch (error) {
      console.error("Error unassigning subject:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to unassign subject from class",
        icon: "error",
      });
    } finally {
      setUnassignLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      subject_id: "",
      class_id: "",
      subject_name: "",
      class_name: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const requestData = {
          subject_id: parseInt(values.subject_id),
          class_id: parseInt(values.class_id)
        };

        const response = await axios.post(
          `${BASE_URL}/subjects/assign_to_class`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status >= 200 && response.status < 300) {
          Swal.fire({
            title: "Success",
            text: `Subject "${values.subject_name}" assigned to class "${values.class_name}" successfully`,
            icon: "success",
          });
          formik.resetForm();
        }
      } catch (error) {
        console.error("Error assigning subject:", error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to assign subject to class",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSubjectChange = (e) => {
    const selectedSubject = subjects.find(subject => subject.subject_id === parseInt(e.target.value));
    formik.setFieldValue('subject_id', e.target.value);
    formik.setFieldValue('subject_name', selectedSubject ? selectedSubject.subject_name : '');
  };

  const handleClassChange = (e) => {
    const selectedClass = classes.find(cls => cls.id === parseInt(e.target.value));
    formik.setFieldValue('class_id', e.target.value);
    formik.setFieldValue('class_name', selectedClass ? selectedClass.name : '');
  };

  if (isInitialLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="dashboard-title">Assign Subject to Class</h1>
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
          <div className="assign-subject-container">
            <div className="navigation-buttons">
              <Link to="/subjects/create" className="nav-button">
                <FontAwesomeIcon icon={faPlus} className="button-icon" />
                Create Subject
              </Link>
              <Link to="/subjects/assign-to-teacher" className="nav-button">
                <FontAwesomeIcon icon={faSchool} className="button-icon" />
                Assign Subject to Teacher
              </Link>
              <Link to="/subjects/assign-to-student" className="nav-button">
                <FontAwesomeIcon icon={faGraduationCap} className="button-icon" />
                Assign Subject to Student
              </Link>
            </div>
            <div className="form-container">
              <h2>Assign Subject</h2>
              <form onSubmit={formik.handleSubmit} className='forall'>
                <div className="form-group">
                  <label htmlFor="subject_id">Select Subject</label>
                  <select
                    id="subject_id"
                    name="subject_id"
                    onChange={handleSubjectChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.subject_id}
                    className={formik.touched.subject_id && formik.errors.subject_id ? 'error' : ''}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.subject_id && formik.errors.subject_id && (
                    <div className="error">{formik.errors.subject_id}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="class_id">Select Class</label>
                  <select
                    id="class_id"
                    name="class_id"
                    onChange={handleClassChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.class_id}
                    className={formik.touched.class_id && formik.errors.class_id ? 'error' : ''}
                  >
                    <option value="">Select a class</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.class_id && formik.errors.class_id && (
                    <div className="error">{formik.errors.class_id}</div>
                  )}
                </div>

                <div className="button-group">
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={loading || !formik.values.subject_id || !formik.values.class_id}
                  >
                    {loading ? (
                      <>
                        <svg className="loading-spinner animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Assigning...
                      </>
                    ) : (
                      "Assign Subject"
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="unassign-btn" 
                    onClick={handleUnassignSubject}
                    disabled={unassignLoading || !formik.values.subject_id || !formik.values.class_id}
                  >
                    {unassignLoading ? (
                      <>
                        <svg className="loading-spinner animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Unassigning...
                      </>
                    ) : (
                      "Unassign Subject"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignSubjectToClass;