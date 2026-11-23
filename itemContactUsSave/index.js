var grocery = require('./grocery.js');
const mysql = require('mysql');
const methods = {};

methods.index = function(client,jsonObj, event, callback) {
    if (event.functionName == 'grocery') {

        jsonObj.storeId = event.storeId;
        jsonObj.sellerId = event.sellerId
        if (event.userId) {
            jsonObj.userId = event.userId;
        } else {
            jsonObj.userId = null;
        }

        jsonObj.itemId = event.itemId;
        jsonObj.emailId = event.emailId;
        jsonObj.name = event.name;
        jsonObj.phone = event.phone;
        jsonObj.comments = event.comments;

        grocery.grocery(client,jsonObj,event, function(response) {
            callback(response)
        });
    }
}
module.exports = methods;