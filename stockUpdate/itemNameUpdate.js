const queryExecution = require('../queryExecution');
const methods = {};
methods.itemNameUpdate = function (client, jsonObj, event, callback) {
    if (event.itemId) {
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
        event.itemName = event.itemName ? event.itemName.replace(/'/g, "\\'") : "";
        event.sellerItemDisplayName = event.sellerItemDisplayName ? event.sellerItemDisplayName.replace(/'/g, "\\'") : "";
        event.brandName = event.brandName ? event.brandName.replace(/'/g, "\\'") : "";
        let qry = `
            UPDATE seller_item 
            SET 
                item_name = ?, 
                display_name = ?, 
                modified_by = ?, 
                modified_on = CONVERT_TZ(NOW(), '+00:00', ?) 
            WHERE id = ?;

            UPDATE store_item_stock 
            SET 
                item_name = ?, 
                modified_by = ?, 
                modified_on = CONVERT_TZ(NOW(), '+00:00', ?) 
            WHERE seller_item_id = ?;

            SELECT GROUP_CONCAT(item_name SEPARATOR ' ') AS itemName 
            FROM seller_item 
            WHERE item_id = ?;
        `;

        let qryParams = [
            event.itemName,
            event.sellerItemDisplayName,
            event.userId,
            event.timeZone,
            event.sellerItemId,

            event.itemName,
            event.userId,
            event.timeZone,
            event.sellerItemId,

            event.itemId
        ];

        queryExecution.queryExecution(client, jsonObj, event, qry, qryParams, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let resultData = response.result
            let itemNameChange = ""
            if (event.brandName) {
                itemNameChange = event.brandName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/_/gi, '') + " " +
                    event.itemName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/_/gi, '') + " " +
                    event.packName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/_/gi, '') + " " +
                    event.brandName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '') +
                    event.itemName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '') +
                    event.packName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '') + " " +
                    event.packName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '')
            }
            else {
                itemNameChange = event.itemName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/_/gi, '') + " " +
                    event.packName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/_/gi, '') + " " +
                    event.itemName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '') +
                    event.packName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '') + " " +
                    event.packName.toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '')
            }
            let itemNameToBeUpdated = itemNameChange
            let sellerItemNames = resultData[2][0].itemName

            let sellerItemNameSplit = sellerItemNames.split(' ')
            let itemNameSplit = itemNameChange.split(' ')
            for (let i = 0; i <= sellerItemNameSplit.length; i++) {
                if (sellerItemNameSplit.length > 0 && i < sellerItemNameSplit.length) {
                    let matchCount = 0
                    for (let j = 0; j < itemNameSplit.length; j++) {
                        if ((sellerItemNameSplit[i].replace(/[^\w]/gi, '').replace(/_/gi, '') != (itemNameSplit[j]))) {
                            matchCount = matchCount + 1
                        }
                    }
                    if (matchCount == itemNameSplit.length) {
                        itemNameToBeUpdated = itemNameToBeUpdated + " " + sellerItemNameSplit[i].toLowerCase().replace(/[^\w]/gi, '').replace(/_/gi, '')
                    }
                }
                else if (sellerItemNameSplit.length > 0 && i == sellerItemNameSplit.length) {
                    let updateItemNames = `
                        UPDATE item_names 
                        SET 
                            name = ?, 
                            modified_by = ?, 
                            modified_on = CONVERT_TZ(NOW(), '+00:00', ?) 
                        WHERE 
                            item_id = ?
                    `;

                    let updateItemNamesParams = [
                        itemNameToBeUpdated,
                        event.userId,
                        event.timeZone,
                        event.itemId
                    ];

                    queryExecution.queryExecution(client, jsonObj, event, updateItemNames, updateItemNamesParams, function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        else {
                            response.result = []
                            response.successMessage = "Item name updated successfully."
                            callback(response);
                        }
                    });
                }
                else {
                    const responseData = {
                        success: "1",
                        result: [],
                        successMessage: "Item name updated successfully.",
                        errorMessage: ""
                    }
                    callback(responseData);
                }
            }
        });
    }
    else {
        let qry = `
            UPDATE seller_item 
            SET 
                item_name = ?, 
                display_name = ?, 
                modified_by = ?, 
                modified_on = CONVERT_TZ(NOW(), '+00:00', ?) 
            WHERE id = ?;
        `;

        let qryParams = [
            event.itemName,
            event.sellerItemDisplayName,
            event.userId,
            event.timeZone,
            event.sellerItemId
        ];

        queryExecution.queryExecution(client, jsonObj, event, qry, callback, qryParams, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            else {
                response.result = []
                response.successMessage = "Item name updated successfully."
                callback(response);
            }
        });
    }
}
module.exports = methods;