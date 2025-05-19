import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
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
import "../assets/style/invitation.css";

const BASE_URL = "https://attendipen-d65abecaffe3.herokuapp.com";

const InvitationPage = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    fetchInvites();
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

  const fetchInvites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/invites/my_invites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Fetch school details for each invite
        const invitesWithSchoolDetails = await Promise.all(
          response.data.map(async (invite) => {
            try {
              const schoolResponse = await axios.get(
                `${BASE_URL}/schools/${invite.school_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              return {
                ...invite,
                school_name: schoolResponse.data.name,
                school_email: schoolResponse.data.email
              };
            } catch (error) {
              console.error("Error fetching school details:", error);
              return {
                ...invite,
                school_name: "Unknown School",
                school_email: "Unknown Email"
              };
            }
          })
        );
        setInvites(invitesWithSchoolDetails);
      } else {
        setError("Invalid data format received from server");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching invites:", error);
      setError(error.response?.data?.message || "Failed to fetch invites");
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch invites",
        icon: "error",
      });
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/invites/accept_offer/${inviteId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          title: "Success",
          text: "Teacher offer accepted successfully",
          icon: "success",
        }).then(() => {
          fetchInvites();
          navigate("/invitation");
        });
      }
    } catch (error) {
      console.error("Error accepting teacher offer:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to accept teacher offer",
        icon: "error",
      });
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/invites/${inviteId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          title: "Success",
          text: "Invitation rejected successfully",
          icon: "success",
        });
        fetchInvites();
      }
    } catch (error) {
      console.error("Error rejecting invite:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to reject invitation",
        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading invitations...</p>
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
            <h1 className="dashboard-title">My Invitations</h1>
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
          <div className="invitation-container">
            {invites.length === 0 ? (
              <div className="no-invites">
                <p>No invitations found</p>
              </div>
            ) : (
              <div className="invitation-table">
                <table>
                  <thead>
                    <tr>
                      <th>School</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite.id}>
                        <td>{invite.school_name}</td>
                        <td>{invite.salary}</td>
                        <td>
                          <span className={`status-badge ${invite.status}`}>
                            {invite.status}
                          </span>
                        </td>
                        <td>
                          {invite.status === 'pending' && (
                            <div className="action-buttons">
                              <button
                                className="accept-btn"
                                onClick={() => handleAcceptInvite(invite.id)}
                              >
                                Accept
                              </button>
                              <button
                                className="reject-btn"
                                onClick={() => handleRejectInvite(invite.id)}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;