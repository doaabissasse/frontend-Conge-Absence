import React, { useState, useEffect } from 'react';
import AuthService from '../tests/AuthService';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';
import 'bootstrap/dist/css/bootstrap.min.css';

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const token = AuthService.getCurrentUserToken();
        if (!token) {
          throw new Error('No token found');
        }
        const response = await axios.get('http://localhost:8080/api/leave-request', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLeaveRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        setError('Failed to fetch leave requests');
      }
    };
    fetchLeaveRequests();
  }, []);

  const downloadPDF = async (id, nom, prenom) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/leave-requests/${id}/pdf`, { responseType: 'blob' });
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `demande_de_conge_${nom}_${prenom}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up
      } else {
        console.error('Failed to download PDF. Status:', response.status);
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      setError('Failed to download PDF');
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

  const handleDownload = (id, nom, prenom) => {
    downloadPDF(id, nom, prenom);
  };

  return (
    <DashboardLayout>
    <div className="container mt-5">
      <h2 className="text-center mb-4">Les demandes effectuées</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Type</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Nombre de jours</th>
            <th>Remarque</th>
            <th>Date de demande</th>
            <th>Status</th>
            <th>Date de Validation</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((request, index) => (
            <tr key={request.id || index}>
              <td>{request.type}</td>
              <td>{formatDate(request.startDate)}</td>
              <td>{formatDate(request.endDate)}</td>
              <td>{request.nbrJourCong}</td>
              <td>{request.remarque}</td>
              <td>{formatDate(request.dateDemande)}</td>
              <td>{request.status}</td>
              {request.status === "approuvé" && (
                  <td>{formatDate(request.dateValidation)}</td>
                )}
              <td>
                {request.status === "approuvé" && (
                  <button className="btn btn-success" onClick={() => handleDownload(request.id, request.emplnom, request.emplprenom)}>Télécharger le PDF</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </DashboardLayout>
  );
};

export default LeaveRequests;

