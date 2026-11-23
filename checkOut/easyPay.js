const request = require("request");
const queryExecution = require('../queryExecution')
const methods = {};
methods.easyPay = function (client, jsonObj, event, callback) {
    let paymentId
    if (event.timeZone) {
        let num = event.timeZone.slice(1);

        let symbol = event.timeZone.toString(0)[0] == '-' ? '+' : '-'
        let hours = (num / 60);
        let rhours = Math.floor(hours);
        rhours = rhours.toString.length == 1 ? '0' + rhours : rhours
        let minutes = (hours - rhours) * 60;
        let rminutes = Math.round(minutes);
        event.timeZone = symbol + rhours + ':' + rminutes
        event.time = symbol + num
    }
    //console.log("event.time ",event.time)
    event.time = event.time ? event.time : '+330'
    event.timeZone = event.timeZone ? event.timeZone : '+05:30'
    let saveRazorDetailsQuery = "INSERT INTO payment (amount,created_at,paymentid,status,payment_gateways_id) VALUES " +
        " (?,CONVERT_TZ (now(), '+00:00',?),?,?,4);";
    queryExecution.queryExecution(client, jsonObj, event, saveRazorDetailsQuery, [event.result[0].transaction_amount, event.timeZone, event.result[0].order_id, event.result[0].status_code], function (responses) {
        paymentId = responses.result.insertId
        if (event.itemBeforePaymentGroupCode) {
            let update = " UPDATE item_before_payment set payment_id = ? where group_code = ?;"
            queryExecution.queryExecution(client, jsonObj, event, update, [responses.result.insertId, event.itemBeforePaymentGroupCode], function (responses) {
                const response = {
                    success: "1",
                    worldLineData: [{
                        paymentId: paymentId
                    }],
                    successMessage: "Success",
                    errorMessage: ""
                };
                callback(response);
            });
        }
        else {
            const response = {
                success: "1",
                worldLineData: [{
                    paymentId: paymentId
                }],
                successMessage: "Success",
                errorMessage: ""
            };
            callback(response);
        }
    });




}
module.exports = methods;
