const queryExecution = require('../queryExecution')
let methods = {};


methods.orderAndRecieve = function (client, jsonObj, event, callback) {
    let queryString = " SELECT id,name " +
        " FROM alcohol_order_options " +
        " WHERE is_active is true; " +

        " SELECT id,name " +
        " FROM alcohol_receive_options " +
        " WHERE is_active is true; "

    queryExecution.queryExecution(client, jsonObj, event, queryString, [], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        const data = {
            success: "1",
            result: {
                orderOptions: results[0],
                receiverOptions: results[1]
            },
            errorMessage: "",
            successMessage: "Success."
        };
        callback(data);

    })
}
module.exports = methods;