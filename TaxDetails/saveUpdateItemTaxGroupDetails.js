const methods = {};
let queryExecution = require('../queryExecution');
methods.saveOrUpdateItemTaxGroupDetails = function (client, jsonObj, event, callback) {

    let saveItemTaxGroupDetailsQuery = "";
    let saveItemTaxGroupDetailsQueryParams = [];
    let itemTaxGroupDetailsId = "";
    let whereQuery = "";
    let whereQueryParams = [];
    if (event.itemTaxGroupDetailsId) {
        saveItemTaxGroupDetailsQuery = `
            UPDATE item_tax_group_details 
            SET item_id = ?, tax_group_id = ?
            WHERE id = ?
        `;
        saveItemTaxGroupDetailsQueryParams = [event.itemId, event.taxGroupId, event.itemTaxGroupDetailsId];
        whereQuery = " and id!= ?";
        whereQueryParams = [event.itemTaxGroupDetailsId];
    }
    else {
        saveItemTaxGroupDetailsQuery = `
            INSERT INTO item_tax_group_details (item_id, tax_group_id) 
            VALUES (?, ?)
        `;
        saveItemTaxGroupDetailsQueryParams = [event.itemId, event.taxGroupId];
    }

    let checkItemTaxGroupDetailsAlreadyExistQuery = "select id from item_tax_group_details where item_id= ? " + whereQuery
    console.log("--checkItemTaxGroupDetailsAlreadyExistQuery--", checkItemTaxGroupDetailsAlreadyExistQuery)
    queryExecution.queryExecution(client, jsonObj, event, checkItemTaxGroupDetailsAlreadyExistQuery, [event.itemId, ...whereQueryParams], function (response) {
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
            queryExecution.queryExecution(client, jsonObj, event, saveItemTaxGroupDetailsQuery, saveItemTaxGroupDetailsQueryParams, function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                else {
                    let saveItemTaxGroupDetailsQueryResult = response.result
                    console.log(saveItemTaxGroupDetailsQueryResult)

                    if (event.itemTaxGroupDetailsId) { itemTaxGroupDetailsId = event.itemTaxGroupDetailsId } else { itemTaxGroupDetailsId = saveItemTaxGroupDetailsQueryResult.insertId }
                    const responseData = {
                        success: "1",
                        result: {
                            "itemTaxGroupDetailsId": itemTaxGroupDetailsId

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