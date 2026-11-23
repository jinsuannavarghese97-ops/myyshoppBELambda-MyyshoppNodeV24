const queryExecution = require('../queryExecution');
const methods = {};
methods.saveCommonItemStock = function (client, event, jsonObj, callback) {


    let mrp = jsonObj.mrp != "" ? parseFloat(jsonObj.mrp) : 0
    let itemPrice = jsonObj.itemPrice != "" ? parseFloat(jsonObj.itemPrice) : 0
    let cmItemIdData = jsonObj.cmItemId


    if (cmItemIdData) {
        let updateQuery = `
            UPDATE cm_item 
            SET 
                modified_by = ?, 
                modified_on = NOW(), 
                item_price = ?, 
                mrp = ?, 
                title = ? 
            WHERE id = ?
        `;

        let updateQueryParams = [jsonObj.userId, jsonObj.itemPrice, jsonObj.mrp, jsonObj.title, cmItemIdData];

        queryExecution.queryExecution(client, jsonObj, event, updateQuery, updateQueryParams, function (response) {
            if (response.success == '0') {
                console.log("11111", updateQuery)
                callback(response);
            }

            else {
                let cm_item_size_updateQuery = "update cm_item_size set is_active = false where cm_item_id = ?";
                queryExecution.queryExecution(client, jsonObj, event, cm_item_size_updateQuery, [cmItemIdData], function (response) {
                    if (response.success == '0') {
                        console.log("222", cm_item_size_updateQuery)
                        callback(response);
                    }
                    else {
                        for (const eachData of jsonObj.cmSizeAndQuantity) {
                            let cm_type_size_getQry = "select id from cm_type_size where cm_size_id = ? and cm_type_id = ?";
                            queryExecution.queryExecution(client, jsonObj, event, cm_type_size_getQry, [eachData.cmSizeId, jsonObj.cmTypeId], function (response) {
                                if (response.success == '0') {
                                    console.log("333", cm_type_size_getQry)
                                    callback(response);
                                }
                                else {
                                    let cmItemSizeId = ""
                                    let cmTypeSizeData = response.result
                                    if (eachData.cmSizeId) {
                                        if (cmTypeSizeData.length > 0) {
                                            let updatecm_item_sizeQry = "";
                                            let updatecm_item_sizeQryParams = [];
                                            if (eachData.cmItemSizeId) {
                                                updatecm_item_sizeQry += `
                                                    UPDATE cm_item_size 
                                                    SET 
                                                        cm_size_id = ?, 
                                                        available_quantity = ?, 
                                                        is_active = TRUE 
                                                    WHERE id = ?
                                                `;

                                                updatecm_item_sizeQryParams.push(eachData.cmSizeId, eachData.quantity, eachData.cmItemSizeId);

                                                queryExecution.queryExecution(client, jsonObj, event, updatecm_item_sizeQry, updatecm_item_sizeQryParams, function (response) {
                                                    if (response.success == '0') {
                                                        console.log("444", updatecm_item_sizeQry)
                                                        callback(response);
                                                    }
                                                    else {
                                                        cmItemSizeId = eachData.cmItemSizeId
                                                        response.result = []
                                                        response.successMessage = "Success."
                                                        callback(response);
                                                    }
                                                })

                                            }
                                            else {
                                                let insert_cm_item_sizeQry = `
                                                    INSERT INTO cm_item_size 
                                                    (version, cm_item_id, cm_size_id, cm_type_size_id, available_quantity, is_active, buy_count) 
                                                    VALUES (0, ?, ?, ?, ?, TRUE, 0)
                                                `;

                                                let insert_cm_item_sizeQryParams = [cmItemIdData, eachData.cmSizeId, cmTypeSizeData[0].id, eachData.quantity];

                                                queryExecution.queryExecution(client, jsonObj, event, insert_cm_item_sizeQry, insert_cm_item_sizeQryParams, function (response) {
                                                    if (response.success == '0') {
                                                        console.log("555", insert_cm_item_sizeQry)
                                                        callback(response);
                                                    }
                                                    else {
                                                        let insertCmItemSizeData = response.result
                                                        cmItemSizeId = insertCmItemSizeData.insertId
                                                        response.result = []
                                                        response.successMessage = "Success."
                                                        callback(response);
                                                    }
                                                })

                                            }
                                        }
                                        else {
                                            let insertCm_typesizeQry = `
                                                INSERT INTO cm_type_size 
                                                (version, cm_size_id, cm_type_id, is_active) 
                                                VALUES (0, ?, ?, TRUE)
                                            `;

                                            let insertCm_typesizeQryParams = [eachData.cmSizeId, jsonObj.cmTypeId];

                                            queryExecution.queryExecution(client, jsonObj, event, insertCm_typesizeQry, insertCm_typesizeQryParams, function (response) {
                                                if (response.success == '0') {
                                                    console.log("666", insertCm_typesizeQry)
                                                    callback(response);
                                                }
                                                else {
                                                    response.result = []
                                                    response.successMessage = "Success."
                                                    callback(response);
                                                }
                                            })
                                        }
                                    }
                                }
                            })
                        }
                    }
                })
            }
        })
    }
}
module.exports = methods;
