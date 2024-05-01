import Home from "../components/Home";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import "../styles/HomePage.css";
import {React, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';


function HomePage(){
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token'); // Retrieve the token from local storage
        if (!token) {
            navigate('/login'); // Redirect to login page if no token is found
        }
    }, [navigate]);
    const { t } = useTranslation();
    return(
        <div>
            <Navbar />
            <Home />
            <div className="card-grid">
                <Card title={t('fact1_title')} description={t('fact1')}/>
                <Card title={t('fact2_title')} description={t('fact2')}/>
                <Card title={t('fact3_title')} description={t('fact3')}/>
                <Card title={t('fact4_title')} description={t('fact4')}/>
                <Card title={t('fact5_title')} description={t('fact5')}/>
                <Card title={t('fact6_title')} description={t('fact6')}/>
            </div>
        </div>
    )
}

export default HomePage;