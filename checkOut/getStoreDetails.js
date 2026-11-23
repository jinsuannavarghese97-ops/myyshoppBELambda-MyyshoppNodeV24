const queryExecution = require('../queryExecution')
let methods = {};

methods.getStoreDetails = function (client, jsonObj, event, callback) {

    let queryString = "Select s.id as storeId,s.name as storeName,CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
        " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT  config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/', " +
        " if(s.logo_path is null,'default.jpg',s.logo_path)) AS image_path " +
        " FROM store as s " +
        " WHERE id = ?"
    queryExecution.queryExecution(client, jsonObj, event, queryString, [event.storeId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        let storeDetails = []
        for (let i = 0; i < results.length; i++) {
            const storeData = {
                storeId: results[i].storeId,
                storeName: results[i].storeName,
                storeLogo: results[i].image_path
            }
            storeDetails.push(storeData)
        }
        const responseData = {
            success: "1",
            successMessage: storeDetails.length > 0 ? "Success" : "No data found.",
            storeDetails: storeDetails,
            errorMessage: ""
        }
        callback(responseData);
    });
}
module.exports = methods;