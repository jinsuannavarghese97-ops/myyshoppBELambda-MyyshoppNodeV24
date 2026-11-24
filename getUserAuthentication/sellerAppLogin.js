let queryExecution = require('../queryExecution');
let methods = {};

methods.sellerAppLogin = function (client, jsonObj, event, callback) {

    let jwt = require('jsonwebtoken');
    let token = event.token
    let decoded = jwt.decode(token, {
        complete: true
    });
    console.log("decoded...", decoded)
    let decodedUsername = decoded.payload.username;
    let decodedPassword = decoded.payload.password;
    let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey'"
    queryExecution.queryExecution(client, jsonObj, event, queryConfigKey,[], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result

        let crypto = require('crypto');
        let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
        let key = results[0].config_value;
        let text = decodedPassword;

        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
        let cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
        let encryptedPassword = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        console.log('encryptedPassword........', encryptedPassword)
        let siteId = event.siteId;
        let authenticationApiExist = false;
        let userData = []
        let userMail = decodedUsername.split('@')
        let subSql = ''
        let sellerQuery = "";
        let storeData = []
        let queryString = " SELECT sec.id as secUserId,sec.display_name as displayName,seRole.authority as authority," +
            " sec.email_id As emailId,sec.mobile_number As mobileNumber FROM sec_user as sec " +
            " inner join sec_user_sec_role as secUsrSecRole on secUsrSecRole.sec_user_id = sec.id " +
            " inner join sec_role as seRole on seRole.id = secUsrSecRole.sec_role_id where sec.email_id = ? and sec.react_password = ? and sec.enabled is true ;"
        //console.log("queryString..........", queryString,decodedUsername, encryptedPassword)
        queryExecution.queryExecution(client, jsonObj, event, queryString, [decodedUsername, encryptedPassword], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let result1 = response.result
            console.log('result1...', result1)
            console.log('result1...length....', result1.length)
            //console.log('result1...authority....',result1[0].authority)
            if (result1.length > 0) {
                console.log('result1...authority....', result1[0].authority)
                if (result1[0].authority == 'ROLE_SELLER') {
                    console.log('INSIDE Seller....')
                    sellerQuery = " Select si.id as siteSellerId,slr.first_name as firstName,slr.last_name as lastName,su.display_name as displayName,su.id as userId,su.email_id as emailId,su.mobile_number as mobileNumber, " +
                        " (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId, " +
                        " concat((select config_value from configuration where config_key = 's3Address'),'/', (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', (select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 'storeImagesFolder'),'/',slr.logo_path) as sellerLogoPath " +
                        " from seller as slr " +
                        " INNER JOIN store as st on slr.id = st.seller_id " +
                        " INNER JOIN store_main_category as smc on smc.store_id = st.id " +
                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                        " inner join sec_user as su on su.id = slr.id " +
                        " LEFT join site as si on si.seller_id = slr.id " +
                        " where su.id = ?;" +

                        " SELECT s.id as storeId,si.id AS siteStoreId,su.display_name AS displayName,su.id AS userId,s.name as storeName,su.email_id AS emailId,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,if(susr.sec_role_id = 4,'ROLE_STORE','ROLE_SELLER') as authority, " +
                        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT  config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/', if(s.logo_path is null,'default.jpg',s.logo_path)) AS storeLogoPath " +
                        " FROM store AS s " +
                        " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                        " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
                        " INNER JOIN sec_user AS su ON su.id = sl.id " +
                        " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id " +
                        " LEFT JOIN site AS si ON si.seller_id = sl.id  " +
                        " where sl.id = ?";
                }

                else if (result1[0].authority == 'ROLE_STORE') {
                    console.log('INSIDE ROLE_STORE....')
                    sellerQuery = " SELECT si.id AS siteStoreId,su.display_name AS displayName,s.name as storeName,su.id AS userId,su.email_id AS emailId,'' as firstName,'' as lastName,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,'ROLE_STORE' as authority, " +
                        " concat((select config_value from configuration where config_key = 's3Address'),'/', (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', (select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 'storeImagesFolder'),'/',sl.logo_path) as sellerLogoPath " +

                        " FROM store AS s " +
                        " INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
                        " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id  " +
                        " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                        " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
                        " INNER JOIN sec_user AS sec ON sec.id = sl.id " +
                        " INNER JOIN site AS si ON si.seller_id = sl.id  " +
                        " where su.id = ?;" +

                        " SELECT s.id as storeId,si.id AS siteStoreId,su.display_name AS displayName,s.name as storeName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,if(susr.sec_role_id = 4,'ROLE_STORE','ROLE_SELLER') as authority, " +
                        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT  config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/', if(s.logo_path is null,'default.jpg',s.logo_path)) AS storeLogoPath " +
                        " FROM store AS s " +
                        " INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
                        " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id  " +
                        " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                        " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
                        " INNER JOIN site AS si ON si.seller_id = sl.id  " +
                        " where su.id =?;"
                }
                else {
                    console.log('INSIDE ELSE OTHERS....')
                    sellerQuery = " SELECT si.id AS siteStoreId,sec.display_name AS displayName,s.name as storeName,sl.id AS userId,sec.email_id AS emailId,sl.first_name as firstName,sl.last_name as lastName,sec.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,if(susr.sec_role_id = 4,'ROLE_STORE','ROLE_SELLER') as authority, " +
                        " concat((select config_value from configuration where config_key = 's3Address'),'/', (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', (select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 'storeImagesFolder'),'/',sl.logo_path) as sellerLogoPath " +
                        " FROM store AS s " +
                        " INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
                        " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id  " +
                        " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                        " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
                        " INNER JOIN sec_user AS sec ON sec.id = sl.id " +
                        " INNER JOIN site AS si ON si.seller_id = sl.id  " +
                        " where su.id =?;" +

                        " SELECT s.id as storeId,si.id AS siteStoreId,su.display_name AS displayName,s.name as storeName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,if(susr.sec_role_id = 4,'ROLE_STORE','ROLE_SELLER') as authority, " +
                        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT  config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/', if(s.logo_path is null,'default.jpg',s.logo_path)) AS storeLogoPath " +
                        " FROM store AS s " +
                        " INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
                        " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id  " +
                        " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                        " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
                        " INNER JOIN site AS si ON si.seller_id = sl.id  " +
                        " where su.id = ?;"
                }


                let buyerSite = sellerQuery;
               // console.log("buyerSite............", buyerSite,result1[0].secUserId, result1[0].secUserId)
                queryExecution.queryExecution(client, jsonObj, event, buyerSite, [result1[0].secUserId, result1[0].secUserId], function (response) {
                    if (response.success == '0') {
                        callback(response);
                    }
                    let result3 = response.result
                    console.log('result3...length....', result3.length)
                    if (result3[0].length > 0) {

                        userData[0] = {
                            userId: result3[0][0].userId,
                            firstName: result3[0][0].firstName,
                            lastName: result3[0][0].lastName,
                            displayName: result3[0][0].displayName,
                            emailId: result3[0][0].emailId,
                            mobileNumber: result3[0][0].mobileNumber,
                            redirectUrl: result3[0][0].redirectURL,
                            storeId: result3[1][0].storeId,
                            //role: 'ROLE_SELLER',
                            storeLogoPath: result3[1][0].storeLogoPath,
                            sellerLogoPath: result3[0][0].sellerLogoPath,
                            role: result3[1][0].authority,
                            storeData: result3[1]
                        }
                        console.log("userData...", userData)
                        //console.log(result3[1])
                        jwt.sign({
                            userData: userData
                        }, key, (err, token) => {
                            if (err) {
                                console.log("err ", err)
                            }
                            else {
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
                    else {
                        const response = {
                            success: "0",
                            result: {
                                userData: userData
                            },
                            errorMessage: "Invalid Username/Password",
                            successMessage: ""
                        };
                        callback(response);
                    }
                });

            }
            else {
                const response = {
                    success: "0",
                    result: {},
                    errorMessage: "Invalid Username/Password",
                    successMessage: ""
                };
                callback(response);
            }
        });
    });
}
module.exports = methods;
