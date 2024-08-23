import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const EditAbsenceModal = ({ show, handleClose, absence, handleSaveClick }) => {
  const [justificationType, setJustificationType] = useState(absence.justificationType || 'text');
  const [justificationText, setJustificationText] = useState(absence.justification || '');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const isFile = (justification) => {
    const fileExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
    return fileExtensions.some(ext => justification.toLowerCase().endsWith(ext));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleJustificationTypeChange = (e) => {
    setJustificationType(e.target.value);
    // Clear previous justification data
    setJustificationText('');
    setFile(null);
  };

  const handleSave = async () => {
    let justification = justificationText;

    if (justificationType === 'file' && file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const fileResponse = await axios.post('http://localhost:8080/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        justification = fileResponse.data; // Nom du fichier ou chemin du fichier
      } catch (error) {
        setMessage('Erreur lors du téléchargement du fichier.');
        console.error('Erreur lors du téléchargement du fichier:', error);
        return;
      }
    }

    // Déterminer la valeur d'authorized
    const authorized = justification ? 'justifié' : 'non justifié';

    try {
      const updatedAbsence = {
        ...absence,
        justificationType,
        justification,
        authorized, // Mettre à jour l'attribut authorized
        lastModifiedDate: new Date(),
        justificationAccepted: "En attente",
      };

      await axios.put(`http://localhost:8080/api/absences/${absence.id}`, updatedAbsence, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      setMessage('Absence modifiée avec succès');
      handleClose();
    } catch (error) {
      setMessage('Erreur lors de la modification de l\'absence.');
      console.error('Erreur lors de la modification de l\'absence:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Modifier Absence</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formDate">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="text"
              name="date"
              value={new Date(absence.date).toLocaleDateString()}
              disabled
            />
          </Form.Group>
          <Form.Group controlId="formType">
            <Form.Label>Type</Form.Label>
            <Form.Control
              type="text"
              name="type"
              value={absence.type}
              disabled
            />
          </Form.Group>
          <Form.Group controlId="formJustificationType">
            <Form.Label>Type de Justification</Form.Label>
            <Form.Control
              as="select"
              name="justificationType"
              value={justificationType}
              onChange={handleJustificationTypeChange}
            >
              <option value="text">Texte</option>
              <option value="file">Fichier</option>
            </Form.Control>
          </Form.Group>
          {justificationType === 'text' && (
            <Form.Group controlId="formJustificationText">
              <Form.Label>Justification (texte)</Form.Label>
              <Form.Control
                as="textarea"
                name="justificationText"
                value={justificationText}
                onChange={(e) => setJustificationText(e.target.value)}
              />
            </Form.Group>
          )}
          {justificationType === 'file' && (
            <Form.Group controlId="formJustificationFile">
              <Form.Label>Justification (fichier)</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
              />
            </Form.Group>
          )}
          <Form.Group controlId="formAuthorized">
            <Form.Label>Autorisé</Form.Label>
            <Form.Control
              type="text"
              name="authorized"
              value={absence.authorized} // Afficher la valeur actuelle
              disabled
            />
          </Form.Group>
          <Form.Group controlId="formJustificationAccepted">
            <Form.Label>Status</Form.Label>
            <Form.Control
              type="text"
              name="justificationAccepted"
              value="En attente" // Toujours "En attente" lors de la modification
              disabled
            />
          </Form.Group>
          {message && <div className="alert alert-info mt-3">{message}</div>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
  <Button variant="light" onClick={handleClose}>
    Fermer
  </Button>
  <Button variant="primary" onClick={handleSave}>
    Enregistrer
  </Button>
</Modal.Footer>
    </Modal>
  );
};

export default EditAbsenceModal;


