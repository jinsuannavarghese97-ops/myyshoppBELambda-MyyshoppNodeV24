const request = require("request");
const queryExecution = require('../queryExecution')
const methods = {};
methods.saveSubscriptionDetails = function (client, jsonObj, event, callback) {

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
            let addons = []
            if (event.initialAmount != '0' && event.initialAmount != null && event.initialAmount != "") {
                let amountInPaise = parseFloat(event.initialAmount) * 100

                if (parseFloat(event.initialAmount) == 1) {
                    amountInPaise = 100
                }
                console.log('amountInPaise.....', amountInPaise)
                addons = {
                    "item": {
                        "name": "Initial Amount",
                        "amount": amountInPaise,
                        "currency": "INR"
                    }
                }
            }

            request({
                method: 'POST',
                url: "https://" + razorKey + ":" + razorkeysecret + "@api.razorpay.com/v1/subscriptions/",
                form: {
                    "plan_id": event.planId,
                    "total_count": 100,
                    "addons": [addons]
                }
            },
                function (error, responseData, body) {
                    if (error) {
                        const response = {
                            success: "0",
                            successMessage: "",
                            errorMessage: "Something went wrong2"
                        };
                        callback(response);
                    }
                    else {

                        let responseSubData = JSON.parse(body)
                        const response = {
                            success: "1",
                            responseSubData: responseSubData,
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
