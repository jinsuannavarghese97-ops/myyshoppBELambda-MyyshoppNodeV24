let methods = {};
let queryExecution = require('../queryExecution');
methods.isGlobal = function (client, event, jsonObj, callback) {
    let queryString = " select if(has_location is true,'false','true') as isGlobal from seller where id = ?;"
    queryExecution.queryExecution(client, jsonObj, event, queryString, [event.sellerId], function (response) {
        callback(response);
    });
}
module.exports = methods;