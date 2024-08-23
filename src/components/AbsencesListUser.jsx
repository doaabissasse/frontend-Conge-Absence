import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../tests/AuthService';
import EditAbsenceModal from '../components/EditAbsenceModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import DashboardLayout from './DashboardLayout';

const AbsencesListUser = () => {
  const [absences, setAbsences] = useState([]);
  const [message, setMessage] = useState('');
  const [editingAbsence, setEditingAbsence] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const userResponse = await AuthService.getUserDetails();
        const employeeId = userResponse.data.id;
        const response = await axios.get(`http://localhost:8080/api/absences/employee/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setAbsences(response.data);
      } catch (error) {
        setMessage('Erreur lors de la récupération des absences.');
        console.error('Erreur lors de la récupération des absences:', error);
      }
    };

    fetchAbsences();
  }, []);

  const isImage = (fileName) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const handleEditClick = (absence) => {
    setEditingAbsence(absence);
    setShowModal(true);
  };

  const handleSaveClick = async (updatedAbsence) => {
    try {
      // Mise à jour de l'absence via l'API
      await axios.put(`http://localhost:8080/api/absences/${updatedAbsence.id}`, updatedAbsence, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // Mise à jour de l'état local sans faire un nouvel appel API
      setAbsences((prevAbsences) =>
        prevAbsences.map(abs => (abs.id === updatedAbsence.id ? updatedAbsence : abs))
      );

      setShowModal(false);
      setEditingAbsence(null);
    } catch (error) {
      setMessage('Erreur lors de la sauvegarde des modifications.');
      console.error('Erreur lors de la sauvegarde des modifications:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingAbsence({
      ...editingAbsence,
      [name]: value,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAbsence(null);
  };

  return (
    <DashboardLayout>
      <div className="container mt-5">
        <h2>Mes Absences</h2>
        {message && <div className="alert alert-danger">{message}</div>}
        {absences.length > 0 ? (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Justification</th>
                <th>Autorisé</th>
                <th>Status</th>
                <th>Modifier</th>
              </tr>
            </thead>
            <tbody>
              {absences.map(absence => (
                <tr key={absence.id}>
                  <td>{new Date(absence.date).toLocaleDateString()}</td>
                  <td>{absence.type}</td>
                  <td>
                    {absence.justification ? (
                      absence.justification.endsWith('.pdf') ? (
                        <a href={`http://localhost:8080/api/files/download/${absence.justification}`} target="_blank" rel="noopener noreferrer">Télécharger</a>
                      ) : isImage(absence.justification) ? (
                        <a href={`http://localhost:8080/api/files/download/${absence.justification}`} target="_blank" rel="noopener noreferrer">Voir Image</a>
                      ) : (
                        absence.justification
                      )
                    ) : (
                      ''
                    )}
                  </td>
                  <td>{absence.authorized }</td>
                  <td>{absence.justificationAccepted }</td>
                  <td>
                    {(absence.justificationAccepted === 'refusé' || absence.authorized === 'non justifié') && (
                      <button
                        onClick={() => handleEditClick(absence)}
                        className="btn btn-primary"
                        title="Modifier"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucune absence enregistrée.</p>
        )}
        {editingAbsence && (
          <EditAbsenceModal
            show={showModal}
            handleClose={handleCloseModal}
            absence={editingAbsence}
            handleChange={handleChange}
            handleSaveClick={handleSaveClick}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AbsencesListUser;
