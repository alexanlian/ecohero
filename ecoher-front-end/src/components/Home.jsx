import React from 'react';
import '../styles/Home.css';
import { useTranslation } from 'react-i18next';
function Home() {
    const { t } = useTranslation();

    return (
        <div className="home">
            <h2>{t('welcome')}</h2>
            <p>{t('mission')}.</p>
        </div>

    );
}

export default Home;
