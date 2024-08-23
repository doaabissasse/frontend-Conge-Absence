import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const HorizontalCalendarView = ({ usersData, currentMonth }) => {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  const getEventStyle = (event) => {
    let style = {
      backgroundColor: 'gray', 
      color: 'white', 
      borderRadius: '4px',
      margin: '2px',
      padding: '2px',
    };
  
    if (event.type === 'absence') {
      style.backgroundColor = '#feffaa'; // Jaune pour les absences
      style.color = '#000000'; // Texte noir
    } else if (event.type === 'leave') {
      switch (event.status) {
        case 'approuvé':
          style.backgroundColor = '#89d69f'; // Vert pour les congés approuvés
          break;
        case 'En attente':
          style.backgroundImage = 'repeating-linear-gradient(50deg, transparent, #ffffff 5px, #89d69f 10px, #89d69f 15px)'; // Vert avec des lignes pour les congés en attente
          break;
        default:
          break;
      }
      style.color = 'transparent';
    }
  
    return style;
  };

  const eventCoversDay = (event, day) => {
    // Normaliser les heures au début de la journée pour éviter les problèmes de comparaisons de date
    const normalizedStart = startOfDay(event.start);
    const normalizedEnd = endOfDay(event.end);
    const normalizedDay = startOfDay(day);

    return isWithinInterval(normalizedDay, { start: normalizedStart, end: normalizedEnd });
  };

  return (
    <div className="calendar-container">
      <div className="horizontal-calendar">
        <div className="horizontal-calendar-header">
          <div className="horizontal-calendar-header-employee">Employés</div>
          {days.map(day => (
            <div key={day} className="horizontal-calendar-header-cell">
              {format(day, 'd')}
            </div>
          ))}
        </div>
        {usersData.map(userData => (
          <div key={userData.user.id} className="horizontal-calendar-row">
            <div className="horizontal-calendar-user-cell">
              {userData.user.nom} {userData.user.prenom}
            </div>
            {days.map(day => {
              const dayEvents = userData.absences.concat(userData.leaveRequests).filter(event =>
                eventCoversDay(event, day)
              );

              return (
                <div key={day} className="horizontal-calendar-cell">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="horizontal-calendar-event"
                      style={getEventStyle(event)}
                    >
                      {/* Aucune condition d'affichage de texte pour les absences ou congés en attente */}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalCalendarView;

