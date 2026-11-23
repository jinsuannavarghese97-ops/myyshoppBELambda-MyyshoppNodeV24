let mysql = require('mysql');
let methods = {};
methods.saveOrUpdateSaleOrderPackingDetails = function (client, jsonObj, event, queryExecution, callback) {
    console.log("Inside saveOrUpdateSaleOrderPackingDetails.....", event.ondcStatus)
    if (event.ondcStatus && event.ondcStatus == 2) {
        let saveSaleOrderPackingDetailsQuery = "";
        let saveSaleOrderPackingDetailsParams = [];
        let dateTime = new Date().getTime()
        let packingDetails = event.packingDetails;

        packingDetails.userId = event.userId
        packingDetails.saleOrderId = event.orderId
        packingDetails.weightUnit = packingDetails.weightUnit ? packingDetails.weightUnit : null
        packingDetails.weightValue = packingDetails.weightValue ? packingDetails.weightValue : null
        packingDetails.lengthUnit = packingDetails.lengthUnit ? packingDetails.lengthUnit : null
        packingDetails.lengthValue = packingDetails.lengthValue ? packingDetails.lengthValue : null
        packingDetails.breadthUnit = packingDetails.breadthUnit ? packingDetails.breadthUnit : null
        packingDetails.breadthValue = packingDetails.breadthValue ? packingDetails.breadthValue : null
        packingDetails.heightUnit = packingDetails.heightUnit ? packingDetails.heightUnit : null
        packingDetails.heightValue = packingDetails.heightValue ? packingDetails.heightValue : null

        console.log(" packingDetails....", packingDetails.saleOrderId)

        let existsQUery = " select id,sale_order_id from sale_order_packing_details where sale_order_id=?";
        console.log(" existsQUery....", existsQUery)
        queryExecution.queryExecution(client, jsonObj, event, existsQUery, [packingDetails.saleOrderId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let results = response.result;

            if (results.length > 0) {
                saveSaleOrderPackingDetailsQuery = `
                    UPDATE sale_order_packing_details 
                    SET 
                        sale_order_id = ?, 
                        modified_on = ?, 
                        modified_by = ?, 
                        weight_unit = ?, 
                        weight_value = ?, 
                        length_unit = ?, 
                        length_value = ?, 
                        breadth_unit = ?, 
                        breadth_value = ?, 
                        height_unit = ?, 
                        height_value = ? 
                    WHERE sale_order_id = ?;
                `;

                saveSaleOrderPackingDetailsParams = [
                    packingDetails.saleOrderId,
                    dateTime,
                    packingDetails.userId,
                    packingDetails.weightUnit,
                    packingDetails.weightValue,
                    packingDetails.lengthUnit,
                    packingDetails.lengthValue,
                    packingDetails.breadthUnit,
                    packingDetails.breadthValue,
                    packingDetails.heightUnit,
                    packingDetails.heightValue,
                    packingDetails.saleOrderId
                ];

            }
            else {
                saveSaleOrderPackingDetailsQuery = `
                    INSERT INTO sale_order_packing_details 
                    (sale_order_id, created_on, created_by, weight_unit, weight_value, length_unit, length_value, breadth_unit, breadth_value, height_unit, height_value) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;

                saveSaleOrderPackingDetailsParams = [
                    packingDetails.saleOrderId,
                    dateTime,
                    packingDetails.userId,
                    packingDetails.weightUnit,
                    packingDetails.weightValue,
                    packingDetails.lengthUnit,
                    packingDetails.lengthValue,
                    packingDetails.breadthUnit,
                    packingDetails.breadthValue,
                    packingDetails.heightUnit,
                    packingDetails.heightValue
                ];

            }
            console.log("saveSaleOrderPackingDetailsQuery.....", saveSaleOrderPackingDetailsQuery)
            queryExecution.queryExecution(client, jsonObj, event, saveSaleOrderPackingDetailsQuery, saveSaleOrderPackingDetailsParams, function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                else {
                    let responseData = {
                        "success": "1",
                        "successMessage": "Success",
                        "result": packingDetails.saleOrderId,
                        "errorMessage": ""
                    }
                    callback(responseData)
                }
            });
        });
    }
    else {
        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "result": "No change in save Update Packing Details",
            "errorMessage": ""
        }
        callback(responseData)
    }


};
module.exports = methods;
