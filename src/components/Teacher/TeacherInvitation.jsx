import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faBars, faTimes} from '@fortawesome/free-solid-svg-icons';


const TeacherInvitation = () => {

  const navigate = useNavigate();
  const { accesstoken } = useParams();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

const BASE_URL = "https://attendipen-backend-staging.onrender.com";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("User parsing error:", err);
      }
    }
    fetchInvites();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);



  const fetchInvites = async () => {
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) return navigate("/login");

      const response = await axios.get(`${BASE_URL}/api/accept/${accesstoken}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data?.data) {
        setInvites([response.data.data]);
      } else {
        setError("No invitations found");
      }
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Failed to fetch invitations.";
      setError(message);
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    const result = await Swal.fire({
      title: "Accept Invitation?",
      text: "Do you want to accept this invitation?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (!result.isConfirmed) return;

    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/teacher/accept/${accesstoken}`, {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      Swal.fire("Success", "Invitation accepted successfully!", "success").then(() => {
        fetchInvites();
        navigate("/Teachers/Dashboard");
      });
    } catch (err) {
      const message = err.response?.data?.message || "Error accepting invitation.";
      Swal.fire("Error", message, "error");
    }
  };

  const handleRejectInvite = async (inviteId) => {
    const result = await Swal.fire({
      title: "Reject Invitation?",
      text: "Do you want to reject this invitation?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (!result.isConfirmed) return;

    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/teacher/reject/${accesstoken}`, {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      Swal.fire("Success", "Invitation rejected successfully!", "success").then(() => fetchInvites());
    } catch (err) {
      const message = err.response?.data?.message || "Error rejecting invitation.";
      Swal.fire("Error", message, "error");
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;
  if (error) return <div className="error-container"><p>{error}</p><button onClick={fetchInvites}>Retry</button></div>;


  return (
    <div>      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <header className="header">
              <button onClick={toggleSidebar}><FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} /></button>
              <h1>My Invitations</h1>
            </header>
    
            <section className="invites-section">
              {invites.length === 0 ? (
                <p>No invitations available.</p>
              ) : (
                invites.map(invite => (
                  <div key={invite.id} className="invite-card">
                    <h3>Invitation to {invite.school?.name || 'a school'}</h3>
                    <p>Email: {invite.email}</p>
                    <p>Message: {invite.message}</p>
                    <div className="actions">
                      <button onClick={() => handleAcceptInvite(invite.id)} className="accept-btn">Accept</button>
                      <button onClick={() => handleRejectInvite(invite.id)} className="reject-btn">Reject</button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </main>
          </div>
  )
}

export default TeacherInvitation