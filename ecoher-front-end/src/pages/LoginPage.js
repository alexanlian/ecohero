import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import { useTranslation } from 'react-i18next';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            navigate("/");  // Redirect to homepage if already logged in
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json(); // Parse JSON response
                localStorage.setItem('token', data.token); // Store token in local storage
                navigate("/"); // Redirect to the homepage
            } else {
                setError('Login failed, please check your username and password');
            }
        } catch (error) {
            setError('Failed to connect to the server');
            console.error('Error:', error);
        }
    };
    const {t} = useTranslation();
    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>{t('login')}</h2>
                <div className="form-group">
                    <label htmlFor="email">{t('email')}</label>
                    <input
                        type="email"
                        id="email"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">{t('password')}</label>
                    <input
                        type="password"
                        id="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="login-button">{t('login_button')}</button>
                {error && <p className="error">{error}</p>}
                <p className="register-message">
                   {t('dont_have_account')} <Link to="/register">{t("register_button")}</Link>
                </p>
            </form>
        </div>
    );
}

export default LoginPage;
