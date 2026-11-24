let mysql = require('mysql');
let crypto = require('crypto');
let methods = {};
//let queryExecution = require('./../queryExecution');
methods.encryptUrl = function (client, jsonObj, orderReviewParams, queryExecution, event, callback) {
    console.log("innnnnn,,,/......", orderReviewParams)
    let orderId = orderReviewParams.orderId
    let algorithm = 'aes256';
    let loginKeyQuery = `SELECT config_value AS loginKey FROM configuration where config_key = 'loginKey' ;`
    console.log("loginKeyQuery...", loginKeyQuery)
    console.log("queryExecution...", queryExecution)
    // console.log("client...",client)
    queryExecution.queryExecution(client, jsonObj, event, loginKeyQuery,[], function (response) {
        console.log("response....loginKeyQuery..", response)
        if (response.success == '0') {
            console.log("222222")
            callback(response);
        } else {
            let key = response.result[0].loginKey;
            // console.log("key....", key)
            var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
            let cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
            let encryptedorderId = cipher.update(orderId.toString(), 'utf8', 'hex') + cipher.final('hex');
            console.log("encryptedorderId....", encryptedorderId, "......", orderReviewParams.orderId)
            callback(encryptedorderId);
        }
    })
}
module.exports = methods;
