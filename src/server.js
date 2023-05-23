import express from "express";
import { MongoClient } from "mongodb";
// let articlesInfo = [
//     {
//         name: 'learn-react',
//         upvotes: 0,
//         comments: [],
//     },
//     {
//         name: 'learn-node',
//         upvotes: 0,
//         comments: [],
//     },
//     {
//         name: 'mongodb',
//         upvotes: 0,
//         comments: [],
//     },
// ]

const listeningPort = 8000;

const app = express();

app.get('/api/articles/:name', async (req, res) => {
    const {name} = req.params;
    const client = new MongoClient('mongodb://127.0.0.1:27017');

    await client.connect();

    const db = client.db('react-blog-db');
    const article = await db.collection('articles').findOne({name})

    if (article) {
        res.json(article);
    } else {
        res.status(404).send(`The '${name}' article was not found.`)
    }
});

app.use(express.json()); // Middleware!

app.put('/api/articles/:name/upvote', async (req, res) => {
    const {name} = req.params;
    // const article = articlesInfo.find(article => article.name === name);

    const client = new MongoClient('mongodb://127.0.0.1:27017');
    await client.connect()

    const db = client.db('react-blog-db');
    await db.collection('articles').updateOne({name}, {$inc: {upvotes: 1}}); 
    // I'm not familiar with mongodb so the query here is saying "find an article with this name, then increase ($inc) it's upvotes by 1"

    const article = await db.collection('articles').findOne({name});
    
    
    if (article) {
        res.send(`The ${name} article now has ${article.upvotes}  upvotes.`);
    } else {
        res.send(`That article doesn't exist!`);
    }
        
    
});

app.post('/api/articles/:name/comments', (req, res) => {
    const {name} = req.params;
    const {postedBy, text} = req.body;

    const article = articlesInfo.find(article => article.name === name);
    if (article) {
        article.comments.push({postedBy, text});
        res.send(`The ${name} article now has a comment starting with "${text.substring(0,10)}..." by ${postedBy}.`)
    } else {
        res.send(`That article doesn't exist!`);
    }
});


app.listen(listeningPort, () => {
    console.log(`Server is listening on port ${listeningPort}`);
});