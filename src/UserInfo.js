import React, { useEffect, useState } from 'react';

const UserInfo = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>User Information</h2>
            <p>Name: {user.nom} {user.prenom}</p>
            <p>Email: {user.email}</p>
            <p>Age: {user.age}</p>
            <p>Sexe: {user.sexe}</p>
            <p>Adresse: {user.adresse.rue}, {user.adresse.ville}, {user.adresse.code_postal}, {user.adresse.pays}</p>
            <p>Téléphone: {user.telephone}</p>
            <p>Poste: {user.poste}</p>
            <p>Département: {user.departement}</p>
            <p>Date d'embauche: {new Date(user.date_embauche).toLocaleDateString()}</p>
            <p>Salaire: {user.salaire}</p>
            <h3>Solde des congés:</h3>
            <p>Payés: {user.solde_conges.payes}</p>
            <p>Non payés: {user.solde_conges.non_payes}</p>
            <p>Maladie: {user.solde_conges.maladie}</p>
            <h3>Congés:</h3>
            {user.conges.map((conge, index) => (
                <div key={index}>
                    <p>Type: {conge.type}</p>
                    <p>Date début: {new Date(conge.date_debut).toLocaleDateString()}</p>
                    <p>Date fin: {new Date(conge.date_fin).toLocaleDateString()}</p>
                    <p>Statut: {conge.statut}</p>
                </div>
            ))}
        </div>
    );
};

export default UserInfo;
