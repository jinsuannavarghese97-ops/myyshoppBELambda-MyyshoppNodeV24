const queryExecution = require('../queryExecution');
const methods = {};
methods.addDefaultItem = function (client, jsonObj, event, callback) {
    let queryString = "call upload_default_store_items(?,?)";
    queryExecution.queryExecution(client, jsonObj, event, queryString, [event.storeId, event.myCategoryId], function (response) {
        // if (response.success == '0') {
        //         callback(response);
        //     }
        //     else{
        //         const responseData = {
        //             success: "1",
        //             result: [],
        //             errorMessage: "",
        //             successMessage: "Success"
        //         };
        //         return callback(responseData);
        //     }
    })
    setTimeout(function () {
        callback('Success');
    }, 15000);
}
module.exports = methods;