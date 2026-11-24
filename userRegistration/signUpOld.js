let mysql = require('mysql');
let queryExecution = require('../queryExecution');
let methods = {};
methods.signUp = function (client,jsonObj,event, callback) {
    
    let jwt = require('jsonwebtoken');
    let decoded = jwt.decode(jsonObj.token, { complete: true });
    let decodedFirstName = decoded.payload.txtFirstName;
    let decodedEmailId = decoded.payload.emailId;
    let decodedMobileNumber = decoded.payload.mobileNumber;
    let decodedPassword = decoded.payload.password;
    let isTermsAccepted = decoded.payload.isTermsAccepted;
    let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey'"
    //con.query(queryConfigKey, function(error, results, fields) {
    queryExecution.queryExecution(client, jsonObj, event, queryConfigKey,[], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        let crypto = require('crypto');
        let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
        let key = results[0].config_value;
        let text = decodedPassword;
        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
        let cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
        let encryptedPassword = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        let username = Math.floor((Math.random() * 1000000) + 1);
        let customerNumber = Math.floor((Math.random() * 1000000) + 1);
        let siteId = jsonObj.siteId;
        let txtdisplayName = decodedFirstName;
        let userData = []
        //let mysqlTimestamp = new Date();
        let otpFlag = jsonObj.otpFlag
        
        let sql = " SELECT si.id as siteId,si.site_url as siteUrl from site as si " +
            " where si.id =?"
        
        //con.query(sql, function(err, result1) { 
        queryExecution.queryExecution(client, jsonObj, event, sql,[siteId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let result1 = response.result;
            if (result1.length > 0) {
                let emailExistSite = " Select b.id as buyerId from buyer as b " +
                    " Inner join sec_user as secUsr on secUsr.id = b.id " +
                    " Inner join site_buyer as siteBuyer on siteBuyer.buyer_id = b.id " +
                    " where secUsr.email_id = ? and siteBuyer.site_id = ? "
                //con.query(emailExistSite, function(err, emailExistSiteResult) {
                queryExecution.queryExecution(client, jsonObj, event, emailExistSite,[decodedEmailId,result1[0].siteId], function (response) {
                    if (response.success == '0') {
                        callback(response);
                    }
                    let emailExistSiteResult = response.result;
                    if (emailExistSiteResult.length > 0 && emailExistSiteResult.buyerId != null && emailExistSiteResult.buyerId != '') {
                        otpFlag = "false";
                        const response = {
                            success: "0",
                            result: { userData: userData },
                            errorMessage: "Email Id already Exists",
                            successMessage: ""
                        };
                        callback(response);
                    } else {
                        let mobileExistSite = " Select b.id as buyerId from buyer as b " +
                            " Inner join sec_user as secUsr on secUsr.id = b.id " +
                            " Inner join site_buyer as siteBuyer on siteBuyer.buyer_id = b.id " +
                            " where secUsr.mobile_number = ? and siteBuyer.site_id = ? "
                        
                        //con.query(mobileExistSite, function(err, mobileExistSiteResult) {
                        queryExecution.queryExecution(client, jsonObj, event, mobileExistSite,[decodedMobileNumber,result1[0].siteId], function (response) {
                            if (response.success == '0') {
                                callback(response);
                            }
                            let mobileExistSiteResult = response.result;
                            if (mobileExistSiteResult.length > 0 && mobileExistSiteResult.buyerId != null && mobileExistSiteResult.buyerId != '') {
                                otpFlag = "false";
                                const response = {
                                    success: "0",
                                    result: { userData: userData },
                                    errorMessage: "Mobile Number already Exists",
                                    successMessage: ""
                                };
                                callback(response);
                            } else {
                                if (otpFlag == "true") {
                                    let sql1 = "INSERT INTO sec_user (version,account_expired,account_locked,enabled,is_verified,display_name,email_id,mobile_number,react_password,password_expired,username) VALUES ('0',0,0,1,1,?,?,?,?,0,?)";
                                    //con.query(sql1, function(err, result4) {
                                    queryExecution.queryExecution(client, jsonObj, event, sql1,[txtdisplayName,decodedEmailId,decodedMobileNumber,encryptedPassword,username], function (response) {
                                        if (response.success == '0') {
                                            callback(response);
                                        }
                                        let result4 = response.result;
                                        let sql = "SELECT * FROM sec_user where id = ? "  
                                        //con.query(sql, function(err, result5) {
                                        queryExecution.queryExecution(client, jsonObj, event, sql,[result4.insertId], function (response) {
                                            if (response.success == '0') {
                                                callback(response);
                                            }
                                            let result5 = response.result;
                                            let sql2 = " INSERT INTO buyer (id,created_by,created_on,customer_number,is_active,is_married,is_opt_in,is_terms_accepted,first_name,last_name,gender,number_of_kids,points,preferred_store_id,rank,rating,site_id) VALUES (?,?, NOW() ,?,1,0,1,?,?,'',1,1,0,0,0,0,?)";
                                            //con.query(sql2, function(err, result6) {
                                            queryExecution.queryExecution(client, jsonObj, event, sql2,[result5[0].id,result5[0].id,customerNumber,isTermsAccepted,decodedFirstName,result1[0].siteId], function (response) {
                                                if (response.success == '0') {
                                                    callback(response);
                                                }
                                                let result6 = response.result;
                                                let sql3 = " INSERT INTO sec_user_sec_role (sec_role_id,sec_user_id) VALUES ('2',?)";
                                                //con.query(sql3, function(err, result7) {
                                                queryExecution.queryExecution(client, jsonObj, event, sql3,[result5[0].id], function (response) {
                                                    if (response.success == '0') {
                                                        callback(response);
                                                    }
                                                    let result7 = response.result;
                                                    let sqlSiteBuyer = " INSERT INTO site_buyer (version,buyer_id,site_id) VALUES ('0',?,?)";
                                                    //con.query(sqlSiteBuyer, function(err, resultSiteBuyer) {
                                                    queryExecution.queryExecution(client, jsonObj, event, sqlSiteBuyer,[result5[0].id,result1[0].siteId], function (response) {
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
                                                        //con.query(buyerSite, function(err, result8) {
                                                        queryExecution.queryExecution(client, jsonObj, event, buyerSite,[result5[0].id], function (response) {
                                                            if (response.success == '0') {
                                                                callback(response);
                                                            }
                                                            let result8 = response.result;
                                                            if (result8.length > 0) {
                                                                console.log("12.....")
                                                                userData[0] = {
                                                                    userId: result8[0].userId,
                                                                    firstName: result8[0].firstName,
                                                                    lastName: result8[0].lastName,
                                                                    displayName: result8[0].displayName,
                                                                    emailId: result8[0].emailId,
                                                                    mobileNumber: result8[0].mobileNumber,
                                                                    userRole: result8[0].userRole
                                                                }
                                                                const response = {
                                                                    success: "1",
                                                                    result: { userData: userData },
                                                                    errorMessage: "",
                                                                    successMessage: "Sucess"
                                                                };
                                                                callback(response);
                                                            }
                                                            
                                                        });
                                                    });
                                                });
                                            });
                                            
                                            
                                        });
                                    });
                                    
                                } else {
                                    const response = {
                                        success: "1",
                                        result: { userData: userData },
                                        errorMessage: "",
                                        successMessage: "Sucess"
                                    };
                                    callback(response);
                                }
                            }
                            
                        });
                    }
                    
                });
            };
        });
    });
}
module.exports = methods;
