const methods = {};
const queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {

    let listQuery = "SELECT id,store_id as storeId,site_id as siteId,concat((select config_value from configuration where config_key = 's3Address'),'/', " +
        " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
        " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
        " (select config_value from configuration where config_key = 's3pharmacyItemFolder') " +
        " ,'/attachments/',attachment_name) as path,attachment_name as attachments " +
        " FROM ph_buyer_attachments " +
        " WHERE is_active is true and buyer_id = ? and site_id = ? " +
        " and store_id = ?; " 

        //+ " SELECT `config_value` as accessKey FROM `configuration` WHERE  `config_key` = 's3bucketAccessKey'; " +
        // " SELECT `config_value` as secretKey FROM `configuration` WHERE  `config_key` = 's3bucketSecretKey'; "
       

    const listQueryParams = [event.buyerId, event.siteId, event.storeId];
    queryExecution.queryExecution(client, jsonObj, event, listQuery, listQueryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let resultData = response.result;
        const responseData = {
            success: "1",
            result: {
                phListing: resultData[0],
                secretKey: "",//resultData[1][0].accessKey,
                accessKey: "",//resultData[2][0].secretKey,
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(responseData);

    });
}
module.exports = methods;