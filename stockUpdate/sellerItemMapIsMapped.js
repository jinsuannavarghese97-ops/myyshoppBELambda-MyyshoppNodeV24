const queryExecution = require('../queryExecution');
const methods = {};
methods.sellerItemMapIsMapped = function (client, jsonObj, event, callback) {
    let generalQuery = "select si.id as sellerItemId, if(sis.id, 1, 0) as isStockUpdate  " +
        " from seller_item as si " +
        " left join store_item_stock as sis on si.id = sis.seller_item_id " +
        " where si.id in ("+event.sellerItemId+");"
    queryExecution.queryExecution(client, jsonObj, event, generalQuery, [], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let generalResults = response.result
        if (generalResults.length > 0) {
            const response = {
                success: "1",
                resultData: JSON.parse(JSON.stringify(generalResults).replace(/\:null/gi, "\:\"\"")),
                errorMessage: "",
                successMessage: "success"
            }
            return callback(response);

        } else {
            const response = {
                success: "0",
                successMessage: "",
                errorMessage: "No Data Found"
            };
            return callback(response);
        }
    });
}
module.exports = methods;