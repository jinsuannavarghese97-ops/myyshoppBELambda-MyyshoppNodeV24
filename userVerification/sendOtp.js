let smsCommon = require('./smsCommon.js');
let methods = {};
let queryExecution = require('../queryExecution');
methods.sendOtp = function (client, jsonObj, event, callback) {
    let message
    let randomInt = Math.floor((Math.random() * 1000000) + 1);
    if (jsonObj.type == "Forgot Password") {
        message = "OTP is " + randomInt + " for Forgot Password. Please enter the OTP to complete the process."
    } else if (jsonObj.type == "SignUp") {
        message = "OTP is " + randomInt + " for registration. Please enter the OTP to complete the process."
    } else if (jsonObj.type == "Login") {
        message = "OTP is " + randomInt + " for login. Do not share the OTP with anyone for security reasons."
    } else {
        message = "OTP is " + randomInt + "  Please enter the OTP to complete the process."
    }

    let whereQuery = "";
    let whereQueryParams = [];

    let userInput = jsonObj.userInput.split('@');
    let siteId = jsonObj.siteId;
    event.siteId = jsonObj.siteId
    let smsSender;
    let date = new Date();
    let createdOn = Date.parse(date);
    let otp

    if (userInput.length > 1) {
        whereQuery = " where su.email_id = ?";
        whereQueryParams.push(jsonObj.userInput);
    } else {
        whereQuery = " where su.mobile_number = ?";
        whereQueryParams.push(jsonObj.userInput);
    }
    let userQuery = "SELECT su.mobile_number as mobile_number,su.id as Id,sr.authority as userRole,su.email_id from sec_user as su " +
        "INNER JOIN sec_user_sec_role as susr on susr.sec_user_id=su.id " +
        "INNER JOIN sec_role as sr on sr.id=susr.sec_role_id " + whereQuery
    //connection.query(userQuery, function (error, userResult, fields) {
    queryExecution.queryExecution(client, jsonObj, event, userQuery, [...whereQueryParams], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let userResult = response.result;
        if (userResult.length > 0) {
            if (jsonObj.type == "Forgot Password" || jsonObj.type == "Login") {
                for (let i = 0; i < userResult.length; i++) {
                    let userId = userResult[i].Id;
                    let userSiteData = "";
                    let userSiteDataParams = [];
                    if (userResult[i].userRole == 'ROLE_SELLER') {
                        userSiteData = "SELECT id as siteId from site where seller_id = ?";
                        userSiteDataParams = [userResult[i].Id];
                    } else if (userResult[i].userRole == 'ROLE_STORE') {
                        userSiteData = " SELECT id as siteId from site as s" +
                            " INNER JOIN store as st on st.seller_id = s.seller_id " +
                            " where s.sec_user_id = ?";
                        userSiteDataParams = [userResult[i].Id];
                    } else if (userResult[i].userRole == 'ROLE_BUYER') {
                        userSiteData = "select site_id as siteId from site_buyer where buyer_id = ?";
                        userSiteDataParams = [userResult[i].Id];
                    }
                    //connection.query(userSiteData, function (error, siteResult, fields) {
                    queryExecution.queryExecution(client, jsonObj, event, userSiteData, userSiteDataParams, function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        let siteResult = response.result;
                        if (siteResult[0].siteId == jsonObj.siteId) {
                            let mobileNumber = userResult[i].mobile_number
                            let userId = userResult[i].Id
                            let queryString = "SELECT  ( " +
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
                                ") AS smsSender "
                            //connection.query(queryString, function (error, results, fields) {
                            queryExecution.queryExecution(client, jsonObj, event, queryString,[], function (response) {
                                if (response.success == '0') {
                                    callback(response);
                                }
                                let results = response.result;
                                let queryString1 = " select s.site_url as siteUrl, s.seller_id as sellerId,s.site_category_group as siteCategoryGroup " +
                                    " from site as s " +
                                    " where s.id = ? ";
                                //connection.query(queryString1, function (error, results1, fields) {
                                queryExecution.queryExecution(client, jsonObj, event, queryString1,  [siteId], function (response) {
                                    if (response.success == '0') {
                                        callback(response);
                                    }
                                    let results1 = response.result;
                                    if (0 != results1[0].sellerId && null != results1[0].sellerId) {
                                        let queryString2 = " select sl.id as sellerId, ssd.sms_sender as smsSender " +
                                            " from seller as sl " +
                                            " inner join store as st ON st.seller_id = sl.id " +
                                            " inner join store_sms_details as ssd ON ssd.store_id = st.id " +
                                            " where sl.id = ?";
                                        //connection.query(queryString2, function (error, results2, fields) {
                                        queryExecution.queryExecution(client, jsonObj, event, queryString2,  [results1[0].sellerId], function (response) {
                                            if (response.success == '0') {
                                                callback(response);
                                            }
                                            let results2 = response.result;
                                            if (results2[0].smsSender != null || results2[0].smsSender != '') {
                                                smsSender = results2[0].smsSender
                                            } else {
                                                smsSender = results[0].smsSender
                                            }
                                            let buyerSite = " Select sb.site_id as siteBuyerId,b.first_name as firstName,b.last_name as lastName,su.display_name as displayName,su.email_id as emailId,su.mobile_number as mobileNumber,su.id as userId " +
                                                " from buyer as b " +
                                                " Inner join sec_user as su on su.id = b.id " +
                                                " inner join site_buyer as sb on sb.buyer_id = b.id " +
                                                " where b.id = ? and sb.site_id = ?";
                                            //connection.query(buyerSite, function (error, userExistData, fields) {
                                            queryExecution.queryExecution(client, jsonObj, event, buyerSite,  [userId, siteId], function (response) {
                                                if (response.success == '0') {
                                                    callback(response);
                                                }
                                                let userExistData = response.result;
                                                if (userExistData.length > 0) {

                                                    let mobileExistSite = " Select usrMobOtp.id as userMobOtpId,usrMobOtp.otp as userOtp,usrMobOtp.mobile_number as mobileNumber from user_mobile_otp as usrMobOtp " +
                                                        " where usrMobOtp.mobile_number = ? "
                                                    //connection.query(mobileExistSite, function (error, mobileExistData, fields) {
                                                    queryExecution.queryExecution(client, jsonObj, event, mobileExistSite,  [mobileNumber], function (response) {
                                                        if (response.success == '0') {
                                                            callback(response);
                                                        }
                                                        let mobileExistData = response.result;
                                                        if (mobileExistData.length > 0) {
                                                            let sqlUpdate = " UPDATE user_mobile_otp SET otp = ? WHERE mobile_number = ?";
                                                            //connection.query(sqlUpdate, function (err, sqlUpdateResult, fields) {
                                                            queryExecution.queryExecution(client, jsonObj, event, sqlUpdate,  [randomInt, mobileNumber], function (response) {
                                                                if (response.success == '0') {
                                                                    callback(response);
                                                                }
                                                                let sqlUpdateResult = response.result;

                                                                event.message = message;
                                                                event.mobileNumber = mobileNumber
                                                                event.siteId = jsonObj.siteId
                                                                //NEW CODE
                                                                smsCommon.smsCommon(client, jsonObj, event, function (response) {
                                                                    callback(response)
                                                                });

                                                            });
                                                        } else {
                                                            let sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
                                                            //connection.query(sqlInsert, function (error, sqlInsertData, fields) {
                                                            queryExecution.queryExecution(client, jsonObj, event, sqlInsert,  [createdOn, mobileNumber, randomInt], function (response) {
                                                                if (response.success == '0') {
                                                                    callback(response);
                                                                }
                                                                let sqlInsertData = response.result;

                                                                //NEW CODE
                                                                event.message = message;
                                                                event.mobileNumber = mobileNumber
                                                                event.siteId = jsonObj.siteId
                                                                smsCommon.smsCommon(client, jsonObj, event, function (response) {
                                                                    callback(response)
                                                                });
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    let response = {
                                                        success: "0",
                                                        errorMessage: "Invalid userid",
                                                        successMessage: ""
                                                    };
                                                    callback(response);
                                                }

                                            });

                                        });

                                    }
                                });
                            });
                        }

                    });
                }
            } else {
                let response = {
                    success: "0",
                    errorMessage: "Mobile number already exists",
                    successMessage: ""
                };
                callback(response);
            }
        } else {
            if (jsonObj.type == "SignUp" || jsonObj.type == "numberChange") {
                let queryString = " SELECT * FROM user_mobile_otp where mobile_number = ?; ";
                //connection.query(queryString, function (error, results, fields) {
                queryExecution.queryExecution(client, jsonObj, event, queryString,  [jsonObj.userInput], function (response) {
                    if (response.success == '0') {
                        callback(response);
                    }
                    let results = response.result;
                    let sqlInsert = "";
                    let sqlInsertParams = [];
                    if (results.length > 0) {
                        sqlInsert = "UPDATE user_mobile_otp set otp = ? where mobile_number =? )";
                        sqlInsertParams = [randomInt, jsonObj.userInput];
                    } else {
                        sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
                        sqlInsertParams = [createdOn, jsonObj.userInput, randomInt];
                    }
                    //connection.query(sqlInsert, function (error, sqlInsertData, fields) {
                    queryExecution.queryExecution(client, jsonObj, event, sqlInsert,  sqlInsertParams, function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        let sqlInsertData = response.result;
                        event.message = message;
                        event.mobileNumber = jsonObj.userInput
                        event.siteId = jsonObj.siteId
                        smsCommon.smsCommon(client, jsonObj, event, function (response) {
                            callback(response)
                        });
                    });
                });
            } else {
                let response = {
                    success: "0",
                    errorMessage: "Invalid userid",
                    successMessage: ""
                };
                callback(response);
            }
        }
    });
}
module.exports = methods;
