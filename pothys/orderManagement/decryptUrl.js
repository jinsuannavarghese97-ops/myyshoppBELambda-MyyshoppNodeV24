let mysql = require('mysql');
let crypto = require('crypto');
let methods = {};
methods.decryptUrl = function (client, jsonObj, event, queryExecution, callback) {
    let orderId = event.encryptedOrderId
    let loginKeyQuery = `SELECT config_value AS loginKey FROM configuration where config_key = 'loginKey' ;`
    queryExecution.queryExecution(client, jsonObj, event, loginKeyQuery,[], function (response) {
        //   console.log("response....loginKeyQuery..", response)
        if (response.success == '0') {
            //   console.log("222222")
            callback(response);
        }
        let algorithm = 'aes256';
        let key = response.result[0].loginKey;
        //  console.log("key....", key)
        var text = orderId;
        var decipher = crypto.createDecipher(algorithm, key);
        var decryptedUrl = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
        //   console.log("decryptedUrl....", decryptedUrl)
        const responseData = {
            success: "1",
            result: {
                decryptedOrderId: decryptedUrl
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(responseData);

    })
}
module.exports = methods;
