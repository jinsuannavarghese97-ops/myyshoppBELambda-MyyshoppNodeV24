const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const EVP_BytesToKey = require('evp_bytestokey')
const queryExecution = require('../queryExecution');
const methods = {};
methods.signUp = function (client, jsonObj,event, callback) {
    let decoded = jwt.decode(jsonObj.token, {
        complete: true
    });
    let decodedFirstName = decoded.payload.txtFirstName;
    let decodedEmailId = decoded.payload.emailId;
    let decodedMobileNumber = decoded.payload.mobileNumber;
    let decodedPassword = decoded.payload.password;
    let isTermsAccepted = decoded.payload.isTermsAccepted;
    let countryId = decoded.payload.countryId;
    let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey'"
    queryExecution.queryExecution(client, jsonObj,event, queryConfigKey,[], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        const KEY_SIZE = 32;
        let results = response.result;
        let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
        let key = results[0].config_value;
        let text = decodedPassword;
        
        let before = (Math.random() + 1).toString(36).substring(7);
        let after = (Math.random() + 1).toString(36).substring(7);
        let middle = (Math.random() + 1).toString(36).substring(7);
        
        
        let userPassword = before+'##@'+middle+'$!'+text+'#$'+after
        
        const result = EVP_BytesToKey(
          key,
          null,
          KEY_SIZE * 8, // byte to bit size
          16
        )
    
        var cipher = crypto.createCipheriv(algorithm, result.key, result.iv);
        var encryptedPassword = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        console.log("encryptedPassword...",encryptedPassword)
        //let cipher = crypto.createCipher(algorithm, key);
        //let encryptedPassword = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        let username = Math.floor((Math.random() * 1000000) + 1);
        
        console.log("username...",username)
        let customerNumber = Math.floor((Math.random() * 1000000) + 1);
        let siteId = jsonObj.siteId;
        let txtdisplayName = decodedFirstName;
        let userData = []
        let otpFlag = jsonObj.otpFlag
        let emailQry=""
        let emailQryval = []
        if(decodedEmailId){
            emailQry = " su.email_id = ? or "
            emailQryval .push(decodedEmailId)
        }
        let emailExistSite = "SELECT count(*) as count " +
            " FROM sec_user as su " +
            " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id and susr.sec_role_id = 2 " +
            " WHERE ("+emailQry+" su.mobile_number=?) and su.enabled is true and su.site_id = ?; "
        console.log([...emailQryval,decodedMobileNumber,siteId],"...emailExistSite...",emailExistSite)
        queryExecution.queryExecution(client, jsonObj, event, emailExistSite,[...emailQryval,decodedMobileNumber,siteId], function (response) {
            
            console.log("emailExistSiteresponse...",response)
            if (response.success == '0') {
                console.log("a..")
                callback(response);
            }
           // console.log("b..",response)

            let emailExistSiteResult = response.result;
            console.log(emailExistSiteResult[0].count,"..emailExistSiteResult...",emailExistSiteResult)
            if (emailExistSiteResult[0].count > 0) {
                otpFlag = "false";
                const response = {
                    success: "0",
                    result: {},
                    errorMessage: "Email id/mobile number already exists",
                    successMessage: ""
                };
                callback(response);
            } else {
                console.log("c..")
                if (otpFlag == "true") {
                    console.log("d..")
                    client.query("START TRANSACTION");
                    let sql1 = "INSERT INTO sec_user (version,account_expired,account_locked,enabled,is_verified,display_name,email_id,mobile_number,react_password,password_expired,username,site_id,password,data_clone) VALUES ('0',0,0,1,1,?,?,?,?,0,?,?,'5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',?)";
                    console.log("sql1 ",sql1)
                    queryExecution.queryExecution(client, jsonObj, event, sql1,[txtdisplayName,decodedEmailId,decodedMobileNumber,encryptedPassword,username,siteId,userPassword], function (response) {
                        
                        console.log("sec_user insert result...",response)
                        if (response.success == '0') {
                            callback(response);
                        }
                        let result4 = response.result;
                        console.log(result4.insertId,"result4 ",result4)
                        
                       let sql2 = " INSERT INTO buyer (id,created_by,created_on,customer_number,is_active,is_married,is_opt_in,is_terms_accepted,first_name,last_name,gender,number_of_kids,points,preferred_store_id,buyer.rank,rating,site_id,country_id) VALUES (?,?, NOW() ,?,1,0,1,?,?,'',0,1,0,0,0,0,?,?); " +

                       
                            " INSERT INTO sec_user_sec_role (sec_role_id,sec_user_id) VALUES ('2',?)";
                        console.log("sql2.... ",sql2)
                        queryExecution.queryExecution(client, jsonObj, event, sql2,[result4.insertId,result4.insertId,customerNumber,isTermsAccepted,decodedFirstName,siteId,countryId,result4.insertId], function (response) {
                            console.log("sql2response...",response)
                            if (response.success == '0') {
                                client.query("ROLLBACK");
                                callback(response);
                            }
                            client.query("COMMIT")
                            userData[0] = {
                                userId: result4.insertId,
                                firstName: txtdisplayName,
                                lastName: '',
                                displayName: txtdisplayName,
                                emailId: decodedEmailId,
                                mobileNumber: decodedMobileNumber,
                                userRole: 'ROLE_BUYER',
                                countryId:countryId
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
                        })
                    });
                } else {
                    console.log("e..",userData)
                    jwt.sign({
                            userData: userData
                    }, key, (err, token) => {
                        console.log("er...",err)
                        if (err) {
                            console.log("err ", err)
                        } else {
                            console.log("e1..",token)
                            userData[0] = {
                               token :token
                            } 
                            console.log("userData...",userData)
                            const response = {
                                success: "1",
                                result: {
                                    userData: userData
                                },
                                errorMessage: "",
                                successMessage: "Sucess"
                            };
                            console.log("response...",response)
                            callback(response)
                        }
                    })
                }
            }
            
        });
    });
}
module.exports = methods;
