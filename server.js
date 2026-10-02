const Database = require('better-sqlite3');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());

const db = new Database('diary.db');

const sqlUsers = `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL)`

const sqlEntries = `CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT, user_id INT NOT NULL)`

db.exec(sqlUsers);
db.exec(sqlEntries);

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    const saltRounds = 12;
    const senhaHash = await bcrypt.hash(password, 12);
    await db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, senhaHash);
    return res.status(201).json({ message: 'User successfully registered!' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
        return res.status(401).json({ error: 'Incorrect password' });
    }
    const token = jwt.sign(
        { id: user.id, email: user.email },
        'secret123',
        { expiresIn: '1h' }
    );

    return res.json({ token });

});

function authenticate(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
    }
    try {
        const decoded = jwt.verify(token, 'secret123');
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

app.post('/entries', authenticate, async (req, res) => {
    const { title, content } = req.body;
    await db.prepare('INSERT INTO entries (title, content, user_id) VALUES (?, ?, ?)').run(title, content, req.user.id);
    return res.status(201).json({ message: 'Entry created successfully' });
});

app.get('/entries', authenticate, (req, res) => {
    const entries = db.prepare('SELECT * FROM entries WHERE user_id = ?').all(req.user.id);
    res.status(200).json(entries);
});

app.delete('/entries/:id', authenticate, (req, res) => {
    const id = req.params.id;
    db.prepare('DELETE FROM entries WHERE id = ?').run(id);
    res.json({ message: 'Successfully deleted' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});