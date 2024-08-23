import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../tests/AuthService';
import '../componentsSCC/adminLayout.css';
import { FaUsers, FaCalendarAlt } from 'react-icons/fa';

/**
 * Layout principal pour les administrateurs
 * Affiche la barre supérieure, la barre latérale et le contenu principal
 */
const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Récupère les détails de l'utilisateur lors du chargement du composant
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await AuthService.getUserDetails();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user details:', error); // Affiche une erreur en cas d'échec
      }
    };

    fetchUserDetails();
  }, []);

  // Déconnexion de l'utilisateur
  const handleSignout = async () => {
    await AuthService.signout();
    navigate('/login', { replace: true }); // Redirige vers la page de connexion après déconnexion
  };

  return (
    <div className="container-fluid p-0">
      {/* Barre supérieure */}
      <div className="row top-bar-custom py-2 px-4 align-items-center">
        <div className="col-md-1">
          <img src="/lofowhite.png" alt="Logo" className="topbar-logo" />
        </div>
        <div className="col-md-9 name">
          {user && (
            <h6>
              Welcome, {user.nom} {user.prenom} {/* Affiche le nom de l'utilisateur */}
            </h6>
          )}
        </div>
        <div className="col-md-2 text-right">
          <button className="btn" onClick={handleSignout}>
            Signout {/* Bouton de déconnexion */}
          </button>
        </div>
      </div>

      {/* Barre latérale et contenu principal */}
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
                  <i className="fas fa-user-minus"></i>&nbsp;&nbsp;&nbsp;Les absences
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/AbsenceFormAdmin">
                  <i className="fas fa-pen"></i>&nbsp;&nbsp;&nbsp;Enregistrer une Absence
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/PendingLeaveRequests">
                  <i className="fas fa-clock"></i>&nbsp;&nbsp;&nbsp;Demandes En attente
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/PendingAbsences">
                  <i className="fas fa-clock"></i>&nbsp;&nbsp;&nbsp;Absences En attente
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main role="main" className="col-md-9 ms-sm-auto col-lg-10 px-4">
          {children} {/* Contenu principal rendu ici */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

