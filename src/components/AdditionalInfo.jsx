import React, { useState, useEffect } from 'react';
import AuthService from '../tests/AuthService';
import DashboardLayout from './DashboardLayout';
import AdminLayout from './adminLayout'; // Import AdminLayout
import 'bootstrap/dist/css/bootstrap.min.css';
import '../componentsSCC/AdditionalInfo.css';

const AdditionalInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await AuthService.getUserDetails();
        setUser(response.data);
      } catch (error) {
        setError('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!user) {
    return null;
  }

  // Determine the layout based on user role
  const Layout = user.role === 'ADMIN' ? AdminLayout : DashboardLayout;

  return (
    <Layout>
      <div className="profile-container">
        <div className="profile-card">
          <h1 className="text-center my-4">Profile</h1>
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

