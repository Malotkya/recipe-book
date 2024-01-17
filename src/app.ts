import express, {Application} from "express";
import logger from 'morgan';
import path from 'path';

export const app: Application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res)=>{
    res.send("Hello World!");
});