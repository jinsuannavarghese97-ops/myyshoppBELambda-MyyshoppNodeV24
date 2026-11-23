const queryExecution = require('../queryExecution');
const methods = {};

methods.getRtItemSize = function (client, jsonObj, event, callback) {

    let getRtItemSizeQuery = " select id,name from rt_item_size where is_active=true ";

    queryExecution.queryExecution(client, jsonObj, event, getRtItemSizeQuery, [],function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let itemSizeResults = response.result
        let resultData = {
            "itemSizeResults": itemSizeResults
        }
        const data = {
            success: "1",
            result: resultData,
            errorMessage: "",
            successMessage: resultData.itemSizeResults.length > 0 ? "Success" : "No data found"
        };
        callback(data);
    })

}
module.exports = methods;