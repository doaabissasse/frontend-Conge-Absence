import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginComponent from './components/LoginComponent';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import SuperDashboard from './components/SuperDashboard';
import PendingAbsences from './components/PendingAbsences';
import LeaveRequestForm from './components/LeaveRequestForm';
import LeaveRequests from './components/LeaveRequests';
import Dashboard from './components/Dashboard';
import LeaveRequestALL from './components/LeaveRequestALL';
import PendingLeaveRequests from './components/PendingLeaveRequests';
import AdditionalInfo from './components/AdditionalInfo';
import NotFound from './components/NotFound'; 
import AbsenceForm from './components/AbsenceForm';
import SuivieAbsences from './components/SuivieAbsences';
import EmployeeList from './components/EmployeeList';
import AbsenceFormAdmin from './components/AbsenceFormAdmin';
import AbsencesListAdmin from './components/AbsencesListAdmin';
import SuivieAbsenceAdmin from './components/SuivieAbsenceAdmin';
import AbsencesListUser from './components/AbsencesListUser';// A component to display when the route is not found

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginComponent />} /> {/* Route for root path */}
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
