const request = require("request");
const queryExecution = require('../queryExecution')
const methods = {};
methods.razorpayPlanDetails = function (client, jsonObj, event, callback) {

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

            request({
                method: 'GET',
                url: "https://" + razorKey + ":" + razorkeysecret + "@api.razorpay.com/v1/plans/" + event.planId,
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
