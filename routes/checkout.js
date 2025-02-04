var express = require('express');
var router = express.Router();

const { generateReference , toMinorUnits} = require('../helpers/utility.js');
const { API_URL , API_KEY} = require('../helpers/config.js');




router.get("/", function (req, res) {
    res.send("Hello World");
});

// POST route to process payment
router.post("/process-payment", async function (req, res) {
    console.log("Payment Data Received:", req.body);

    // Extract form data
    const { firstName, lastName, email, address, address2, postcode, amount, country, city } = req.body;

    if (!firstName || !lastName || !email || !address || !postcode) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const reference = generateReference();

    let fullName = `${firstName} ${lastName}`

    let payload = {
        amount: toMinorUnits(amount),
        currency: "GBP",
        reference: reference,
        description: "Payment for Elixirs",
        billing_descriptor: {
            name: fullName,
            city: city
        },
        customer: {
            email: email,
            name: fullName
        },
        shipping: {
            address: {
                address_line1: address,
                address_line2: address2,
                city: city,
                zip: postcode,
                country: country
            },
            phone: {
                number: "1234567890",
                country_code: "+44",
            },
        },
        billing: {
            address: {
                address_line1: address,
                address_line2: address2,
                city: city,
                zip: postcode,
                country: country
            },
            phone: {
                number: "1234567890",
                country_code: "+44",
            },
        },
        risk: {
            enabled: true,
        },
        success_url: "http://localhost:3000/checkout/payment-completed?status=succeeded",
        failure_url: "http://localhost:3000/checkout/payment-completed?status=failed",
        metadata: {},
        items: [
            {
                name: "Zenova",
                quantity: 1,
                unit_price: toMinorUnits(amount),
            },
        ],
    };



    const request = await fetch(
        API_URL,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!request.ok) {
        console.log("API Error:", await request.text());
        return res.status(request.status).json({ error: "Payment processing failed" });
    }

    const parsedPayload = await request.json();

    res.status(request.status).send(parsedPayload);
});



router.get('/payment-completed', function(req, res, next) {
    res.render('complete', { status: req.query.status || 'failed' });
  });

module.exports = router;