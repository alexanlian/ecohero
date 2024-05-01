import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function RegistrationPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(()=>{
        const link = document.createElement('link');
        link.href = 'https://cdn.jsdelivr.net/gh/alexanlian/ecohero@main/ecohero-frontend/src/styles/RegistrationPage.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    
        return () => {
          document.head.removeChild(link); 
        }
    },[]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }),
            });

            if (response.ok) {
                // Registration was successful
                navigate('/login'); // Redirect to the login page
            } else {
                // Handle errors (e.g., user already exists)
                alert('Failed to register. User may already exist.');
            }
        } catch (error) {
            console.error('Failed to register:', error);
        }
    };
    const {t} = useTranslation();
    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Register</h2>
                <div className="form-group">
                    <label htmlFor="email">{t('email')}</label>
                    <input type="email" id="email" name="email" required
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">{t('password')}</label>
                    <input type="password" id="password" name="password" required
                        value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password">{t('confirm_password')}</label>
                    <input type="password" id="confirm-password" name="confirm-password" required />
                </div>
                <button className='register-button' type="submit">{t('register_button')}</button>
                <p className="login-message">
                    {t('already_have_account')} <Link to="/login">{t('login_button')}</Link>
                </p>
            </form>
        </div>
    );
}

export default RegistrationPage;
