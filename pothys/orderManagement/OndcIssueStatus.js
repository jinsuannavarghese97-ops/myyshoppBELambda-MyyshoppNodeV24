let mysql = require('mysql');
let methods = {};
methods.OndcIssueStatus = function (client, jsonObj, event, queryExecution, callback) {

    console.log("enter ....................")
    let queryString = " select * from ondc_fullfillment_states where id in (14,15,16,17,18) "
    console.log("queryString......", queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString,[], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "results": results,
            "errorMessage": ""
        }
        callback(responseData)
    });
}
module.exports = methods;
