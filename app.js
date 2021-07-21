const express = require("express");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app = express();

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
});



//configuracion de Paypal, colocar el id del cliente y su secreto

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AUaLcL0v9fhe7eqZNTuWD_GOPIYe1wgfZEWfH8NJRUZaw8MlosCQPhU0ZsIfF2N-VgohcLNRgt2XdY5F",
    client_secret:
        "EGxtbS-6um8OWnOgDquuF7dltserVNio9-vuvaRvLdy6Idh-1NDDSoQf1WN4Y5bkaLGvNeOhL_Gt8RPQ"
});

app.get("/", (req, res) => {
    res.render("index");
});

const cost = null;
//creacion de la ruta /paypal
app.get("/paypal/:cost", (req, res) => {
   cost = req.params.cost; //para colocar un precio variable
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "https://shielded-inlet-17175.herokuapp.com/success",
            cancel_url: "https://shielded-inlet-17175.herokuapp.com/cancel"
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: "item",
                            sku: "item",
                            price: cost,
                            currency: "USD",
                            quantity: 1
                        }
                    ]
                },
                amount: {
                    currency: "USD",
                    total: cost
                },
                description: "This is the payment description."
            }
        ]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        console.log('FUNCION CREATE')
        console.log("payment", payment)
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href); //redirijo a los links de pago
            //res.send('Ok!')
          
        }
    });
});

//manejar el exito
app.get("/success", (req, res) => {
    //informacion del pago
    console.log('FUNCION get exito')
        console.log("req", req)
        console.log("res", res)
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "1.00"
                }
            }
        ]
    };
//ejecusion del pago
    paypal.payment.execute(paymentId, execute_payment_json, function(
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.render("success");
        }
    });
});
//cancelacion del pago
app.get("cancel", (req, res) => {
    res.render("cancel");
});


//servidor
app.listen({port: process.env.PORT || 3000}, () => {
    console.log("Server is running");
});