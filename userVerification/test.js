var mysql = require('mysql');
var nodemailer = require('nodemailer');
var request = require("request");
var smsCommon = require('./smsCommon.js');
var methods = {};
let queryExecution = require('../queryExecution');
methods.forgotPassword = function (client,jsonObj , event, callback) {
    var pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField(field, useDefaultTypeCasting) { if ((field.type === "BIT") && (field.length === 1)) { var bytes = field.buffer(); return (bytes[0] === 1); } return (useDefaultTypeCasting()); }
    });

    pool.getConnection(function (err, connection) {
        var randomInt = Math.floor((Math.random() * 1000000) + 1);
        var userInput = jsonObj.userInput.split('@');
        //var userInput = jsonObj.userInput;
        ////console.log("user..."+userInput)
        var date = new Date();
        var createdOn = Date.parse(date);
        var whereQuery = "";
        var whereQueryval = "";
        var userData = [];
        var message = "OTP is " + randomInt + " for Forgot Password. Please enter the OTP to complete the process."
       
        if (userInput.length > 1) {
            whereQuery = " where email_id= ? "
            whereQueryval = jsonObj.userInput
        }
        else {
            whereQuery = " where mobile_number= ? "
            whereQueryval = jsonObj.userInput
        }
        var userQuery = "SELECT su.mobile_number as mobile_number,su.id as Id,sr.authority as userRole from sec_user as su " +
            "INNER JOIN sec_user_sec_role as susr on susr.sec_user_id=su.id " +
            "INNER JOIN sec_role as sr on sr.id=susr.sec_role_id " + whereQuery + "; " +
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
        ////console.log("userQuery..."+userQuery)
        connection.query(userQuery,[whereQueryval], function (err, userQueryResult) {
            
            if (userQueryResult[0].length > 0) {

                for (let i = 0; i <= userQueryResult[0].length; i++) {
                    if(i<userQueryResult[0].length){
                    var mobileNumber = userQueryResult[0][i].mobile_number
                    console.log(userQueryResult[0][i])
                    console.log(userQueryResult[0][i].Id, " userQueryResult[i].userRole.." + userQueryResult[0][i].userRole)
                    if (userQueryResult[0][i].userRole == "ROLE_BUYER") {
                        console.log("1111111111111111111 ",userQueryResult[0][i].Id)
                        var siteQuery = "SELECT site_id from site_buyer where buyer_id = ?;" +
                            " Select usrMobOtp.id as userMobOtpId,usrMobOtp.otp as userOtp from user_mobile_otp as usrMobOtp " +
                            " where usrMobOtp.mobile_number = ? "

                        connection.query(siteQuery,[userQueryResult[0][i].Id,mobileNumber], function (err, siteQueryResult) {
                            console.log("siteQueryResult[0][0].site_id ",siteQueryResult)
                            console.log("jsonObj.siteId ",jsonObj.siteId)
                            if (siteQueryResult[0].length > 0) {
                                
                                if (siteQueryResult[0][0].site_id == jsonObj.siteId) {
                                    console.log("if successs")
                                    if (siteQueryResult[1].length > 0) {
                                        event.message = message;
                                        event.mobileNumber = userQueryResult[0][i].mobile_number
                                        event.siteId = jsonObj.siteId
                                        event.userId = userQueryResult[0][i].Id
                                        var sqlUpdate = " UPDATE user_mobile_otp SET otp = ? WHERE mobile_number = ?"
                                        connection.query(sqlUpdate, [randomInt, mobileNumber], function (err, sqlUpdateResult) {
                                            console.log("if success 11111 ")
                                            smsCommon.smsCommon(client,jsonObj , event, function (response) {
                                                return callback(response)
                                                
                                            });

                                        });
                                    }
                                    else {
                                        var sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
                                        connection.query(sqlInsert,[createdOn,mobileNumber,randomInt], function (error, sqlInsertData, fields) {
                                            //console.log("errrr 44444444 ", err)

                                            smsCommon.smsCommon(client,jsonObj , event, function (response) {
                                                return callback(response)
                                            });

                                        });
                                    }


                                }
                            }
                            else {
                                // //console.log("test")
                                const response = {
                                    success: "0",

                                    errorMessage: "Mobile Number/Email Id Not Registered!",
                                    successMessage: ""
                                };
                                return callback(response);
                            }

                        });
                    }
                    else if (userQueryResult[0][i].userRole == "ROLE_SELLER") {
                        console.log("11111111111111111111111111")
                        var siteQuery = "SELECT id from site where seller_id = ?; " +
                            " select id from user_mobile_otp where mobile_number = ? ;"
                        connection.query(siteQuery,[userQueryResult[0][i].Id,mobileNumber], function (err, siteQueryResult, fields) {
                            if (siteQueryResult[0].length > 0) {
                                if (siteQueryResult[0][0].id == jsonObj.siteId) {
                                    var sqlUpdate
                                    var sqlUpdateval = []
                                    if (siteQueryResult[1].length > 0) {
                                        sqlUpdate = " UPDATE user_mobile_otp SET otp = ? WHERE mobile_number = ?"
                                        sqlUpdateval.push(randomInt,mobileNumber)
                                    }
                                    else {
                                        sqlUpdate = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
                                        sqlUpdateval.push(createdOn,mobileNumber,randomInt)
                                    
                                    }

                                    connection.query(sqlUpdate,sqlUpdateval, function (error, sqlInsertData, fields) {
                                            //console.log("errrr 44444444 ", err)
                                            event.message = message;
                                            event.mobileNumber = userQueryResult[0][i].mobile_number
                                            event.siteId = jsonObj.siteId
                                            event.userId = userQueryResult[0][i].Id
                                            smsCommon.smsCommon(client,jsonObj , event, function (response) {
                                                return callback(response)
                                            });

                                        });
                                }
                            }
                            else {
                                // //console.log("test")
                                const response = {
                                    success: "0",

                                    errorMessage: "Mobile Number/Email Id Not Registered!",
                                    successMessage: ""
                                };
                                return callback(response);
                            }

                        });

                    }
                    else if (userQueryResult[0][i].userRole == "ROLE_STORE") {
                        console.log("222222222222222222222")
                        var siteQuery = "SELECT st.id as site from store as s INNER JOIN seller as sl on sl.id=s.seller_id " +
                            "INNER JOIN site as st on st.seller_id = sl.id " +
                            "where s.sec_user_id = ?; " +
                            " select id from user_mobile_otp where mobile_number = ? ;"

                        connection.query(siteQuery,[userQueryResult[0][i].Id,mobileNumber], function (err, siteQueryResult) {
                            if (siteQueryResult[0].length > 0) {
                                if (siteQueryResult[0][0].site == jsonObj.siteId) {
                                    var sqlInsert
                                    var sqlInsertval = []
                                    if (siteQueryResult[1].length > 0) {
                                        sqlInsert = " UPDATE user_mobile_otp set created_on =?,otp=? where mobile_number = ? ;";
                                        sqlInsertval.push(createdOn,randomInt,mobileNumber)
                                    }
                                    else {
                                        sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
                                        sqlInsertval.push(createdOn,mobileNumber,randomInt)
                                    }
                                    connection.query(sqlInsert,sqlInsertval, function (error, sqlInsertData, fields) {
                                        event.message = message;
                                        event.mobileNumber = userQueryResult[0][i].mobile_number
                                        event.siteId = jsonObj.siteId
                                        event.userId = userQueryResult[0][i].Id
                                        smsCommon.smsCommon(client,jsonObj , event, function (response) {
                                            return callback(response)
                                        });
                                    });
                                }
                                else {
                                    ////console.log("test")
                                    const response = {
                                        success: "0",
                                        errorMessage: "Mobile Number/Email Id Not Registered!",
                                        successMessage: ""
                                    };
                                    return callback(response);
                                }
                            }
                            else {
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
                }
                else{
                    const response = {
                    success: "0",

                    errorMessage: "Mobile Number/Email Id Not Registered!",
                    successMessage: ""
                };
                return callback(response);
                }
                }
                
                ////console.log("userQueryResult")
            }
            else {
                ////console.log("test")
                const response = {
                    success: "0",

                    errorMessage: "Mobile Number/Email Id Not Registered!",
                    successMessage: ""
                };
                return callback(response);
            }
        });
    });

}
module.exports = methods;
