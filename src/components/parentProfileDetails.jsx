import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import "../assets/style/dashboard.css";
import "../assets/style/profiledetails.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faPlus,
  faCalendar,
  faGear,
  faClipboardUser,
  faChartColumn
} from '@fortawesome/free-solid-svg-icons';
import "../assets/style/dashboard.css";

const ParentProfileDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState(null);
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

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch profile picture
        const pictureResponse = await axios.get(
          'https://attendipen-d65abecaffe3.herokuapp.com/profile/me?type=profile_picture',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            responseType: 'blob'
          }
        );

        if (pictureResponse.data) {
          const imageUrl = URL.createObjectURL(pictureResponse.data);
          setProfilePicture(imageUrl);
        }

        // Fetch profile details
        const profileResponse = await axios.get(
          'https://attendipen-d65abecaffe3.herokuapp.com/profile/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        );

        setProfile(profileResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
        setLoading(false);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load profile data',
          icon: 'error',
          confirmButtonColor: '#1a237e'
        });
      }
    };

    fetchProfile();

    return () => {
      if (profilePicture && profilePicture.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicture);
      }
    };
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAttendance = () => {
    setIsAttendanceOpen(!isAttendanceOpen);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p className="error-message">{error}</p>
          <button
            onClick={() => navigate('/parent-dashboard')}
            className="back-button"
          >
            Back to Dashboard
          </button>
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
              <Link to="/ParentDashboard" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faHouse} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link to="/students/admission/:inviteId" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faPlus} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Admission</span>}
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
                    <Link to="/parents/children" className="dropdown-link">
                      <span className="icon">
                        <FontAwesomeIcon icon={faClipboardUser} className="nav-icon" />
                      </span>
                      <span className="text">Attendance</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link to="/parents/profile/edit" className="nav-link">
                <span className="icon">
                  <FontAwesomeIcon icon={faGear} className="nav-icon" />
                </span>
                {isSidebarOpen && <span className="text">Profile</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="header">
          <div className="header-left">
            <h1 className="dashboard-title">Profile Details</h1>
          </div>
          <div className="user">
            <div className="profile-picture">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  onError={(e) => {
                    console.log('Profile picture load error');
                    e.target.src = null;
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
              <h5>Parent</h5>
            </div>
          </div>
        </div>

        <div className="content-body">
          <div className="profile-details-container">
            <div className="profile-details-content">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-picture-large">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="profile-image"
                        onError={(e) => {
                          console.log('Profile picture load error');
                          e.target.src = null;
                        }}
                      />
                    ) : (
                      <div className="profile-placeholder-large">
                        {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="profile-actions">
                    <button
                      onClick={() => navigate('/parents/profile/edit')}
                      className="edit-button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="profile-info">
                  <div className="info-grid">
                    <div className="info-group">
                      <h3 className="info-label">Full Name</h3>
                      <p className="info-value">{profile?.name || 'Not set'}</p>
                    </div>

                    <div className="info-group">
                      <h3 className="info-label">Email</h3>
                      <p className="info-value">{profile?.email || 'Not set'}</p>
                    </div>

                    <div className="info-group">
                      <h3 className="info-label">Phone Number</h3>
                      <p className="info-value">{profile?.phone_number || 'Not set'}</p>
                    </div>

                    <div className="info-group">
                      <h3 className="info-label">Address</h3>
                      <p className="info-value">{profile?.address || 'Not set'}</p>
                    </div>

                    <div className="info-group">
                      <h3 className="info-label">Role</h3>
                      <p className="info-value">{profile?.role || 'Parent'}</p>
                    </div>

                    <div className="info-group">
                      <h3 className="info-label">Status</h3>
                      <p className="info-value">{profile?.status || 'Active'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentProfileDetails;
