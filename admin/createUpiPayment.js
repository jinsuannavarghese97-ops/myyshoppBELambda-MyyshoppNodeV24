const request = require("request");
const queryExecution = require('../queryExecution')
const methods = {};
methods.createUpiPayment = function (client, jsonObj, event, callback) {

    let razorPayConfigQuery = " SELECT config_value FROM configuration WHERE config_key = 'razorpaykeyid'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'razorpaykeysecret'; "

    queryExecution.queryExecution(client, jsonObj, event, razorPayConfigQuery, [], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        else {

            let results = response.result
            let razorKey = results[0][0].config_value;
            let razorkeysecret = results[1][0].config_value
            console.log('event.paymentDetails.amount....', event.paymentDetails.amount)
            console.log('event.paymentDetails.currency....', event.paymentDetails.currency)

            request({
                method: 'POST',
                url: "https://" + razorKey + ":" + razorkeysecret + "@api.razorpay.com/v1/payment_links/",
                form: {
                    "amount": event.paymentDetails.amount,
                    "upi_link": "true",
                    "currency": event.paymentDetails.currency
                }
            },
                function (error, responseData, body) {

                    let responseDataNew = JSON.parse(body)
                    //console.log('responseDataNew.....',responseDataNew)
                    //console.log('error.....',error)
                    if (responseDataNew.error) {
                        const response = {
                            success: "0",
                            successMessage: "",
                            errorMessage: responseDataNew.error
                        };
                        callback(response);
                    }
                    else {

                        //let responseSubData = JSON.parse(body)
                        const response = {
                            success: "1",
                            //responseSubData: responseSubData,
                            successMessage: "Success",
                            errorMessage: ""
                        };
                        callback(response);
                    }
                });
        }
    });
}
module.exports = methods;
