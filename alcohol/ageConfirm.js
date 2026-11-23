const queryExecution = require('../queryExecution')
let methods = {};


methods.ageConfirm = function (client, jsonObj, event, callback) {
    let age = Math.floor((new Date() - new Date(event.age).getTime()) / 3.15576e+10);
    let queryString = " SELECT group_concat(alcohol_content) as alcohol_content " +
        " FROM master_state_alcohol_content " +
        " WHERE is_active is true and state_id = ? and ? >= age_from && age_to > ? ;"
    let queryStringParams = [event.stateId, age, event.age];
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryStringParams, function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        console.log("queryStringResult...", queryStringResult);
        let result = queryStringResult.result
        let alcoholContent = ""
        if ((result.length > 0) && (result[0].alcohol_content != null)) {
            alcoholContent = queryStringResult.result[0].alcohol_content.split(',').map(Number);
        }
        else {
            alcoholContent = ""
        }
        const response = {
            success: "1",
            successMessage: "Success.",
            result: {
                alcoholContent: alcoholContent,
                count: "10"
            },
            errorMessage: ""
        }
        callback(response)
    })
}
module.exports = methods;