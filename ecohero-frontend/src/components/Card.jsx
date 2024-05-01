import React, { useEffect } from 'react';
import '../styles/Card.css'; 

function Card(props) {
    useEffect(()=>{
        const link = document.createElement('link');
        link.href = 'https://cdn.jsdelivr.net/gh/alexanlian/ecohero@main/ecohero-frontend/src/styles/Card.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    
        return () => {
          document.head.removeChild(link); 
        }
    },[]);
    return (
        <div className="card">
            <h3>{props.title}</h3>
            <p>{props.description}</p>
            <p>{props.type}</p>
        </div>
    );
}

export default Card;
