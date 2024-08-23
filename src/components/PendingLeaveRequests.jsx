import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../tests/AuthService'; // Service pour gérer l'authentification
import AdminLayout from './adminLayout'; // Mise en page spécifique à l'administrateur
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap pour le style
import { FaCheck, FaTimes } from 'react-icons/fa'; // Icônes pour les boutons d'action
import '../componentsSCC/PendingAbsences.css'; // Styles spécifiques pour le composant

/**
 * Composant pour afficher et gérer les demandes de congés en attente.
 * Affiche une liste de demandes de congés filtrées par rôle d'utilisateur (ADMIN ou SUPERVISEUR).
 * Permet d'approuver ou de rejeter les demandes en fonction du rôle.
 */
const PendingLeaveRequests = () => {
  // État pour stocker les demandes de congés en attente
  const [leaveRequests, setLeaveRequests] = useState([]);
  // État pour stocker les messages d'erreur
  const [error, setError] = useState('');
  // État pour stocker le rôle de l'utilisateur
  const [userRole, setUserRole] = useState('');

  // Effet pour récupérer les détails de l'utilisateur à l'initialisation du composant
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Appel au service d'authentification pour obtenir les détails de l'utilisateur
        const response = await AuthService.getUserDetails();
        // Définir le rôle de l'utilisateur en fonction des détails récupérés
        setUserRole(response.data.role);
      } catch (error) {
        // Gestion des erreurs en cas d'échec de la récupération des détails
        console.error('Failed to fetch user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  // Effet pour récupérer les demandes de congés en attente lorsque le rôle est défini
  useEffect(() => {
    const fetchPendingLeaveRequests = async () => {
      try {
        // Récupérer le token de l'utilisateur pour l'authentification
        const token = AuthService.getCurrentUserToken();
        if (!token) {
          throw new Error('No token found');
        }

        // Appel à l'API pour obtenir les demandes de congés
        const response = await axios.get('http://localhost:8080/api/leave-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allRequests = response.data;
        console.log('All requests:', allRequests);

        // Filtrer les demandes en attente en fonction du rôle de l'utilisateur
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
        // Mettre à jour l'état avec les demandes en attente filtrées
        setLeaveRequests(pendingRequests);
      } catch (error) {
        // Gestion des erreurs en cas d'échec de la récupération des demandes
        console.error('Error fetching leave requests:', error);
        setError('Failed to fetch leave requests');
      }
    };

    if (userRole) { // Récupérer les demandes seulement si le rôle est défini
      fetchPendingLeaveRequests();
    }
  }, [userRole]);

  // Fonction pour approuver une demande de congé
  const approveRequest = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/leave-requests/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${AuthService.getCurrentUserToken()}`,
        },
      });
      if (response.status === 200) {
        // Mettre à jour l'état pour retirer la demande approuvée
        setLeaveRequests(leaveRequests.filter(request => request.id !== id));
      }
    } catch (error) {
      setError('Failed to approve request');
    }
  };

  // Fonction pour rejeter une demande de congé
  const rejectRequest = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/leave-requests/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${AuthService.getCurrentUserToken()}`,
        },
      });
      if (response.status === 200) {
        // Mettre à jour l'état pour retirer la demande rejetée
        setLeaveRequests(leaveRequests.filter(request => request.id !== id));
      }
    } catch (error) {
      setError('Failed to reject request');
    }
  };

  // Fonction pour approuver une demande en tant qu'administrateur (si le superviseur a déjà approuvé)
  const AdminApproveRequest = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/leave-requests/${id}/admin-approve`, {}, {
        headers: {
          Authorization: `Bearer ${AuthService.getCurrentUserToken()}`,
        },
      });
      if (response.status === 200) {
        // Mettre à jour l'état pour marquer la demande comme approuvée par le superviseur
        setLeaveRequests(leaveRequests.map(request => 
          request.id === id ? { ...request, supervisorApproved: true } : request
        ));
      }
    } catch (error) {
      setError('Failed to approve request as supervisor');
    }
  };

  // Fonction pour formater les dates au format 'dd/mm/yyyy'
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Les mois sont basés sur zéro
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Afficher un message d'erreur s'il y en a
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Rendu du composant
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






