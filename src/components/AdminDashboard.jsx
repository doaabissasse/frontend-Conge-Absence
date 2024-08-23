import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../tests/AuthService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from './adminLayout';
import { FaBell, FaExclamationTriangle } from 'react-icons/fa';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [previousPendingRequestsCount, setPreviousPendingRequestsCount] = useState(0);
  const [previousPendingJustificationsCount, setPreviousPendingJustificationsCount] = useState(0);

  useEffect(() => {
    AuthService.getUserDetails().then(
      (response) => {
        setUser(response.data);
      },
      () => {
        toast.error('Échec de la récupération des détails de l\'utilisateur', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    );
  }, []);

  useEffect(() => {
    const fetchPendingLeaveRequests = async () => {
      try {
        const token = AuthService.getCurrentUserToken();
        if (!token) {
          throw new Error('Aucun token trouvé');
        }

        const response = await axios.get('http://localhost:8080/api/leave-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const pendingRequests = response.data.filter(request => request.status === 'En attente');
        if (pendingRequests.length > previousPendingRequestsCount) {
          toast.info(<div><FaBell /> Il y a une nouvelle demande de congé en attente!</div>, {
            position: "top-right",
            autoClose: false,
            closeOnClick: true,
            draggable: true,
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
        if (!token) {
          throw new Error('Aucun token trouvé');
        }

        const response = await axios.get('http://localhost:8080/api/absences', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const pendingJustifications = response.data.filter(absence => absence.justificationAccepted === 'En attente');
        if (pendingJustifications.length > previousPendingJustificationsCount) {
          toast.warning(<div><FaExclamationTriangle /> Il y a une nouvelle  absence en attente!</div>, {
            position: "top-right",
            autoClose: false,
            closeOnClick: true,
            draggable: true,
          });
        }
        setPreviousPendingJustificationsCount(pendingJustifications.length);
      } catch (error) {
        console.error('Échec de la récupération des absences:', error);
      }
    };

    fetchPendingLeaveRequests();
    fetchPendingJustifications();

    const interval = setInterval(() => {
      fetchPendingLeaveRequests();
      fetchPendingJustifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [previousPendingRequestsCount, previousPendingJustificationsCount]);

  return (
    <AdminLayout>
      <ToastContainer />
      {user && (
        <div>
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
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
