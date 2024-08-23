import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../tests/AuthService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../componentsSCC/DashboardLayout.css'; // Assurez-vous d'inclure le fichier CSS
import {FaCalendarAlt } from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedPage, setSelectedPage] = useState('Navigate'); // Default label for the dropdown

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await AuthService.getUserDetails();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleSignout = async () => {
    await AuthService.signout();
    navigate('/login', { replace: true });
  };


  return (
    <div className="container-fluid p-0">
      {/* Top bar */}
      <div className="row bg-dark text-white py-2 px-4 align-items-center">
        <div className="col-md-1">
          <img src="/lofo.png" alt="Logo" className="topbar-logo" />
        </div>
        <div className="col-md-9">
          {user && (
            <h6>
              Welcome, {user.nom} {user.prenom}
            </h6>
          )}
        </div>
        <div className="col-md-2 text-right">
          <button className="btn" onClick={handleSignout}>
            Signout
          </button>
        </div>
      </div>

      {/* Sidebar and content */}
      <div className="row no-gutters">
        <div className="col-md-2 bg-light sidebar">
          <div className="logo-container my-4">
            <img src="/loginfo.png" alt="Logo" className="logo" />
          </div>
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link className="nav-link" to="/additional-info">
                <i className="fas fa-user"></i>&nbsp;&nbsp;&nbsp;Profile
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/SuivieAbsences">
              <FaCalendarAlt size={20} />&nbsp;&nbsp;&nbsp;Suivre Absences
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/leave-request-form">
                <i className="fas fa-pen"></i>&nbsp;&nbsp;&nbsp;Demander un Congés
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/leave-requests">
                <i className="fas fa-check"></i>&nbsp;&nbsp;&nbsp;Demandes effectuées
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/register-absence">
                <i className="fas fa-pen"></i>&nbsp;&nbsp;&nbsp;Enregistrer une Absence
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/liste-Absences">
                <i className="fas fa-check"></i>&nbsp;&nbsp;&nbsp;Absences effectuées
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-md-10 p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
