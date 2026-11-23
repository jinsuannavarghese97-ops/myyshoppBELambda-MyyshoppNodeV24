const queryExecution = require('../queryExecution')
const methods = {};
var crypto = require('crypto');
const EVP_BytesToKey = require('evp_bytestokey')
let moment = require('moment-timezone');
methods.newSellerStoreRegistration = function (client, jsonObj, event, callback) {


    let queryConfigKey = "SELECT config_value FROM configuration WHERE config_key = 'loginKey' ";
    console.log(queryConfigKey)

    queryExecution.queryExecution(client, "", event, queryConfigKey, [], function (queryConfigKeyResult) {
        if (queryConfigKeyResult.success == '0') {
            const response = {
                success: "0",
                successMessage: "",
                errorMessage: "Something went wrong"
            };
            callback(response);
        }
        else {

            if (queryConfigKeyResult.length > 0) {
                //SELLER REGISTRATION
                var dateTime = new Date()
                var password = 'password'
                var userName = dateTime.getTime();
                const KEY_SIZE = 32;
                let algorithm = 'aes256';
                let key = queryConfigKeyResult.result[0].config_value;
                let text = password;

                const result = EVP_BytesToKey(
                    key,
                    null,
                    KEY_SIZE * 8,
                    16
                )

                var cipher = crypto.createCipheriv(algorithm, result.key, result.iv);
                var encryptedPassword = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');


                let before = (Math.random() + 1).toString(36).substring(7);
                let after = (Math.random() + 1).toString(36).substring(7);
                let middle = (Math.random() + 1).toString(36).substring(7);


                let userPassword = before + '##@' + middle + password + after
                var hasContactUsForm = false
                var hasLocation = false
                var isRental = false
                var isRentalHome = false
                var hasHomePage = false
                var homePageHtml = ""
                var isTrialRoomEnabled = false
                var isSinglelevelMenu = false
                var hasWallet = false
                var isServiceProvider = false
                var hasBlog = false
                var blogName = ""
                var adminId = 1
                var ranking = '999'
                var pickupReturnAvailable = false
                var regionId = "" //DOUBT
                var cityId = "" //DOUBT

                var createdOn = moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
                console.log(createdOn)

                var insertSecUserQuery = `
                    INSERT INTO sec_user 
                    (version, account_expired, account_locked, display_name, email_id, enabled, is_verified, mobile_number, password, password_expired, username, react_password, data_clone) 
                    VALUES (?, 0, 0, ?, ?, 1, 0, ?, ?, 0, ?, ?, ?);
                `;

                const insertSecUserParams = [
                    0, // version
                    event.sellerName,
                    event.sellerEmailId,
                    event.sellerMobileNumber,
                    encryptedPassword,
                    userName,
                    encryptedPassword,
                    userPassword
                ];

                var sellerInsertQuery = `
                    INSERT INTO seller 
                    (id, first_name, last_name, aadhar_no, retail_group_name, description, telephone_number, has_contact_us_form, has_location, is_rental,
                    is_rental_home, has_home_page, is_trial_room_enabled, home_page_html, is_singlelevel_menu, has_wallet, is_service_provider,
                    has_blog, blog_name, created_by, region_id, city_id, ranking, created_on,
                    is_approved, is_active, is_items_mapped, modified_by, is_embed_code_enabled, has_buy_option,
                    is_app_android_exist, is_app_ios_exist, has_theme_details_set, has_express_delivery, pickup_return_available) 
                    VALUES 
                    (LAST_INSERT_ID(), ?, '', '', '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;

                const sellerInsertParams = [
                    event.sellerName,
                    event.sellerMobileNumber,
                    hasContactUsForm,
                    hasLocation,
                    isRental,
                    isRentalHome,
                    hasHomePage,
                    isTrialRoomEnabled,
                    homePageHtml,
                    isSinglelevelMenu,
                    hasWallet,
                    isServiceProvider,
                    hasBlog,
                    blogName,
                    adminId,
                    regionId,
                    cityId,
                    ranking,
                    createdOn,
                    true,  // is_approved
                    true,  // is_active
                    false, // is_items_mapped
                    1,     // modified_by
                    false, // is_embed_code_enabled
                    true,  // has_buy_option
                    false, // is_app_android_exist
                    false, // is_app_ios_exist
                    false, // has_theme_details_set
                    false, // has_express_delivery
                    pickupReturnAvailable
                ];


                var insertSecUserSecRoleQuery = " INSERT INTO sec_user_sec_role (sec_role_id,sec_user_id) VALUES (3,LAST_INSERT_ID()); "

                var sellerRegistrationQuery = insertSecUserQuery + sellerInsertQuery + insertSecUserSecRoleQuery;
                const queryParams = [...insertSecUserParams, ...sellerInsertParams];
                queryExecution.queryExecution(client, "", event, sellerRegistrationQuery, queryParams, function (dbRresponse) {
                    if (dbRresponse.success == '0') {
                        const response = {
                            success: "0",
                            successMessage: "",
                            errorMessage: "Something went wrong in register seller"
                        };
                        callback(response);
                    }
                    else {
                        // STORE REGISTRATION
                        if (event.storeDetails) {

                        }

                    }

                });
            }
            else {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: " No Data Found"
                };
                callback(response);
            }
        }

    });
}
module.exports = methods;
