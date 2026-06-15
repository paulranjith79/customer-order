import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

await client.connect();

const db = client.db("Shop_kutti");

console.log("Mongo Connected");

app.listen(3000, () => {
    console.log("Server Running");
});
app.use(express.json());

app.post('/login', async (req, res) => {

    const { phone, birthDate, birthMonth } = req.body;

    const customer =
    await db.collection("customers").findOne({
        phone: Number(phone)
    });

    if(!customer){

        return res.json({
            success:false
        });

    }

    const dob =
    new Date(customer.dob);

    const day =
    dob.getDate();

    const month =
    dob.getMonth() + 1;

    if(
        day === Number(birthDate) &&
        month === Number(birthMonth)
    ){

        return res.json({
            success:true,
            customer
        });

    }

    return res.json({
        success:false
    });

});


app.use(cors());
app.use(express.static('public'));
app.get('/products', async (req, res) => {

    const products = await db
        .collection("tbl_product_mas")
        .find({})
        .sort({ name: 1 })
        .toArray();

    res.json(products);

});
app.post('/saveorder', async (req,res)=>{

    await db.collection("orders")
    .insertOne(req.body);

    res.json({
        success:true
    });

});
