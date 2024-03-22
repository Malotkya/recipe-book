import express, {Application, Request, Response} from "express";
import logger from 'morgan';
import path from 'path';
import { RecipeAPI } from "./Recipe";

const PUBLIC_DIRECTORY = path.join(__dirname, "public");

export const app: Application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/API", RecipeAPI);
app.use(express.static(PUBLIC_DIRECTORY));

app.use((req, res)=>{
    res.sendFile(path.join(PUBLIC_DIRECTORY, "index.html"));
});

app.use((err:any, req:Request, res:Response, next:Function)=>{
    const {
        status = 500,
        message = "An unknown error occured!"
    } = err;

    res.status(status).send(message);
})