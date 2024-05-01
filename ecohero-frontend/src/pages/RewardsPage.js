import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../styles/RewardsPage.css';
import { useTranslation } from 'react-i18next';

function RewardsPage() {
    const [rewards, setRewards] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/rewards', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => setRewards(data))
        .catch(error => console.error('Error fetching rewards:', error));
    }, []);
    const {t} = useTranslation();
    return (
        <div>
            <Navbar/>
            <h1>{t('rewards')}</h1>
            <div className="rewards-container">
                {rewards.map(reward => (
                    <div key={reward.reward_id} className="reward-card">
                        <h3>{reward.challengeTitle}</h3>
                        <p>{reward.reward_description}</p>
                        <span>{t('reward_received_on')} {new Date(reward.reward_date).toLocaleDateString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RewardsPage;
