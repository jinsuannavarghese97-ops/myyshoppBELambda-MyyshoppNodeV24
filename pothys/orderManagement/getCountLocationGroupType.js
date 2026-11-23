let mysql = require('mysql');
let methods = {};
methods.getCountLocationGroupType = function (client, jsonObj, event, queryExecution, callback) {




    let countQry = " select count(*) as totalCount from location_group_type where store_id=? ;"
    console.log("queryString......", countQry)
    queryExecution.queryExecution(client, jsonObj, event, countQry, [event.storeId], function (response) {
        if (response.success == '0') {
            callback(response);
        }

        let results = response.result
        console.log("results..........", results)
        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "count": results[0].totalCount,
            "errorMessage": ""
        }
        callback(responseData)
    });
}

methods.updateSaleOrderItemCancel = function (client, jsonObj, event, queryExecution, callback) {
    let countQry = `
            UPDATE sale_order_item 
            SET 
            cancelled_quantity = ?, 
            cancelled_by = 'seller', 
            cancelled_at = ?, 
            status = 5 
            WHERE id = ?;
        `;

    const countParams = [
        event.cancelled_quantity,
        event.cancelled_at,
        event.saleOrderItemId
    ];

    console.log("queryString......", countQry)
    queryExecution.queryExecution(client, jsonObj, event, countQry, countParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }

        let results = response.result
        console.log("results..........", results)
        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "errorMessage": ""
        }
        callback(responseData)
    });
}


module.exports = methods;
