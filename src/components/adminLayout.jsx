import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../tests/AuthService';
import '../componentsSCC/adminLayout.css';
import { FaUsers } from 'react-icons/fa';
import {FaCalendarAlt } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
    navigate('/login', { replace: true }); // Use replace to prevent going back to previous page
  };


  return (
    <div className="container-fluid p-0">
      {/* Top bar */}
      <div className="row top-bar-custom py-2 px-4 align-items-center">
        <div className="col-md-1">
          <img src="/lofowhite.png" alt="Logo" className="topbar-logo" />
        </div>
        <div className="col-md-9 name">
          {user && (
            <h6>
              Welcome, {user.nom} {user.prenom}
            </h6>
          )}
        </div>
        <div className="col-md-2 text-right">
          <button className="btn " onClick={handleSignout}>
            Signout
          </button>
        </div>
      </div>

      {/* Sidebar and content */}
      <div className="row">
        <nav id="sidebar" className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
          <div className="position-sticky">
            <div className="logo-container my-4">
              <img src="/loginfo.png" alt="Logo" className="logo" />
            </div>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  <i className="fas fa-chart-line"></i>&nbsp;&nbsp;&nbsp;Dashboard
                </Link>
              </li>
              <li className="nav-item">
              <Link className="nav-link" to="/SuivieAbsenceAdmin">
              <FaCalendarAlt size={20} />&nbsp;&nbsp;&nbsp;Suivre Absences
              </Link>
            </li>
              <li className="nav-item">
                <Link className="nav-link" to="/EmployeeList">
                   <FaUsers size={20} />&nbsp;&nbsp;&nbsp;Employés
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/leave-requestALL">
                  <i className="fas fa-check"></i>&nbsp;&nbsp;&nbsp;Demandes Traitées
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/AbsencesListAdmin">
                <i className="fas fa-user-minus"></i>&nbsp;&nbsp;&nbsp;les absences
                </Link>
              </li>
              <li className="nav-item">
              <Link className="nav-link" to="/AbsenceFormAdmin">
                <i className="fas fa-pen"></i>&nbsp;&nbsp;&nbsp;Enregistrer une Absence
              </Link>
            </li>
              <li className="nav-item">
                <Link className="nav-link" to="/PendingLeaveRequests">
                  <i className="fas fa-clock"></i>&nbsp;&nbsp;&nbsp;Demandes En attentes
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/PendingAbsences">
                  <i className="fas fa-clock"></i>&nbsp;&nbsp;&nbsp;Absences En attentes
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main role="main" className="col-md-9 ms-sm-auto col-lg-10 px-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

