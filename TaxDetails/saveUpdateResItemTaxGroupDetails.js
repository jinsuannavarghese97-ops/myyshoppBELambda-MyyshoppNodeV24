const methods = {};
let queryExecution = require('../queryExecution');
methods.saveOrUpdateRestaurantItemTaxGroupDetails = function (client, jsonObj, event, callback) {

    let saveItemTaxGroupDetailsQuery = "";
    let saveItemTaxGroupDetailsQueryParams = [];
    let rtItemTaxGroupDetailsId = "";
    let whereQuery = "";
    let whereQueryParams = [];
    if (event.rtItemTaxGroupDetailsId) {
        saveItemTaxGroupDetailsQuery = `
            UPDATE rt_store_item_tax_group_details 
            SET rt_item_id = ?, tax_group_id = ?
            WHERE id = ?
        `;
        saveItemTaxGroupDetailsQueryParams = [event.rtItemId, event.taxGroupId, event.rtItemTaxGroupDetailsId];

        whereQuery = " and id!= ? ";
        whereQuery = [event.rtItemTaxGroupDetailsId];
    }
    else {
        saveItemTaxGroupDetailsQuery = `
            INSERT INTO rt_store_item_tax_group_details (rt_item_id, tax_group_id) 
            VALUES (?, ?)
        `;
        saveItemTaxGroupDetailsQueryParams = [event.rtItemId, event.taxGroupId];
    }

    let checkItemTaxGroupDetailsAlreadyExistQuery = "select id from rt_store_item_tax_group_details where rt_item_id= ? " + whereQuery
    console.log("--checkItemTaxGroupDetailsAlreadyExistQuery--", checkItemTaxGroupDetailsAlreadyExistQuery)
    queryExecution.queryExecution(client, jsonObj, event, checkItemTaxGroupDetailsAlreadyExistQuery, [event.rtItemId, ...whereQueryParams], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let checkItemTaxGroupDetailsAlreadyExistQueryResult = response.result;
        if (checkItemTaxGroupDetailsAlreadyExistQueryResult.length > 0) {
            const response = {
                success: "0",
                result: {},
                errorMessage: "Item tax group details already exists",
                successMessage: ""
            };
            callback(response);
        }
        else {
            queryExecution.queryExecution(client, jsonObj, event, saveItemTaxGroupDetailsQuery, callback, saveItemTaxGroupDetailsQueryParams, function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                else {
                    let saveItemTaxGroupDetailsQueryResult = response.result
                    console.log(saveItemTaxGroupDetailsQueryResult)

                    if (event.itemTaxGroupDetailsId) { rtItemTaxGroupDetailsId = event.rtItemTaxGroupDetailsId } else { rtItemTaxGroupDetailsId = saveItemTaxGroupDetailsQueryResult.insertId }
                    const responseData = {
                        success: "1",
                        result: {
                            "rtItemTaxGroupDetailsId": rtItemTaxGroupDetailsId

                        },
                        errorMessage: "",
                        successMessage: "Success"
                    };
                    callback(responseData);
                }
            });
        }

    });

}
module.exports = methods;
