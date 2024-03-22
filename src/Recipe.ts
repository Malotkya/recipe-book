import {Router} from "express";
import Database, {Collection} from "./util/Database";
import createHttpError from "http-errors";

const db:Database = new Database("data");
const col:Collection = db.collection("Recipies");
export const RecipeAPI:Router = Router();

RecipeAPI.get("/:id", (req, res, next)=>{
    col.getDocument(req.params.id).then(doc=>{
        console.log(doc);

        if(doc) {
            res.json(doc.data);
            next();
        } else {
            next(createHttpError(404));
        }
    });
});