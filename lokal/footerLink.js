const methods = {};
let queryExecution = require('../queryExecution');

methods.footerLink = function(client, jsonObj, event, callback) {

    let storeResults = [];
    let siteQry = " SELECT * FROM site_category_group where id = ?; " +
        " SELECT id,version,content,if(is_media is true,1,0) as is_media,name,share_url,site_category_group_id,url,if(is_app is true,true,false) as is_app," +
        "image_name,if(image_name = '' OR image_name IS NULL,'',CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
        "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/themes/',image_name)) AS imageFullPath FROM site_category_group_footer_links" +
        " where site_category_group_id =  ?; "

    queryExecution.queryExecution(client, jsonObj, event, siteQry,[event.siteCategoryGroupId,event.siteCategoryGroupId], function(response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result

        let siteGroup = results[0]
        siteGroup[0].footerLink = results[1]

        const responseData = {
            success: "1",
            siteGroupData: siteGroup,
            successMessage: "Data fetched successfully.",
            errorMessage: ""
        }
        callback(responseData);

    });

}
module.exports = methods;
