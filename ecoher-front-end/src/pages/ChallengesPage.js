import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import "../styles/ChallengesPage.css"
import { useTranslation } from 'react-i18next';
function ChallengesPage() {
    const [challenges, setChallenges] = useState([]);
    const [selectedChallenge, setSelectedChallenge] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }
    
        console.log("Using token for authorization:", token);
        fetch('http://localhost:3001/challenges', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            setChallenges(data);
            console.log(data);
        })
        .catch(error => console.error('Error fetching challenges:', error));
    }, []);
    

    const handleCompleteTask = (challengeId) => {
        fetch(`http://localhost:3001/challenges/complete/${challengeId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(message => {
            alert(message.message);
            setChallenges(challenges.filter(challenge => challenge.challenge_id !== challengeId));
        })
        .catch(error => console.error('Error completing challenge:', error));
    };
    const {t} = useTranslation();
    return (
        <div>
            <Navbar/>
            <h1>{t('challenges')}</h1>
            <div className="challenges-container">
                {challenges.map(challenge => (
                    <div key={challenge.challenge_id} onClick={() => setSelectedChallenge(challenge)}>
                        <h2>{challenge.challenge_title}</h2>
                        <p>{challenge.challenge_description}</p>
                        {selectedChallenge && selectedChallenge.challenge_id === challenge.challenge_id &&
                            (challenge.challenge_type === 'quiz' ? <QuizForm challenge={challenge} />
                             : challenge.challenge_type === 'upload' ? <UploadForm challenge={challenge} />
                             : <button onClick={() => handleCompleteTask(challenge.challenge_id)}>{t('mark_as_done')}</button>
                            )
                        }
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChallengesPage;

function QuizForm({ challenge }) {
    const [questions, setQuestions] = useState([]);
    const {t} = useTranslation();
    useEffect(() => {
        fetch(`http://localhost:3001/challenges/${challenge.challenge_id}/questions`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(setQuestions)
        .catch(error => console.error('Error fetching questions:', error));
    }, [challenge.challenge_id]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const answers = questions.map(question => ({
            questionId: question.question_id,
            answer: formData.get(`answer_${question.question_id}`)
        }));

        fetch(`http://localhost:3001/challenges/submit-quiz/${challenge.challenge_id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answers })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === 'Quiz completed successfully!') {
                // Optionally update UI or state
            }
        })
        .catch(error => console.error('Error submitting quiz:', error));
    };
    
    return (
        <form onSubmit={handleSubmit}>
            {questions.map((question, index) => (
                <div key={index}>
                    <p>{question.question_text}</p>
                    {question.options.map((option, optIndex) => (
                        <div key={optIndex}>
                            <input 
                                type="radio" 
                                id={`option_${optIndex}_${question.question_id}`} 
                                name={`answer_${question.question_id}`} 
                                value={option} 
                                required
                            />
                            <label htmlFor={`option_${optIndex}_${question.question_id}`}>{option}</label>
                        </div>
                    ))}
                </div>
            ))}
            <button type="submit">{t('submit_quiz')}</button>
        </form>
    );
}


function UploadForm({ challenge }) {
    const {t} = useTranslation();

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        formData.append('challengeId', challenge.challenge_id);

        fetch(`http://localhost:3001/challenges/upload/${challenge.challenge_id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error('Error uploading file:', error));
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" name="file" required />
            <button type="submit">{t('upload_file')}</button>
        </form>
    );
}
