const queryExecution = require('../queryExecution');
const methods = {};
methods.sellerItemMapProcedure = function (client, jsonObj, event, callback) {
    let updateQuery = ""; 
    let params = [];

    if (event.storeId) {
        updateQuery = "call grocery_stock_update(?)";
        params = [event.storeId];
    }
    else {
        updateQuery = "call itemMapping(?)";
        params = [event.sellerId];
    }
    client.query(updateQuery, params, function (error, results, fields) {

    })
    setTimeout(function () {
        callback('Success');
    }, 15000);
}
module.exports = methods;