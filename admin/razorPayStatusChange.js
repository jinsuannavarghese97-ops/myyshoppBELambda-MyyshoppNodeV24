let request = require("sync-request");
const queryExecution = require('../queryExecution')
const methods = {};
methods.razorPayStatusChange = function (client, jsonObj, event, callback) {
    let razorPayConfigQuery = " SELECT config_value FROM configuration WHERE config_key = 'razorpaykeyid'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'razorpaykeysecret'; "
    queryExecution.queryExecution(client, jsonObj, event, razorPayConfigQuery, [], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        let razorKey
        let razorkeysecret
        razorKey = results[0][0].config_value;
        razorkeysecret = results[1][0].config_value

        try {
            let url = "https://" + razorKey + ":" + razorkeysecret + "@api.razorpay.com/v1/payments/" + event.paymentId + "/capture"
            console.log('url..1...', url)
            let requests = request('POST', url, {
                json: { amount: event.amount, currency: event.currency },
            });
            console.log('requests..1...', requests)
            var responseData = JSON.parse(requests.getBody('utf8'));
            console.log('responseData..1...', responseData)
            let saveRazorDetailsQuery = " update subscription_razorpay_details set status = ? where id = ?";
            console.log('saveRazorDetailsQuery..2...', saveRazorDetailsQuery)
            queryExecution.queryExecution(client, jsonObj, event, saveRazorDetailsQuery, [responseData.status, event.id], function (responses) {
                console.log('responses...3..', responses)
                responseData.paymentId = responses.result.insertId
                if (responses.success == '0') {
                    callback(responses);
                } else {
                    const response = {
                        success: "1",
                        razorPayData: responseData,
                        successMessage: "Success",
                        errorMessage: ""
                    };
                    callback(response);
                }
            });
        }
        catch (e) {
            console.log('error......', e)
            const response = {
                success: "0",
                successMessage: "",
                errorMessage: "Payment Failed"
            };
            callback(response);
        }


        /*request({
                method: 'GET',
                url: "https://" + razorKey + ":" + razorkeysecret + "@api.razorpay.com/v1/payments/" + event.paymentId
            },
            function(error, response, body) {
                if (error) {
                    const response = {
                        success: "0",
                        successMessage: "",
                        errorMessage: "Something went wrong"
                    };
                    callback(response);
                } else {
                    let responseData = JSON.parse(body)
                    let saveRazorDetailsQuery = " update subscription_razorpay_details set status = '" + responseData.status + "' where id = " +event.id;
                    queryExecution.queryExecution(client, jsonObj, event, saveRazorDetailsQuery, function(responses) {
                        responseData.paymentId = responses.result.insertId
                        if (responses.success == '0') {
                            callback(responses);
                        } else {
                            const response = {
                                success: "1",
                                razorPayData: responseData,
                                successMessage: "Success",
                                errorMessage: ""
                            };
                            callback(response);
                        }
                    });
                }
            });*/
    });

}
module.exports = methods;