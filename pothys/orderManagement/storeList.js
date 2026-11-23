let mysql = require('mysql');
let methods = {};
methods.storeList = function (client, jsonObj, event, queryExecution, callback) {

    let forStoreGroup = ""
    let subQuery = ""
    let offset = 0
    let max = 10
    let storeQry = "";
    let storeQryParams = [];
    let sellerQry = "";
    let sellerQryParams = [];
    let subQry = "";
    let subQryParams = [];
    if (event.storeId) {
        subQry = " where st.is_active =TRUE AND st.is_approved = TRUE and id = ?";
        subQryParams.push(event.storeId);
        storeQry = " and st.id = ?";
        storeQryParams.push(event.storeId);
    }
    if (event.sellerId) {
        sellerQry = " AND s.id= ?";
        sellerQryParams.push(event.sellerId);
        subQry = " where st.is_active =TRUE AND st.is_approved = TRUE and seller_id = ? ";
        subQryParams.push(event.sellerId);
    }
    let queryString = "SELECT st.id as storeId, st.name as storeName, st.locality from store as st " + subQry + "; " +

        "SELECT st.id AS storeId,st.name AS storeName,s.id AS sellerId, st.alternate_number2 as alternateNumber2,st.alternate_number1 as " +
        " alternateNumber1,st.alternate_email as alternateEmail, st.whatsapp_description as whatsappDescription, st.locality as locality, " +
        " st.footer_description as footerDescription, sc.mobile_number as mobileNumber,st.telephone_number as telephoneNumber, " +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/', (SELECT config_value FROM configuration WHERE " +
        " config_key = 'storeDigS3BucketName'),'/', (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', (SELECT " +
        " config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/',  if(st.logo_path is null,'default.jpg',st. " +
        " logo_path)) AS storeLogoPath,  CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/', (SELECT " +
        " config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', (SELECT config_value FROM configuration WHERE " +
        " config_key = 'bucketSubFolder'),'/', (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/SML_',  " +
        " if(st.logo_path is null,'default.jpg',st.logo_path)) AS storeLogoPathSmall " +
        "FROM store AS st " +
        "INNER JOIN seller AS s ON s.id = st.seller_id " +
        "LEFT JOIN sec_user as sc on st.sec_user_id = sc.id " +
        "WHERE s.is_active =TRUE AND s.is_approved = TRUE and st.is_active =TRUE AND st.is_approved = TRUE and sc.is_verified = true and sc.enabled = true AND s.is_embed_code_enabled = TRUE " +
        " AND st.is_embed_code_enabled = TRUE " + sellerQry + storeQry + " group by st.id; "
    queryExecution.queryExecution(client, jsonObj, event, queryString, [...subQryParams, ...sellerQryParams, ...storeQryParams], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "result": results[0],
            "logo": results[1],
            "errorMessage": ""
        }
        callback(responseData)

    });
}
module.exports = methods;
