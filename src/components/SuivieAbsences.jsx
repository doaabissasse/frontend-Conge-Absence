import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import AuthService from '../tests/AuthService';
import DashboardLayout from './DashboardLayout';
import '../componentsSCC/SuivieAbsences.css';
import { Container, Card } from 'react-bootstrap';

moment.locale('fr'); // Configurer moment.js en français
const localizer = momentLocalizer(moment);

const messages = {
  today: "Aujourd'hui",
  previous: 'Précédent',
  next: 'Suivant',
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Événement',
  showMore: total => `+ ${total} plus`,
};

const SuivieAbsences = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.MONTH);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id: userId, token } = AuthService.getCurrentUser();

        const absencesResponse = await axios.get(`/api/absences/employee/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const absences = absencesResponse.data.map(absence => ({
          id: `absence-${absence.id}`,
          start: new Date(absence.date),
          end: new Date(absence.date),
          allDay: true,
          type: 'absence',
        }));

        const leaveRequestsResponse = await axios.get(`/api/leave-requests/employee/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const leaveRequests = leaveRequestsResponse.data
          .filter(request => request.status !== 'refusé')
          .map(request => ({
            id: `leave-${request.id}`,
            start: new Date(request.startDate),
            end: new Date(request.endDate),
            allDay: true,
            type: 'leave',
            status: request.status,
          }));

        const combinedEvents = [...absences, ...leaveRequests];
        setEvents(combinedEvents);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const eventPropGetter = (event) => {
    let style = {
      backgroundColor: 'gray', // Default color
      color: 'white', // Text color
      borderRadius: '0px', // Rounded corners
      border: 'none', // No border
    };

    if (event.type === 'absence') {
      style.backgroundColor = '#feffaa'; // Yellow for absences
      style.color = '#000000'; // Black text
    } else if (event.type === 'leave') {
      switch (event.status) {
        case 'approuvé':
          style.backgroundColor = '#89d69f'; // Green for approved leave
          break;
        case 'En attente':
          style.backgroundImage = 'repeating-linear-gradient(50deg, transparent, #ffffff 5px, #89d69f 10px, #89d69f 15px)'; // Green with lines for pending leave
          break;
        default:
      }
    }

    return { style };
  };

  return (
    <DashboardLayout>
      <Container className="mt-4">
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
        <Card>
          <Card.Body>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              views={['month']}
              defaultView={view}
              onView={view => setView(view)}
              min={new Date(new Date().getFullYear(), 0, 1)}
              max={new Date(new Date().getFullYear() + 1, 0, 1)}
              eventPropGetter={eventPropGetter}
              components={{
                month: {
                  dateHeader: ({ label }) => (
                    <div className="rbc-date-cell">
                      <span>{label}</span>
                    </div>
                  ),
                },
              }}
              messages={messages} // Ajout des messages personnalisés
            />
          </Card.Body>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

export default SuivieAbsences;









