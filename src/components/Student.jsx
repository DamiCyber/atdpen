import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../assets/style/student.css";

const Student = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user"));
        
        if (!token || !userData?.id) {
          navigate("/login");
          return;
        }

        setLoading(true);
        console.log('Fetching students for school:', userData.id);
        const response = await axios.get(
          `https://attendipen-backend-staging.onrender.com/api/school/${userData.id}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log('Students API Response:', response.data);
        
        // Handle the response data structure
        if (response.data && response.data.data) {
          const studentsData = response.data.data.map(student => ({
            id: student._id,
            name: `${student.firstName} ${student.lastName}`.trim(),
            email: student.parentEmail,
            gender: student.gender,
            dateOfBirth: student.dateOfBirth,
            classId: student.classId,
            className: student.className || 'Not Assigned'
          }));
          setStudents(studentsData);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        let errorMessage = "Failed to fetch student data";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }

        if (error.response?.status !== 404) {
          Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK"
          });
        }
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading Students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="header">
          <div className="header-left">
            <h1 className="dashboard-title">Students</h1>
          </div>
          {students.length > 0 && (
            <div className="add-student-button">
              <Link to="/students/add" className="add-btn">Add Student</Link>
            </div>
          )}
        </div>
        <div className="content-body">
          <div className="students-grid">
            {students.length > 0 ? (
              <div className="students-list">
                {students.map((student) => (
                  <div key={student.id} className="student-card">
                    <h3>{student.name || "Unnamed Student"}</h3>
                    <div className="student-info">
                      <div className="info-row">
                        <span>Email:</span>
                        <span>{student.email || "Not set"}</span>
                      </div>
                      <div className="info-row">
                        <span>Gender:</span>
                        <span>{student.gender?.charAt(0).toUpperCase() + student.gender?.slice(1) || "Not set"}</span>
                      </div>
                      <div className="info-row">
                        <span>Class:</span>
                        <span>{student.className}</span>
                      </div>
                      <div className="info-row">
                        <span>Date of Birth:</span>
                        <span>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "Not set"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-students">
                <p>No students found. Add your first student to get started.</p>
                <Link to="/students/add" className="add-student-btn">
                  Add Student
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add these styles to your CSS file
const styles = `
.add-student-button {
  margin-left: auto;
  padding: 0 20px;
}

.add-btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #45a049;
}

.no-students {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 20px;
}

.add-student-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.add-student-btn:hover {
  background-color: #45a049;
}
`;

export default Student;
