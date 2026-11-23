let mysql = require('mysql');
let methods = {};
let ondcUpdateCall = require('./ondcUpdateCall.js');
methods.ChangeOndcStatus = async function (client, jsonObj, event, queryExecution, callback) {

    console.log("enter ....................")
    jsonObj = event
    let queryString = " UPDATE sale_order_item SET ondc_fullfillment_states_id= ? ,cancelled_by ='Seller' where id= ?";
    console.log("queryString......", queryString)
    await queryExecution.queryExecution(client, jsonObj, event, queryString, [event.ondcFullfilmentStatusId, event.saleOrderItemId], async function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "errorMessage": ""
        }
        await ondcUpdateCall.ondcUpdateCall(client, jsonObj, event, queryExecution, async function (response2) {
            console.log("response2.................", response2)
            if (response2.success == '0') {
                callback(response);
            }

            callback(responseData)
        })


    });
}
module.exports = methods;
