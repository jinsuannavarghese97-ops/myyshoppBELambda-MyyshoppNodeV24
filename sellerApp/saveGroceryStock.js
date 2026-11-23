const queryExecution = require('../queryExecution');
const methods = {};
methods.saveGroceryStock = function (client, jsonObj, event, callback) {

    let displayitemPrice = ""
    let offerText = ""
    let isoffer = ""
    let offerPrice = ""
    let subQryField = "";
    let subQryFieldParams = [];
    let netAmount = ""

    let displayItemPriceQuery = "select if(display_item_price is true,true,false) as displayItemPrice from store where id= ?;"
    let offerQuery = "select id,if(is_offer is true,true,false) as isoffer,offer_text,offer_price from store_item_stock where id= ?;"
    let fullQuery = displayItemPriceQuery + offerQuery;
    queryExecution.queryExecution(client, jsonObj, event, fullQuery, [event.storeId, event.storeItemStockId], function (response) {
        if (response.success == '0') {
            callback(response);
        }

        response.result[1] = JSON.parse(JSON.stringify(response.result[1]).replace(/\:null/gi, "\:\"\""))
        displayitemPrice = response.result[0][0].displayItemPrice
        offerText = response.result[1][0].offer_text
        isoffer = response.result[1][0].isoffer
        offerPrice = response.result[1][0].offer_price
        event.itemName = event.itemName ? event.itemName.replace(/'/g, "\\'") : "";
        event.stockQuantity = event.stockQuantity ? event.stockQuantity : 100

        if (offerText) {

            if (offerPrice && offerPrice > 0) {
                netAmount = offerPrice
            }
            else {
                netAmount = event.itemPrice
                offerPrice = event.itemPrice
            }
        }
        if (displayitemPrice == 'false') {
            if (!event.itemPrice) {
                event.itemPrice = event.mrp
            }
            netAmount = event.mrp
        }
        else {
            if (!event.itemPrice) {
                event.itemPrice = event.mrp
            }
            netAmount = event.itemPrice
        }

        if (event.storeItemStockId) {
            if (offerText) {
                subQryField = "offer_price= ? ";
                subQryFieldParams.push(parseFloat(event.offerPrice).toFixed(2));
            }
            let query = `
                UPDATE store_item_stock 
                SET 
                    version = version + 1, 
                    is_active = TRUE, 
                    is_offer = ?, 
                    item_name = ?, 
                    item_price = ?, 
                    modified_by = ?, 
                    modified_on = NOW(), 
                    mrp = ?, 
                    net_amount = ?, 
                    seller_item_id = ?, 
                    stock_quantity = ?, 
                    stock_updated_on = NOW(), 
                    store_id = ?
                    ${subQryField} 
                WHERE id = ?
            `;

            let queryParams = [
                isoffer,
                event.itemName,
                parseFloat(event.itemPrice).toFixed(2),
                event.userId,
                parseFloat(event.mrp).toFixed(2),
                parseFloat(netAmount).toFixed(2),
                event.sellerItemId,
                event.stockQuantity,
                event.storeId,
                ...subQryFieldParams,
                event.storeItemStockId
            ];
            console.log(query)
            queryExecution.queryExecution(client, jsonObj, event, query, queryParams, function (response) {
                if (response.success == '0') {
                    callback(response);
                }

                if (event.itemId) {

                    event.itemName = event.itemName ? event.itemName.replace(/'/g, "\\'") : "";
                    event.sellerItemDisplayName = event.sellerItemDisplayName ? event.sellerItemDisplayName.replace(/'/g, "\\'") : "";
                    event.brandName = event.brandName ? event.brandName.replace(/'/g, "\\'") : "";
                    let qry = `
                        UPDATE seller_item 
                        SET 
                            item_name = ?, 
                            display_name = ?, 
                            modified_by = ?, 
                            modified_on = NOW() 
                        WHERE id = ?;

                        UPDATE store_item_stock 
                        SET 
                            item_name = ?, 
                            modified_by = ?, 
                            modified_on = NOW() 
                        WHERE seller_item_id = ?;

                        SELECT 
                            GROUP_CONCAT(item_name SEPARATOR ' ') AS itemName 
                        FROM seller_item 
                        WHERE item_id = ?;
                    `;

                    let qryParams = [
                        event.itemName,
                        event.sellerItemDisplayName,
                        event.userId,
                        event.sellerItemId,
                        event.itemName,
                        event.userId,
                        event.sellerItemId,
                        event.itemId
                    ];

                    queryExecution.queryExecution(client, jsonObj, event, qry, callback, qryParams, function (response) {
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
                                    WHERE item_id = ?;
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
                                        response.successMessage = " Success."
                                        callback(response);
                                    }
                                });
                            }
                            else {
                                const responseData = {
                                    success: "1",
                                    result: [],
                                    successMessage: "Success.",
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
                            modified_on = NOW() 
                        WHERE id = ?;
                    `;

                    let qryParams = [
                        event.itemName,
                        event.sellerItemDisplayName,
                        event.userId,
                        event.sellerItemId
                    ];

                    queryExecution.queryExecution(client, jsonObj, event, qry, qryParams, function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        else {
                            response.result = []
                            response.successMessage = "Success."
                            callback(response);
                        }
                    });
                }


            })
        }

    });

}
module.exports = methods;
