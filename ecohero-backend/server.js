const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // configure storage options

const db = require('./db');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(require('helmet')());
app.use(require('cors')({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// JWT Secret Key
const jwtSecret = 'yourJwtSecret';

// Helper function to authenticate and authorize
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: "No authorization header provided" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};



// Challenges endpoints
app.get('/challenges', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        // Fetch all challenges that the user has not completed
        const [challenges] = await db.query(`
            SELECT c.* FROM challenges c
            WHERE NOT EXISTS (
                SELECT 1 FROM submissions s
                WHERE s.challenge_id = c.challenge_id AND s.user_id = ?
            )
        `, [userId]);
        res.json(challenges);
    } catch (error) {
        console.error('Error fetching challenges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/challenges/:id/questions', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [questions] = await db.query('SELECT question_id, question_text, options FROM questions WHERE challenge_id = ?', [id]);
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/challenges/submit-quiz/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; // challenge ID
    const userId = req.user.id;  // Assuming user id is stored in JWT
    const answers = req.body.answers; // Array of { questionId, answer }

    try {
        const [correctAnswers] = await db.query('SELECT question_id, correct_answer FROM questions WHERE challenge_id = ?', [id]);
        const isCorrect = answers.every(answer => {
            const correct = correctAnswers.find(ca => ca.question_id === answer.questionId);
            return correct && correct.correct_answer === answer.answer;
        });

        if (!isCorrect) {
            return res.status(400).json({ message: 'Not all answers are correct. Please try again.' });
        }

        // Insert submission if all answers are correct
        await db.query('INSERT INTO submissions (user_id, challenge_id, submission_type, submission_content) VALUES (?, ?, "quiz", ?)',
                       [userId, id, JSON.stringify(answers)]);

        // Check if a reward already exists for this challenge to avoid duplicates
        const [existingReward] = await db.query('SELECT * FROM rewards WHERE user_id = ? AND challenge_id = ?', [userId, id]);
        if (existingReward.length === 0) {
            // Fetch the challenge title for the reward title
            const [challenge] = await db.query('SELECT challenge_title FROM challenges WHERE challenge_id = ?', [id]);
            const challengeTitle = challenge[0].challenge_title;

            // Insert a new reward
            await db.query('INSERT INTO rewards (user_id, challenge_id, reward_title, reward_description) VALUES (?, ?, ?, ?)',
                           [userId, id, `Badge for completion: ${challengeTitle}`, `Awarded for completing the challenge: ${challengeTitle}`]);
        }

        res.json({ message: 'Quiz completed successfully and reward granted!' });
    } catch (error) {
        console.error('Error submitting quiz answers or granting reward:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.post('/challenges/complete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;  // Assuming user id is stored in JWT
    try {
        // Check if the challenge is already completed by the user
        const [existing] = await db.query('SELECT * FROM submissions WHERE user_id = ? AND challenge_id = ?', [userId, id]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Challenge already completed' });
        }

        // Add submission (simplified as completion)
        await db.query('INSERT INTO submissions (user_id, challenge_id, submission_type, submission_content) VALUES (?, ?, "complete", "completed")', [userId, id]);

        // Optionally add a reward
        await db.query('INSERT INTO rewards (user_id, challenge_id, reward_title, reward_description) VALUES (?, ?, "Completion Badge", "Awarded for completing challenge ID: ' + id + '")', [userId, id]);

        res.json({ message: 'Challenge completed and reward granted' });
    } catch (error) {
        console.error('Error completing challenge:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/challenges/upload/:id', authenticateToken, upload.single('file'), async (req, res) => {
    const { id } = req.params; // challenge ID
    const userId = req.user.id;
    const file = req.file;

    try {
        // First, insert the file upload submission
        await db.query('INSERT INTO submissions (user_id, challenge_id, submission_type, submission_content) VALUES (?, ?, "file", ?)',
                       [userId, id, file.path]);

        // Check if a reward already exists for this challenge to avoid duplicates
        const [existingReward] = await db.query('SELECT * FROM rewards WHERE user_id = ? AND challenge_id = ?', [userId, id]);
        if (existingReward.length > 0) {
            return res.status(409).json({ message: 'Reward already granted for this challenge' });
        }

        // Fetch the challenge title for the reward description
        const [challengeData] = await db.query('SELECT challenge_title FROM challenges WHERE challenge_id = ?', [id]);
        const challengeTitle = challengeData[0].challenge_title;

        // Create a reward with the challenge title in the description
        await db.query('INSERT INTO rewards (user_id, challenge_id, reward_title, reward_description) VALUES (?, ?, ?, ?)',
                       [userId, id, `Badge for completion: ${challengeTitle}`, `Awarded for completing the challenge: ${challengeTitle}`]);

        res.json({ message: 'File uploaded successfully, challenge completed and reward granted', filePath: file.path });
    } catch (error) {
        console.error('Error uploading file or granting reward:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// Rewards endpoints
app.get('/rewards', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const [rewards] = await db.query(`
            SELECT r.*, c.challenge_title
            FROM rewards r
            JOIN challenges c ON r.challenge_id = c.challenge_id
            WHERE r.user_id = ?
        `, [userId]);
        res.json(rewards.map(reward => ({
            ...reward,
            challengeTitle: reward.challenge_title
        })));
    } catch (error) {
        console.error('Error fetching rewards:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Login route
app.post('/login', [
    check('username').isEmail(),
    check('password').notEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT user_id, password FROM users WHERE email = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.user_id }, jwtSecret, { expiresIn: '7d' });
        res.json({ token });  // Send the token to the client
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// Register route
app.post('/register', [
    check('username').isEmail(),
    check('password').isLength({ min: 6 }),
], async (req, res) => {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
        const [existingUsers] = await db.query('SELECT user_id FROM users WHERE email = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).send({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});