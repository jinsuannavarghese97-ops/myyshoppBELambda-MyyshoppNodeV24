const queryExecution = require('../queryExecution');
const methods = {};
methods.rtStoreItemBulkSaveUpdate = function (client, jsonObj, event, callback) {
    //let callProcedureQry = "call rt_store_item_bulk_upload_new(" + event.storeId + "," + event.userId + ");"
    let callProcedureQry = "call restaurant_items_bulk_upload(?,?);"
    console.log("callProcedureQry...", callProcedureQry)
    queryExecution.queryExecution(client, jsonObj, event, callProcedureQry, [event.storeId, event.userId], function (response) {

    })
    setTimeout(function () {
        // callback('Success');
        const responseData = {
            success: "1",
            successMessage: "",
            errorMessage: "Success"
        }
        callback(responseData);

    }, 19000);
}
module.exports = methods;