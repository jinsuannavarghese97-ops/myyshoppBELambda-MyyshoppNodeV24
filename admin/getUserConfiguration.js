const methods = {};
let queryExecution = require('../queryExecution');
methods.getUserConfiguration = function (client, jsonObj, event, callback) {

    let dQuery = " select config_value from configuration where config_key = 'razorpaykeyid' ;" +

        " select config_value from configuration where config_key = 'razorpaykeysecret' ;"

    queryExecution.queryExecution(client, jsonObj, event, dQuery, [], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        let razorpaykeyid = ""
        let result = []
        let razorpaykeysecret = ""
        if (results[0].length > 0) {

            if (results[0].length > 0) {
                razorpaykeyid = results[0][0].config_value
            }

            if (results[1].length > 0) {
                razorpaykeysecret = results[1][0].config_value
            }

            result = {
                razorpaykeyid: "" ,//razorpaykeyid,
                razorpaykeysecret: "",//razorpaykeysecret
            }
            const response = {
                success: "1",
                successMessage: "Success.",
                result: result,
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: [],
                errorMessage: "No data found."
            }
            callback(response)
        }
    })
}
module.exports = methods;