import Database from "./Database";
import { DatabaseDocument } from "./Database/Types";

test("Database Init Test", ()=>{
    new Database("test");
});

test("Database Error Test", ()=>{
    let test:any;
    try {
        new Database("test/app.js")
    } catch (e:any){
        test = e;
    }

    expect(test).toBeDefined()
});

test("Collection Init Test", async()=>{
    const database = new Database("test");

    const collection = database.collection("newCollection");
    expect(Number(await collection.getNewRef())).toBeCloseTo(Date.now());
});

test("Collection Insert Test", async()=>{
    const database = new Database("test");

    const collection = database.collection("insertTest");
    await collection.clear();

    await collection.insertDocument({Hello:"World"});
    expect(await collection.count()).toBe(1);
});

test("Collection Update Test", async()=>{
    const database = new Database("test");

    const collection = database.collection("updateTest");
    await collection.clear();

    let document = await collection.insertDocument({Hello:"World"});
    document.data.Hello = 'I have been updated';

    await collection.updateDocument(document);
    expect(await collection.count()).toBe(1);
});

test("Collection Reference Test", async()=>{
    const database = new Database("test");
    const collection = database.collection("referenceTest");
    collection.clear();

    let document:DatabaseDocument|null = await collection.insertDocument({Hello: "World"});
    document.data.Hello = "Dont See this Update";

    document = await collection.getDocument(document.ref);
    if(document)
        expect(document.data.Hello).toBe("World");
    else
        throw new Error("Document was not Found!");
});

test("Document Delete Test", async()=>{
    const database = new Database("test");
    const collection = database.collection("deleteTest");
    const data = {name: "Ben Wyatt", location: "Pawni, IN"};

    const document = await collection.insertDocument(data);
    await collection.deleteDocument(document);
    expect(await collection.count()).toBe(0);

    const {ref} = await collection.insertDocument(data);
    await collection.deleteDocument(ref);
    expect(await collection.count()).toBe(0);
})

test("Collection First Query Test", async()=>{
    const database = new Database("test");
    const collection = database.collection("updateTest");
    const documents = await collection.query();

    expect(documents.length).toBe(1);
    expect(documents[0].data.Hello).toBe('I have been updated');
});