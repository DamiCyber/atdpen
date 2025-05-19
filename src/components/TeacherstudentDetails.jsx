import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherstudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `https://attendipen-d65abecaffe3.herokuapp.com/students/${studentId}?type=object`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setStudent(response.data);
      } catch (error) {
        console.error('Error fetching student details:', error);
        setError('Failed to fetch student details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading student details...</p>
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

  if (!student) {
    return (
      <div className="error-container">
        <h3>Not Found</h3>
        <p>Student not found</p>
        <button onClick={() => navigate('/teachers/students')}>Back to Students</button>
      </div>
    );
  }

  return (
    <div className="student-details-container">
      <div className="student-header">
        <h2>Student Details</h2>
        <button onClick={() => navigate('/teachers/students')}>Back to Students</button>
      </div>

      <div className="student-profile">
        <div className="profile-image">
          {student.profile_picture ? (
            <img 
              src={student.profile_picture} 
              alt={student.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = null;
                e.target.parentElement.innerHTML = `
                  <div class="profile-placeholder">
                    ${student.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                `;
              }}
            />
          ) : (
            <div className="profile-placeholder">
              {student.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        <div className="student-info">
          <h3>{student.name}</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>ID:</label>
              <span>{student.id}</span>
            </div>
            {student.email && (
              <div className="info-item">
                <label>Email:</label>
                <span>{student.email}</span>
              </div>
            )}
            {student.roll_number && (
              <div className="info-item">
                <label>Roll Number:</label>
                <span>{student.roll_number}</span>
              </div>
            )}
            {student.class && (
              <div className="info-item">
                <label>Class:</label>
                <span>{student.class}</span>
              </div>
            )}
            {student.dob && (
              <div className="info-item">
                <label>Date of Birth:</label>
                <span>{new Date(student.dob).toLocaleDateString()}</span>
              </div>
            )}
            {student.gender && (
              <div className="info-item">
                <label>Gender:</label>
                <span>{student.gender}</span>
              </div>
            )}
            {student.address && (
              <div className="info-item">
                <label>Address:</label>
                <span>{student.address}</span>
              </div>
            )}
            {student.phone && (
              <div className="info-item">
                <label>Phone:</label>
                <span>{student.phone}</span>
              </div>
            )}
            {student.parent_name && (
              <div className="info-item">
                <label>Parent Name:</label>
                <span>{student.parent_name}</span>
              </div>
            )}
            {student.parent_phone && (
              <div className="info-item">
                <label>Parent Phone:</label>
                <span>{student.parent_phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherstudentDetails;
