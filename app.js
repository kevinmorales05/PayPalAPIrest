const express = require("express");
const engines = require("consolidate"); //esta de mas
const paypal = require("paypal-rest-sdk");



paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AUaLcL0v9fhe7eqZNTuWD_GOPIYe1wgfZEWfH8NJRUZaw8MlosCQPhU0ZsIfF2N-VgohcLNRgt2XdY5F",
    client_secret:
        "EGxtbS-6um8OWnOgDquuF7dltserVNio9-vuvaRvLdy6Idh-1NDDSoQf1WN4Y5bkaLGvNeOhL_Gt8RPQ"
});

const app = express();


//configuracion de Paypal, colocar el id del cliente y su secreto
const cost = null;


//creacion de la ruta /pay
app.get('/pay/:cost', (req, res) => {
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
                            name: "Entrada para evento virtual",
                            sku: "entrada",
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
                description: "El mejor show del mundo"
            }
        ]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        
        if (error) {
            throw error;
        } else {
           
            for (let i=0; i<payment.links.length; i++){
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }
          
        }
    });
});

//manejar el exito
app.get("/success", (req, res) => {
    //informacion del pago
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: cost
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
            res.sendFile(__dirname + "/success.html")
        }
    });
});
//cancelacion del pago
app.get("cancel", (req, res) => {
    res.send("Cancelled");
});


//servidor
app.listen({port: process.env.PORT || 3000}, () => {
    console.log("Server is running");
});