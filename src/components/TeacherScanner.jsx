import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Link, useNavigate } from 'react-router-dom';
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
  faTimes,
  faQrcode
} from '@fortawesome/free-solid-svg-icons';
import "../assets/style/dashboard.css";
import "../assets/style/scanner.css";

const TeacherScanner = () => {
  const navigate = useNavigate();
  const [decodedText, setDecodedText] = useState("");
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanner, setScanner] = useState(null);

 useEffect(() => {
  const storedUser = localStorage.getItem("user");
  const inviteToken = localStorage.getItem("token");
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Save profile picture to localStorage if it exists
      if (parsedUser.profile_picture) {
        localStorage.setItem("profilePicture", parsedUser.profile_picture);
      }

            if (inviteToken) {
        axios.post(`${BASE_URL}/api/teacher/accept/${inviteToken}`)
          .then(res => console.log("Invitation accepted:", res.data))
          .catch(err => console.error("Accept invite error:", err.response?.data || err.message));
      }


      // Fetch teacher details if IDs are present
      if (parsedUser.schoolId && parsedUser.teacherId) {
        const URL = `${BASE_URL}/api/school/${parsedUser.schoolId}/teacher/${parsedUser.teacherId}`;

        axios.get(URL)
          .then(response => {
            console.log("Teacher Details:", response.data);
          })
          .catch(error => {
            console.error("Error fetching teacher details:", error);
          });
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
}, []);


  useEffect(() => {
    // Only create scanner if it doesn't exist
    if (!scanner) {
      const newScanner = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: 250,
      });

      newScanner.render((text, result) => {
        console.log("QR Code detected:", text);
        setDecodedText(text);
      });

      setScanner(newScanner);
    }

    // Cleanup function
    return () => {
      if (scanner) {
        scanner.clear().catch(error => {
          console.error("Failed to clear scanner", error);
        });
        setScanner(null);
      }
    };
  }, []); // Empty dependency array means this only runs once on mount

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profilePicture");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAttendance = () => {
    setIsAttendanceOpen(!isAttendanceOpen);
  };

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
              <Link to="/teachers/scan" className="nav-link active">
                <span className="icon">
                  <FontAwesomeIcon icon={faQrcode} className="nav-icon" />
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
            <h1 className="dashboard-title">QR Code Scanner</h1>
          </div>
          <form className="search-form" onSubmit={handleSearch}>
            <button type="button">
              <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
                <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
            <input 
              className="search-input" 
              placeholder="Search..." 
              required 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                  {user?.firstName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="user-info">
              <h4 className="welcome-message">{user?.firstName || "Loading..."}</h4>
              <h5>Teacher</h5>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>

        <div className="content-body">
          <div className="scanner-container">
            <div className="scanner-content">
              <div className="scanner-header">
                <h2>Scan Student ID Card</h2>
                <p>Position the QR code within the scanner frame</p>
              </div>
              <div id="qr-reader" style={{ width: "500px" }}></div>
              {decodedText && (
                <div className="last-scanned">
                  <p>Last scanned student ID: {decodedText}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherScanner;