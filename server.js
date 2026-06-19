import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const client = new MongoClient(process.env.MONGO_URI);

await client.connect();

const db = client.db("Shop_kutti");

console.log("Mongo Connected");

app.listen(3000, () => {
    console.log("Server Running");
});


// ======================
// CUSTOMER LOGIN
// ======================

app.post('/login', async (req, res) => {

    const {
        phone,
        birthDate,
        birthMonth
    } = req.body;

    const customer =
    await db.collection("customers")
    .findOne({
        phone: Number(phone)
    });

    if (!customer) {

        return res.json({
            success: false
        });

    }

    const dob =
    new Date(customer.dob);

    const day =
    dob.getDate();

    const month =
    dob.getMonth() + 1;

    if (
        day === Number(birthDate) &&
        month === Number(birthMonth)
    ) {

        return res.json({
            success: true,
            customer
        });

    }

    return res.json({
        success: false
    });

});


// ======================
// PRODUCT LIST
// ======================

app.get('/products', async (req, res) => {

    const products =
    await db.collection("tbl_product_mas")
    .find({})
    .sort({ name: 1 })
    .toArray();

    res.json(products);

});


// ======================
// LOAD PENDING ORDER
// ======================

app.get('/pendingorder/:cusid', async (req, res) => {

    const order =
    await db.collection("orders")
    .findOne({

        customer_id:
        Number(req.params.cusid),

        status:
        "Pending"

    });
    res.json(order || null);

});


// ======================
// SAVE ORDER
// ======================

app.post('/saveorder', async (req, res) => {

    const order = req.body;

    try {

        // Customer already loaded a pending order
        if (order.order_id) {

            const existing =
            await db.collection("orders")
            .findOne({

                _id:
                new ObjectId(
                    order.order_id
                ),

                status:
                "Pending"

            });

            if (!existing) {

                return res.json({

                    success: false,

                    message:
                    "This order was already downloaded by our company for billing purpose."

                });

            }

            await db.collection("orders")
            .updateOne(

                {
                    _id:
                    new ObjectId(
                        order.order_id
                    )
                },

                {
                    $set: {

                        customer_name:
                        order.customer_name,

                        order_date:
                        new Date(),

                        items:
                        order.items

                    }
                }

            );

            return res.json({

                success: true,

                message:
                "Order Updated Successfully"

            });

        }

        // No pending order found
        // Create new order

        const result =
        await db.collection("orders")
        .insertOne({

            customer_id:
            order.customer_id,

            customer_name:
            order.customer_name,

            order_date:
            new Date(),

            status:
            "Pending",

            items:
            order.items

        });

        res.json({

            success: true,

            order_id:
            result.insertedId,

            message:
            "Order Saved Successfully"

        });

    }
    catch (err) {

        console.log(err);

        res.json({

            success: false,

            message:
            "Server Error"

        });

    }

});


// ======================
// DOWNLOAD ORDERS
// AFTER IMPORT TO SQL
// ======================

app.post('/markdownloaded', async (req, res) => {

    const result =
    await db.collection("orders")
    .updateMany(

        {
            status:
            "Pending"
        },

        {
            $set: {

                status:
                "Downloaded",

                downloaded_date:
                new Date()

            }
        }

    );

    res.json({

        success: true,

        count:
        result.modifiedCount

    });

});
app.post('/login_flower_pks', async (req, res) => {

    const {
        mob_no,
        birthDate,
        birthMonth
    } = req.body;

    const customer =
    await db.collection("tbl_mer_mas")
    .findOne({
        mob_no: String(mob_no)
    });
    // console.log("Customer Found:");
     //   console.log(customer);

    if (!customer) {

        return res.json({
            success: false
        });

    }

    const dob =
    new Date(customer.dob);

    const day =
    dob.getDate();

    const month =
    dob.getMonth() + 1;

    if (
        day === Number(birthDate) &&
        month === Number(birthMonth)
    ) {

        return res.json({
            success: true,
            customer
        });

    }

    return res.json({
        success: false
    });

});