import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './adminLayout';
import { Spinner } from 'react-bootstrap';
import AuthService from '../tests/AuthService';
import { FaCheck, FaTimes } from 'react-icons/fa';
import '../componentsSCC/PendingAbsences.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const PendingAbsences = () => {
  const [absences, setAbsences] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await AuthService.getUserDetails();
        setUserRole(response.data.role);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchPendingAbsences = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/absences/pending', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const allAbsences = response.data;

        const pendingAbsences = allAbsences.filter(absence => {
          if (userRole === 'ADMIN') {
            return absence.supervisorApproved === false;
          } else if (userRole === 'SUPERVISEUR') {
            return absence.supervisorApproved === true;
          }
          return false;
        });

        setAbsences(pendingAbsences);

        const employeeData = {};
        for (let absence of pendingAbsences) {
          if (!employeeData[absence.employeeId]) {
            try {
              const employeeResponse = await axios.get(`http://localhost:8080/api/${absence.employeeId}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
              });
              employeeData[absence.employeeId] = employeeResponse.data;
            } catch (error) {
              console.error(`Erreur lors de la récupération des informations de l'employé avec l'ID ${absence.employeeId}:`, error);
            }
          }
        }
        setEmployeeInfo(employeeData);
        setLoading(false);
      } catch (error) {
        if (error.response) {
          setMessage(`Erreur: ${error.response.status} - ${error.response.data.message}`);
        } else if (error.request) {
          setMessage('Erreur de communication avec le serveur.');
        } else {
          setMessage('Erreur lors de la configuration de la requête.');
        }
        setLoading(false);
      }
    };

    fetchPendingAbsences();
  }, [userRole]);

  const handleAccept = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/absences/${id}/accept`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setAbsences(absences.filter(absence => absence.id !== id));
    } catch (error) {
      setMessage('Erreur lors de l\'acceptation de l\'absence.');
      console.error('Erreur lors de l\'acceptation de l\'absence:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/absences/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setAbsences(absences.filter(absence => absence.id !== id));
    } catch (error) {
      setMessage('Erreur lors du refus de l\'absence.');
      console.error('Erreur lors du refus de l\'absence:', error);
    }
  };

  const AdminApproveAbsences = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/absences/${id}/admin-approve`, {}, {
        headers: {
          Authorization: `Bearer ${AuthService.getCurrentUserToken()}`,
        },
      });
      if (response.status === 200) {
        setAbsences(absences.map(absence => 
          absence.id === id ? { ...absence, supervisorApproved: true } : absence
        ));
      }
    } catch (error) {
      setError('Failed to approve absence as admin');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <AdminLayout>
      <div className="container mt-5">
        <h2 className="mb-4">Absences en Attente</h2>
        {message && <div className="alert alert-danger">{message}</div>}
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : absences.length > 0 ? (
          <table className="table table-striped table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Département</th>
                <th>Justification</th>
                <th>Date de Création</th>
                <th>Dernière Modification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {absences.map(absence => (
                <tr key={absence.id}>
                  <td>{formatDate(absence.date)}</td>
                  <td>{absence.type}</td>
                  <td>{employeeInfo[absence.employeeId]?.nom} {employeeInfo[absence.employeeId]?.prenom}</td>
                  <td>{employeeInfo[absence.employeeId]?.email}</td>
                  <td>{employeeInfo[absence.employeeId]?.telephone}</td>
                  <td>{employeeInfo[absence.employeeId]?.departement}</td>
                  <td>
                    {absence.justification ? (
                      absence.justification.endsWith('.pdf') ? (
                        <a href={`http://localhost:8080/api/files/download/${absence.justification}`} target="_blank" rel="noopener noreferrer">Télécharger</a>
                      ) : (
                        absence.justification
                      )
                    ) : (
                      'Aucune'
                    )}
                  </td>
                  <td>{formatDate(absence.creationDate)}</td>
                  <td>{formatDate(absence.lastModifiedDate)}</td>
                  <td>
                    {userRole === 'SUPERVISEUR' && absence.supervisorApproved ? (
                      <>
                        <button onClick={() => handleAccept(absence.id)} className="btn btnAccepter btn-sm ml-2">
                          <FaCheck /> 
                        </button>
                        <button onClick={() => handleReject(absence.id)} className="btn btnRefuser btn-sm ml-2">
                          <FaTimes /> 
                        </button>
                      </>
                    ) : userRole === 'ADMIN' && !absence.supervisorApproved ? (
                      <>
                        <button className="btn btnAccepter btn-sm ml-2" onClick={() => AdminApproveAbsences(absence.id)}>
                          <FaCheck />
                        </button>
                        <button className="btn btnRefuser btn-sm ml-2" onClick={() => handleReject(absence.id)}>
                          <FaTimes />
                        </button>
                      </>
                    ) : <button className="btn btn-secondary btn-sm" disabled>Approuvé</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info">Aucune absence en attente</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PendingAbsences;
