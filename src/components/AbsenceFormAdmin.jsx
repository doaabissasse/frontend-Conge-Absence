import React, { useState, useEffect } from 'react';
import AuthService from '../tests/AuthService'; // Service pour gérer l'authentification et récupérer les détails de l'utilisateur
import axios from 'axios'; // Bibliothèque pour effectuer des requêtes HTTP
import AdminLayout from './adminLayout'; // Layout pour la page d'administration
import 'bootstrap/dist/css/bootstrap.min.css'; // Styles Bootstrap pour les composants
import '../componentsSCC/LeaveRequestForm.css'; // Assurez-vous que le chemin d'importation du fichier CSS est correct

/**
 * Composant `AbsenceFormAdmin`
 * Ce composant permet aux administrateurs d'enregistrer des absences pour les employés.
 * Les administrateurs peuvent sélectionner le type d'absence, fournir une justification (texte ou fichier) et spécifier une date future.
 * Les détails de l'absence sont envoyés au backend pour enregistrement.
 */
const AbsenceFormAdmin = () => {
  const [user, setUser] = useState(null); // État pour stocker les détails de l'utilisateur connecté
  const [employeeId, setEmployeeId] = useState(''); // État pour stocker l'ID de l'employé
  const [date, setDate] = useState(''); // État pour stocker la date de l'absence
  const [type, setType] = useState(''); // État pour stocker le type d'absence
  const [justificationType, setJustificationType] = useState('text'); // État pour déterminer le type de justification (texte ou fichier)
  const [justificationText, setJustificationText] = useState(''); // État pour stocker le texte de justification
  const [file, setFile] = useState(null); // État pour stocker le fichier de justification
  const [message, setMessage] = useState(''); // État pour afficher les messages de succès ou d'erreur
  const [dateError, setDateError] = useState(''); // État pour stocker les erreurs liées à la date

  // Utilisation de useEffect pour récupérer les détails de l'utilisateur une fois que le composant est monté
  useEffect(() => {
    AuthService.getUserDetails().then(
      (response) => {
        setUser(response.data); // Stocke les détails de l'utilisateur dans l'état
      },
      (error) => {
        console.error('Failed to fetch user details:', error); // Affiche une erreur en cas d'échec de la récupération des détails de l'utilisateur
      }
    );
  }, []);

  // Gestionnaire de changement de fichier pour la justification
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Met à jour l'état avec le fichier sélectionné
  };

  // Gestionnaire de changement du type de justification
  const handleJustificationTypeChange = (e) => {
    setJustificationType(e.target.value); // Met à jour le type de justification (texte ou fichier)
    setJustificationText(''); // Réinitialise le texte de justification si le type change
    setFile(null); // Réinitialise le fichier de justification si le type change
  };

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    const today = new Date();
    const absenceDate = new Date(date);

    // Vérifie que la date d'absence est dans le futur
    if (absenceDate < today) {
      setDateError('La date de l\'absence doit être future.');
      return;
    }

    setDateError(''); // Réinitialise les erreurs de date si la date est valide

    let justification = '';
    if (justificationType === 'file' && file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Envoie le fichier au serveur pour le téléverser
        const fileResponse = await axios.post('http://localhost:8080/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        justification = fileResponse.data; // Stocke la réponse du serveur (lien du fichier) comme justification
      } catch (error) {
        setMessage('Erreur lors du téléchargement du fichier.');
        console.error('Erreur lors du téléchargement du fichier:', error);
        return;
      }
    } else if (justificationType === 'text' && justificationText) {
      justification = justificationText; // Stocke le texte de justification
    }

    try {
      // Envoie les données d'absence au serveur pour enregistrement
      await axios.post('http://localhost:8080/api/absences', {
        employeeId, // Utilisation de l'ID employé saisi par l'administrateur
        date,
        type,
        justificationType,
        justification,
        authorized: justification ? 'justifié' : 'non justifié', // Indique si l'absence est justifiée
        justificationAccepted: 'En attente', // Statut initial de la justification
        supervisorApproved: false, // Indique que l'approbation du superviseur est en attente
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Utilise le token d'authentification
        },
      });
      setMessage('Absence enregistrée avec succès'); // Message de succès
      setEmployeeId(''); // Réinitialise l'ID employé après enregistrement
      setDate(''); // Réinitialise la date après enregistrement
      setType(''); // Réinitialise le type après enregistrement
      setJustificationText(''); // Réinitialise le texte de justification après enregistrement
      setFile(null); // Réinitialise le fichier de justification après enregistrement
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement de l\'absence.');
      console.error('Erreur lors de l\'enregistrement de l\'absence:', error);
    }
  };

  // Affiche un message de chargement si les détails de l'utilisateur ne sont pas encore disponibles
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="container mt-5 d-flex justify-content-center">
        <div className="card p-4 shadow-sm" style={{ maxWidth: '800px', width: '100%' }}>
          <h2 className="text-center mb-4">Formulaire d'enregistrement des absences</h2>
          {message && <div className="alert alert-success mt-3 text-center">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 'bold' }}>ID de l'employé:</label>
              <input
                type="text"
                className="form-control"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>
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
            <button type="submit" className="btn btn-primary w-100">Enregistrer l'absence</button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AbsenceFormAdmin;

