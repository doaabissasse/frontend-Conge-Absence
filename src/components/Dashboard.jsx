import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './adminLayout';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../componentsSCC/Dashboard.css'; // Assurez-vous d'importer le CSS

// Register the components needed by Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [leaveRequestCounts, setLeaveRequestCounts] = useState({
    payé: 0,
    non_payé: 0,
    maladie: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const role = 'USER';
        const employeeCountResponse = await axios.get('http://localhost:8080/api/dashboard/employee-count', {
          params: { role }
        });
        setEmployeeCount(employeeCountResponse.data);

        const leaveRequestCountsResponse = await axios.get('http://localhost:8080/api/dashboard/leave-request-count');
        setLeaveRequestCounts(leaveRequestCountsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const data = {
    labels: ['Payé', 'Non Payé', 'Maladie'],
    datasets: [
      {
        label: 'Leave Requests',
        data: [leaveRequestCounts['payé'], leaveRequestCounts['non_payé'], leaveRequestCounts['maladie']],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        borderColor: ['#1e7e34', '#e0a800', '#c82333'],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return tooltipItem.label + ': ' + tooltipItem.raw;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Type de Congé',
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Nombre de Congés',
          font: {
            size: 14,
          },
        },
        beginAtZero: true
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h1 className="mb-4">Dashboard</h1>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card text-center mb-3 border-success">
              <div className="card-body">
                <i className="fas fa-users fa-3x text-success"></i>
                <h4 className="card-title mt-3">Employee Count</h4>
                <p className="card-text display-4">{employeeCount}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card mb-3 border-primary">
              <div className="card-body">
                <h4 className="card-title mb-4">Les demandes de congés</h4>
                <div className="chart-container">
                  <Bar data={data} options={options} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
