import { Transform, TransformCallback } from "stream";
import {DatabaseDocument} from "./Types";

type FilterFunction = (doc:DatabaseDocument)=>void|DatabaseDocument|null;

export default class FilterStream extends Transform {
    private _data:string;
    private _index:number;
    private _filter:FilterFunction;

    constructor(filter:FilterFunction) {
        super();
        this._data = "";
        this._index = 0;
        
        if(typeof filter !== "function")
            throw new TypeError("Filter must be a function!");
        this._filter = filter;
    }

    processLine(line:string, number:number){
        try {
            const test:DatabaseDocument = JSON.parse(line);
            //validate
            if(typeof test?.ref !== "string")
                throw new TypeError("Reference is not a string!");

            if(typeof test?.data !== "object")
                throw new TypeError("Data is invalid!");
            
            const update = this._filter(test);
            if(update === undefined) {
                this.push(JSON.stringify(test)+'\n');
            } else if(update){
                this.push(JSON.stringify(update)+'\n');
            }
        } catch (e:any){
            this.emit("error", new Error(`${number}: ${e.message || "An unknown Error occured!"}`));
        }
    }

    _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
        this._data += chunk.toString();

        let index = this._data.indexOf("\n");
        while (index >= 0) {

            if (index != 0) {
                
                this.processLine(this._data.slice(0, index).trim(), this._index++);
                this._data = this._data.slice(index + 1);
            }
            else {
                this._data = this._data.slice(1);
            }
            index = this._data.indexOf('\n');
        }

        callback();
    }
}