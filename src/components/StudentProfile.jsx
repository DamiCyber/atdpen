import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import "../assets/style/idcard.css";

const StudentProfile = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState('');

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

    if (studentId) {
      console.log('Fetching data for student ID:', studentId);
      fetchStudentData();
    } else {
      console.error('No student ID provided');
      Swal.fire('Error', 'No student ID provided', 'error');
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire('Error', 'Please login to continue', 'error');
        navigate('/login');
        return;
      }

      // Check localStorage for profile picture first
      const studentPictures = JSON.parse(localStorage.getItem('studentPictures') || '{}');
      if (studentPictures[studentId]) {
        setProfilePicture(studentPictures[studentId]);
      }

      const response = await axios.get(
        `https://attendipen-d65abecaffe3.herokuapp.com/profile/id_card/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log('Student data response:', response.data);

      if (response.data) {
        setHtmlContent(response.data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      Swal.fire('Error', 'Failed to fetch student data', 'error');
      navigate('/students');
    } finally {
      setLoading(false);
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student ID Card</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none;
              }
              .id-card {
                page-break-after: always;
                page-break-inside: avoid;
              }
            }
            .id-card {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            ${htmlContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Loading student profile...</p>
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
            <h1 className="dashboard-title">Student ID Card</h1>
          </div>

          <div className="user">
            <div className="profile-picture">
              <img
                src={profilePicture || user?.profile_picture || ""}
                alt="Profile"
                onError={(e) => {
                  e.target.src = "";
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
          <div className="id-card-container">
            <div className="id-card" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            <button
              onClick={handlePrint}
              className="no-print print-button"
            >
              Print ID Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;