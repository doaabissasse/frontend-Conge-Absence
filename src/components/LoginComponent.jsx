import React, { useState } from 'react';
import AuthService from '../tests/AuthService';
import { useNavigate } from 'react-router-dom';
import '../componentsSCC/LoginComponent.css'; // Importer le fichier CSS pour les styles personnalisés

const LoginComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    AuthService.login(username, password).then(
      (response) => {
        if (response.role === 'ADMIN') {
          navigate('/admin');
        } else if (response.role === 'USER') {
          navigate('/user');
        }else if (response.role === 'SUPERVISEUR') {
          navigate('/superviseur');
        }
      },
      (error) => {
        setMessage('Invalid credentials');
      }
    );
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center mt-5">
            <img src="/looginfo.png" alt="Company Logo" className="logo" />
          </div>
          <div className="card mt-6">
            <div className="card-body">
              <h5 className="card-title text-center">Login</h5>
              <form onSubmit={handleLogin}>
                <div className="form-group d-flex align-items-center">
                  <label htmlFor="username" className="mr-2">Username :</label>
                  <input
                    type="text"
                    className="form-control flex-grow-1"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group d-flex align-items-center position-relative">
                  <label htmlFor="password" className="mr-2">Password :</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control flex-grow-1 pr-4"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <i
                    className={`fas fa-eye${showPassword ? '-slash' : ''} position-absolute`}
                    style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>
                <button type="submit" className="btn btn-primary btn-block">sign in</button>
                {message && <div className="mt-3 alert alert-danger">{message}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;

