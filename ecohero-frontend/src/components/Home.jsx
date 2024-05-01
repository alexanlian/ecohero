import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
function Home() {
    const { t } = useTranslation();
    useEffect(()=>{
        const link = document.createElement('link');
        link.href = 'https://cdn.jsdelivr.net/gh/alexanlian/ecohero@main/ecohero-frontend/src/styles/Home.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    
        return () => {
          document.head.removeChild(link); 
        }
    },[]);
    return (
        <div className="home">
            <h2>{t('welcome')}</h2>
            <p>{t('mission')}.</p>
        </div>

    );
}

export default Home;
