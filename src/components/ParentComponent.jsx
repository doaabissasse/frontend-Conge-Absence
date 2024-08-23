import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditAbsenceModal from './EditAbsenceModal';

const ParentComponent = () => {
  const [absences, setAbsences] = useState([]);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fonction pour récupérer les absences depuis le backend
  const fetchAbsences = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/absences');
      setAbsences(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des absences:', error);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  // Fonction pour gérer l'enregistrement des modifications
  const handleSaveClick = async (updatedAbsence) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/absences/${updatedAbsence.id}`, updatedAbsence);
      const updatedAbsences = absences.map(absence => 
        absence.id === updatedAbsence.id ? response.data : absence
      );
      setAbsences(updatedAbsences);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'absence:', error);
    }
  };

  // Fonction pour ouvrir le modal d'édition
  const handleEditClick = (absence) => {
    setSelectedAbsence(absence);
    setShowModal(true);
  };

  return (
    <div>
      <h1>Gestion des absences</h1>
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
                <button onClick={() => handleEditClick(absence)}>Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
