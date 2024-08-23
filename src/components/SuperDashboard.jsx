import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../tests/AuthService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from './adminLayout'; // Ensure the correct path to AdminLayout

const SuperDashboard = () => {
  const [user, setUser] = useState(null);
  const [previousPendingRequestsCount, setPreviousPendingRequestsCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);


  useEffect(() => {
    AuthService.getUserDetails().then(
      (response) => {
        setUser(response.data);
      },
      () => {
        toast.error('Failed to fetch user details', {
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
          throw new Error('No token found');
        }
        console.log('Fetching pending leave requests with token:', token); // Log token
        const response = await axios.get('http://localhost:8080/api/leave-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Leave requests response:', response.data); // Log response
        const pendingRequests = response.data.filter(request => request.status === 'En attente');
        if (pendingRequests.length > previousPendingRequestsCount) {
          setShowNotification(true);
        }
        setPreviousPendingRequestsCount(pendingRequests.length);
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
      }
    };

    fetchPendingLeaveRequests(); // Fetch immediately when component mounts

    const interval = setInterval(fetchPendingLeaveRequests, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [previousPendingRequestsCount]);

  useEffect(() => {
    if (showNotification) {
      toast.info(<div style={{ color: 'black' }}>Une nouvelle demande en attente a été ajoutée!</div>, {
        position: "top-right",
        autoClose: false,
        closeOnClick: true,
        draggable: true,
        onClose: () => setShowNotification(false),
      });
    }
  }, [showNotification]);


  return (
    <AdminLayout>
      <ToastContainer />
      {user && (
        <div>
          <h2>Welcome ,{user.nom} {user.prenom}</h2>
          {/* Ajoutez d'autres composants ou informations spécifiques au tableau de bord ici */}
        </div>
      )}
    </AdminLayout>
  );
};

export default SuperDashboard;