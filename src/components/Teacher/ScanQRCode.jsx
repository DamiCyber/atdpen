import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Link, useNavigate } from 'react-router-dom';
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
  faTimes,
  faQrcode
} from '@fortawesome/free-solid-svg-icons';

const ScanQRCode = () => {

      const navigate = useNavigate();
      const [decodedText, setDecodedText] = useState("");
      const [user, setUser] = useState(null);
      const [isSidebarOpen, setIsSidebarOpen] = useState(true);
      const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
      const [searchTerm, setSearchTerm] = useState('');
      const [scanner, setScanner] = useState(null);

        useEffect(() => {
          // Only create scanner if it doesn't exist
          if (!scanner) {
            const newScanner = new Html5QrcodeScanner("qr-reader", {
              fps: 10,
              qrbox: 250,
            });
      
            newScanner.render((text, result) => {
              console.log("QR Code detected:", text);
              setDecodedText(text);
            });
      
            setScanner(newScanner);
          }
      
          // Cleanup function
          return () => {
            if (scanner) {
              scanner.clear().catch(error => {
                console.error("Failed to clear scanner", error);
              });
              setScanner(null);
            }
          };
        }, []); // Empty dependency array means this only runs once on mount
      

          const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

          const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

    const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profilePicture");
    navigate("/login");
  };


  return (
    <div>
    
         
         <h1 className="dashboard-title">QR Code Scanner</h1>
                <main className="content-body">
                  <div className="scanner-container">
                    <div className="scanner-content">
                      <div className="scanner-header">
                        <h2>Scan Student ID Card</h2>
                        <p>Position the QR code within the scanner frame</p>
                      </div>
                      <div id="qr-reader" style={{ width: "500px" }}></div>
                      {decodedText && (
                        <div className="last-scanned">
                          <p>Last scanned student ID: {decodedText}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </main>
    </div>
  )
}

export default ScanQRCode