import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faInfoCircle,
  faMoneyBill,
  faChalkboardTeacher,
  faBook,
  faCalendarAlt,
  faClock,
  faHouse, 
  faSchool, 
  faGraduationCap, 
  faCalendar, 
  faChalkboard, 
  faBook as faBookIcon, 
  faHandsHoldingChild,
  faGear,
  faEye,
  faClipboardUser,
  faChartColumn,
  faPlus,
  faLinesLeaning,
  faUser as faUserIcon,
  faCog,
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import "../assets/style/dashboard.css";
import "../assets/style/teacherdetails.css";

const BASE_URL = "https://attendipen-d65abecaffe3.herokuapp.com";

const TeacherDetails = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
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

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // First get the teacher's profile
        const profileResponse = await axios.get(
          `${BASE_URL}/profile/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Then get additional teacher details
        const teacherResponse = await axios.get(
          `${BASE_URL}/teachers/${teacherId}?type=object`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Fetch profile picture
        const pictureResponse = await axios.get(
          `${BASE_URL}/teachers/${teacherId}?type=profile_picture`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob'
          }
        );

        // Convert blob to base64 and save to localStorage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          localStorage.setItem(`teacher_${teacherId}_profile_picture`, base64data);
          setProfilePicture(base64data);
        };
        reader.readAsDataURL(pictureResponse.data);

        // Combine profile and teacher data
        const combinedData = {
          ...profileResponse.data,
          ...teacherResponse.data
        };

        setTeacher(combinedData);
      } catch (err) {
        console.error('Error fetching teacher details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [teacherId, navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading teacher details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="error-container">
        <h3>Not Found</h3>
        <p>Teacher not found</p>
        <button onClick={() => navigate('/teachers')}>Back to Teachers</button>
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
                  <FontAwesomeIcon icon={faBookIcon} className="nav-icon" />
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
        
            <h1 className="dashboard-title">Teacher Details</h1>
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
              ) : localStorage.getItem("profilePicture") ? (
                <img 
                  src={localStorage.getItem("profilePicture")}
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
              <h5>Admin</h5>
            </div>
          </div>
        </div>

        <div className="content-body">
          <div className="teacher-profile-card">
            <div className="profile-header">
              <div className="profile-image">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt={teacher?.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = null;
                      e.target.parentElement.innerHTML = `
                        <div class="profile-placeholder">
                          ${teacher?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="profile-placeholder">
                    {teacher?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2>{teacher.name}</h2>
                <p className="teacher-role">Teacher</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faUser} className="detail-icon" />
                    <div className="detail-content">
                      <label>ID</label>
                      <span>{teacher.id}</span>
                    </div>
                  </div>
                  {teacher.email && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faEnvelope} className="detail-icon" />
                      <div className="detail-content">
                        <label>Email</label>
                        <span>{teacher.email}</span>
                      </div>
                    </div>
                  )}
                  {teacher.gender && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faUser} className="detail-icon" />
                      <div className="detail-content">
                        <label>Gender</label>
                        <span>{teacher.gender}</span>
                      </div>
                    </div>
                  )}
                  {teacher.phone_number && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faPhone} className="detail-icon" />
                      <div className="detail-content">
                        <label>Phone</label>
                        <span>{teacher.phone_number}</span>
                      </div>
                    </div>
                  )}
                  {teacher.address && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="detail-icon" />
                      <div className="detail-content">
                        <label>Address</label>
                        <span>{teacher.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Professional Information</h3>
                <div className="detail-grid">
                  {teacher.about && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faInfoCircle} className="detail-icon" />
                      <div className="detail-content">
                        <label>About</label>
                        <span>{teacher.about}</span>
                      </div>
                    </div>
                  )}
                  {teacher.salary && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faMoneyBill} className="detail-icon" />
                      <div className="detail-content">
                        <label>Salary</label>
                        <span>{teacher.salary}</span>
                      </div>
                    </div>
                  )}
                  {teacher.classes && teacher.classes.length > 0 && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="detail-icon" />
                      <div className="detail-content">
                        <label>Classes</label>
                        <span>{teacher.classes.join(', ')}</span>
                      </div>
                    </div>
                  )}
                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faBook} className="detail-icon" />
                      <div className="detail-content">
                        <label>Subjects</label>
                        <span>{teacher.subjects.join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Account Information</h3>
                <div className="detail-grid">
                  {teacher.created_at && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faCalendarAlt} className="detail-icon" />
                      <div className="detail-content">
                        <label>Joined</label>
                        <span>{new Date(teacher.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                  {teacher.updated_at && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faClock} className="detail-icon" />
                      <div className="detail-content">
                        <label>Last Updated</label>
                        <span>{new Date(teacher.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails; 