
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import express from "express"
import cors from "cors"
const app = express()

dotenv.config();
app.use(cors())
app.use(express.json())

const RAZORPAY_KEY_ID = process.env.RAZORPAY_ID
const RAZORPAY_KEY = process.env.RAZORPAY_KEY
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY,
});


app.post('/create-order', async (req, res) => {
    console.log("Create order")
    console.log("body", req.body)
    try {
        const options = {
            amount: req.body.amount,
            currency: 'INR',
            receipt: 'receipt_' + Math.random().toString(36).substring(7),
        };

        const order = await razorpay.orders.create(options);
        console.log(order)
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/verify-payment', async (req, res) => {
    console.log("Verify order")

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            
            console.log("Payment verified successfully")
            res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            console.log("Invalid payment signature")
            res.status(400).json({ error: 'Invalid payment signature' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(3001, console.log(`Server running in  port 3001`))