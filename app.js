const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Shruti@1512',
    database: 'blog_creation',
    port: 3306
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Route to render the main page
app.get('/', (req, res) => {
    db.query('SELECT * FROM blog_posts', (err, blogs) => {
        if (err) throw err;
        res.render('index', { blogs });
    });
});

// API to create a new blog post
app.post('/api/create', (req, res) => {
    const { title, author, content } = req.body;
    db.query('INSERT INTO blog_posts (title, author, content) VALUES (?, ?, ?)',
        [title, author, content], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ id: result.insertId, title, author, content });
    });
});

// API to view a blog post with comments
app.get('/api/blog/:id', (req, res) => {
    const blogId = req.params.id;
    db.query('SELECT * FROM blog_posts WHERE id = ?', [blogId], (err, blogResult) => {
        if (err) return res.status(500).json({ error: err });
        db.query('SELECT * FROM comments WHERE blog_id = ?', [blogId], (err, comments) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ blog: blogResult[0], comments });
        });
    });
});

// API to add a comment to a blog post
app.post('/api/blog/:id/comment', (req, res) => {
    const blogId = req.params.id;
    const { content } = req.body;
    db.query('INSERT INTO comments (blog_id, content) VALUES (?, ?)', [blogId, content], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ id: result.insertId, content });
    });
});

// API to delete a specific comment
app.delete('/api/comment/:id', (req, res) => {
    const commentId = req.params.id;
    db.query('DELETE FROM comments WHERE id = ?', [commentId], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Comment deleted' });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
