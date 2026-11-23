const queryExecution = require('../queryExecution')
let methods = {};


methods.expressDelivery = function (client, jsonObj, event, callback) {
    let id = event.id;
    let queryString
    queryString = "SELECT if(has_express_delivery is true,'1','0) as hasExpressDelivery, express_delivery_description as expressDeliveryDescription,express_delivery_charge as expressDeliveryCharge FROM seller WHERE id = ? "
    queryExecution.queryExecution(client, jsonObj, event, queryString, [id], function (queryStringResult) {
        let expressDeliveryData = [];
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result;
        if (results.length > 0) {
            expressDeliveryData[0] = {
                hasExpressDelivery: results[0].hasExpressDelivery,
                expressDeliveryDescription: (results[0].expressDeliveryDescription == null) ? '' : results[0].expressDeliveryDescription,
                expressDeliveryCharge: (results[0].expressDeliveryCharge == null) ? '' : results[0].expressDeliveryCharge
            };
            const data = {
                success: "1",
                expressDeliveryData: expressDeliveryData,
                errorMessage: "",
                successMessage: "Success."
            };
            callback(data);
        }
        else {
            const data = {
                success: "1",
                expressDeliveryData: expressDeliveryData,
                errorMessage: "",
                successMessage: "No data found."
            };
            callback(data);
        }
    });
}
module.exports = methods;
