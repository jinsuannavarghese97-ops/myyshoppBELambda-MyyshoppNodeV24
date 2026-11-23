const queryExecution = require('../queryExecution');
let moment = require('moment-timezone');
let methods = {};


methods.bannerList = function (client, jsonObj, event, callback) {
    let subQry = ""
    let params = []
    const removeQuotes = (str) => {
        return str.split("'").join('');
    };
    if (event.siteCategoryGroupBannerId) {
        subQry = " and id = ? "
        params.push(event.siteCategoryGroupBannerId)
    }
    if (event.cmbSelect == "1") {
        subQry = " and sGBanner.name like ? "
        params.push(removeQuotes("'%" + event.txtInput + "%'"))
    }
    if (event.cmbStatus) {
        event.cmbStatus = event.cmbStatus == "true" ? 1 : 0
        subQry = subQry + " and sGBanner.is_active = ? "
        params.push(event.cmbStatus)

    }
    let dQuery = " Select sGBanner.id as bannerId " +
        " from site_category_group_banner as sGBanner " +
        " where sGBanner.site_category_group_id = ?" + subQry +
        " order by sGBanner.id desc; " +

        " Select sGBanner.id as bannerId,sGBanner.name as bannerName,sGBanner.`rank` as `Rank`,sGBanner.site_category_group_id as groupId,sGBanner.banner_type_id as bannerType,date_format(sGBanner.from_date, '%d %b %Y') as bannerFrDate,date_format(sGBanner.to_date, '%d %b %Y') as bannerToDte, " +
        " 'MyCategoryHomeBanner' as bannerTypeName,sGBanner.image_path as imgPath,sGBanner.category_id as category,sGBanner.description as descrip,date_format(sGBanner.from_date,'%d-%m-%Y') as bannerFrmDate,date_format(sGBanner.to_date,'%d-%m-%Y') as bannerToDate,if(sGBanner.is_active is true,'true','false') as IsActive,if(sGBanner.is_approved is true,'true','false') as IsApprove, " +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/',(SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
        "	   (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        "	   (SELECT config_value FROM configuration WHERE config_key = 'groupItem'),'/groupHomeBanner/',sGBanner.image_path) AS image, " +
        // " (SELECT config_value FROM configuration WHERE config_key = 's3bucketAccessKey') as accessKey, " +
        // " (SELECT config_value FROM configuration WHERE config_key = 's3bucketSecretKey') as secretKey " +
        " from site_category_group_banner as sGBanner " +
        " where sGBanner.site_category_group_id = ?" + subQry +
        " order by sGBanner.id desc " +
        " limit ?,?;"
    let values = [event.siteCategoryGroupId, ...params, event.siteCategoryGroupId, parseInt(event.offset), parseInt(event.max)]
   // console.log("dQuery ", dQuery,values)
    queryExecution.queryExecution(client, jsonObj, event, dQuery, values, function (queryStringResult) {
       
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        if (results[0].length > 0) {
            const response = {
                success: "1",
                successMessage: "Success.",
                result: {
                    bannerlist: results[1],
                    count: results[0].length
                },
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: [],
                errorMessage: "No data found."
            }
            callback(response)
        }
    })
}


methods.bannerSave = function (client, jsonObj, event, callback) {
    let dQuery = "";
    event.isMedia = event.isMedia == 'true' ? 1 : 0;
    event.isActive = event.isActive == 'true' ? 1 : 0;
    event.bannerTypeId = event.bannerTypeId ? event.bannerTypeId : 23;
    let params = []
    if (event.siteCategoryGroupBannerId) {
        dQuery = " update site_category_group_banner set " +
            " version =version+1,description=?,from_date=?,image_path=?,is_active=?,rank=?,name=?,to_date=?,modified_on = now(), modified_by = ?" +
            " where id = ?;"
        params.push(event.description, event.fromDate, event.image, event.isActive, event.rank, event.name, event.toDate, event.userId, event.siteCategoryGroupBannerId)
    }
    else {
        dQuery = " insert into site_category_group_banner " +
            " (version,banner_type_id,category_id,created_by,created_on,description,from_date,image_path,is_active,is_approved,`rank`,name,site_category_group_id,to_date) " +
            " values " +
            " (0,?,0,?,now(),?,?,?,?,1,?,?,?,?) ;"
        params.push(event.bannerTypeId, event.userId, event.description, event.fromDate, event.image, event.isActive, event.rank, event.name, event.siteCategoryGroupId, event.toDate)
    }

   // console.log("dQuery ", dQuery,params)
    queryExecution.queryExecution(client, jsonObj, event, dQuery, params, function (queryStringResult) {
      // console.log("queryStringResult...",queryStringResult);
       
        queryStringResult.result = queryStringResult.result ? [] : []
        callback(queryStringResult);
    })
}

module.exports = methods;