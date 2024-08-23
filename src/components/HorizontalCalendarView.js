import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * Composant pour afficher un calendrier horizontal avec les absences et congés des employés
 * 
 * @param {Object[]} usersData - Les données des utilisateurs, incluant les absences et demandes de congés
 * @param {Date} currentMonth - Le mois actuellement affiché dans le calendrier
 * @returns {JSX.Element} Le calendrier horizontal affichant les absences et congés
 */
const HorizontalCalendarView = ({ usersData, currentMonth }) => {
  // Détermine le début et la fin du mois courant
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  // Crée un tableau de tous les jours du mois courant
  const days = eachDayOfInterval({ start, end });

  /**
   * Détermine le style d'un événement en fonction de son type et statut
   * 
   * @param {Object} event - L'événement à styliser
   * @returns {Object} Le style CSS à appliquer à l'événement
   */
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
      style.color = 'transparent'; // Pas de texte pour les congés
    }
  
    return style;
  };

  /**
   * Vérifie si un événement couvre un jour donné
   * 
   * @param {Object} event - L'événement à vérifier
   * @param {Date} day - Le jour à vérifier
   * @returns {boolean} Vrai si l'événement couvre le jour, sinon faux
   */
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
        {/* Entête du calendrier avec les jours du mois */}
        <div className="horizontal-calendar-header">
          <div className="horizontal-calendar-header-employee">Employés</div>
          {days.map(day => (
            <div key={day} className="horizontal-calendar-header-cell">
              {format(day, 'd')} {/* Affiche le jour du mois */}
            </div>
          ))}
        </div>
        {/* Lignes du calendrier pour chaque employé */}
        {usersData.map(userData => (
          <div key={userData.user.id} className="horizontal-calendar-row">
            <div className="horizontal-calendar-user-cell">
              {userData.user.nom} {userData.user.prenom} {/* Nom et prénom de l'employé */}
            </div>
            {days.map(day => {
              // Filtre les événements de l'employé pour le jour actuel
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
