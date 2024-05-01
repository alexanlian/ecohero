import React from 'react';
import '../styles/Card.css'; 

function Card(props) {
    return (
        <div className="card">
            <h3>{props.title}</h3>
            <p>{props.description}</p>
            <p>{props.type}</p>
        </div>
    );
}

export default Card;
