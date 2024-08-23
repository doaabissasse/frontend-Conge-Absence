import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form } from 'react-bootstrap';
import AdminLayout from './adminLayout';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [role, setRole] = useState('USER'); // Default to 'USER'

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/employees', {
                    params: { role, search: searchTerm } // Pass search term and role
                });
                setEmployees(response.data);
                setFilteredEmployees(response.data); // Initialize filtered list with all employees
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [searchTerm, role]);

    useEffect(() => {
        // Filter employees based on search term
        const result = employees.filter(employee =>
            employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEmployees(result);
    }, [searchTerm, employees]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <AdminLayout>
            <div className="container mt-4">
                <h2 className="mb-4">Liste des Employés</h2>
                <Form className="mb-4">
                    <Form.Group controlId="search">
                        <Form.Control
                            type="text"
                            placeholder="Rechercher par nom, prénom ou email"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </Form.Group>
                </Form>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>CIN</th>
                            <th>Email</th>
                            <th>Département</th>
                            <th>Poste</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((employee) => (
                            <tr key={employee.id}>
                                <td>{employee.id}</td>
                                <td>{employee.nom} {employee.prenom}</td>
                                <td>{employee.cin}</td>
                                <td>{employee.email}</td>
                                <td>{employee.departement}</td>
                                <td>{employee.poste}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </AdminLayout>
    );
};

export default EmployeeList;

