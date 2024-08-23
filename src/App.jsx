import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginComponent from './components/LoginComponent';// page de login 
import AdminDashboard from './components/AdminDashboard';// c'est l'interface de l'admin  
import UserDashboard from './components/UserDashboard';// c'est l'interface de user
import SuperDashboard from './components/SuperDashboard';// c'est l'interface de superviseur 
import PendingAbsences from './components/PendingAbsences';// les absences qui ont en attentes 
import LeaveRequestForm from './components/LeaveRequestForm';//la page de la formulaire des conges 
import LeaveRequests from './components/LeaveRequests';// l'affichage  les conges d'un user 
import Dashboard from './components/Dashboard';// la page qui affiche les statistiques
import LeaveRequestALL from './components/LeaveRequestALL';// l'affichage  les conges de tous les users
import PendingLeaveRequests from './components/PendingLeaveRequests';// les congés qui ont en attentes 
import AdditionalInfo from './components/AdditionalInfo';// page de profile
import NotFound from './components/NotFound'; 
import AbsenceForm from './components/AbsenceForm';//la page de la formulaire des absences
import SuivieAbsences from './components/SuivieAbsences';// suivre les conges et les absences pour un user
import EmployeeList from './components/EmployeeList';// la liste des employes et aussi la recherche
import AbsenceFormAdmin from './components/AbsenceFormAdmin';//la formulaire des absences des users pour l'admin
import AbsencesListAdmin from './components/AbsencesListAdmin';//lister les absences de tous les users
import SuivieAbsenceAdmin from './components/SuivieAbsenceAdmin';//suivres de toutes les absences et les congés
import AbsencesListUser from './components/AbsencesListUser';//lister les absences avec la possibilité du modifier la justification dans le cas de refusion ou non justifié

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginComponent />} /> 
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/SuivieAbsenceAdmin" element={<SuivieAbsenceAdmin />} />
        <Route path="/EmployeeList" element={<EmployeeList />} />
        <Route path="/AbsencesListAdmin" element={<AbsencesListAdmin />} />
        <Route path="/AbsenceFormAdmin" element={<AbsenceFormAdmin />} />
        <Route path="/PendingAbsences" element={<PendingAbsences />} />
        <Route path="/SuivieAbsences" element={<SuivieAbsences />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/superviseur" element={<SuperDashboard />} />
        <Route path="/register-absence"   element={<AbsenceForm/>}/>
        <Route path="/leave-request-form" element={<LeaveRequestForm />} />
        <Route path="/liste-Absences" element={<AbsencesListUser />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leave-requests" element={<LeaveRequests />} />
        <Route path="/leave-requestALL" element={<LeaveRequestALL />} />
        <Route path="/additional-info" element={<AdditionalInfo />} />
        <Route path="/PendingLeaveRequests" element={<PendingLeaveRequests />} />
        <Route path="*" element={<NotFound />} /> {/* Fallback route */}
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
