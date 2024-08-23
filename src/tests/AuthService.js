import axios from 'axios';

// URL de base pour l'API d'authentification
const API_URL = 'http://localhost:8080/api/auth/';

/**
 * Effectue une requête de connexion à l'API.
 * @param {string} username - Nom d'utilisateur.
 * @param {string} password - Mot de passe de l'utilisateur.
 * @returns {Promise<Object>} Les données de l'utilisateur authentifié, y compris le token JWT.
 */
const login = async (username, password) => {
  const response = await axios.post(API_URL + 'signin', {
    username,
    password,
  });

  // Si un token est reçu, on le stocke dans le localStorage
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

/**
 * Déconnecte l'utilisateur en supprimant les données stockées dans le localStorage.
 */
const logout = () => {
  localStorage.removeItem('user');
};

/**
 * Récupère le rôle de l'utilisateur actuellement connecté.
 * Le rôle de l'utilisateur ou null s'il n'y a pas d'utilisateur connecté.
 */
const getCurrentUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? user.role : null;
};

/**
 * Effectue une requête de déconnexion auprès de l'API.
 * Supprime également les données de l'utilisateur du localStorage.
 */
const signout = async () => {
  try {
    await axios.post(`${API_URL}signout`, {}, {
      headers: {
        Authorization: `Bearer ${getCurrentUserToken()}`
      }
    });
  } catch (error) {
    console.error('Error during signout:', error);
  }

  // Suppression des données utilisateur du localStorage après la déconnexion
  localStorage.removeItem('user');
};

/**
 * Récupère les données de l'utilisateur actuellement connecté depuis le localStorage.
 * Les données de l'utilisateur ou null s'il n'y a pas d'utilisateur connecté.
 */
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

/**
 * Récupère les détails de l'utilisateur actuellement connecté via une requête à l'API.
 * Les détails de l'utilisateur.
 * Erreur si aucun token utilisateur n'est trouvé.
 */
const getUserDetails = () => {
  const user = getCurrentUser();
  if (user && user.token) {
    return axios.get('/api/me', {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  }

  return Promise.reject('No user token found');
};

/**
 * Récupère le token JWT de l'utilisateur actuellement connecté.
 * Le token JWT de l'utilisateur ou null s'il n'y a pas d'utilisateur connecté.
 */
const getCurrentUserToken = () => {
  const user = getCurrentUser();
  return user ? user.token : null;
};

// Regroupe toutes les méthodes d'authentification dans un objet pour un accès facile
const AuthService = {
  login,
  logout,
  signout,
  getCurrentUser,
  getUserDetails,
  getCurrentUserRole,
  getCurrentUserToken,
};

export default AuthService;
