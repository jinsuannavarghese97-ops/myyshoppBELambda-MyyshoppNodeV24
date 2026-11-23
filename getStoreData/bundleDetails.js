let bundleDetails = require('./bundleDetails.js');
let queryExecution = require('../queryExecution');
let methods = {};
methods.bundleDetails = function (client, jsonObj, event, callback) {
    let bundleId = jsonObj.bundleId
    let appData = [];
    let saveDeviceQuery
    let response
     
    let appDetailQuery = " select app.id as appDetailsId ,st.id as storeId,app.site_id as siteId, s.site_url as siteUrl,s.app_splash_image as appSplashImage, " +
        " s.seller_id as sellereId,s.site_category_group as siteCategoryGroup, if(s.has_multiple_checkout is true,'1','0') as hasMultipleCheckout, if(scg.display_city is true,'1','0') as hasDisplayCity " +
        " from app_details as app  " +
        " inner join site as s on s.id=app.site_id " +
        " left join site_category_group as scg on scg.id = s.site_category_group and scg.is_active is true " +
        " inner join seller as sl on s.seller_id = sl.id and sl.is_active is true " +
        " inner join store as st on sl.id = st.seller_id and st.is_active is true " +
        " where app.bundle_id = ?; " +

        " select st.id as storeId," +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/'," +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/',b.image_path) as imagePath" +
        " from app_details as ad " +
        " inner join site as s on s.id = ad.site_id " +
        " inner join seller as sl on s.seller_id = sl.id and sl.is_active is true " +
        " inner join store as st on sl.id = st.seller_id and st.is_active is true " +
        " inner join banner as b on b.store_id = st.id and b.is_active is true and b.is_approved is true and b.banner_type_id = 32 " +
        " inner join banner_type as bt on bt.id = b.banner_type_id and bt.is_active is true " +
        " where ad.bundle_id = ?; " +

        " select scg.id as siteCategoryGroupId," +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/'," +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'groupItem'),'/groupHomeBanner/',scgb.image_path) as imagePath" +
        " from app_details as ad " +
        " inner join site as s on s.id = ad.site_id " +
        " inner join site_category_group as scg on scg.id = s.site_category_group and scg.is_active is true " +
        " inner join site_category_group_banner as scgb on scgb.site_category_group_id = scg.id and scgb.is_active is true and scgb.banner_type_id = 32 " +
        " inner join banner_type as bt on bt.id = scgb.banner_type_id and bt.is_active is true " +
        " where ad.bundle_id = ?; "
   
    queryExecution.queryExecution(client, jsonObj, event, appDetailQuery,[bundleId,bundleId,bundleId], function (response) {
     //console.log(".....",response.result)
        if (response.success == '0') {
            callback(response)
        }
        let appDetailResults = response.result
        if (appDetailResults[0].length > 0) {
            let appDetails = [];
            appDetails = {
                siteId: appDetailResults[0][0].siteId,
                siteUrl: appDetailResults[0][0].siteUrl,
                sellereId: appDetailResults[0][0].sellereId,
                siteCategoryGroup: appDetailResults[0][0].siteCategoryGroup,
                appSplashImage: appDetailResults[0][0].appSplashImage,
                hasMultipleCheckout: appDetailResults[0][0].hasMultipleCheckout,
                hasDisplayCity: appDetailResults[0][0].hasDisplayCity,
                storeId: appDetailResults[0][0].storeId,
                storeHomeBanner: appDetailResults[1],
                storeGroupHomeBanner: appDetailResults[2]

            }
            appData.push(appDetails)
          
            const data = {
                success: "1",
                result: {
                    "bundleIdDetails": appData,
                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(data);
        } else {
            const data = {
                success: "1",
                result: {
                    "bundleIdDetails": appData,
                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(data);
        }
    })
}
module.exports = methods;
