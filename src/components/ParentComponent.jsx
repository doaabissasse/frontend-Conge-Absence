import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditAbsenceModal from './EditAbsenceModal';

/**
 * Composant principal pour la gestion des absences
 * 
 * Affiche une liste d'absences récupérées depuis le backend et permet de modifier les détails d'une absence via un modal d'édition.
 */
const ParentComponent = () => {
  // État pour stocker les absences récupérées depuis le backend
  const [absences, setAbsences] = useState([]);
  
  // État pour stocker l'absence actuellement sélectionnée pour modification
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  
  // État pour contrôler l'affichage du modal d'édition
  const [showModal, setShowModal] = useState(false);

  /**
   * Fonction pour récupérer les absences depuis le backend
   * Effectue une requête GET à l'API et met à jour l'état des absences
   */
  const fetchAbsences = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/absences');
      setAbsences(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des absences:', error);
    }
  };

  // Utilise useEffect pour appeler fetchAbsences lors du premier rendu du composant
  useEffect(() => {
    fetchAbsences();
  }, []);

  /**
   * Fonction pour gérer l'enregistrement des modifications d'une absence
   * 
   * @param {Object} updatedAbsence - Les détails de l'absence mise à jour
   */
  const handleSaveClick = async (updatedAbsence) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/absences/${updatedAbsence.id}`, updatedAbsence);
      // Met à jour l'état des absences avec les nouvelles données de l'absence modifiée
      const updatedAbsences = absences.map(absence => 
        absence.id === updatedAbsence.id ? response.data : absence
      );
      setAbsences(updatedAbsences);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'absence:', error);
    }
  };

  /**
   * Fonction pour ouvrir le modal d'édition
   * 
   * @param {Object} absence - L'absence à modifier
   */
  const handleEditClick = (absence) => {
    setSelectedAbsence(absence);
    setShowModal(true);
  };

  return (
    <div>
      <h1>Gestion des absences</h1>
      {/* Tableau affichant les absences */}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Justification</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {absences.map(absence => (
            <tr key={absence.id}>
              <td>{new Date(absence.date).toLocaleDateString()}</td>
              <td>{absence.type}</td>
              <td>{absence.justification}</td>
              <td>
                {/* Bouton pour ouvrir le modal d'édition */}
                <button onClick={() => handleEditClick(absence)}>Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal d'édition pour l'absence sélectionnée */}
      {selectedAbsence && (
        <EditAbsenceModal 
          show={showModal} 
          handleClose={() => setShowModal(false)} 
          absence={selectedAbsence} 
          handleSaveClick={handleSaveClick} 
        />
      )}
    </div>
  );
};

export default ParentComponent;

