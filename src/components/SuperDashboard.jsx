import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../tests/AuthService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from './adminLayout';
import { FaBell, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Composant pour le tableau de bord de le superviseur 
 * Affiche les notifications pour les nouvelles demandes de congés et absences
 */
const SuperDashboard = () => {
  const [user, setUser] = useState(null); // Détails de l'utilisateur connecté
  const [previousPendingRequestsCount, setPreviousPendingRequestsCount] = useState(0); // Compteur des demandes de congés en attente
  const [previousPendingJustificationsCount, setPreviousPendingJustificationsCount] = useState(0); // Compteur des absences en attente

  // Récupère les détails de l'utilisateur lors du chargement du composant
  useEffect(() => {
    AuthService.getUserDetails().then(
      (response) => setUser(response.data),
      () => toast.error('Échec de la récupération des détails de l\'utilisateur') // Affiche une erreur si la récupération échoue
    );
  }, []);

  // Récupère les demandes de congés et les absences en attente
  useEffect(() => {
    const fetchPendingLeaveRequests = async () => {
      try {
        const token = AuthService.getCurrentUserToken();
        if (!token) throw new Error('Aucun token trouvé');

        const response = await axios.get('http://localhost:8080/api/leave-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pendingRequests = response.data.filter(request => 
          request.status === 'En attente' && request.supervisorApproved === true
        );

        if (pendingRequests.length > previousPendingRequestsCount) {
          toast.info(<div><FaBell /> Nouvelle demande de congé en attente!</div>, {
            autoClose: false, // Désactive la fermeture automatique
          });
        }
        setPreviousPendingRequestsCount(pendingRequests.length);
      } catch (error) {
        console.error('Échec de la récupération des demandes de congé:', error);
      }
    };

    const fetchPendingJustifications = async () => {
      try {
        const token = AuthService.getCurrentUserToken();
        if (!token) throw new Error('Aucun token trouvé');

        const response = await axios.get('http://localhost:8080/api/absences', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pendingJustifications = response.data.filter(absence => 
          absence.justificationAccepted === 'En attente' && absence.supervisorApproved === true
        );

        if (pendingJustifications.length > previousPendingJustificationsCount) {
          toast.warning(<div><FaExclamationTriangle /> Nouvelle absence en attente!</div>, {
            autoClose: false, // Désactive la fermeture automatique
          });
        }
        setPreviousPendingJustificationsCount(pendingJustifications.length);
      } catch (error) {
        console.error('Échec de la récupération des absences:', error);
      }
    };

    fetchPendingLeaveRequests();
    fetchPendingJustifications();

    // Re-vérifie les demandes de congés et absences toutes les 5 secondes
    const interval = setInterval(() => {
      fetchPendingLeaveRequests();
      fetchPendingJustifications();
    }, 5000);

    return () => clearInterval(interval); // Nettoie l'intervalle lors du démontage du composant
  }, [previousPendingRequestsCount, previousPendingJustificationsCount]);

  return (
    <AdminLayout>
      <ToastContainer />
      {user && (
        <div className="container mt-4">
          <div className="row">
            <div className="col-md-8">
              <h2 className="mb-3">Bienvenue dans <span className="text-success">Lifo</span></h2>
              <p className="lead">
                Cette application de l'entreprise Loginfo Ingénierie 
                vous permet <br />de gérer vos demandes de congés et de suivre
                vos absences pour une meilleure organisation du travail.
              </p>
            </div>
            <div className="col-md-4 text-md-right">
              <img src="/entrer.jpeg" alt="Logo" className="img-fluid" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SuperDashboard;
