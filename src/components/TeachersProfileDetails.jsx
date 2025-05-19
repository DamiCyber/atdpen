import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const TeachersProfileDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          'https://attendipen-d65abecaffe3.herokuapp.com/profile/me',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Handle profile picture
        if (response.data.profile_picture) {
          if (response.data.profile_picture instanceof Blob) {
            const imageUrl = URL.createObjectURL(response.data.profile_picture);
            setProfilePicture(imageUrl);
          } else {
            setProfilePicture(response.data.profile_picture);
          }
        }

        setProfile(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load profile data',
          icon: 'error',
          confirmButtonColor: '#1a237e'
        });
        setLoading(false);
      }
    };

    fetchProfile();

    // Cleanup function to revoke object URL
    return () => {
      if (profilePicture && profilePicture.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicture);
      }
    };
  }, [navigate]);

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

  return (
    <div className="profile-details-container">
      <div className="profile-details-content">
        <div className="profile-card">
          <div className="card-header">
            <div className="header-content">
              <div className="profile-info">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-placeholder">
                    <span className="initial">
                      {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <h2>Profile Details</h2>
              </div>
              <div className="header-actions">
                <button
                  onClick={() => navigate('/TeacherProfileEdit')}
                  className="edit-button"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/Teacher')}
                  className="close-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-grid">
              <div className="profile-section">
                <div className="profile-picture-container">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="large-profile-image"
                    />
                  ) : (
                    <div className="large-profile-placeholder">
                      <span className="large-initial">
                        {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-section">
                <div className="details-grid">
                  <div className="detail-item">
                    <h3 className="detail-label">Full Name</h3>
                    <p className="detail-value">{profile?.name || 'Not set'}</p>
                  </div>

                  <div className="detail-item">
                    <h3 className="detail-label">Email</h3>
                    <p className="detail-value">{profile?.email || 'Not set'}</p>
                  </div>

                  <div className="detail-item">
                    <h3 className="detail-label">Gender</h3>
                    <p className="detail-value">
                      {profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not set'}
                    </p>
                  </div>

                  <div className="detail-item">
                    <h3 className="detail-label">Phone Number</h3>
                    <p className="detail-value">{profile?.phone_number || 'Not set'}</p>
                  </div>

                  <div className="detail-item">
                    <h3 className="detail-label">Address</h3>
                    <p className="detail-value">{profile?.address || 'Not set'}</p>
                  </div>

                  <div className="detail-item">
                    <h3 className="detail-label">About</h3>
                    <p className="detail-value">{profile?.about || 'Not set'}</p>
                  </div>

                  <div className="detail-item">
                    <h3 className="detail-label">Last Updated</h3>
                    <p className="detail-value">
                      {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'Not set'}
                    </p>
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

export default TeachersProfileDetails;
