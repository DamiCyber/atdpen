import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CreateClass = () => {
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!className.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter a class name'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get school ID from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.id) {
        throw new Error('School ID not found');
      }

      const schoolId = userData.id;
      const response = await axios.post(
        `https://attendipen-backend-staging.onrender.com/api/school/${schoolId}/class`,
        {
          name: className.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.message === "Class created successfully") {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Class created successfully',
          showConfirmButton: false,
          timer: 1500
        });
        
        // Reset form
        setClassName('');
        
        // Optionally navigate to classes list or stay on the page
        // navigate('/classes');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create class'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-class-container">
      <div className="create-class-form">
        <h2>Create New Class</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="className">Class Name</label>
            <input
              type="text"
              id="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Enter class name"
              disabled={isLoading}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Class'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClass;

// Add styles
const styles = `
  .create-class-container {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  }

  .create-class-form {
    background: #fff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .create-class-form h2 {
    margin-bottom: 20px;
    text-align: center;
    color: #333;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
  }

  .form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }

  .form-group input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }

  button {
    width: 100%;
    padding: 12px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background: #0056b3;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
