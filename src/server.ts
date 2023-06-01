import fs from 'fs';
import admin from 'firebase-admin';
import express from "express";
import { db, connectToDb } from "./db";

const listeningPort = 8000;

// const credentials = JSON.parse(fs.readFileSync('../credentials.json').to);
const credentials = JSON.parse(fs.readFileSync('../credentials.json').toString());

admin.initializeApp({credential: admin.credential.cert(credentials)});

const app = express();
app.use(express.json()); // Middleware!

app.get('/api/articles/:name', async (req, res) => {
    const {name} = req.params;
    
    const article = await db.collection('articles').findOne({name})

    if (article) {
        res.json(article);
    } else {
        res.status(404).send(`The '${name}' article was not found.`)
    }
});

app.put('/api/articles/:name/upvote', async (req, res) => {
    const {name} = req.params;

    await db.collection('articles').updateOne({name}, {$inc: {upvotes: 1}}); 
    // I'm not familiar with mongodb so the query here is saying "find an article with this name, then increase ($inc) it's upvotes by 1"

    const article = await db.collection('articles').findOne({name});
    
    
    if (article) {
        res.json(article);
    } else {
        res.send(`That article doesn't exist!`);
    }
        
    
});

app.post('/api/articles/:name/comments', async (req, res) => {
    const {name} = req.params;
    const {postedBy, text} = req.body;

    await db.collection('articles').updateOne({name}, {$push: {comments: {postedBy, text}}}); 

    const article = await db.collection('articles').findOne({name})

    if (article) {
        res.json(article);
    } else {
        res.send(`That article doesn't exist!`);
    }
});

connectToDb(() => {
    console.log('Connected to database!');
    app.listen(listeningPort, () => {
        console.log(`Server is listening on port ${listeningPort}`);
    });
} )

