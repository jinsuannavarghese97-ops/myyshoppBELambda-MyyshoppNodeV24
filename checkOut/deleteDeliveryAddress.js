const queryExecution = require('../queryExecution')
let methods = {};

methods.deleteDeliveryAddress = function (client, jsonObj, event, callback) {
    let queryString = "UPDATE buyer_delivery_address set is_active=false WHERE id =?"

    queryExecution.queryExecution(client, jsonObj, event, queryString, [event.id], function (queryStringResult) {
        callback(queryStringResult)
    })
}
module.exports = methods;