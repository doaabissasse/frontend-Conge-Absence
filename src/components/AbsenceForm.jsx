import React, { useState, useEffect } from 'react';
import AuthService from '../tests/AuthService';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../componentsSCC/LeaveRequestForm.css'; // Assurez-vous que le chemin d'importation est correct

/*
 * Composant AbsenceForm :
 * Ce composant permet aux utilisateurs d'enregistrer une absence en spécifiant la date, le type d'absence,
 * et une justification soit sous forme de texte, soit en téléchargeant un fichier.
 * L'utilisateur peut soumettre le formulaire pour enregistrer l'absence dans le système.
 */

const AbsenceForm = () => {
  // États pour gérer les données du formulaire et les messages d'erreur/succès
  const [user, setUser] = useState(null); // Stocke les détails de l'utilisateur connecté
  const [date, setDate] = useState(''); // Stocke la date de l'absence
  const [type, setType] = useState(''); // Stocke le type d'absence
  const [justificationType, setJustificationType] = useState('text'); // Définit le type de justification (texte ou fichier)
  const [justificationText, setJustificationText] = useState(''); // Stocke le texte de justification
  const [file, setFile] = useState(null); // Stocke le fichier de justification
  const [message, setMessage] = useState(''); // Message de retour pour l'utilisateur
  const [dateError, setDateError] = useState(''); // Message d'erreur pour la date d'absence

  // Récupère les détails de l'utilisateur lors du montage du composant
  useEffect(() => {
    AuthService.getUserDetails().then(
      (response) => {
        setUser(response.data); // Stocke les détails de l'utilisateur dans l'état
      },
      (error) => {
        console.error('Failed to fetch user details:', error); // Affiche une erreur si la récupération échoue
      }
    );
  }, []);

  // Gère le changement de fichier sélectionné pour la justification
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Gère le changement du type de justification (texte ou fichier)
  const handleJustificationTypeChange = (e) => {
    setJustificationType(e.target.value);
    setJustificationText('');
    setFile(null);
  };

  // Gère la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifie que la date d'absence est future
    const today = new Date();
    const absenceDate = new Date(date);

    if (absenceDate < today) {
      setDateError('La date de l\'absence doit être future.');
      return;
    }

    setDateError(''); // Réinitialise le message d'erreur si la date est valide

    let justification = '';
    if (justificationType === 'file' && file) {
      // Si la justification est un fichier, envoie le fichier au serveur
      const formData = new FormData();
      formData.append('file', file);

      try {
        const fileResponse = await axios.post('http://localhost:8080/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        justification = fileResponse.data; // Récupère le chemin du fichier téléchargé
      } catch (error) {
        setMessage('Erreur lors du téléchargement du fichier.');
        console.error('Erreur lors du téléchargement du fichier:', error);
        return;
      }
    } else if (justificationType === 'text' && justificationText) {
      // Si la justification est un texte, utilise le texte saisi
      justification = justificationText;
    }

    try {
      // Envoie les données d'absence au serveur
      await axios.post('http://localhost:8080/api/absences', {
        employeeId: user.id,
        date,
        type,
        justificationType,
        justification,
        authorized: justification ? 'justifié' : 'non justifié', // Définit l'état de la justification
        justificationAccepted: 'En attente', // L'état par défaut de la justification
        supervisorApproved: false, // L'absence n'est pas encore approuvée par le superviseur
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Ajoute le jeton d'authentification
        },
      });
      setMessage('Absence enregistrée avec succès');
      // Réinitialise le formulaire après l'enregistrement
      setDate('');
      setType('');
      setJustificationText('');
      setFile(null);
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement de l\'absence.');
      console.error('Erreur lors de l\'enregistrement de l\'absence:', error);
    }
  };

  // Affiche un message de chargement tant que les détails de l'utilisateur ne sont pas chargés
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="container mt-5 d-flex justify-content-center">
        <div className="card p-4 shadow-sm" style={{ maxWidth: '800px', width: '100%' }}>
          <h2 className="text-center mb-4">Formulaire d'enregistrement des absences</h2>
          {/* Affiche un message de succès ou d'erreur si nécessaire */}
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
            {/* Affiche un champ de texte si l'utilisateur a choisi "Texte" comme type de justification */}
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
            {/* Affiche un champ de téléchargement de fichier si l'utilisateur a choisi "Fichier" comme type de justification */}
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
            {/* Affiche un message d'erreur si la date d'absence est incorrecte */}
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

export default AbsenceForm; // Exporte le composant pour l'utiliser dans d'autres parties de l'application.





