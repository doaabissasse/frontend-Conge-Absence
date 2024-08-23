import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './adminLayout';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import '../componentsSCC/Dashboard.css'; // Import custom CSS

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
        // Fetch employee count by role (Example role)
        const role = 'USER';
        const employeeCountResponse = await axios.get('http://localhost:8080/api/dashboard/employee-count', {
          params: { role }
        });
        setEmployeeCount(employeeCountResponse.data);

        // Fetch leave request counts
        const leaveRequestCountsResponse = await axios.get('http://localhost:8080/api/dashboard/leave-request-count');
        setLeaveRequestCounts(leaveRequestCountsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h1 className="mb-4">Dashboard</h1>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card card-border-success mb-3">
              <div className="card-header card-header-success">Employee Count</div>
              <div className="card-body">
                <p className="card-text"> {employeeCount}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card card-border-success mb-3">
              <div className="card-header card-header-success">Leave Request Counts</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="card card-border-success mb-3">
                      <div className="card-header bg-success text-white">Payé</div>
                      <div className="card-body">
                        <p className="card-text"> {leaveRequestCounts['payé']}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card card-border-warning mb-3">
                      <div className="card-header bg-warning text-white">Non Payé</div>
                      <div className="card-body">
                        <p className="card-text"> {leaveRequestCounts['non_payé']}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card card-border-danger mb-3">
                      <div className="card-header bg-danger text-white">Maladie</div>
                      <div className="card-body">
                        <p className="card-text"> {leaveRequestCounts['maladie']}</p>
                      </div>
                    </div>
                  </div>
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
