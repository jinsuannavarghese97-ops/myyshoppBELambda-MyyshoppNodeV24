let jwt = require('jsonwebtoken');
let crypto = require('crypto')
const EVP_BytesToKey = require('evp_bytestokey')
let methods = {};
let queryExecution = require('../queryExecution');
methods.changePassword = function (client,jsonObj , event, callback) {
    console.log('1111111111111111111')
    let token = event.token
    let decoded = jwt.decode(token, { complete: true });
    let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey'"
    queryExecution.queryExecution(client,jsonObj ,event, queryConfigKey,[], function (response) {
       // console.log('222222222222222',response)
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        let crypto = require('crypto');
        let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
        let key = results[0].config_value;
        let oldPasswordText = event.token ? decoded.payload.oldPasswordInChangePwrd : jsonObj.oldPassword //oldPassword?oldPassword:jsonObj.oldPassword;
        let newPasswordText = event.token ? decoded.payload.newPasswordInChangePwrd : jsonObj.newPassword //newPassword?newPassword:jsonObj.newPassword;
        let userId = event.token ? decoded.payload.userIdInChangePwrd : jsonObj.userId
        
        // let cipher = crypto.createCipher(algorithm, key);
        // let encryptedOldPassword = cipher.update(oldPasswordText, 'utf8', 'hex') + cipher.final('hex');
        // let cipher1 = crypto.createCipher(algorithm, key);
        // let encryptedNewPassword = cipher1.update(newPasswordText, 'utf8', 'hex') + cipher1.final('hex');
        
        
        const KEY_SIZE = 32;
        
        let before = (Math.random() + 1).toString(36).substring(7);
        let after = (Math.random() + 1).toString(36).substring(7);
        let middle = (Math.random() + 1).toString(36).substring(7);
        
        
        let userPassword = before+'##@'+middle+'$!'+newPasswordText+'#$'+after
        
        //let userPassword = '~!~'+newPasswordText+'~!~'
        const result = EVP_BytesToKey(
          key,
          null,
          KEY_SIZE * 8, // byte to bit size
          16
        )
    
        var cipher = crypto.createCipheriv(algorithm, result.key, result.iv);
        var encryptedOldPassword = cipher.update(oldPasswordText, 'utf8', 'hex') + cipher.final('hex');
        
        var cipher1 = crypto.createCipheriv(algorithm, result.key, result.iv);
        var encryptedNewPassword = cipher1.update(newPasswordText, 'utf8', 'hex') + cipher1.final('hex');
        
        
        
        
        let queryString = "select password from sec_user where id =? and react_password =? "
       // console.log("queryString......",queryString)
        queryExecution.queryExecution(client,jsonObj ,event, queryString,[userId,encryptedOldPassword], function (response) {
          //  console.log('333333333333333',response)
            if (response.success == '0') {
                callback(response);
            }
            results = response.result;
            let params = []
            if (results.length > 0) {
                let updateQry = "UPDATE sec_user SET react_password=?,data_clone=? where id =?;"
                let updateQryval = [encryptedNewPassword,userPassword,userId]
                let sellerQuery = " Select si.id as siteSellerId,slr.first_name as firstName,slr.last_name as lastName,su.display_name as displayName,su.id as userId,su.email_id as emailId,su.mobile_number as mobileNumber, " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId " +
                    " from seller as slr " +
                    " INNER JOIN store as st on slr.id = st.seller_id " +
                    " INNER JOIN store_main_category as smc on smc.store_id = st.id " +
                    " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                    " inner join sec_user as su on su.id = slr.id " +
                    " Inner join site as si on si.seller_id = slr.id " +
                    " where su.id = ? and enabled is true ;"
                let storeQuery = " SELECT si.id AS siteStoreId,su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId " +
                    " FROM store AS s " +
                    " INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
                    " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id and susr.sec_role_id = 4 " +
                    " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
                    " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                    " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
                    " INNER JOIN site AS si ON si.seller_id = sl.id  " +
                    " where su.id = ? and enabled is true ;"

                let adminQuery = " SELECT su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,seRole.authority as authority " +
                    " FROM sec_user AS su " +
                    " inner join sec_user_sec_role as secUsrSecRole on secUsrSecRole.sec_user_id = su.id " +
                    " inner join sec_role as seRole on seRole.id = secUsrSecRole.sec_role_id and seRole.id in (1 , 9) " +
                    " where su..id = ? and enabled is true  ;"
                let buyerSite = " Select su.site_id as siteBuyerId,b.first_name as firstName,b.last_name as lastName,su.display_name as displayName,su.email_id as emailId,su.mobile_number as mobileNumber,su.id as userId " +
                    " from buyer as b " +
                    " Inner join sec_user as su on su.id = b.id " +
                    //" inner join site_buyer as sb on sb.buyer_id = b.id " +
                    " where su.id = ? and enabled is true ;"
                if(decoded.payload.role == 'ROLE_ADMIN' || decoded.payload.role == 'ROLE_MAPPING_ADMIN'){
                    updateQry = updateQry + adminQuery
                }
                else if(decoded.payload.role == 'ROLE_BUYER'){
                    updateQry = updateQry + buyerSite
                }
                else if(decoded.payload.role == 'ROLE_SELLER'){
                    updateQry = updateQry + sellerQuery
                }
                else if(decoded.payload.role == 'ROLE_STORE'){
                    updateQry = updateQry + storeQuery
                }
               // console.log('updateQry..........',updateQry)
                queryExecution.queryExecution(client, jsonObj, event, updateQry,[...updateQryval,userId], function (response) {
                  //  console.log('44444444444444444',response)
                    if (response.success == '0') {
                      //  console.log("response.....",response)
                        callback(response);
                    }
                    let result3 = response.result
                   // console.log('result3........',result3)
                    let userData = []
                            const response1 = {
                                success: "1",
                                result: {
                                    userData: userData
                                },
                                errorMessage: "",
                                successMessage: "Sucess"
                            };
                            callback(response1)
                    // userData[0] = {
                    //         userId: result3[1][0].userId,
                    //         firstName: result3[1][0].firstName,
                    //         lastName: result3[1][0].lastName,
                    //         displayName: result3[1][0].displayName,
                    //         emailId: result3[1][0].emailId,
                    //         mobileNumber: result3[1][0].mobileNumber,
                    //         redirectUrl: '',
                    //         isBuyer: (decoded.payload.role == 'ROLE_STORE') ? '1':'0',
                    //         role: decoded.payload.role
                    //     }
                    // jwt.sign({
                    //     userData: userData
                    // }, key, (err, token) => {
                    //     if (err) {
                    //         console.log("err ", err)
                    //     } else {
                    //         userData[0].token = token
                    //         const response = {
                    //             success: "1",
                    //             result: {
                    //                 userData: userData
                    //             },
                    //             errorMessage: "",
                    //             successMessage: "Sucess"
                    //         };
                    //         callback(response)
                    //     }
                    // })
                });
            } 
            else {
                const responseData = {
                    "success": "0",
                    "errorMessage": "Current password does not match",
                    "successMessage": ""
                }
                callback(responseData)
            }
        });
    });
}
module.exports = methods;
