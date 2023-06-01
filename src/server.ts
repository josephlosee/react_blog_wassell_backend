import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import express, { Request } from "express";
import { db, connectToDb } from "./db";
import { DecodedIdToken } from 'firebase-admin/auth';

import * as url from 'url';

const __fileName = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MyBlogRequest extends Request {
    user?: DecodedIdToken
}

const listeningPort = 8000;

// const credentials = JSON.parse(fs.readFileSync('../credentials.json').to);
const credentials = JSON.parse(fs.readFileSync('./credentials.json').toString());

admin.initializeApp({credential: admin.credential.cert(credentials)});

const app = express();

app.use(express.json()); // Middleware!
app.use(express.static(path.join(__dirname, '../client')))

app.use(async (req: MyBlogRequest, res, next) => {
    const {authtoken } = req.headers;
    if (authtoken){
        try {
            req.user = await admin.auth().verifyIdToken(authtoken as string);
        } catch(e) {
            return res.sendStatus(400);
        }
        
    }   
    next(); 
});

app.get('/api/articles/:name', async (req:MyBlogRequest, res) => {
    const {name} = req.params;
    const uid = req.user?.sub || '';
    const article = await db.collection('articles').findOne({name})

    if (article) {
        res.json(article);
        const upvoteIds = article.upvoteIds || [];
        article.canUpvote = uid && !upvoteIds.includes(uid);
    } else {
        res.status(404).send(`The '${name}' article was not found.`)
    }
});


app.use((req: MyBlogRequest, res, next) => {
    if(req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
})

app.put('/api/articles/:name/upvote', async (req: MyBlogRequest, res) => {
    const {name} = req.params;
    const uid = req.user?.sub || '';
    const article = await db.collection('articles').findOne({name});


    if (article) {
        const upvoteIds = article.upvoteIds || [];
        const canUpvote = uid && !upvoteIds.includes(uid);

        if (canUpvote){
            await db.collection('articles').updateOne(
                {name}, 
                {
                    $inc: {upvotes: 1}, 
                    $push: {upvoteIds: uid}
                }); 
            // I'm not familiar with mongodb so the query here is saying "find an article with this name, then increase ($inc) it's upvotes by 1, and add the user id to the upvoteIds"
        
            const updatedArticle = await db.collection('articles').findOne({name});
            res.json(updatedArticle);
        } else {
            res.sendStatus(400);
        }
        
    } else {
        res.send(`That article doesn't exist!`);
    }
        
    
});

app.post('/api/articles/:name/comments', async (req:MyBlogRequest, res) => {
    const {name} = req.params;
    const { text } = req.body;
    const { email } = req.user!;

    // console.log(`Comment ${text} posted by ${email}`);gi
    await db.collection('articles').updateOne({name}, {$push: {comments: {postedBy: email, text}}}); 

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

