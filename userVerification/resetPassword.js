let crypto = require('crypto')
let jwt = require('jsonwebtoken');
let methods = {};
let queryExecution = require('../queryExecution');
methods.resetPassword = function (client,jsonObj , event, callback) {
    
    let token = event.token
    let decoded = jwt.decode(token, { complete: true });
    console.log("decoded.payload ",decoded.payload)
    let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey'"
    queryExecution.queryExecution(client, jsonObj, event, queryConfigKey,[], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
        let key = results[0].config_value;
        let newPasswordText = event.token ? decoded.payload.newPasswordInResetPwrd : jsonObj.newPassword;
        let userId = event.token ? decoded.payload.userIdInResetPwrd : jsonObj.userId
        let cipher = crypto.createCipher(algorithm, key);
        let encryptedNewPassword = cipher.update(newPasswordText, 'utf8', 'hex') + cipher.final('hex');
        if (userId) {
            let updateQry = "UPDATE sec_user SET react_password=? where id =? " 
                queryExecution.queryExecution(client, jsonObj, event, updateQry,[encryptedNewPassword,userId], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let resultsUpdate = response.result;
                response = {
                    "success": "1",
                    "errorMessage": "",
                    "successMessage": "Password updated successfully"
                }
                callback(response);
            });
            
        } 
        else {
            const response = {
                "success": "0",
                "errorMessage": "",
                "successMessage": "Something went wrong."
            }
            callback(response);
        }
    });
}

module.exports = methods;
