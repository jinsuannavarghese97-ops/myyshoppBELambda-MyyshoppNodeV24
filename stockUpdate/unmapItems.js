const queryExecution = require('../queryExecution');
const methods = {};
methods.unmapItems = function (client, jsonObj, event, callback) {
    let subQuery = ""
    let successMessage = ""
    console.log("1")
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
    console.log("2")
    event.time = event.time ? event.time : '+330'
    event.timeZone = event.timeZone ? event.timeZone : '+05:30'
    let updateQuery = `
        UPDATE seller_item 
        SET 
            is_active = false, 
            item_id = NULL, 
            is_approved = false, 
            modified_by = ?, 
            modified_on = CONVERT_TZ(NOW(), '+00:00', ?) 
        WHERE 
            id = ?;

        UPDATE store_item_stock 
        SET 
            is_active = false, 
            modified_by = ?, 
            modified_on = CONVERT_TZ(NOW(), '+00:00', ?) 
        WHERE 
            seller_item_id = ?;
        `;

    let updateQueryParams = [
        event.userId,
        event.timeZone,
        event.sellerItemId,
        event.userId,
        event.timeZone,
        event.sellerItemId
    ];

    console.log("updateQuery-------", updateQuery)
    queryExecution.queryExecution(client, jsonObj, event, updateQuery, updateQueryParams, function (response) {
        console.log("response-------", response)
        if (response.success == '0') {
            callback(response);
        } else {
            response.successMessage = "Item Code : " + event.itemCode + " Successfully Unmapped"
            callback(response);
        }
    });
}

methods.deleteSellerItem = function (client, jsonObj, event, callback) {
    let deleteQry = " DELETE from seller_item where id = ?;"
    queryExecution.queryExecution(client, jsonObj, event, deleteQry, [event.sellerItemId], function (response) {
        if (response.success == '0') {
            callback(response);
        } else {
            response.successMessage = "Item Code : " + event.itemCode + " Successfully Unmapped"
            callback(response);
        }
    });
}

module.exports = methods;