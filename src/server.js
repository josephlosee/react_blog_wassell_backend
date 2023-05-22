import express from "express";
const listeningPort = 8000;

const app = express();

app.use(express.json()); // Middleware!



app.post('/hello', (req, res)=>{
    console.log(req.body);
    res.send(`Hello, ${req.body.name}!`);
});

app.get('/hello/:name', (req, res) => {
    // const name = req.params.name;
    const {name} = req.params;
    res.send(`Hello, ${name}, how odd to include it as a URL Parameter!`);
} )

app.listen(listeningPort, () => {
    console.log(`Server is listening on port ${listeningPort}`);
});