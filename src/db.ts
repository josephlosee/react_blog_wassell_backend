
import { Db, MongoClient } from "mongodb";

let db: Db;

async function connectToDb(callback: Function) {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    await client.connect();

    db = client.db('react-blog-db');
    callback();
}

export {
    db,
    connectToDb
}