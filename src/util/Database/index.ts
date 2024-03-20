import path from "path";
import fs from "fs";
import Collection from "./Collection";

const HOME:string = process.cwd();

export default class Database{
    private _directory:string;

    constructor(target:string) {
        if(typeof target !== "string")
            throw new TypeError("Target must be a string!");

        this._directory = path.join(HOME, target);

        if(fs.existsSync(this._directory)) {
            if(fs.statSync(this._directory).isFile())
                throw new Error("Target not valid!");
        } else {
            fs.mkdirSync(this._directory, {recursive: true});
        }
    }

    collection(name:string):Collection{
        const collection:string = path.join(this._directory, name);

        if(fs.existsSync(collection)){
            if(fs.statSync(this._directory).isDirectory())
                throw new Error("Collection name is not valid!");
        } else {
            fs.writeFileSync(collection, "");
        }

        return new Collection(collection);
    }
}