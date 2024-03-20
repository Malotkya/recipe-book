import FilterStream from "./FilterStream";
import fs from "fs";
import { DatabaseDocument } from "./Types";

export default class Collection {
    private _target:string;

    constructor(target:string){
        this._target = target;
    }

    clear():Promise<void> {
        return new Promise((resolve, reject)=>{
            fs.writeFile(this._target, "", (err)=>{
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    getDocument(ref:string):Promise<DatabaseDocument|null>{
        return new Promise((resolve, reject)=>{

            fs.createReadStream(this._target)
                .on("error", reject)
            .pipe(new FilterStream((doc)=>{
                if(doc.ref === ref)
                    resolve(doc);
            })).on("close", ()=>resolve(null))
              .on("error", reject);
        });
    }

    getNewRef():Promise<string>{
        return new Promise((resolve, reject)=>{
            let largest:number = 0;

            fs.createReadStream(this._target)
                .on("error", reject)
            .pipe(new FilterStream((doc)=>{
                const number = Number(doc.ref);

                if(!isNaN(number) && number > largest)
                    largest = number;

            })).on("error", reject)
                .on("finish", ()=>{
                    const now:number = Date.now();
                    if(now <= largest)
                        resolve(String(largest+1));

                    resolve(String(now));
                });
        });
    }

    insertDocument(data:any):Promise<DatabaseDocument>{
        return new Promise(async(resolve, reject)=>{
            if(typeof data.ref === "undefined"){
                data = {
                    ref: await this.getNewRef(),
                    data: data
                }
            } else {
                if(await this.getDocument(data.ref))
                    reject(new Error(`Document '${data.ref}' already exists!`));
            }

            try {
                fs.appendFileSync(this._target, JSON.stringify(data)+"\n");
            } catch (e){
                reject(e);
            }
            resolve(data);
        });
    }

    count():Promise<number> {
        return new Promise(async(resolve, reject)=>{
            let count:number = 0;
            fs.createReadStream(this._target)
                .on("error", reject)
            .pipe(new FilterStream((doc)=>{
                count++;
            })).on("error", reject)
                .on("finish", ()=>resolve(count));
        });
    }

    updateDocument(update:DatabaseDocument):Promise<void>{
        return new Promise((resolve, reject)=>{
            let done:boolean = false;
            const insertStream = new FilterStream((doc):DatabaseDocument|void=>{
                if(!done && doc.ref === update.ref){
                    done = true;
                    return update;
                }
            })

            fs.createReadStream(this._target)
                .on("error", reject)
            .pipe(insertStream).on("error", reject)
                .on("finish", ()=>{
                    insertStream.pipe(fs.createWriteStream(this._target))
                        .on("error", reject)
                        .on("close", ()=>{
                            if(done === false)
                                reject(new Error("Document was not in database!"));

                            resolve();
                        })
                });
                
        });
    }

    deleteDocument(ref:DatabaseDocument|string){
        return new Promise((resolve, reject)=>{
            if(typeof ref !== "string")
                ref = ref.ref || "undefined";

            fs.createReadStream(this._target)
                .on("error", reject)
            .pipe(new FilterStream((doc):null|void=>{
                if(doc.ref === ref)
                    return null;
            })).on("error", reject)
            .pipe(fs.createWriteStream(this._target))
                .on("error", reject)
                .on("finish", resolve);
        })
    }

    query(attributes:any = {}):Promise<Array<DatabaseDocument>>{
        return new Promise((resolve, reject)=>{
            const output:Array<DatabaseDocument> = []

            fs.createReadStream(this._target)
                .on("error", reject)
            .pipe(new FilterStream((doc)=>{

                let match:boolean = true;
                for(let name in attributes){
                    if(typeof doc.data[name] === "undefined" || doc.data[name] != attributes[name])
                        match = false;
                }

                if(match)
                    output.push(doc);

            })).on("error", reject)
                .on("finish", ()=>resolve(output));
        })
    }
}