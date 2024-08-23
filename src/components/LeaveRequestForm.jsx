import React, { useState, useEffect } from 'react';
import AuthService from '../tests/AuthService';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../componentsSCC/LeaveRequestForm.css'; // Assurez-vous que le chemin d'importation est correct

const LeaveRequestForm = () => {
  const [user, setUser] = useState(null);
  const [remarque, setRemarque] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nbrJourCong, setNbrJourCong] = useState('');
  const [message, setMessage] = useState('');
  const [dateError, setDateError] = useState('');
  const [soldeError, setSoldeError] = useState('');

  useEffect(() => {
    AuthService.getUserDetails().then(
      (response) => {
        setUser(response.data);
      },
      (error) => {
        console.error('Failed to fetch user details:', error);
      }
    );
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setNbrJourCong(diffDays);
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date();
    const start = new Date(startDate);

    if (new Date(endDate) < new Date(startDate)) {
      setDateError('La date de fin doit être postérieure à la date de début');
      return;
    }

    const diffTime = start - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 10) {
      setDateError('La date de début doit être au moins 10 jours à partir d\'aujourd\'hui');
      return;
    }

    setDateError('');

    let isValid = true;
    if (type === 'payé' && nbrJourCong > user.solde_conges.payes) {
      setSoldeError('Le nombre de jours de congé payé demandés dépasse le solde disponible.');
      isValid = false;
    } else if (type === 'non_payé' && nbrJourCong > user.solde_conges.non_payes) {
      setSoldeError('Le nombre de jours de congé non payé demandés dépasse le solde disponible.');
      isValid = false;
    } else if (type === 'maladie' && nbrJourCong > user.solde_conges.maladie) {
      setSoldeError('Le nombre de jours de congé maladie demandés dépasse le solde disponible.');
      isValid = false;
    } else {
      setSoldeError('');
    }

    if (!isValid) {
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/leave-requests', {
        emplnom: user.nom,
        emplprenom: user.prenom,
        emplCIN: user.cin,
        departemant: user.departement,
        email: user.email,
        tele: user.telephone,
        username: user.username,
        remarque,
        type,
        startDate,
        endDate,
        nbrJourCong,
        status: "En attente",
        supervisorApproved: false,
        dateValidation: null,
        dateDemande: new Date().toISOString().split('T')[0],
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      // Réinitialiser les champs du formulaire après succès
      setRemarque('');
      setType('');
      setStartDate('');
      setEndDate('');
      setNbrJourCong('');
      setMessage('La demande est bien enregistrée');
    } catch (error) {
      setMessage('Échec de la soumission de la demande');
      console.error('Error submitting leave request:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mt-5 d-flex justify-content-center">
        <div className="card p-4 shadow-sm" style={{ maxWidth: '800px', width: '100%' }}>
          <h2 className="text-center mb-4">Formulaire des demandes de congé</h2>
          {message && <div className="alert alert-success mt-3 text-center">{message}</div>}
          <form onSubmit={handleSubmit}>
            {user && (
              <div className="mb-4">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Solde de congés:</label>
                <ul className="list-group">
                  <li className="list-group-item">Payés: {user.solde_conges.payes}</li>
                  <li className="list-group-item">Non payés: {user.solde_conges.non_payes}</li>
                  <li className="list-group-item">Maladie: {user.solde_conges.maladie}</li>
                </ul>
              </div>
            )}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Type de congé:</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="">Sélectionnez le type de congé</option>
                  <option value="payé">Payés</option>
                  <option value="non_payé">Non payés</option>
                  <option value="maladie">Maladie</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Date de début:</label>
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="col-md-4">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Date de fin:</label>
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Jours de congé:</label>
                <input type="text" className="form-control" value={nbrJourCong} readOnly />
              </div>
              <div className="col-md-8">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Remarque:</label>
                <textarea className="form-control" value={remarque} onChange={(e) => setRemarque(e.target.value)}></textarea>
              </div>
            </div>
            {dateError && <div className="alert alert-danger">{dateError}</div>}
            {soldeError && <div className="alert alert-danger">{soldeError}</div>}
            <div className="text-center">
              <button type="submit" className="btn btn-success">Soumettre la demande</button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeaveRequestForm;
