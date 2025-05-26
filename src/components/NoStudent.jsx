import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import "../assets/style/dashboard.css";
import "../assets/style/nostudent.css";

const NoStudent = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchClassDetails(parsedUser.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [classId]);

  const fetchClassDetails = async (schoolId) => {
    try {
      const response = await axios.get(
        `https://attendipen-backend-staging.onrender.com/api/school/${schoolId}/class/${classId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      if (response.data.message === "Class details retrieved successfully") {
        setClassDetails(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch class details");
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
      setError(error.response?.data?.message || "Failed to fetch class details");
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch class details",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="main-content">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#4D44B5] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#4D44B5] font-medium">Loading class details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="header">
          <div className="header-left">
            <h1 className="dashboard-title">Class Details</h1>
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
              <h4 className="welcome-message">{user?.name || "Admin"}</h4>
              <h5>Admin</h5>
            </div>
          </div>
        </div>

        <div className="content-body">
          <div className="class-details-container">
            <div className="back-button">
              <Link to="/classroom/list" className="back-link">
                <FontAwesomeIcon icon={faArrowLeft} className="button-icon" />
                Back to Class List
              </Link>
            </div>

            {error ? (
              <div className="error-message">
                <p>{error}</p>
              </div>
            ) : classDetails ? (
              <div className="class-info-card">
                <div className="class-header">
                  <h2>{classDetails.name}</h2>
                  <div className="class-meta">
                    <p>Created: {new Date(classDetails.createdAt).toLocaleDateString()}</p>
                    <p>Teacher: {classDetails.teacherId ? "Assigned" : "Not Assigned"}</p>
                  </div>
                </div>

                <div className="no-students-message">
                  <div className="message-content">
                    <FontAwesomeIcon icon={faUserPlus} className="message-icon" />
                    <h3>No Students in this Class</h3>
                    <p>This class currently has no students assigned to it.</p>
                    <Link to={`/students/assign?classId=${classId}`} className="add-students-btn">
                      Add Students to Class
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="error-message">
                <p>No class details found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoStudent;
