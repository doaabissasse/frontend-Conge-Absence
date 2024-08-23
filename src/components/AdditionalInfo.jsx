import React, { useState, useEffect } from 'react';
import AuthService from '../tests/AuthService';
import DashboardLayout from './DashboardLayout';
import AdminLayout from './adminLayout'; // Import du layout pour les administrateurs
import 'bootstrap/dist/css/bootstrap.min.css'; // Import du CSS Bootstrap
import '../componentsSCC/AdditionalInfo.css'; // Import du CSS spécifique au composant

/**
 * Composant pour afficher les informations de profil de l'utilisateur
 * Le layout utilisé dépend du rôle de l'utilisateur
 */
const AdditionalInfo = () => {
  const [user, setUser] = useState(null); // État pour stocker les détails de l'utilisateur
  const [loading, setLoading] = useState(true); // État pour gérer le chargement des données
  const [error, setError] = useState(''); // État pour gérer les erreurs

  useEffect(() => {
    // Fonction pour récupérer les détails de l'utilisateur
    const fetchUserDetails = async () => {
      try {
        const response = await AuthService.getUserDetails(); // Appel au service d'authentification
        setUser(response.data); // Mise à jour de l'état avec les détails de l'utilisateur
      } catch (error) {
        setError('Échec de la récupération des détails de l\'utilisateur'); // Message d'erreur
      } finally {
        setLoading(false); // Fin du chargement
      }
    };

    fetchUserDetails(); // Appel de la fonction pour récupérer les données
  }, []);

  // Fonction pour formater les dates en format DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Afficher un message de chargement pendant la récupération des données
  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  // Afficher un message d'erreur en cas d'échec de la récupération des données
  if (error) {
    return <div className="error">{error}</div>;
  }

  // Si aucun utilisateur n'est trouvé, ne rien afficher
  if (!user) {
    return null;
  }

  // Déterminer le layout en fonction du rôle de l'utilisateur
  const Layout = user.role === 'ADMIN' ? AdminLayout : DashboardLayout;

  return (
    <Layout>
      <div className="profile-container">
        <div className="profile-card">
          <h1 className="text-center my-4">Profil</h1>
          <div className="profile-details">
            <div className="profile-info">
              <p><strong>Nom:</strong> {user.nom} {user.prenom}</p>
              <p><strong>CIN:</strong> {user.cin}</p>
              <p><strong>Date de naissance:</strong> {formatDate(user.date_naissance)}</p>
              <p><strong>Sexe:</strong> {user.sexe}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
            <div className="profile-info">
              <p><strong>Téléphone:</strong> {user.telephone}</p>
              <p><strong>Poste:</strong> {user.poste}</p>
              <p><strong>Département:</strong> {user.departement}</p>
              <p><strong>Solde payée:</strong> {user.solde_conges.payes}</p>
              <p><strong>Solde non payée:</strong> {user.solde_conges.non_payes}</p>
              <p><strong>Solde maladie:</strong> {user.solde_conges.maladie}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdditionalInfo;

