let methods = {};
let queryExecution = require('../queryExecution');
methods.configuration = function (client, jsonObj, event, callback) {
    let configurationQuery = " select config_value from configuration where config_key = ?; "
    queryExecution.queryExecution(client, jsonObj, event, configurationQuery, [event.configKey], function (response) {
        callback(response);
    });
}

methods.s3configuration = function (client, jsonObj, event, callback) {
    // let configurationQuery = "select (select config_value from configuration where config_key = 's3bucketAccessKey') as accessKey, (select config_value from configuration where config_key = 's3bucketSecretKey') as secretKey, (select config_value from configuration where config_key = 'storeDigS3BucketName') as bucketName ; "
    let configurationQuery = "select (select config_value from configuration where config_key = 'storeDigS3BucketName') as bucketName ; "

    queryExecution.queryExecution(client, jsonObj, event, configurationQuery, [], function (response) {
        callback(response);
    });
}

module.exports = methods;