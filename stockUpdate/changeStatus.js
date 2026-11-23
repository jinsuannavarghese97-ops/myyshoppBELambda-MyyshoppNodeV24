const queryExecution = require('../queryExecution');
const methods = {};
methods.changeSellerItemStatus = function (client, jsonObj, event, callback) {
    let subQuery = "";
    let subQueryParams = [];
    let successMessage = "";
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
    event.time = event.time ? event.time : '+330'
    event.timeZone = event.timeZone ? event.timeZone : '+05:30'
    if (event.isActive) {
        successMessage = event.isActive == "true" ? "Activated successfully." : "Deactivated successfully.";
        event.isActive = event.isActive == "true" ? true : false;
        subQuery = " is_active = ?";
        subQueryParams = [event.isActive];
    } else if (event.isApproved) {
        successMessage = event.isApproved == "true" ? "Approved successfully." : "Unapproved successfully.";
        event.isApproved = event.isApproved == "true" ? true : false;
        subQuery = " is_approved = ?";
        subQueryParams = [event.isApproved];
    }
    let updateQuery = " UPDATE seller_item SET " + subQuery + ", modified_by = ?, modified_on = CONVERT_TZ (now(), '+00:00',?) where id = ?; ";
    queryExecution.queryExecution(client, jsonObj, event, updateQuery, [...subQueryParams, event.userId, event.timeZone, event.sellerItemId], function (response) {

        if (response.success == '0') {
            callback(response);
        } else {
            response.result = []
            response.successMessage = successMessage
            callback(response);
        }
    });
}
methods.changeStoreItemStockStatus = function (client, jsonObj, event, callback) {
    let subQuery = "";
    let subQueryParams = [];
    let successMessage = "";
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
    event.time = event.time ? event.time : '+330';
    event.timeZone = event.timeZone ? event.timeZone : '+05:30';
    if (event.isActive) {
        successMessage = event.isActive == "true" ? "Activated successfully." : "Deactivated successfully.";
        event.isActive = event.isActive == "true" ? true : false;
        subQuery = " is_active = ?";
        subQueryParams = [event.isActive];
    }
    let updateQuery = " UPDATE store_item_stock SET " + subQuery + ", modified_by = ?, modified_on = CONVERT_TZ (now(), '+00:00',?) where id = ?; ";
    // console.log("updateQuery....",updateQuery)
    queryExecution.queryExecution(client, jsonObj, event, updateQuery, [...subQueryParams, event.userId, event.timeZone, event.storeItemStockId], function (response) {
        // console.log("response....",response)
        if (response.success == '0') {
            callback(response);
        } else {
            response.successMessage = successMessage
            response.result = []
            callback(response);
        }
    });
}
module.exports = methods;