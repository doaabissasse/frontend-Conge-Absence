// liste les absences pour tous les users et modifier la justification dans le case de refusion ou non justifié
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../tests/AuthService';
import EditAbsenceModal from '../components/EditAbsenceModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import AdminLayout from './adminLayout';

const AbsencesListAdmin = () => {
  // États pour gérer les absences, les employés, les messages d'erreur et l'édition
  const [absences, setAbsences] = useState([]);
  const [employees, setEmployees] = useState({});
  const [message, setMessage] = useState('');
  const [editingAbsence, setEditingAbsence] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fonction pour récupérer les absences et les détails des employés
    const fetchAbsences = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/absences', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const absencesData = response.data;

        // Récupérer les identifiants uniques des employés
        const employeeIds = [...new Set(absencesData.map(abs => abs.employeeId))];

        // Récupérer les détails des employés
        const employeeResponses = await Promise.all(employeeIds.map(id =>
          axios.get(`http://localhost:8080/api/employees/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          })
        ));

        const employeesData = employeeResponses.reduce((acc, response) => {
          acc[response.data.id] = response.data;
          return acc;
        }, {});

        setEmployees(employeesData);
        setAbsences(absencesData);
      } catch (error) {
        setMessage('Erreur lors de la récupération des absences.');
        console.error('Erreur lors de la récupération des absences:', error);
      }
    };

    fetchAbsences();
  }, []);

  // Fonction pour vérifier si un fichier est une image
  const isImage = (fileName) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  // Gérer l'édition d'une absence
  const handleEditClick = (absence) => {
    setEditingAbsence(absence);
    setShowModal(true);
  };

  // Sauvegarder les modifications d'une absence
  const handleSaveClick = async (updatedAbsence) => {
    try {
      await axios.put(`http://localhost:8080/api/absences/${updatedAbsence.id}`, updatedAbsence, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // Mettre à jour la liste des absences après modification
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

  // Gérer les changements dans le formulaire de modification
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingAbsence({
      ...editingAbsence,
      [name]: value,
    });
  };

  // Fermer la modal de modification
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAbsence(null);
  };

  return (
    <AdminLayout>
      <div className="container mt-5">
        <h2>Liste des Absences</h2>
        {message && <div className="alert alert-danger">{message}</div>}
        {absences.length > 0 ? (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Nom d'employé</th>
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
                  <td>
                    {employees[absence.employeeId]?.prenom} {employees[absence.employeeId]?.nom }
                  </td>
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
                  <td>{absence.authorized}</td>
                  <td>{absence.justificationAccepted}</td>
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
    </AdminLayout>
  );
};

export default AbsencesListAdmin;
