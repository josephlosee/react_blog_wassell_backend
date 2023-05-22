import express from "express";
const listeningPort = 8000;
const app = express();

app.get('/hello', (req, res)=>{
    res.send('Hello!');
});

app.listen(listeningPort, () => {
    console.log(`Server is listening on port ${listeningPort}`);
});