import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../tests/AuthService';
import AdminLayout from './adminLayout';
import HorizontalCalendarView from './HorizontalCalendarView';
import '../componentsSCC/SuivieAbsenceAdmin.css';
import { Container, Card, Button } from 'react-bootstrap';

const SuivieAbsenceAdmin = () => {
  const [usersData, setUsersData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { token } = AuthService.getCurrentUser();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
        const usersResponse = await axios.get(`/api/employees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const users = usersResponse.data.filter(user => user.role === 'USER');
  
        const fetchAbsencesAndLeaves = users.map(async (user) => {
          const absencesResponse = await axios.get(`/api/absences/employee/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          const leaveRequestsResponse = await axios.get(`/api/leave-requests/employee/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          return {
            user,
            absences: absencesResponse.data.map(absence => ({
              id: `absence-${absence.id}`,
              start: new Date(absence.date),
              end: new Date(absence.date),
              allDay: true,
              type: 'absence',
            })),
            leaveRequests: leaveRequestsResponse.data
              .filter(request => request.status !== 'refusé')
              .map(request => ({
                id: `leave-${request.id}`,
                start: new Date(request.startDate),
                end: new Date(request.endDate),
                allDay: true,
                type: 'leave',
                status: request.status,
              })),
          };
        });
  
        const results = await Promise.all(fetchAbsencesAndLeaves);
        setUsersData(results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
  };

  return (
    <AdminLayout>
      <Container className="mt-4">
        {/* Guide des couleurs */}
        <div className="color-guide mb-3">
          <ul className="list-inline">
            <li className="list-inline-item">
              <span className="legend-absence"></span> Jours d'absence
            </li>
            <li className="list-inline-item">
              <span className="legend-approved"></span> Congés approuvés
            </li>
            <li className="list-inline-item">
              <span className="legend-pending"></span> Congés en attente
            </li>
          </ul>
        </div>

        <div className="d-flex justify-content-between mb-3">
          <Button onClick={handlePrevMonth}>Précédent</Button>
          <h4>{currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h4>
          <Button onClick={handleNextMonth}>Suivant</Button>
        </div>
        <Card className="custom-card">
          <Card.Body className="custom-card-body">
            <div className="calendar-container">
              <HorizontalCalendarView usersData={usersData} currentMonth={currentMonth} />
            </div>
          </Card.Body>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default SuivieAbsenceAdmin;

