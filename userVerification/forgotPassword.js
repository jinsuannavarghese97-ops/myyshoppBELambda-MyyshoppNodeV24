let smsCommon = require('./smsCommon.js');
const smsSettings = require('../smsSettings.js');
let methods = {};
let queryExecution = require('../queryExecution');
methods.forgotPassword = function (client,jsonObj , event, callback) {
    let randomInt = Math.floor((Math.random() * 1000000) + 1);
    let userInput = jsonObj.userInput.split('@');
    let date = new Date();
    let createdOn = Date.parse(date);
    let whereQuery = "";
    let whereQueryval = '';
    let userData = [];
    event.smsEmailType = 11
    event.randomInt = randomInt
    let message = "OTP is " + randomInt + " for Forgot Password. Please enter the OTP to complete the process."
    if (userInput.length > 1) {
        whereQuery = " where email_id=?  and su.enabled is true "
        whereQueryval = jsonObj.userInput
    } else {
        whereQuery = " where mobile_number=?  and su.enabled is true "
        whereQueryval = jsonObj.userInput
    }
    let userQuery = "SELECT su.mobile_number as mobile_number,su.id as Id from sec_user as su " +
        " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id=su.id " +
        " INNER JOIN sec_role as sr on sr.id=susr.sec_role_id and sr.id = 2 " +
        whereQuery + " and su.site_id= ?; "+
        "SELECT  ( " +
        "select c.config_value as configValue " +
        "from configuration as c " +
        "where c.config_key = 'smsLoginName' " +
        ") AS smsLoginName, " +
        "( " +
        "select c.config_value as configValue " +
        "from configuration as c " +
        "where c.config_key = 'smsApiPassword' " +
        ") AS smsApiPassword, " +
        "( " +
        "select c.config_value as configValue " +
        "from configuration as c " +
        "where c.config_key = 'smsSender' " +
        ") AS smsSender; "
        console.log("userQuery ",userQuery)
    //connection.query(userQuery, function (err, userQueryResult) {
    queryExecution.queryExecution(client, jsonObj, event, userQuery,[whereQueryval,jsonObj.siteId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let userQueryResult = response.result;
        console.log("................",userQueryResult[0])
        if (userQueryResult[0].length > 0) {
            
            event.message = message;
            event.mobileNumber = userQueryResult[0][0].mobile_number
            event.siteId = jsonObj.siteId
            event.userId = userQueryResult[0][0].Id
            let existQry = "select * from user_mobile_otp WHERE mobile_number = ? ;"
            //connection.query(existQry, function (errExist, existResult) {
            queryExecution.queryExecution(client, jsonObj, event, existQry,[event.mobileNumber], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let existResult = response.result;
                let sqlUpdate = ""
                sqlUpdate = existResult.length > 0 ? " UPDATE user_mobile_otp SET created_on=UNIX_TIMESTAMP(),otp = ? WHERE mobile_number = ?" : "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',UNIX_TIMESTAMP(),?,?)"
                console.log("sqlUpdate ", sqlUpdate)
                let params = existResult.length > 0 ? [randomInt,event.mobileNumber]:[event.mobileNumber,randomInt]
                //connection.query(sqlUpdate, function (err, sqlUpdateResult) {
                queryExecution.queryExecution(client, jsonObj, event, sqlUpdate,[...params], function (response) {
                    if (response.success == '0') {
                        callback(response);
                    }
                    let sqlUpdateResult = response.result;
                    smsSettings.smsSettings(client, jsonObj, event, queryExecution,  function (response) {
                        return callback(response)
                    });
                })
            });
        } else {
            ////console.log("test")
            const response = {
                success: "0",
                
                errorMessage: "Mobile Number/Email Id Not Registered!",
                successMessage: ""
            };
            return callback(response);
        }
    });
}
module.exports = methods;
