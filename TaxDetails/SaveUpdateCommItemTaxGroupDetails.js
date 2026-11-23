const methods = {};
let queryExecution = require('../queryExecution');
methods.SaveUpdateCommItemTaxGroupDetails = function (client, jsonObj, event, callback) {

    let saveItemTaxGroupDetailsQuery = "";;
    let saveItemTaxGroupDetailsQueryParams = [];
    let cmItemTaxGroupDetailsId = "";
    let whereQuery = "";
    let whereQueryParams = [];

    if (event.cmItemTaxGroupDetailsId) {

        saveItemTaxGroupDetailsQuery = `
            UPDATE cm_item_tax_group_details 
            SET cm_item_id = ?, tax_group_id = ?
            WHERE id = ?
        `;
        whereQuery = " and id!= ? ";
        whereQueryParams = [event.cmItemTaxGroupDetailsId];
        saveItemTaxGroupDetailsQueryParams = [event.cmItemId, event.taxGroupId, event.cmItemTaxGroupDetailsId];
    }
    else {
        saveItemTaxGroupDetailsQuery = `
            INSERT INTO cm_item_tax_group_details (cm_item_id, tax_group_id) 
            VALUES (?, ?)
        `;
        saveItemTaxGroupDetailsQueryParams = [event.cmItemId, event.taxGroupId];

    }

    let checkItemTaxGroupDetailsAlreadyExistQuery = "select id from cm_item_tax_group_details where cm_item_id= ?" + whereQuery
    console.log("--checkItemTaxGroupDetailsAlreadyExistQuery--", checkItemTaxGroupDetailsAlreadyExistQuery)
    queryExecution.queryExecution(client, jsonObj, event, checkItemTaxGroupDetailsAlreadyExistQuery, [event.cmItemId, ...whereQueryParams], function (response) {
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

                    if (event.cmItemTaxGroupDetailsId) { cmItemTaxGroupDetailsId = event.cmItemTaxGroupDetailsId } else { cmItemTaxGroupDetailsId = saveItemTaxGroupDetailsQueryResult.insertId }
                    const responseData = {
                        success: "1",
                        result: {
                            "itemTaxGroupDetailsId": cmItemTaxGroupDetailsId

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
