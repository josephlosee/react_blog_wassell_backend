import express from "express";

let articlesInfo = [
    {
        name: 'learn-react',
        upvotes: 0,
        comments: [],
    },
    {
        name: 'learn-node',
        upvotes: 0,
        comments: [],
    },
    {
        name: 'mongodb',
        upvotes: 0,
        comments: [],
    },
]

const listeningPort = 8000;

const app = express();

app.use(express.json()); // Middleware!

app.put('/api/articles/:name/upvote', (req, res) => {
    const {name} = req.params;
    const article = articlesInfo.find(article => article.name === name);
    if (article) {
        article.upvotes += 1;
        res.send(`The ${name} article now has ${article.upvotes}  upvotes.`)
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