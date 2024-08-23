import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../tests/AuthService';
import AdminLayout from './adminLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCheck, FaTimes } from 'react-icons/fa';
import '../componentsSCC/PendingAbsences.css';

const PendingLeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await AuthService.getUserDetails();
        setUserRole(response.data.role); // Adjust this based on your actual user details structure
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchPendingLeaveRequests = async () => {
      try {
        const token = AuthService.getCurrentUserToken();
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:8080/api/leave-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allRequests = response.data;
        console.log('All requests:', allRequests);

        const pendingRequests = allRequests.filter(request => {
          console.log('User Role:', userRole);
          console.log(`Filtering request ${request.id} - Status: ${request.status}, Supervisor Approved: ${request.supervisorApproved}`);
          if (userRole === 'ADMIN') {
            return request.status === 'En attente' && request.supervisorApproved === false;
          } else if (userRole === 'SUPERVISEUR') {
            return request.status === 'En attente' && request.supervisorApproved === true;
          }
          return false;
        });

        console.log('Pending Requests:', pendingRequests);
        setLeaveRequests(pendingRequests);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        setError('Failed to fetch leave requests');
      }
    };

    if (userRole) { // Fetch leave requests only if userRole is defined
      fetchPendingLeaveRequests();
    }
  }, [userRole]);

  const approveRequest = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/leave-requests/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${AuthService.getCurrentUserToken()}`,
        },
      });
      if (response.status === 200) {
        setLeaveRequests(leaveRequests.filter(request => request.id !== id));
      }
    } catch (error) {
      setError('Failed to approve request');
    }
  };

  const rejectRequest = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/leave-requests/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${AuthService.getCurrentUserToken()}`,
        },
      });
      if (response.status === 200) {
        setLeaveRequests(leaveRequests.filter(request => request.id !== id));
      }
    } catch (error) {
      setError('Failed to reject request');
    }
  };

  const AdminApproveRequest = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/leave-requests/${id}/admin-approve`, {}, {
        headers: {
          Authorization: `Bearer ${AuthService.getCurrentUserToken()}`,
        },
      });
      if (response.status === 200) {
        setLeaveRequests(leaveRequests.map(request => 
          request.id === id ? { ...request, supervisorApproved: true } : request
        ));
      }
    } catch (error) {
      setError('Failed to approve request as supervisor');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h2 className="mb-4">Les Demandes En Attente</h2>
        {leaveRequests.length === 0 ? (
          <p>Aucune demande en attente.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-striped table-bordered">
              <thead className="thead-dark">
                <tr>
                  <th>Nom</th>
                  <th>Username</th>
                  <th>CIN</th>
                  <th>Dépt.</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Type</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th>Jours</th>
                  <th>Status</th>
                  <th>Rem</th>
                  <th>Demande</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request, index) => (
                  <tr key={request.id || index}>
                    <td>{request.emplnom} {request.emplprenom}</td>
                    <td>{request.username}</td>
                    <td>{request.emplCIN}</td>
                    <td>{request.departemant}</td>
                    <td>{request.email}</td>
                    <td>{request.tele}</td>
                    <td>{request.type}</td>
                    <td>{formatDate(request.startDate)}</td>
                    <td>{formatDate(request.endDate)}</td>
                    <td>{request.nbrJourCong}</td>
                    <td>{request.status}</td>
                    <td>{request.remarque}</td>
                    <td>{formatDate(request.dateDemande)}</td>
                    <td>
                      {userRole === 'SUPERVISEUR' && request.supervisorApproved ? (
                        <>
                          <button className="btn btnAccepter btn-sm ml-2" onClick={() => approveRequest(request.id)}><FaCheck /> </button>
                          <button className="btn btnRefuser btn-sm ml-2" onClick={() => rejectRequest(request.id)}><FaTimes /></button>
                        </>
                      ) : userRole === 'ADMIN' && !request.supervisorApproved ? (
                        <>
                          <button className="btn btnAccepter btn-sm ml-2" onClick={() => AdminApproveRequest(request.id)}><FaCheck /> </button>
                          <button className="btn btnRefuser btn-sm ml-2" onClick={() => rejectRequest(request.id)}><FaTimes /></button>
                        </>
                      ) : (
                        <button className="btn btn-secondary btn-sm" disabled>Approuvé</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PendingLeaveRequests;





