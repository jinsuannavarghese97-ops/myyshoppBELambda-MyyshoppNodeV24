const methods = {};
let queryExecution = require('../queryExecution');


methods.adminSiteUrlDecryption = function (client, jsonObj, event, callback) {
    let jwt = require('jsonwebtoken');

    let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey';"

    queryExecution.queryExecution(client, jsonObj, event, queryConfigKey,[], function (response) {
        console.log(response)
        if (response.success == '0') {
            callback(response);
        }
        let userData = []
        let results = response.result
        let crypto = require('crypto');
        var algorithm = 'aes256';
        var key = results[0].config_value;
        console.log("----", key)
        var text = event.encryptedData;

        var decipher = ""
        var decryptedUrl = ""
        var successFlag = true
        try {

            successFlag = true
            console.log("----------inside try------", text)
            decipher = crypto.createDecipher(algorithm, key);
            console.log("----------------", decipher)
            decryptedUrl = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
        }
        catch (error) {
            console.log("----------inside catch------", error)

            successFlag = false
        }

        if (successFlag == true) {
            decryptedUrl = decryptedUrl.split('-')
            let userId = decryptedUrl[0]
            let siteId = decryptedUrl[1]
            console.log(userId, siteId, "...........")
            let sql1 = " SELECT sec.id as secUserId,sec.display_name as displayName,seRole.authority as authority," +
                " sec.email_id As emailId,sec.mobile_number As mobileNumber FROM sec_user as sec " +
                " inner join sec_user_sec_role as secUsrSecRole on secUsrSecRole.sec_user_id = sec.id " +
                " inner join sec_role as seRole on seRole.id = secUsrSecRole.sec_role_id where sec.id = ? and enabled is true "
            console.log("sql1 ", sql1)
            queryExecution.queryExecution(client, jsonObj, event, sql1, [userId], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let result2 = response.result
                if (result2.length > 0) {
                    let sellerQuery = " Select si.id as siteSellerId,slr.first_name as firstName,slr.last_name as lastName,su.display_name as displayName,su.id as userId,su.email_id as emailId,su.mobile_number as mobileNumber, " +
                        " (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,si.sub_domain_url as subDomainUrl " +
                        " from seller as slr " +
                        " INNER JOIN store as st on slr.id = st.seller_id " +
                        " INNER JOIN store_main_category as smc on smc.store_id = st.id " +
                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                        " inner join sec_user as su on su.id = slr.id " +
                        " Inner join site as si on si.seller_id = slr.id " +
                        " where su.id = ? and enabled is true ;"

                    let storeQuery = " SELECT si.id AS siteStoreId,su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,si.sub_domain_url as subDomainUrl " +
                        " FROM store AS s " +
                        " INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
                        " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id and susr.sec_role_id = 4 " +
                        " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                        " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
                        " INNER JOIN site AS si ON si.seller_id = sl.id  " +
                        " where su.id = ? and si.id = ? and enabled is true ;"


                    let adminQuery = " SELECT su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,seRole.authority as authority " +
                        " FROM sec_user AS su " +
                        " inner join sec_user_sec_role as secUsrSecRole on secUsrSecRole.sec_user_id = su.id " +
                        " inner join sec_role as seRole on seRole.id = secUsrSecRole.sec_role_id and seRole.id in (1 , 9) " +
                        " where su.id = ? and enabled is true  ;"

                    let sellerSubDomainQuery = " Select '' as siteSellerId,slr.first_name as firstName,slr.last_name as lastName,su.display_name as displayName,su.id as userId,su.email_id as emailId,su.mobile_number as mobileNumber, " +
                        " (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId " +
                        " from seller as slr " +
                        " INNER JOIN store as st on slr.id = st.seller_id " +
                        " INNER JOIN store_main_category as smc on smc.store_id = st.id " +
                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                        " inner join sec_user as su on su.id = slr.id " +
                        " where su.id = ? and su.site_id is null and enabled is true ;"

                    let storeSubDomainQuery = " SELECT '' AS siteStoreId,su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId " +
                        " FROM store AS s " +
                        " INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
                        " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id and susr.sec_role_id = 4 " +
                        " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
                        " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                        " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
                        " where su.id = ? and su.site_id is null   and enabled is true ;"

                    let buyerSite = " Select su.site_id as siteBuyerId,b.first_name as firstName,b.last_name as lastName,su.display_name as displayName,su.email_id as emailId,su.mobile_number as mobileNumber,su.id as userId " +
                        " from buyer as b " +
                        " Inner join sec_user as su on su.id = b.id " +
                        //" inner join site_buyer as sb on sb.buyer_id = b.id " +
                        " where su.id = ?  and su.site_id =  ? and enabled is true ;" +
                        sellerQuery +
                        storeQuery +
                        adminQuery +
                        sellerSubDomainQuery +
                        storeSubDomainQuery;
                    const buyerSiteParams = [
                        userId,
                        siteId,
                        userId,
                        userId,
                        siteId,
                        userId,
                        userId,
                        userId
                    ];
                    console.log("buyerSite ", buyerSite)
                    queryExecution.queryExecution(client, jsonObj, event, buyerSite, buyerSiteParams, function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        let result3 = response.result
                        if (result3[3].length > 0) {
                            var textBuyer = result3[3][0].userId + "-" + siteId;
                            var cipher = crypto.createCipher(algorithm, key);
                            var encryptedUrl = cipher.update(textBuyer, 'utf8', 'hex') + cipher.final('hex');

                            userData[0] = {
                                userId: result3[3][0].userId,
                                firstName: result3[3][0].firstName,
                                lastName: result3[3][0].lastName,
                                displayName: result3[3][0].displayName,
                                emailId: result3[3][0].emailId,
                                mobileNumber: result3[3][0].mobileNumber,
                                redirectUrl: '',
                                isBuyer: '0',
                                role: result3[3][0].authority
                                //subDomainUrl: adminSiteUrl + encryptedUrl
                            }
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
                        else if (result3[1].length > 0) {
                            let data = result3[1][0].userId + '-ROLE_SELLER-' + event.siteId;
                            let buff = new Buffer(data);
                            let base64data = buff.toString('base64');
                            //if (result3[1][0].siteSellerId == result1[0].siteId) {

                            var textSeller = result3[1][0].userId + "-" + siteId;
                            var cipher = crypto.createCipher(algorithm, key);
                            var encryptedUrl = cipher.update(textSeller, 'utf8', 'hex') + cipher.final('hex');




                            userData[0] = {
                                userId: result3[1][0].userId,
                                firstName: result3[1][0].firstName,
                                lastName: result3[1][0].lastName,
                                displayName: result3[1][0].displayName,
                                emailId: result3[1][0].emailId,
                                mobileNumber: result3[1][0].mobileNumber,
                                redirectUrl: result3[1][0].redirectURL + '?token=' + base64data,
                                isBuyer: '0',
                                role: "ROLE_SELLER",
                                mainCategoryId: result3[1][0].mainCategoryId,
                                mainGroupCategoryId: result3[1][0].mainGroupCategoryId
                                //subDomainUrl: adminSiteUrl + encryptedUrl
                            }
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
                            //}
                        }
                        else if (result3[2].length > 0) {
                            let data = result3[2][0].userId + '-ROLE_STORE-' + event.siteId;
                            let buff = new Buffer(data);
                            let base64data = buff.toString('base64');

                            var textBuyer = result3[2][0].userId + "-" + siteId;
                            var cipher = crypto.createCipher(algorithm, key);
                            var encryptedUrl = cipher.update(textBuyer, 'utf8', 'hex') + cipher.final('hex');
                            //if (result3[2][0].siteStoreId == result1[0].siteId) {
                            userData[0] = {
                                userId: result3[2][0].userId,
                                firstName: result3[2][0].displayName,
                                lastName: '',
                                displayName: result3[2][0].displayName,
                                emailId: result3[2][0].emailId,
                                mobileNumber: result3[2][0].mobileNumber,
                                storeId: result3[2][0].storeId,
                                sellerId: result3[2][0].sellerId,
                                redirectUrl: result3[2][0].redirectURL + '?token=' + base64data,
                                isBuyer: '0',
                                role: "ROLE_STORE",
                                mainCategoryId: result3[2][0].mainCategoryId,
                                mainGroupCategoryId: result3[2][0].mainGroupCategoryId
                                //subDomainUrl: adminSiteUrl + encryptedUrl

                            }
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
                        else if (result3[0].length > 0) {
                            //if (result3[0][0].siteBuyerId == result1[0].siteId) {

                            var textBuyer = result3[0][0].userId + "-" + siteId;
                            var cipher = crypto.createCipher(algorithm, key);
                            var encryptedUrl = cipher.update(textBuyer, 'utf8', 'hex') + cipher.final('hex');

                            userData[0] = {
                                userId: result3[0][0].userId,
                                firstName: result3[0][0].firstName,
                                lastName: result3[0][0].lastName,
                                displayName: result3[0][0].displayName,
                                emailId: result3[0][0].emailId,
                                mobileNumber: result3[0][0].mobileNumber,
                                //subDomainUrl: adminSiteUrl + encryptedUrl,
                                redirectUrl: '',
                                isBuyer: '1',
                                role: "ROLE_BUYER"
                            }
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
                        else if (result3[4].length > 0) {
                            let data = result3[4][0].userId + '-ROLE_SELLER-' + event.siteId;
                            let buff = new Buffer(data);
                            let base64data = buff.toString('base64');

                            var textBuyer = result3[4][0].userId + "-" + siteId;
                            var cipher = crypto.createCipher(algorithm, key);
                            var encryptedUrl = cipher.update(textBuyer, 'utf8', 'hex') + cipher.final('hex');
                            //if (result3[1][0].siteSellerId == result1[0].siteId) {
                            userData[0] = {
                                userId: result3[4][0].userId,
                                firstName: result3[4][0].firstName,
                                lastName: result3[4][0].lastName,
                                displayName: result3[4][0].displayName,
                                emailId: result3[4][0].emailId,
                                mobileNumber: result3[4][0].mobileNumber,
                                redirectUrl: result3[4][0].redirectURL + '?token=' + base64data,
                                isBuyer: '0',
                                role: "ROLE_SELLER",
                                mainCategoryId: result3[4][0].mainCategoryId,
                                mainGroupCategoryId: result3[4][0].mainGroupCategoryId
                                // subDomainUrl: adminSiteUrl + encryptedUrl
                            }
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
                        else if (result3[5].length > 0) {
                            let data = result3[5][0].userId + '-ROLE_STORE-' + event.siteId;
                            let buff = new Buffer(data);
                            let base64data = buff.toString('base64');

                            var textBuyer = result3[5][0].userId + "-" + siteId;
                            var cipher = crypto.createCipher(algorithm, key);
                            var encryptedUrl = cipher.update(textBuyer, 'utf8', 'hex') + cipher.final('hex');
                            //if (result3[2][0].siteStoreId == result1[0].siteId) {
                            userData[0] = {
                                userId: result3[5][0].userId,
                                firstName: result3[5][0].displayName,
                                lastName: '',
                                displayName: result3[5][0].displayName,
                                emailId: result3[5][0].emailId,
                                mobileNumber: result3[5][0].mobileNumber,
                                storeId: result3[5][0].storeId,
                                sellerId: result3[5][0].sellerId,
                                redirectUrl: result3[5][0].redirectURL + '?token=' + base64data,
                                isBuyer: '0',
                                role: "ROLE_STORE",
                                mainCategoryId: result3[5][0].mainCategoryId,
                                mainGroupCategoryId: result3[5][0].mainGroupCategoryId
                                //subDomainUrl: adminSiteUrl + encryptedUrl

                            }
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
                                errorMessage: "Something went wrong",
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
                        errorMessage: "Something went wrong1",
                        successMessage: ""
                    };
                    callback(response);
                }
            });

        }
        else {
            const response = {
                success: "0",

                errorMessage: "Invalid encrypted data",
                successMessage: ""
            };
            callback(response);
        }
    })
}
module.exports = methods;
