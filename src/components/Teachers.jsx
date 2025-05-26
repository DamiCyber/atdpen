import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [schoolName, setSchoolName] = useState('');
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // Get school ID from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) {
          throw new Error('School ID not found');
        }

        const schoolId = userData.id;
        const response = await axios.get(
          `https://attendipen-backend-staging.onrender.com/api/school/${schoolId}/teachers`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        // Log the API response
        console.log('Teachers API Response:', response.data);

        if (response.data.message === "Teachers retrieved successfully") {
          setSchoolName(response.data.data.schoolName);
          setTeachers(response.data.data.teachers);
          setTotalTeachers(response.data.data.totalTeachers);
        } else {
          setError('Failed to fetch teachers data');
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        if (error.response) {
          setError(error.response.data.message || 'Failed to fetch teachers');
        } else {
          setError('Network error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <h2>Loading teachers...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="teachers-container">
      <div className="teachers-header">
        <h1>Teachers at {schoolName}</h1>
        <p>Total Teachers: {totalTeachers}</p>
      </div>

      {teachers.length === 0 ? (
        <div className="no-teachers">
          <p>No teachers found in this school.</p>
        </div>
      ) : (
        <div className="teachers-list">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="teacher-card">
              <h3>{teacher.firstName} {teacher.lastName}</h3>
              <p>Email: {teacher.email}</p>
              {/* Add more teacher details as needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teachers;

// Add some basic styles
const styles = `
  .teachers-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .teachers-header {
    margin-bottom: 30px;
    text-align: center;
  }

  .teachers-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .teacher-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .loading-container,
  .error-container {
    text-align: center;
    padding: 40px;
  }

  .no-teachers {
    text-align: center;
    padding: 40px;
    background: #f5f5f5;
    border-radius: 8px;
  }

  button {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #0056b3;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
