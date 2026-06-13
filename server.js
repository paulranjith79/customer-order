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

app.post('/login', async (req,res)=>{

    try{

        const phone =
        Number(req.body.phone);

        const dobStart =
        new Date(req.body.dob);

        const dobEnd =
        new Date(req.body.dob);

        dobEnd.setDate(
            dobEnd.getDate() + 1
        );

        const customer =
        await db.collection("customers")
        .findOne({

            phone: phone,

            dob: {
                $gte: dobStart,
                $lt: dobEnd
            }

        });

        if(customer){

            res.json({

                success:true,
                customer:customer

            });

        }
        else{

            res.json({

                success:false

            });

        }

    }
    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,
            error:err.message

        });

    }

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