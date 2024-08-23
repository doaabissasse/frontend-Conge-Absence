import React, { useState, useEffect } from 'react';
import AuthService from '../tests/AuthService';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../componentsSCC/LeaveRequestForm.css'; // Assurez-vous que le chemin d'importation est correct

const AbsenceForm = () => {
  const [user, setUser] = useState(null);
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [justificationType, setJustificationType] = useState('text');
  const [justificationText, setJustificationText] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [dateError, setDateError] = useState('');

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleJustificationTypeChange = (e) => {
    setJustificationType(e.target.value);
    setJustificationText('');
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date();
    const absenceDate = new Date(date);

    if (absenceDate < today) {
      setDateError('La date de l\'absence doit être future.');
      return;
    }

    setDateError('');

    let justification = '';
    if (justificationType === 'file' && file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const fileResponse = await axios.post('http://localhost:8080/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        justification = fileResponse.data;
      } catch (error) {
        setMessage('Erreur lors du téléchargement du fichier.');
        console.error('Erreur lors du téléchargement du fichier:', error);
        return;
      }
    } else if (justificationType === 'text' && justificationText) {
      justification = justificationText;
    }

    try {
      await axios.post('http://localhost:8080/api/absences', {
        employeeId: user.id,
        date,
        type,
        justificationType,
        justification,
        authorized: justification ? 'justifié' : 'non justifié',
        justificationAccepted: 'En attente',
        supervisorApproved: false,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setMessage('Absence enregistrée avec succès');
      setDate('');
      setType('');
      setJustificationText('');
      setFile(null);
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement de l\'absence.');
      console.error('Erreur lors de l\'enregistrement de l\'absence:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="container mt-5 d-flex justify-content-center">
        <div className="card p-4 shadow-sm" style={{ maxWidth: '800px', width: '100%' }}>
          <h2 className="text-center mb-4">Formulaire d'enregistrement des absences</h2>
          {message && <div className="alert alert-success mt-3 text-center">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Date de l'absence:</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Type d'absence:</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="">Sélectionnez le type d'absence</option>
                <option value="maladie imprévue">Maladie imprévue</option>
                <option value="absence personnelle">Absence personnelle</option>
                <option value="retard">Retard</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Type de justification:</label>
              <div>
                <label>
                  <input
                    type="radio"
                    value="text"
                    checked={justificationType === 'text'}
                    onChange={handleJustificationTypeChange}
                  />
                  Texte
                </label>
                <label className="ml-3">
                  <input
                    type="radio"
                    value="file"
                    checked={justificationType === 'file'}
                    onChange={handleJustificationTypeChange}
                  />
                  Fichier
                </label>
              </div>
            </div>
            {justificationType === 'text' && (
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Justification (texte):</label>
                <textarea
                  className="form-control"
                  value={justificationText}
                  onChange={(e) => setJustificationText(e.target.value)}
                />
              </div>
            )}
            {justificationType === 'file' && (
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Justification (fichier):</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                />
              </div>
            )}
            {dateError && <div className="alert alert-danger">{dateError}</div>}
            <div className="text-center">
              <button type="submit" className="btn btn-success">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AbsenceForm;




