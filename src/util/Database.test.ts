import Database from "./Database";

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
    expect(Number(await collection.getNewRef())).toBeCloseTo(Date.now(), 100);
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