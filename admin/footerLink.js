const queryExecution = require('../queryExecution');
let methods = {};


methods.footerLinkList = function (client, jsonObj, event, callback) {
    let subQry = ""
    let val = []
    event.offset = event.offset ? event.offset : 0
    event.max = event.max ? event.max : 10
    if (event.siteCategoryGroupFooterLinksId) {
        subQry = " and id = ?"
        val.push(event.siteCategoryGroupFooterLinksId)
    }
    let dQuery = " Select id " +
        " from site_category_group_footer_links " +
        " where site_category_group_id = ? " + subQry +
        " order by id desc; " +

        " Select id as siteCategoryGroupFooterLinksId,image_name,if(image_name = '' OR image_name IS NULL,'',CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/themes/',image_name)) AS imageFullPath,name as linkName,share_url as shareUrlLink,url as urlLink,site_category_group_id as siteId,if(is_media is true,'true','false') as media,content as content,if(is_app is true,true,false) as isApp " +
        " from site_category_group_footer_links " +
        " where site_category_group_id = ?" + subQry +
        " order by id desc " +
        " limit ?, ?;"


    queryExecution.queryExecution(client, jsonObj, event, dQuery, [event.siteCategoryGroupId, ...val, event.siteCategoryGroupId, ...val, parseInt(event.offset), parseInt(event.max)], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        //  console.log("results.....",results)
        if (results[0].length > 0) {
            const response = {
                success: "1",
                successMessage: "Success.",
                result: results[1],
                count: results[0].length,
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: [],
                count: 0,
                errorMessage: "No data found."
            }
            callback(response)
        }
    })
}


methods.footerLinkSave = function (client, jsonObj, event, callback) {
    let dQuery = "";
    event.isMedia = event.isMedia == 'true' ? 1 : 0;
    event.isApp = event.isApp == true ? 1 : 0;
    let existSub = ""
    let params = []
    if (event.siteCategoryGroupFooterLinksId) {
        existSub = " and id != ? "
        params.push(event.siteCategoryGroupFooterLinksId)
    }

    let existQry = "SELECT id from site_category_group_footer_links where name = ? and site_category_group_id= ? " + existSub + "; "
    queryExecution.queryExecution(client, jsonObj, event, existQry, [event.name, event.siteCategoryGroupId, ...params], function (exist) {
        if (exist.success == '0') {
            callback(exist);
        }
        let results = exist.result
        let values = []
        if (results.length == 0) {
            if (event.siteCategoryGroupFooterLinksId) {
                dQuery = " update site_category_group_footer_links set " +
                    " version = version+1 ,content=?,is_media = ?,name=?, " +
                    " share_url=?,site_category_group_id=?,url=?,image_name=? ,is_app= ? " +
                    " where id =?  ; "
                values.push(event.content, event.isMedia, event.name, event.shareUrl, event.siteCategoryGroupId, event.urlData, event.imageName, event.isApp, event.siteCategoryGroupFooterLinksId)
            }
            else {
                dQuery = " insert into site_category_group_footer_links " +
                    " (version,content,is_media,name,share_url,site_category_group_id,url,is_app,image_name) " +
                    " values " +
                    " (0,?,?,?,?,?,?,?,?) ;"
                values.push(event.content, event.isMedia, event.name, event.shareUrl, event.siteCategoryGroupId, event.urlData, event.isApp, event.imageName)
            }


            queryExecution.queryExecution(client, jsonObj, event, dQuery, values, function (queryStringResult) {
                queryStringResult.result = queryStringResult.result ? [] : []
                callback(queryStringResult);
            });
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: [],
                errorMessage: "Footer already exist."
            }
            callback(response)
        }
    });
}

module.exports = methods;
