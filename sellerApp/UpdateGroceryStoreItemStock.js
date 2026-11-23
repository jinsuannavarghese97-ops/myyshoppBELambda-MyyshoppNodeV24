const queryExecution = require('../queryExecution');
const methods = {};
methods.updateStoreItemStockGrocery = function (client, jsonObj, event, callback) {
    try {
        let qry = `
            UPDATE store_item_stock 
            SET 
                item_name = ?, 
                mrp = ?, 
                net_amount = ?, 
                stock_quantity = ?, 
                unit = ?, 
                unit_type = ?, 
                modified_by = ?, 
                modified_on = NOW() 
            WHERE id = ?;
        `;

        let qryParams = [
            event.itemName,
            event.mrp,
            event.netAmount,
            event.stockQuantity,
            event.unit,
            event.unitType,
            event.userId,
            event.storeItemStockId
        ];

        queryExecution.queryExecution(client, jsonObj, event, qry, qryParams, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            else {
                const response1 = {
                    success: "1",
                    successMessage: "Success",
                    errorMessage: ""

                }
                callback(response1);
            }
        });

    }
    catch (e) {
        const response = {
            success: "0",
            successMessage: "",
            errorMessage: "Something went wrong."
        }
        callback(response);

    }

}
module.exports = methods;
