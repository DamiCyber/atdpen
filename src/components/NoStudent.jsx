import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../assets/style/dashboard.css";

const NoStudent = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    console.log('Component mounted with classId:', classId);
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('User data loaded:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Fetching students for class:', classId);
        const response = await axios.get(
          `https://attendipen-d65abecaffe3.herokuapp.com/classes/${classId}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('API Response:', response.data);
        setStudents(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Failed to fetch students data');
        setLoading(false);
        Swal.fire('Error', 'Failed to fetch students data', 'error');
      }
    };

    if (classId) {
      fetchStudents();
    } else {
      console.warn('No classId provided');
    }
  }, [classId, navigate]);

  const handleViewStudent = (studentId) => {
    console.log('Viewing student profile:', studentId);
    navigate(`/students/profile/${studentId}`);
  };

  const toggleSidebar = () => {
    console.log('Toggling sidebar:', !isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Log state changes
  useEffect(() => {
    console.log('Students state updated:', students);
  }, [students]);

  useEffect(() => {
    console.log('Loading state updated:', loading);
  }, [loading]);

  useEffect(() => {
    if (error) {
      console.log('Error state updated:', error);
    }
  }, [error]);

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading students data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="error-container">
        <div className="error-content">
          <i className="fas fa-exclamation-circle"></i>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  console.log('Rendering students list:', students);
  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">logo</div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/dashboard" className="nav-link">
                <span className="icon">🏠</span>
                {isSidebarOpen && <span className="text">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link to="/classroom/list" className="nav-link">
                <span className="icon">🏫</span>
                {isSidebarOpen && <span className="text">Classes</span>}
              </Link>
            </li>
            <li>
              <Link to="/students" className="nav-link">
                <span className="icon">👨‍🎓</span>
                {isSidebarOpen && <span className="text">Students</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="header">
          <div className="header-left">
            <h1 className="dashboard-title">Class Students</h1>
          </div>
          <div className="user">
            <div className="profile-picture">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  onError={(e) => {
                    console.log('Profile picture load error');
                    e.target.src = null;
                  }}
                />
              ) : null}
            </div>
            <div className="user-info">
              <h4 className="welcome-message">{user?.name || "Loading..."}</h4>
              <h5>Admin</h5>
            </div>
          </div>
        </div>

        <div className="content-body">
          <div className="students-grid">
            {students.length === 0 ? (
              <div className="no-students">
                <p>No students found in this class.</p>
                <Link to="/students/assign" className="add-student-btn">
                  Assign Students
                </Link>
              </div>
            ) : (
              <div className="students-list">
                {students.map((student) => (
                  <div key={student.id} className="student-card">
                    <div className="profile-picture-container">
                      {student.profile_picture ? (
                        <img
                          src={student.profile_picture}
                          alt={`${student.name}'s profile`}
                          className="profile-picture"
                          onError={(e) => {
                            console.log('Student profile picture load error:', student.id);
                            e.target.src = null;
                          }}
                        />
                      ) : (
                        <div className="profile-placeholder">
                          {student.name ? student.name.charAt(0).toUpperCase() : "?"}
                        </div>
                      )}
                    </div>
                    <div className="card-actions">
                      <button
                        className="action-btn view-profile"
                        onClick={() => handleViewStudent(student.id)}
                      >
                        View Profile
                      </button>
                    </div>
                    <h3>{student.name || "Unnamed Student"}</h3>
                    <div className="student-info">
                      <div className="info-row">
                        <span>ID:</span>
                        <span>{student.id}</span>
                      </div>
                      <div className="info-row">
                        <span>Status:</span>
                        <span>{student.status || "Active"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoStudent;
