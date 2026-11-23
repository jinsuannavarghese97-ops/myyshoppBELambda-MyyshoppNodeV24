const queryExecution = require('../queryExecution');

let methods = {};


methods.ondcCancellReasonsList = function (client, jsonObj, event, callback) {

    let dQuery = " SELECT id, reason, code FROM ondc_cancell_reason;"
    console.log("dQuery ", dQuery)
    queryExecution.queryExecution(client, jsonObj, event, dQuery, [], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        // console.log(results)
        if (results.length > 0) {
            const response = {
                success: "1",
                successMessage: "Success.",
                result: {
                    cancellReasonsList: results
                },
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: {},
                errorMessage: "No data found."
            }
            callback(response)
        }
    })
}



module.exports = methods;