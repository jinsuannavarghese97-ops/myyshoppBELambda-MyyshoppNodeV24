const queryExecution = require('../queryExecution');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

let methods = {};

methods.saveSiteCategoryGroup = function (client, jsonObj, event, callback) {
    console.log("event....123", event)
    try {
        let decoded = jwt.decode(event.token, {
            complete: true
        });
        let decodedEmailId = decoded.payload.emailId;
        let decodedMobileNumber = decoded.payload.mobileNumber;
        let decodedPassword = decoded.payload.emailHost ? decoded.payload.emailHost : Math.floor((Math.random() * 1000000) + 1);
        let emailHost = decoded.payload.emailHost
        let emailPassword = decoded.payload.emailPassword
        let emailPort = decoded.payload.emailPort
        let emailUserId = decoded.payload.emailUserId
        if (event.hasGlobalDelivery) { } else { event.hasGlobalDelivery = false }

        let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey'"
        queryExecution.queryExecution(client, jsonObj, event, queryConfigKey, [], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let results = response.result;
            let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
            let key = results[0].config_value;
            let text = decodedPassword.toString();
            var _evp = require('evp_bytestokey')(Buffer.from(key), null, 256, 16);
            let cipher = crypto.createCipheriv(algorithm, _evp.key, _evp.iv);
            let encryptedPassword = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
            let username = Math.floor((Math.random() * 1000000) + 1);
            let siteId = event.siteId;
            let txtdisplayName = event.groupName;
            let userData = []
            let existSubQry = ""
            if (event.secUserId) {
                existSubQry = " and id not in (" + event.secUserId + ") "
            }
            let emailExistSite = "SELECT count(*) as count " +
                " FROM sec_user as su " +
                " INNER JOIN sec_user_sec_role as susr on susr.sec_user_id = su.id and susr.sec_role_id not in (2) " +
                " WHERE (su.email_id = ? or su.mobile_number=?) and su.enabled is true " + existSubQry + "; "
            console.log('emailExistSite....', emailExistSite)
            queryExecution.queryExecution(client, jsonObj, event, emailExistSite, [decodedEmailId, decodedMobileNumber,], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let emailExistSiteResult = response.result;
                if (emailExistSiteResult[0].count > 0) {
                    const response = {
                        success: "0",
                        result: {},
                        errorMessage: "Email id/mobile number already exists",
                        successMessage: ""
                    };
                    callback(response);
                }
                else {
                    //client.query("START TRANSACTION");
                    let query = ""
                    let val = []
                    if (event.siteCategoryGroupId) {
                        query = "UPDATE sec_user set version=version+1,display_name=?,email_id=?,mobile_number=? where id = ?;"
                        val.push(txtdisplayName, decodedEmailId, decodedMobileNumber, event.secUserId)
                    }
                    else {
                        query = "INSERT INTO sec_user (version,account_expired,account_locked,enabled,is_verified,display_name,email_id,mobile_number,react_password,password_expired,username,password) VALUES ('0',0,0,1,1,?,?,?,?,0,?,'5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8')";
                        val.push(txtdisplayName, decodedEmailId, decodedMobileNumber, encryptedPassword, username)
                    }

                    queryExecution.queryExecution(client, jsonObj, event, query, val, function (response1) {
                        query = ""
                        if (response1.success == '0') {
                            //client.query("ROLLBACK");
                            callback(response1);
                        }
                        let result4 = response1.result;
                        let insertIds = ""
                        insertIds = result4.insertId ? result4.insertId : ''
                        event.secUserId = insertIds
                        event.slug = "SITE_GROUP" + '-' + event.groupName
                        event.hasBuyOption = 1//(event.hasBuyOption == "true") ? 1 : 0
                        event.hasCategoryInHomePage = 0//(event.hasCategoryInHomePage) == "true" ? 1 : 0
                        event.hasCategorySelection = 1//(event.hasCategorySelection == "true") ? 1 : 0
                        event.hasContactUsForm = (event.hasContactUsForm == "true") ? 1 : 0
                        event.hasHomeBanner = (event.hasHomeBanner == "true") ? 1 : 0
                        event.hasRegistrationForm = 0//(event.hasRegistrationForm == "true") ? 1 : 0
                        event.headerFooterColour = (event.headerFooterColour == "true") ? 1 : 0
                        event.homePageHtml = (event.homePageHtml == "true") ? 1 : 0
                        event.showContactDetails = (event.showContactDetails == "true") ? 1 : 0
                        event.displayCity = (event.displayCity == "true") ? 1 : 0
                        event.showWhatsappLink = (event.showWhatsappLink == "true") ? 1 : 0
                        event.isActive = (event.isActive == "true") ? 1 : 0
                        event.hasSellerRegisteration = (event.hasSellerRegisteration == "1") ? 1 : 0
                        event.hasGlobalSearch = (event.hasGlobalSearch == "true") ? 1 : 0
                        console.log("event.hasSellerRegisteration....", event.hasSellerRegisteration)
                        let insert = '0'
                        let values = []
                        if (event.siteCategoryGroupId) {
                            query = " UPDATE site_category_group set version=version+1,alternate_contact_no=?,bannerbutton_text=?,button_colour=?, " +
                                " contact_email = ?, contact_no = ?, fb_client_id = ?,  " +
                                " google_client_id = ?, group_name = ?, has_buy_option = ?, has_category_in_home_page = ?,  " +
                                " has_category_selection = ?, has_contact_us_form = ?, has_home_banner = ?, has_registration_form = ?,  " +
                                " home_page_html = '',  logo_path = ?,  " +
                                " seo_description = ?, seo_title = ?, show_contact_details = ?, show_whatsapp_link = ?,  " +
                                " slug = ?, whats_app_description = ?, display_city = ?, email_host = ?, email_password = ?,  " +
                                " email_port = ?, email_user_id = ?,has_global_search = ?,has_seller_registration = ? " +
                                " where id = ?; " +
                                " delete from site_category_group_category where site_category_group_id = ?;" +
                                " UPDATE site set version=version+1, site_url = ?,google_analytics_script = ?,has_global_delivery=? ,isPincodeBased=? where id =?;" +
                                " UPDATE site_sub_domain set version=version+1, site_url = ? where id = ?;"

                            console.log("query.....", query)
                            values.push(event.alternateNo, event.bannerbuttonText, event.buttonColour, decodedEmailId, decodedMobileNumber, event.fbClientId, event.googleClientId, event.groupName,
                                event.hasBuyOption, event.hasCategoryInHomePage, event.hasCategorySelection, event.hasContactUsForm, event.hasHomeBanner, event.hasRegistrationForm, event.logoPath,
                                event.groupName, event.groupName, event.showContactDetails, event.showWhatsappLink, event.slug, event.whatsAppDescription, event.displayCity, emailHost, emailPassword,
                                emailPort, emailUserId, event.hasGlobalSearch, event.hasSellerRegisteration, event.siteCategoryGroupId, event.siteCategoryGroupId, event.siteUrl, event.googleAnalyticsScript,
                                event.hasGlobalDelivery, event.isPincodeBased, event.siteId, event.siteUrl, event.siteSubDomainId
                            )
                        }
                        else {
                            insert = '1'
                            query = " INSERT INTO site_category_group " +
                                " (version,alternate_contact_no,bannerbutton_text,button_colour, " +
                                " contact_email,contact_no,created_by,created_on,fb_client_id, " +
                                " google_client_id,group_name,has_buy_option,has_category_in_home_page, " +
                                " has_category_selection,has_contact_us_form,has_home_banner,has_registration_form, " +
                                " header_footer_colour,home_page_html,is_active,logo_path,sec_user_id, " +
                                " seo_description,seo_keyword,seo_title,show_contact_details,show_whatsapp_link, " +
                                " slug,whats_app_description,display_city,email_host,email_password, " +
                                " email_port,email_user_id,has_seller_registration,has_global_search) " +
                                " values " +
                                " (0, '" + event.alternateNo + "', '" + event.bannerbuttonText + "', '" + event.buttonColour + "', " +
                                " '" + decodedEmailId + "', '" + decodedMobileNumber + "', '" + event.userId + "', now(), '" + event.fbClientId + "'," +
                                " '" + event.googleClientId + "', '" + event.groupName + "', " + event.hasBuyOption + ", " + event.hasCategoryInHomePage + ", " +
                                " " + event.hasCategorySelection + ", " + event.hasContactUsForm + ", " + event.hasHomeBanner + ", " + event.hasRegistrationForm + ", " +
                                " '" + event.headerFooterColour + "', '', true, '" + event.logoPath + "', " + event.secUserId + ", " +
                                " '" + event.groupName + "', '" + event.groupName + "', '" + event.groupName + "', " + event.showContactDetails + ", " + event.showWhatsappLink + ", " +
                                " '" + event.slug + "', '" + event.whatsAppDescription + "', " + event.displayCity + ", '" + emailHost + "', '" + emailPassword + "', " +
                                " '" + emailPort + "', '" + emailUserId + "','" + event.hasSellerRegisteration + "'," + event.hasGlobalSearch + "); "
                            values.push(event.alternateNo, event.bannerbuttonText, event.buttonColour, decodedEmailId, decodedMobileNumber, event.userId, event.fbClientId, event.googleClientId, event.groupName,
                                event.hasBuyOption, event.hasCategoryInHomePage, event.hasCategorySelection, event.hasContactUsForm, event.hasHomeBanner, event.hasRegistrationForm, event.headerFooterColour, event.logoPath,
                                event.secUserId, event.groupName, event.groupName, event.groupName, event.showContactDetails, event.showWhatsappLink, event.slug, event.whatsAppDescription, event.displayCity, emailHost, emailPassword,
                                emailPort, emailUserId, event.hasSellerRegisteration, event.hasGlobalSearch
                            )
                        }
                        console.log("query...fffff..", query)
                        queryExecution.queryExecution(client, jsonObj, event, query, values, function (response2) {
                            query = ""
                            if (response2.success == '0') {
                                //client.query("ROLLBACK");
                                callback(response2);
                            }
                            let result5 = response2.result;
                            console.log("response2.....", response2)
                            event.siteCategoryGroupId = (insert == '1') ? result5.insertId : event.siteCategoryGroupId
                            let category = event.mainCategoryId.split(',')
                            let pushData = []
                            let insertQry = ""
                            let val = []
                            for (let i = 0; i < category.length; i++) {
                                pushData.push("(0, ?,?)")
                                val.push(category[i], event.siteCategoryGroupId)
                                insertQry = insertQry + " INSERT INTO site_category_group_category (version, main_category_id, site_category_group_id) values (0, " + category[i] + ", " + event.siteCategoryGroupId + "); "
                            }
                            query = " INSERT INTO site_category_group_category (version, main_category_id, site_category_group_id) values " + pushData + ";"

                            queryExecution.queryExecution(client, jsonObj, event, query, [...val], function (responseData) {
                                if (responseData.success == '0') {
                                    //client.query("ROLLBACK");
                                    callback(response);
                                }
                                else if (insertIds) {
                                    let resultsdatum = responseData.result
                                    query = ""
                                    let query1 = " insert into sec_user_sec_role (sec_role_id,sec_user_id) values ('12',?) ;" +
                                        " insert into site " +
                                        " (version, seller_id, site_url, has_authentication_api, site_category_group, google_analytics_script, group_id) " +
                                        " values " +
                                        " (0, 0,?, false, ?, ?, 0);"
                                    queryExecution.queryExecution(client, jsonObj, event, query1, [insertIds, event.siteUrl, event.siteCategoryGroupId, event.googleAnalyticsScript], function (responseData1) {
                                        //responseData1.success == '0' ? client.query("ROLLBACK") : client.query("COMMIT");
                                        let query1 = "INSERT INTO site_sub_domain (version, site_url, site_id) values (0, ?, ?);"
                                        queryExecution.queryExecution(client, jsonObj, event, query1, [event.siteUrl, responseData1.result[1].insertId], function (responseData1) {
                                            responseData1.result = []
                                            callback(responseData1);
                                        });

                                    });
                                }
                                else {
                                    //responseData.success == '0' ? client.query("ROLLBACK") : client.query("COMMIT");
                                    responseData.result = []
                                    callback(responseData);

                                }

                            });

                        });


                    });
                }
            });


        });
    }
    catch (e) {
        console.log("e......", e);
        const response = {
            success: "0",
            successMessage: "",
            errorMessage: "Something went wrong." + e,
            errorType: "Execution Error"
        }
        console.log("response...", response)
        callback(response);
    }


}



module.exports = methods;