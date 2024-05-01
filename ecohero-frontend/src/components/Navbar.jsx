import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

function Navbar() {
    const navigate = useNavigate();
    
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
    useEffect(() => {
        if (!token) {
            navigate('/login'); // Redirect to login page if no token is found
        }
    }, [navigate, token]); // Include navigate in the dependency array to ensure it's updated if needed

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/login'); // Redirect to the login page
    };
    const {t} = useTranslation();
    useEffect(()=>{
        const link = document.createElement('link');
        link.href = 'https://cdn.jsdelivr.net/gh/alexanlian/ecohero@main/ecohero-frontend/src/styles/Navbar.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    
        return () => {
          document.head.removeChild(link); 
        }
    },[]);
    return (
        <nav>
            <h1>Eco Hero</h1>
            <ul>
                <li><LanguageSwitcher /></li>
                <li><Link to="/">{t('homepage')}</Link></li>
                <li><Link to="/challenges">{t('challenges')}</Link></li>
                <li><Link to="/rewards">{t('rewards')}</Link></li>
                <li><Link onClick={handleLogout}>{t('logout')}</Link></li>
            </ul>
        </nav>
    );
}

export default Navbar;
