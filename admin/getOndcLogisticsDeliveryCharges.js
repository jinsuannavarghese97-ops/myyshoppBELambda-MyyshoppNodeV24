const queryExecution = require('../queryExecution');
let methods = {};


methods.getOndcLogisticsDeliveryCharge = function (client, jsonObj, event, callback) {

    let getOndcLogisticsDeliveryChargeQuery = " select on_init_json as ondcOnInitJson from ondc_logistics where sale_order_id=?";

    queryExecution.queryExecution(client, jsonObj, event, getOndcLogisticsDeliveryChargeQuery, [event.saleOrderId], function (getOndcLogisticsDeliveryChargeQueryResult) {
        if (getOndcLogisticsDeliveryChargeQueryResult.success == '0') {
            callback(getOndcLogisticsDeliveryChargeQueryResult);
        }
        let results = getOndcLogisticsDeliveryChargeQueryResult.result

        if (results.length > 0) {

            let providerName = ""
            let deliveryCharge = ""
            let currency = ""
            if (results[0].ondcOnInitJson) {
                let onInitJson = JSON.parse(results[0].ondcOnInitJson);
                providerName = onInitJson.message.order.provider.id
                deliveryCharge = onInitJson.message.order.quote.price.value
                currency = onInitJson.message.order.quote.price.currency


            }
            let deliveryChargeResult = {
                providerName: providerName,
                deliveryCharge: deliveryCharge,
                currency: currency
            }

            const response = {
                success: "1",
                successMessage: "Success.",
                result: deliveryChargeResult,
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
