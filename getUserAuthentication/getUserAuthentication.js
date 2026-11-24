const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    let jwt = require('jsonwebtoken');
    let token = event.token
    let decoded = jwt.decode(token, {
        complete: true
    });

    let decodedUsername = decoded.payload.username;
    let decodedPassword = decoded.payload.password;
    let adminQueryRoles = "(1,9)"
    let sitejoinSubQry = ""
    let siteWhereQry = "";
    let siteWhereQryParams = [];
    if (event.isBackend && event.isBackend == true) {
        adminQueryRoles = "(3,4,1,9,14,15)"
    }
    else if (!event.isBackend) {
        sitejoinSubQry = " inner join site as si on si.site_category_group = sc.id "
        siteWhereQry = " and si.id = ?";
        siteWhereQryParams = [event.siteId]
    }
    console.log(adminQueryRoles, ".............decoded...", decoded)
    let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey';"
    let adminSiteQuery = "SELECT " +
        " IF((SELECT `sub_domain_url` FROM site WHERE id = ?) IS NULL,config_value,(SELECT `sub_domain_url` FROM site WHERE id = ?)) AS config_value " +
        " FROM configuration WHERE config_key = 'adminSiteUrl';"
    console.log("adminSiteQuery.....", adminSiteQuery)
    queryExecution.queryExecution(client, jsonObj, event, queryConfigKey + adminSiteQuery, [event.siteId, event.siteId], function (response) {
        console.log("......response.....",response)
        if (response.success == '0') {
            callback(response);
        }

        let results = response.result
        //console.log(results)
        let adminSiteUrl = results[1][0] ? results[1][0].config_value : ""
        let crypto = require('crypto');
        let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
        let key = results[0][0].config_value;
        let text = decodedPassword;

        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
        let cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
        let encryptedPassword = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        let siteId = event.siteId;
        let authenticationApiExist = false;
        let userData = []
        let userMail = decodedUsername.split('@')
        let subSql = ''
        let sql1 = " SELECT sec.id as secUserId,sec.display_name as displayName,seRole.authority as authority," +
            " sec.email_id As emailId,sec.mobile_number As mobileNumber FROM sec_user as sec " +
            " inner join sec_user_sec_role as secUsrSecRole on secUsrSecRole.sec_user_id = sec.id " +
            " inner join sec_role as seRole on seRole.id = secUsrSecRole.sec_role_id where sec.email_id = ? and sec.react_password = ? and enabled is true "
        console.log("sql1 ", sql1)
        queryExecution.queryExecution(client, jsonObj, event, sql1, [decodedUsername, encryptedPassword], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let result2 = response.result
            console.log("result2.length...", result2.length)
            if (result2.length > 0) {
                let sellerQuery = " Select si.id as siteSellerId,slr.first_name as firstName,slr.last_name as lastName,su.display_name as displayName,su.id as userId,su.email_id as emailId,su.mobile_number as mobileNumber, " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,si.sub_domain_url as subDomainUrl,if(st.ondc_registration_completed=true,true,false) as ondcRegistrationCompleted,slr.id as sellerId,st.id as storeId " +
                    " from seller as slr " +
                    " INNER JOIN store as st on slr.id = st.seller_id " +
                    " INNER JOIN store_main_category as smc on smc.store_id = st.id " +
                    " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                    " inner join sec_user as su on su.id = slr.id " +
                    " Inner join site as si on si.seller_id = slr.id " +
                    " where su.email_id =? and si.id = ? and su.react_password = ?  and enabled is true ;"
                //console.log("sellerQuery...",sellerQuery)
                let storeQuery = " SELECT si.id AS siteStoreId,su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,si.sub_domain_url as subDomainUrl,if(s.ondc_registration_completed=true,true,false) as ondcRegistrationCompleted " +
                    " FROM store AS s " +
                    " INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
                    " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id and susr.sec_role_id = 4 " +
                    " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
                    " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                    " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
                    " INNER JOIN site AS si ON si.seller_id = sl.id  " +
                    " where su.email_id =? and si.id = ? and su.react_password = ?  and enabled is true ;"


                let adminQuery = " SELECT su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,seRole.authority as authority,s.id as storeId,s.seller_id as sellerId,if(s.ondc_registration_completed=true,true,false) as ondcRegistrationCompleted " +
                    " FROM sec_user AS su " +
                    " inner join sec_user_sec_role as secUsrSecRole on secUsrSecRole.sec_user_id = su.id " +
                    " inner join sec_role as seRole on seRole.id = secUsrSecRole.sec_role_id and seRole.id in " + adminQueryRoles + " " +
                    " left join store as s on s.sec_user_id = su.id " +
                    " where su.email_id =? and su.react_password = ? and enabled is true  ;"
                //console.log("-------------",adminQuery)
                let sellerSubDomainQuery = " Select '' as siteSellerId,slr.first_name as firstName,slr.last_name as lastName,su.display_name as displayName,su.id as userId,su.email_id as emailId,su.mobile_number as mobileNumber, " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,if(st.ondc_registration_completed=true,true,false) as ondcRegistrationCompleted,slr.id as sellerId,st.id as storeId " +
                    " from seller as slr " +
                    " INNER JOIN store as st on slr.id = st.seller_id " +
                    " INNER JOIN store_main_category as smc on smc.store_id = st.id " +
                    " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                    " inner join sec_user as su on su.id = slr.id " +
                    " where su.email_id =? and su.site_id is null and su.react_password = ?  and enabled is true ;"
                // console.log("sellerSubDomainQuery...", sellerSubDomainQuery)
                let storeSubDomainQuery = " SELECT '' AS siteStoreId,su.display_name AS displayName,su.id AS userId,su.email_id AS emailId,su.mobile_number AS mobileNumber,  (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL,s.id as storeId ,sl.id as sellerId,mc.id as mainCategoryId,mc.main_group_category_id as mainGroupCategoryId,if(s.ondc_registration_completed=true,true,false) as ondcRegistrationCompleted " +
                    " FROM store AS s " +
                    " INNER JOIN sec_user AS su ON su.id = s.sec_user_id " +
                    " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id and susr.sec_role_id = 4 " +
                    " INNER JOIN store_main_category as smc on smc.store_id = s.id " +
                    " INNER JOIN main_category as mc on mc.id = smc.main_category_id " +
                    " INNER JOIN seller AS sl ON sl.id = s.seller_id " +
                    " where su.email_id =? and su.site_id is null and su.react_password = ?  and enabled is true ;"

                let groupAdminQuery = " Select su.display_name as displayName,su.id as userId,su.email_id as emailId,su.mobile_number as mobileNumber, " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'redirectURL') AS redirectURL ,sc.id as siteCategoryGropupId,sc.group_name as siteCategoryGropupName,susr.sec_role_id  as roleId " +
                    " from site_category_group as sc " +
                    " inner join sec_user as su on su.id = sc.sec_user_id " +
                    " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id and susr.sec_role_id = 12 " + sitejoinSubQry +
                    " where su.email_id =?  and su.react_password = ?  and enabled is true " + siteWhereQry + ";"
                //console.log("groupAdminQuery....", groupAdminQuery);

                let buyerSite = " Select su.site_id as siteBuyerId,b.first_name as firstName,b.last_name as lastName,su.display_name as displayName,su.email_id as emailId,su.mobile_number as mobileNumber,su.id as userId " +
                    " from buyer as b " +
                    " Inner join sec_user as su on su.id = b.id " +
                    //" inner join site_buyer as sb on sb.buyer_id = b.id " +
                    " where su.email_id =?  and su.site_id = ? and su.react_password = ?  and enabled is true ;" +
                    sellerQuery +
                    storeQuery +
                    adminQuery +
                    sellerSubDomainQuery +
                    storeSubDomainQuery +
                    groupAdminQuery;

                let buyerSiteParams = [
                    decodedUsername,
                    siteId,
                    encryptedPassword,
                    decodedUsername,
                    siteId,
                    encryptedPassword,
                    decodedUsername,
                    siteId,
                    encryptedPassword,
                    
                    decodedUsername,
                    encryptedPassword,
                    decodedUsername,
                    encryptedPassword,
                    decodedUsername,
                    encryptedPassword,
                    decodedUsername,
                    encryptedPassword,
                    ...siteWhereQryParams
                ];
                console.log("buyerSite ", buyerSite,buyerSiteParams)

                queryExecution.queryExecution(client, jsonObj, event, buyerSite, buyerSiteParams, function (response) {
                    if (response.success == '0') {
                        callback(response);
                    }
                    let result3 = response.result
                    console.log(".......result3.............",result3)
                    if (result3[3].length > 0) {
                        console.log("11....")
                        var textBuyer = result3[3][0].userId + "-" + siteId;
                        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
                        var cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
                        var encryptedUrl = cipher.update(textBuyer, 'utf8', 'hex') + cipher.final('hex');


                        if (result3[3][0].authority == 'ROLE_SELLER') {
                            var sellerQuery = " SELECT mc.id AS mainCategoryId,mc.main_group_category_id AS mainGroupCategoryId,st.id as storeId,slr.id as sellerId " +
                                " FROM seller AS slr  " +
                                " INNER JOIN store AS st ON slr.id = st.seller_id  " +
                                " INNER JOIN store_main_category AS smc ON smc.store_id = st.id " +
                                " INNER JOIN main_category AS mc ON mc.id = smc.main_category_id " +
                                " INNER JOIN sec_user AS su ON su.id = slr.id " +
                                " WHERE su.id = ? LIMIT 1;"
                            // console.log("sellerQuery.........", sellerQuery)
                            queryExecution.queryExecution(client, jsonObj, event, sellerQuery, [result3[3][0].userId], function (sellerQueryResponse) {
                                console.log("sellerQueryResponse...", sellerQueryResponse.result[0].sellerId)
                                userData[0] = {
                                    userId: result3[3][0].userId,
                                    firstName: result3[3][0].displayName,
                                    lastName: '',
                                    displayName: result3[3][0].displayName,
                                    emailId: result3[3][0].emailId,
                                    mobileNumber: result3[3][0].mobileNumber,
                                    redirectUrl: '',
                                    isBuyer: '0',
                                    role: result3[3][0].authority,
                                    subDomainUrl: adminSiteUrl + encryptedUrl,
                                    ondcRegistrationCompleted: result3[3][0].ondcRegistrationCompleted,
                                    sellerId: sellerQueryResponse.result[0].sellerId,
                                    storeId: sellerQueryResponse.result[0].storeId,
                                    mainCategoryId: sellerQueryResponse.result[0].mainCategoryId,
                                    mainGroupCategoryId: sellerQueryResponse.result[0].mainGroupCategoryId,
                                    siteCategoryGropupId: '',
                                    siteCategoryGropupName: '',
                                    roleId: ''
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
                            });
                        }
                        else if (result3[3][0].authority == 'ROLE_STORE') {
                            var sellerQuery = " SELECT mc.id AS mainCategoryId,mc.main_group_category_id AS mainGroupCategoryId,st.id as storeId,st.seller_id as sellerId " +
                                " FROM store AS st  " +
                                " INNER JOIN store_main_category AS smc ON smc.store_id = st.id " +
                                " INNER JOIN main_category AS mc ON mc.id = smc.main_category_id " +
                                " INNER JOIN sec_user AS su ON su.id = st.sec_user_id " +
                                " WHERE su.id = ? LIMIT 1;"
                            console.log("sellerQuery.........", sellerQuery)
                            queryExecution.queryExecution(client, jsonObj, event, sellerQuery, [result3[3][0].userId], function (sellerQueryResponse) {

                                userData[0] = {
                                    userId: result3[3][0].userId,
                                    firstName: result3[3][0].displayName,
                                    lastName: '',
                                    displayName: result3[3][0].displayName,
                                    emailId: result3[3][0].emailId,
                                    mobileNumber: result3[3][0].mobileNumber,
                                    redirectUrl: '',
                                    isBuyer: '0',
                                    role: result3[3][0].authority,
                                    subDomainUrl: adminSiteUrl + encryptedUrl,
                                    ondcRegistrationCompleted: result3[3][0].ondcRegistrationCompleted,
                                    sellerId: sellerQueryResponse.result[0].sellerId,
                                    storeId: sellerQueryResponse.result[0].storeId,
                                    mainCategoryId: sellerQueryResponse.result[0].mainCategoryId,
                                    mainGroupCategoryId: sellerQueryResponse.result[0].mainGroupCategoryId,
                                    siteCategoryGropupId: '',
                                    siteCategoryGropupName: '',
                                    roleId: ''
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
                            });
                        }
                        else {
                            userData[0] = {
                                userId: result3[3][0].userId,
                                firstName: result3[3][0].displayName,
                                lastName: '',
                                displayName: result3[3][0].displayName,
                                emailId: result3[3][0].emailId,
                                mobileNumber: result3[3][0].mobileNumber,
                                redirectUrl: '',
                                isBuyer: '0',
                                role: result3[3][0].authority,
                                subDomainUrl: adminSiteUrl + encryptedUrl,
                                ondcRegistrationCompleted: result3[3][0].ondcRegistrationCompleted,
                                sellerId: result3[3][0].sellerId,
                                storeId: result3[3][0].storeId
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

                    }
                    else if (result3[6].length > 0) {
                        console.log("12....")
                        var textBuyer = result3[6][0].userId + "-" + siteId;
                        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
                        var cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
                        var encryptedUrl = cipher.update(textBuyer, 'utf8', 'hex') + cipher.final('hex');

                        userData[0] = {
                            userId: result3[6][0].userId,
                            firstName: result3[6][0].displayName,
                            lastName: '',
                            displayName: result3[6][0].displayName,
                            emailId: result3[6][0].emailId,
                            mobileNumber: result3[6][0].mobileNumber,
                            redirectUrl: result3[6][0].redirectURL + '?token=' + encryptedUrl,
                            isBuyer: '0',
                            role: "ROLE_GROUP_CATEGORY_ADMIN",
                            siteCategoryGropupId: result3[6][0].siteCategoryGropupId,
                            siteCategoryGropupName: result3[6][0].siteCategoryGropupName,
                            roleId: result3[6][0].roleId
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
                        console.log("13....")
                        console.log("--result3[1]---")
                        let data = result3[1][0].userId + '-ROLE_SELLER-' + event.siteId;
                        let buff = new Buffer(data);
                        let base64data = buff.toString('base64');
                        //if (result3[1][0].siteSellerId == result1[0].siteId) {

                        var textSeller = result3[1][0].userId + "-" + siteId;
                        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
                        var cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
                        var encryptedUrl = cipher.update(textSeller, 'utf8', 'hex') + cipher.final('hex');




                        userData[0] = {
                            userId: result3[1][0].userId,
                            sellerId: result3[1][0].sellerId,
                            storeId: result3[1][0].storeId,
                            firstName: result3[1][0].firstName,
                            lastName: result3[1][0].lastName,
                            displayName: result3[1][0].displayName,
                            emailId: result3[1][0].emailId,
                            mobileNumber: result3[1][0].mobileNumber,
                            redirectUrl: result3[1][0].redirectURL + '?token=' + encryptedUrl,
                            isBuyer: '0',
                            role: "ROLE_SELLER",
                            mainCategoryId: result3[1][0].mainCategoryId,
                            mainGroupCategoryId: result3[1][0].mainGroupCategoryId,
                            subDomainUrl: adminSiteUrl + encryptedUrl,
                            ondcRegistrationCompleted: result3[1][0].ondcRegistrationCompleted,
                            siteCategoryGropupId: '',
                            siteCategoryGropupName: '',
                            roleId: ''

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
                        console.log("14....")
                        let data = result3[2][0].userId + '-ROLE_STORE-' + event.siteId;
                        let buff = new Buffer(data);
                        let base64data = buff.toString('base64');

                        var textBuyer = result3[2][0].userId + "-" + siteId;
                        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
                        var cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
                        var encryptedUrl = cipher.update(textBuyer, 'utf8', 'hex') + cipher.final('hex');
                        console.log(".....result3[1]......",result3[1])
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
                            redirectUrl: result3[2][0].redirectURL + '?token=' + encryptedUrl,
                            isBuyer: '0',
                            role: "ROLE_STORE",
                            mainCategoryId: result3[2][0].mainCategoryId,
                            mainGroupCategoryId: result3[2][0].mainGroupCategoryId,
                            subDomainUrl: adminSiteUrl + encryptedUrl,
                            ondcRegistrationCompleted: result3[1].length>0 ? result3[1][0].ondcRegistrationCompleted:0,
                            siteCategoryGropupId: '',
                            siteCategoryGropupName: '',
                            roleId: ''

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
                        console.log("15....")
                        //if (result3[0][0].siteBuyerId == result1[0].siteId) {

                        var textBuyer = result3[0][0].userId + "-" + siteId;
                        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
                        var cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
                        var encryptedUrl = cipher.update(textBuyer, 'utf8', 'hex') + cipher.final('hex');

                        userData[0] = {
                            userId: result3[0][0].userId,
                            firstName: result3[0][0].firstName,
                            lastName: result3[0][0].lastName,
                            displayName: result3[0][0].displayName,
                            emailId: result3[0][0].emailId,
                            mobileNumber: result3[0][0].mobileNumber,
                            subDomainUrl: adminSiteUrl + encryptedUrl,
                            redirectUrl: '',
                            isBuyer: '1',
                            role: "ROLE_BUYER",
                            siteCategoryGropupId: '',
                            siteCategoryGropupName: '',
                            roleId: ''
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
                        console.log("16....")
                        console.log("--result3[4]---", result3[4][0])
                        let data = result3[4][0].userId + '-ROLE_SELLER-' + event.siteId;
                        let buff = new Buffer(data);
                        let base64data = buff.toString('base64');

                        var textBuyer = result3[4][0].userId + "-" + siteId;
                        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
                        var cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
                        var encryptedUrl = cipher.update(textBuyer, 'utf8', 'hex') + cipher.final('hex');
                        //if (result3[1][0].siteSellerId == result1[0].siteId) {
                        userData[0] = {
                            userId: result3[4][0].userId,
                            storeId: result3[4][0].storeId,
                            sellerId: result3[4][0].sellerId,
                            firstName: result3[4][0].firstName,
                            lastName: result3[4][0].lastName,
                            displayName: result3[4][0].displayName,
                            emailId: result3[4][0].emailId,
                            mobileNumber: result3[4][0].mobileNumber,
                            redirectUrl: result3[4][0].redirectURL + '?token=' + encryptedUrl,
                            isBuyer: '0',
                            role: "ROLE_SELLER",
                            mainCategoryId: result3[4][0].mainCategoryId,
                            mainGroupCategoryId: result3[4][0].mainGroupCategoryId,
                            subDomainUrl: adminSiteUrl + encryptedUrl,
                            ondcRegistrationCompleted: result3[4][0].ondcRegistrationCompleted,
                            siteCategoryGropupId: '',
                            siteCategoryGropupName: '',
                            roleId: ''
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
                        console.log("17....")
                        let data = result3[5][0].userId + '-ROLE_STORE-' + event.siteId;
                        let buff = new Buffer(data);
                        let base64data = buff.toString('base64');

                        var textBuyer = result3[5][0].userId + "-" + siteId;
                        var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
                        var cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
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
                            redirectUrl: result3[5][0].redirectURL + '?token=' + encryptedUrl,
                            isBuyer: '0',
                            role: "ROLE_STORE",
                            mainCategoryId: result3[5][0].mainCategoryId,
                            mainGroupCategoryId: result3[5][0].mainGroupCategoryId,
                            subDomainUrl: adminSiteUrl + encryptedUrl,
                            ondcRegistrationCompleted: result3[5][0].ondcRegistrationCompleted,
                            siteCategoryGropupId: '',
                            siteCategoryGropupName: '',
                            roleId: ''
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
