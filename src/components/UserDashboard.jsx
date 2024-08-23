import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../tests/AuthService';
import DashboardLayout from './DashboardLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../componentsSCC/UserDashboard.css';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previousLeaveRequests, setPreviousLeaveRequests] = useState([]);
  const [previousAbsences, setPreviousAbsences] = useState([]);
  const [showNotificationAPP, setShowNotificationAPP] = useState(false);
  const [showNotificationREF, setShowNotificationREF] = useState(false);
  const [showAbsenceNotification, setShowAbsenceNotification] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await AuthService.getUserDetails();
        setUser(response.data);
      } catch (error) {
        setError('Failed to fetch user details');
        toast.error('Failed to fetch user details', {
          position: "top-right",
          autoClose: false,
          closeOnClick: true,
          draggable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchPendingLeaveRequests = async () => {
      try {
        if (!user) return;

        const token = AuthService.getCurrentUserToken();
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:8080/api/leave-request', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            username: user.username
          }
        });

        const newRequests = Array.isArray(response.data) ? response.data : [];
        const oldRequests = JSON.parse(localStorage.getItem('leaveRequestsStatus')) || [];

        newRequests.forEach(newRequest => {
          const oldRequest = oldRequests.find(req => req.id === newRequest.id);
          if (oldRequest && oldRequest.status.trim().toLowerCase() !== newRequest.status.trim().toLowerCase()) {
            if (newRequest.status.trim().toLowerCase() === 'approuvé') {
              setShowNotificationAPP(true);
            } else if (newRequest.status.trim().toLowerCase() === 'refusé') {
              setShowNotificationREF(true);
            }
          }
        });

        setPreviousLeaveRequests(newRequests);
        localStorage.setItem('leaveRequestsStatus', JSON.stringify(newRequests));
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
      }
    };

    const fetchPendingAbsences = async () => {
      try {
        if (!user) return;

        const token = AuthService.getCurrentUserToken();
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:8080/api/absences', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            username: user.username
          }
        });

        const newAbsences = Array.isArray(response.data) ? response.data : [];
        const oldAbsences = JSON.parse(localStorage.getItem('absencesStatus')) || [];

        newAbsences.forEach(newAbsence => {
          const oldAbsence = oldAbsences.find(abs => abs.id === newAbsence.id);
        
          const newStatus = newAbsence.status ? newAbsence.status.trim().toLowerCase() : null;
          const oldStatus = oldAbsence && oldAbsence.status ? oldAbsence.status.trim().toLowerCase() : null;
        
          if (oldStatus && newStatus && oldStatus !== newStatus) {
            if (newStatus === 'approuvé') {
              setShowNotificationAPP(true);
            } else if (newStatus === 'refusé') {
              setShowNotificationREF(true);
            }
          }
        });
        

        setPreviousAbsences(newAbsences);
        localStorage.setItem('absencesStatus', JSON.stringify(newAbsences));
      } catch (error) {
        console.error('Failed to fetch absences:', error);
      }
    };

    fetchPendingLeaveRequests();
    fetchPendingAbsences();

    const interval = setInterval(() => {
      fetchPendingLeaveRequests();
      fetchPendingAbsences();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (showNotificationAPP) {
      toast.success('Votre demande de congé a été approuvée!', {
        position: "top-right",
        autoClose: false,
        closeOnClick: true,
        draggable: true,
        onClose: () => setShowNotificationAPP(false),
      });
    } else if (showNotificationREF) {
      toast.error('Votre demande de congé a été refusée!', {
        position: "top-right",
        autoClose: false,
        closeOnClick: true,
        draggable: true,
        onClose: () => setShowNotificationREF(false),
      });
    } else if (showAbsenceNotification) {
      toast.info('Le statut de votre absence a été modifié!', {
        position: "top-right",
        autoClose: false,
        closeOnClick: true,
        draggable: true,
        onClose: () => setShowAbsenceNotification(false),
      });
    }
  }, [showNotificationAPP, showNotificationREF, showAbsenceNotification]);
  useEffect(() => {
    if (!navigator.onLine) {
      toast.warning('Vous êtes hors ligne. Les notifications peuvent ne pas fonctionner.', {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  }, []);

  return (
    <DashboardLayout>
      <ToastContainer />
      {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
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
    </DashboardLayout>
  );
};

export default UserDashboard;



