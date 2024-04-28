-- Use your specific database; make sure it's created before running this script
USE ecohero;

-- Drop existing tables if they exist to prevent errors in case you're rerunning this script
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create the challenges table
CREATE TABLE challenges (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_title VARCHAR(255) NOT NULL,
    challenge_description TEXT,
    challenge_type ENUM('quiz', 'task', 'upload') NOT NULL,
    challenge_posted_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create the questions table for quizzes
CREATE TABLE questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,  -- Using JSON type for MySQL 5.7.8 or newer
    correct_answer VARCHAR(255) NOT NULL,
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)
);

-- Create the submissions table for user responses
CREATE TABLE submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    submission_type ENUM('text', 'binary', 'file') NOT NULL,
    submission_content TEXT,  -- Can store text for quiz answers, 'true' for task completion, or file paths
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)
);

-- Insert sample users (passwords should be hashed in a real application)
INSERT INTO users (email, password) VALUES
('user1@example.com', 'password1'),
('user2@example.com', 'password2');

-- Insert sample challenges
INSERT INTO challenges (challenge_title, challenge_description, challenge_type)
VALUES 
('Reduce Single-Use Plastic', 'Avoid using single-use plastic items for a week.', 'task'),
('Public Transport Challenge', 'Use public transport at least 3 times this week instead of driving.', 'task'),
('Quiz on Recycling', 'Take a short quiz on recycling and score at least 80%.', 'quiz'),
('Community Cleanup', 'Participate in a community cleanup event and upload a photo.', 'upload');

-- Assuming the challenge_id for the quiz is 3
INSERT INTO questions (challenge_id, question_text, options, correct_answer)
VALUES 
(3, 'What items are recyclable?', '["Plastic", "Glass", "Metal", "All of the above"]', 'All of the above'),
(3, 'Which bin does paper go in?', '["Blue", "Green", "Yellow", "Black"]', 'Blue');
