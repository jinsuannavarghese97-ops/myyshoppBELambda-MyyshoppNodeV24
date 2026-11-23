const queryExecution = require('../queryExecution');
const methods = {};
methods.stockUpdateLists = function (client, jsonObj, event, callback) {
    let subQry = "", subField = ""
    if (event.type == 'mapped') {
        subQry = " WHERE su.`status` = 'S'"
    }
    else if (event.type == 'failed') {
        subField = ", su.error_message as errorMessage,su.error_type_id as errorTypeId,et.name as errorName,su.status "
        subQry = " inner join error_type as et on et.id=su.error_type_id " +
            " where su.status='F' and   su.error_message != 'Unmapped Item' and su.error_message != 'New Item'"
    }
    else if (event.type == 'unmapped') {
        subQry = " where su.status='F' and  su.error_message = 'Unmapped Item'"
    }
    else if (event.type == 'newItem') {
        subQry = " where su.status='F' and  su.error_message = 'New Item' "
    }
    let listQry = " SELECT su.`seller_item_code` AS sellerItemCode,su.`seller_item_name` AS sellerItemName,su.`mrp` as mrp,su.`item_price` AS itemPrice,su.`quantity` AS quantity, " +
        " su.`offer_text` AS offerText,su.`offer_price` AS offerPrice,DATE_FORMAT(su.`offer_from`,'%d/%m/%Y') AS offerFrom,DATE_FORMAT(su.`offer_to`,'%d/%m/%Y') AS offerTo " + subField +
        " FROM `stock_update_item_list` as su " + subQry +
        " AND su.store_id =  ? limit ?, ?;" +

        " SELECT count(*) as totalCount" +
        " FROM `stock_update_item_list` " +
        " WHERE `status` = 'S'  AND store_id =  ?;" +

        " SELECT count(*) as totalCount " +
        " FROM `stock_update_item_list` as su" +
        " inner join error_type as et on et.id=su.error_type_id " +
        " where su.status='F' and   su.error_message != 'Unmapped Item' and su.error_message != 'New Item' and store_id =  ?;" +

        " SELECT count(*) as totalCount " +
        " FROM `stock_update_item_list` " +
        " where status='F' and  error_message = 'Unmapped Item'  and store_id = ?;" +

        " SELECT count(*) as totalCount " +
        " FROM `stock_update_item_list` " +
        " where status='F' and  error_message = 'New Item'  and store_id =?;"
    const params = [event.storeId, parseInt(event.offset), parseInt(event.max), event.storeId, event.storeId, event.storeId, event.storeId];
    console.log("listQry ", listQry)
    queryExecution.queryExecution(client, jsonObj, event, listQry, params, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let resultData = response.result
        if (resultData[0].length == 0) {
            let mappedCount = resultData[1][0].totalCount
            let failedItemCount = resultData[2][0].totalCount
            let unmappedCount = resultData[3][0].totalCount
            let newitemCount = resultData[4][0].totalCount
            let processed = mappedCount + failedItemCount
            let imported = mappedCount + failedItemCount + unmappedCount + newitemCount
            const responseData = {
                success: "0",
                result: [{
                    list: resultData[0],
                    mappedCount: mappedCount,
                    failedItemCount: failedItemCount,
                    unmappedCount: unmappedCount,
                    newitemCount: newitemCount,
                    processed: processed,
                    imported: imported
                }],
                swapPercentage: resultData[2][0].swapPercentage,
                successMessage: "",
                errorMessage: "No data found."
            }
            callback(responseData);
        }
        for (let i = 0; i <= resultData[0].length; i++) {
            if (i < resultData[0].length) {
                resultData[0][i].itemPrice = parseFloat(resultData[0][i].itemPrice).toFixed(2)
                resultData[0][i].mrp = parseFloat(resultData[0][i].mrp).toFixed(2)
                resultData[0][i].offerPrice = resultData[0][i].offerText ? parseFloat(resultData[0][i].offerPrice).toFixed(2) : ""

                resultData[0][i].offerText = resultData[0][i].offerText ? resultData[0][i].offerText : ""
                resultData[0][i].offerFrom = resultData[0][i].offerFrom ? resultData[0][i].offerFrom : ""
                resultData[0][i].offerTo = resultData[0][i].offerTo ? resultData[0][i].offerTo : ""
            } else {
                let mappedCount = resultData[1][0].totalCount
                let failedItemCount = resultData[2][0].totalCount
                let unmappedCount = resultData[3][0].totalCount
                let newitemCount = resultData[4][0].totalCount
                let processed = mappedCount + failedItemCount
                let imported = mappedCount + failedItemCount + unmappedCount + newitemCount
                if (event.importStatusId) {
                    let updateQry = `
                        UPDATE store_item_stock_import_status 
                        SET 
                            aws_count = ?, 
                            error_count = ?, 
                            import_count = ?, 
                            process_count = ? 
                        WHERE 
                            id = ?
                    `;

                    let updateQryParams = [
                        mappedCount,
                        failedItemCount,
                        imported,
                        processed,
                        event.importStatusId
                    ];

                    queryExecution.queryExecution(client, jsonObj, event, updateQry, updateQryParams, function (response) {
                        if (response.success == '0') {
                            callback(response);
                        } else {
                            const responseData = {
                                success: "1",
                                result: [{
                                    list: resultData[0],
                                    mappedCount: mappedCount,
                                    failedItemCount: failedItemCount,
                                    unmappedCount: unmappedCount,
                                    newitemCount: newitemCount,
                                    processed: processed,
                                    imported: imported
                                }],
                                successMessage: "Success",
                                errorMessage: ""
                            }
                            callback(responseData);
                        }
                    });

                } else {
                    const responseData = {
                        success: "1",
                        result: [{
                            list: resultData[0],
                            mappedCount: mappedCount,
                            failedItemCount: failedItemCount,
                            unmappedCount: unmappedCount,
                            newitemCount: newitemCount
                        }],
                        successMessage: "Success",
                        errorMessage: ""
                    }
                    callback(responseData);
                }
            }
        }

    });
}
module.exports = methods;