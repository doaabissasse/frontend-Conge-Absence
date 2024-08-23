import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../tests/AuthService';
import AdminLayout from './adminLayout';
import '../componentsSCC/LeaveRequestALL.css'; // Import custom CSS for further styling

const LeaveRequestALL = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/leave-requests', {
                    headers: {
                        Authorization: `Bearer ${AuthService.getCurrentUserToken()}`,
                    },
                });
                const approvedAndRejectedRequests = response.data.filter(request => request.status === 'approuvé' || request.status === 'refusé');
                setLeaveRequests(approvedAndRejectedRequests);
            } catch (error) {
                console.error('Failed to fetch leave requests:', error);
                setError('Failed to fetch leave requests');
            }
        };
        fetchLeaveRequests();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <AdminLayout>
            <div className="container mt-4">
                <h2 className="text-center">Les demandes traitées</h2>
                {leaveRequests.length === 0 ? (
                    <p className="text-center">Aucune demande traitée.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-sm table-striped table-bordered">
                            <thead className="thead-dark">
                                <tr>
                                    <th>Nom</th>
                                    <th>CIN</th>
                                    <th>Dépt.</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Type</th>
                                    <th>Début</th>
                                    <th>Fin</th>
                                    <th>Jours</th>
                                    <th>Rem.</th>
                                    <th>Demande</th>
                                    <th>Validation</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveRequests.map((request, index) => (
                                    <tr 
                                        key={request.id || index} 
                                        className={request.status === 'approuvé' ? 'table-success' : request.status === 'refusé' ? 'table-danger' : ''}
                                    >
                                        <td>{request.emplnom} {request.emplprenom}</td>
                                        <td>{request.emplCIN}</td>
                                        <td>{request.departemant}</td>
                                        <td>{request.email}</td>
                                        <td>{request.tele}</td>
                                        <td>{request.type}</td>
                                        <td>{formatDate(request.startDate)}</td>
                                        <td>{formatDate(request.endDate)}</td>
                                        <td>{request.nbrJourCong}</td>
                                        <td>{request.remarque}</td>
                                        <td>{formatDate(request.dateDemande)}</td>
                                        <td>{request.dateValidation ? formatDate(request.dateValidation) : 'Non définie'}</td>
                                        <td>{request.status}</td>
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

export default LeaveRequestALL;

