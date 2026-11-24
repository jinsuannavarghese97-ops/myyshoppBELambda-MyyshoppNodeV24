let mysql = require('mysql');
let crypto = require('crypto')
let methods = {};
let queryExecution = require('../queryExecution');
let jwt = require('jsonwebtoken');
methods.verifyOTP = function(client, jsonObj, event, callback) {

    let mobileNumber = jsonObj.mobileNumber
    let otp = jsonObj.otp
    let siteId = jsonObj.siteId;
    let response
    let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey'"
    queryExecution.queryExecution(client, jsonObj, event, queryConfigKey,[], function(response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        let key = results[0].config_value;
        let otpDetailQuery = " select user.otp  as otp from user_mobile_otp as user " +
            " where user.mobile_number=? and user.otp= ?" 
        queryExecution.queryExecution(client, jsonObj, event, otpDetailQuery,[mobileNumber,otp], function(response) {
            if (response.success == '0') {
                callback(response);
            }
            let otpDeviceResults = response.result;
            if (otpDeviceResults.length > 0) {
                if (jsonObj.type == "SignUp") {

                    let decoded = jwt.decode(jsonObj.token, {
                        complete: true
                    });
                    let decodedFirstName = decoded.payload.txtFirstName;
                    let decodedEmailId = decoded.payload.emailId;
                    let decodedMobileNumber = decoded.payload.mobileNumber;
                    let decodedPassword = decoded.payload.password;
                    let isTermsAccepted = decoded.payload.isTermsAccepted;

                    let crypto = require('crypto');
                    let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
                    
                    let text = decodedPassword;
                    var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
                    let cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
                    let encryptedPassword = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
                    let username = Math.floor((Math.random() * 1000000) + 1);
                    let customerNumber = Math.floor((Math.random() * 1000000) + 1);
                    let siteId = jsonObj.siteId;
                    let txtdisplayName = decodedFirstName;
                    let userData = []
                    let otpFlag = "true"

                    let sql = " SELECT si.id as siteId,si.site_url as siteUrl from site as si " +
                        " where si.id =?"
                    queryExecution.queryExecution(client, jsonObj, event, sql,[siteId], function(response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        let result1 = response.result;
                        if (result1.length > 0) {
                            let emailExistSite = " Select b.id as buyerId from buyer as b " +
                                " Inner join sec_user as secUsr on secUsr.id = b.id " +
                                " Inner join site_buyer as siteBuyer on siteBuyer.buyer_id = b.id " +
                                " where secUsr.email_id =? and siteBuyer.site_id = ? "
                            queryExecution.queryExecution(client, jsonObj, event, emailExistSite,[decodedEmailId,result1[0].siteId], function(response) {
                                if (response.success == '0') {
                                    callback(response);
                                }
                                let emailExistSiteResult = response.result;
                                if (emailExistSiteResult.length > 0) {
                                    otpFlag = "false";
                                    const response = {
                                        success: "0",
                                        result: userData,
                                        errorMessage: "Email Id already Exists",
                                        successMessage: ""
                                    };
                                    callback(response);
                                } else {
                                    let mobileExistSite = " Select b.id as buyerId from buyer as b " +
                                        " Inner join sec_user as secUsr on secUsr.id = b.id " +
                                        " Inner join site_buyer as siteBuyer on siteBuyer.buyer_id = b.id " +
                                        " where secUsr.mobile_number = ? and siteBuyer.site_id = ? "

                                    queryExecution.queryExecution(client, jsonObj, event, mobileExistSite,[decodedMobileNumber,result1[0].siteId], function(response) {
                                        if (response.success == '0') {
                                            callback(response);
                                        }
                                        let mobileExistSiteResult = response.result;
                                        if (mobileExistSiteResult.length > 0) {
                                            otpFlag = "false";
                                            const response = {
                                                success: "0",
                                                result: userData,
                                                errorMessage: "Mobile Number already Exists",
                                                successMessage: ""
                                            };
                                            callback(response);
                                        } else {
                                            if (otpFlag == "true") {
                                                let sql1 = "INSERT INTO sec_user (version,account_expired,account_locked,enabled,is_verified,display_name,email_id,mobile_number,password,password_expired,username) VALUES ('0',0,0,1,1,?,?,?,?,0,?)";
                                                queryExecution.queryExecution(client, jsonObj, event, sql1,[txtdisplayName,decodedEmailId,decodedMobileNumber,encryptedPassword,username], function(response) {
                                                    if (response.success == '0') {
                                                        callback(response);
                                                    }
                                                    let result4 = response.result;
                                                    let sql = "SELECT * FROM sec_user where id = ?" 
                                                    queryExecution.queryExecution(client, jsonObj, event, sql,[result4.insertId], function(response) {
                                                        if (response.success == '0') {
                                                            callback(response);
                                                        }
                                                        let result5 = response.result;
                                                        let sql2 = " INSERT INTO buyer (id,created_by,created_on,customer_number,is_active,is_married,is_opt_in,is_terms_accepted,first_name,last_name,gender,number_of_kids,points,preferred_store_id,rank,rating,site_id) VALUES (?,?, NOW() ,?,1,0,1,?,?,'',2,1,0,0,0,0,?)";
                                                        queryExecution.queryExecution(client, jsonObj, event, sql2,[result5[0].id,result5[0].id,customerNumber,isTermsAccepted,decodedFirstName,result1[0].siteId], function(response) {
                                                            if (response.success == '0') {
                                                                callback(response);
                                                            }
                                                            let result6 = response.result;
                                                            let sql3 = " INSERT INTO sec_user_sec_role (sec_role_id,sec_user_id) VALUES ('2',?)";
                                                            queryExecution.queryExecution(client, jsonObj, event, sql3,[result5[0].id], function(response) {
                                                                if (response.success == '0') {
                                                                    callback(response);
                                                                }
                                                                let result7 = response.result;
                                                                let sqlSiteBuyer = " INSERT INTO site_buyer (version,buyer_id,site_id) VALUES ('0',?,?)";
                                                                queryExecution.queryExecution(client, jsonObj, event, sqlSiteBuyer,[result5[0].id,result1[0].siteId], function(response) {
                                                                    if (response.success == '0') {
                                                                        callback(response);
                                                                    }
                                                                    let resultSiteBuyer = response.result;
                                                                    let buyerSite = " Select b.site_id as siteBuyerId,b.first_name as firstName,b.last_name as lastName,su.display_name as displayName,su.email_id as emailId,su.mobile_number as mobileNumber,su.id as userId,secRol.authority as userRole " +
                                                                        " from buyer as b " +
                                                                        " Inner join sec_user as su on su.id = b.id " +
                                                                        " Inner join sec_user_sec_role as secUsrRole on secUsrRole.sec_user_id = su.id " +
                                                                        " Inner join sec_role as secRol on secRol.id = secUsrRole.sec_role_id " +
                                                                        " where b.id = ? "
                                                                    queryExecution.queryExecution(client, jsonObj, event, buyerSite,[result5[0].id ], function(response) {
                                                                        if (response.success == '0') {
                                                                            callback(response);
                                                                        }
                                                                        let result8 = response.result;
                                                                        if (result8.length > 0) {
                                                                            userData[0] = {
                                                                                userId: String(result8[0].userId),
                                                                                firstName: result8[0].firstName,
                                                                                lastName: result8[0].lastName,
                                                                                displayName: result8[0].displayName,
                                                                                emailId: result8[0].emailId,
                                                                                mobileNumber: result8[0].mobileNumber,
                                                                                userRole: result8[0].userRole
                                                                            }
                                                                            jwt.sign({
                                                                                userData: userData
                                                                            }, key, (err, token) => {
                                                                                if (err) {
                                                                                    console.log("err ", err)
                                                                                } else {
                                                                                    userData[0].token = token
                                                                                    const response = {
                                                                                        success: "1",
                                                                                        result: {
                                                                                            userData: userData
                                                                                        },
                                                                                        errorMessage: "",
                                                                                        successMessage: "Sucess"
                                                                                    };
                                                                                    callback(response)
                                                                                }
                                                                            })
                                                                        }

                                                                    });
                                                                });
                                                            });
                                                        });


                                                    });

                                                });
                                            }

                                        }
                                    });
                                }

                            });
                        };
                    });
                    //});

                } else if (jsonObj.type == "Login") {
                    let buyerSite = " Select sb.site_id as siteBuyerId,b.first_name as firstName,b.last_name as lastName,su.display_name as displayName,su.email_id as emailId,su.mobile_number as mobileNumber,su.id as userId " +
                        " from buyer as b " +
                        " Inner join sec_user as su on su.id = b.id " +
                        " inner join site_buyer as sb on sb.buyer_id = b.id " +
                        " where su.mobile_number = ? and sb.site_id = ?"  
                    queryExecution.queryExecution(client, jsonObj, event, buyerSite,[mobileNumber,siteId], function(response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        let result3 = response.result;
                        let userData = []
                        if (result3.length > 0) {
                            userData[0] = {
                                userId: result3[0].userId,
                                firstName: result3[0].firstName,
                                lastName: result3[0].lastName,
                                displayName: result3[0].displayName,
                                emailId: result3[0].emailId,
                                mobileNumber: result3[0].mobileNumber,
                                otpFlag: "true"
                            }
                            jwt.sign({
                                userData: userData
                            }, key, (err, token) => {
                                if (err) {
                                    console.log("err ", err)
                                } else {
                                    userData[0].token = token
                                    const response = {
                                        success: "1",
                                        result: {
                                            userData: userData
                                        },
                                        errorMessage: "",
                                        successMessage: "Sucess"
                                    };
                                    callback(response)
                                }
                            })

                        } else {
                            let response = {
                                success: "0",
                                result: [],
                                errorMessage: "Invalid user",
                                successMessage: ""
                            };
                            callback(response);
                        }

                    });
                } else if (jsonObj.type == "Forgot Password") {
                    let buyerSite = " Select sb.site_id as siteBuyerId,b.first_name as firstName,b.last_name as lastName,su.display_name as displayName,su.email_id as emailId,su.mobile_number as mobileNumber,su.id as userId " +
                        " from buyer as b " +
                        " Inner join sec_user as su on su.id = b.id " +
                        " inner join site_buyer as sb on sb.buyer_id = b.id " +
                        " where su.mobile_number = ? and sb.site_id = ?"  
                    queryExecution.queryExecution(client, jsonObj, event, buyerSite,[mobileNumber,siteId], function(response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        let result3 = response.result;
                        let userData = []
                        if (result3.length > 0) {
                            console.log("d....")
                            userData[0] = {
                                userId: result3[0].userId
                            }
                            jwt.sign({
                                userData: userData
                            }, key, (err, token) => {
                                if (err) {
                                    console.log("err ", err)
                                } else {
                                    userData[0].token = token
                                    const response = {
                                        success: "1",
                                        result: {
                                            userData: userData
                                        },
                                        errorMessage: "",
                                        successMessage: "Sucess"
                                    };
                                    callback(response)
                                }
                            })
                        } else {
                            let response = {
                                success: "0",
                                result: [],
                                errorMessage: "Invalid user",
                                successMessage: ""
                            };
                            callback(response);
                        }

                    })
                } else {
                    let response = {
                        success: "1",
                        result: [],
                        errorMessage: "",
                        successMessage: "Sucess"
                    };
                    callback(response);
                }
            } else {
                let response = {
                    success: "0",
                    result: [],
                    errorMessage: "Invalid OTP",
                    successMessage: ""
                };
                callback(response);
            }
        });
    });
};
module.exports = methods;