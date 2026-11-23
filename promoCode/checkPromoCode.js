let methods = {};
let queryExecution = require('../queryExecution');
methods.listPromoCode = function (client, jsonObj, event, callback) {

    let storeList = jsonObj.storeId
    let configQuery = " SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'; " +
        " SELECT config_value FROM configuration WHERE config_key = 's3Address'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'siteCategoryLogoPath'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder';"
    //connection.query(configQuery, function (error, configResults, fields) {       
    queryExecution.queryExecution(client, jsonObj, event, configQuery, [],function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let configResults = response.result;
        let promoCodeImagePath = configResults[0][0].config_value + '/' + configResults[1][0].config_value + '/promoBanner/';
        let myCategoryLogoPath = configResults[2][0].config_value + '/' + configResults[3][0].config_value + '/' + configResults[1][0].config_value + '/' + configResults[4][0].config_value + '/thumb/';
        let myCategoryFavIconPath = configResults[2][0].config_value + '/' + configResults[3][0].config_value + '/' + configResults[1][0].config_value + '/' + configResults[4][0].config_value + '/thumb/SML_';
        let storeLogoPath = configResults[2][0].config_value + '/' + configResults[3][0].config_value + '/' + configResults[1][0].config_value + '/' + configResults[5][0].config_value + '/';
        let storeFavIconPath = configResults[2][0].config_value + '/' + configResults[3][0].config_value + '/' + configResults[1][0].config_value + '/' + configResults[5][0].config_value + '/thumb/SML_';

        let myCategoryQuery = "";
        let myCategoryQueryParams = [];
        let storeQry = ""
        let promocodeDetails = []
        let promocodeStoreList = []
        let storeListParams = [];
        let existStore = []
        if (jsonObj.myCategoryId) {
            let storeList = "";
          
            if (jsonObj.storeId) {
                storeList = "?";
                storeListParams.push(jsonObj.storeId)
            }
            else {
                storeList = " SELECT group_concat(store_id) from site_category_group_stores where site_category_group_id = ?";
                storeListParams.push(jsonObj.myCategoryId)
            }
            /*myCategoryQuery = " select '' as mainGroupCategoryId,'' as slug,'' as storeId,pc.code as promoCode ,pc.banner_image as bannerImage,pc.id as promoCodeId, scg.logo_path as logoPath, '1' as isMyCategory, " +
                            " scg.group_name as storeName, pc.description as offerDescription,'' as storeFavIcon " +
                            " from promo_code as pc " +
                            " inner join group_promo_code gpc on gpc.promo_code_id = pc.id " +
                            " inner join site_category_group as scg on scg.id = gpc.site_category_group_id " +
                            " where gpc.site_category_group_id = "+jsonObj.myCategoryId+
                            " and pc.is_active = true and  " +
                            " if(pc.valid_from is not null and pc.valid_to is  not null,(curdate() between date(pc.valid_from) and date(pc.valid_to)),true) " +
                            " and  " +
                            " if(pc.valid_from is not null and pc.valid_to is null,(curdate() >= date(pc.valid_from)),true) " +
                            " and  " +
                            " if(pc.valid_from is null and pc.valid_to is not null,(curdate() < date(pc.valid_to)),true) " +
                            " group by pc.id "*/
            if (jsonObj.siteCategoryGroupStores == '1') {
                myCategoryQuery = myCategoryQuery +//" union " +
                    " select mc.main_group_category_id as mainGroupCategoryId,s.slug as slug,spc.store_id as storeId,pc.code as promoCode, pc.banner_image as bannerImage,pc.id as promoCodeId, s.logo_path as logoPath, '1' as isMyCategory, " +
                    " s.name as storeName, pc.description as offerDescription, sl.logo_path as storeFavIcon " +
                    " from promo_code as pc " +
                    " inner join store_promo_code as spc on spc.promo_code_id = pc.id " +
                    " inner join store as s on s.id = spc.store_id " +
                    " inner join seller as sl on sl.id = s.seller_id " +
                    " inner join store_main_category as smc on smc.store_id = s.id " +
                    " inner join main_category as mc on mc.id = smc.main_category_id " +
                    " where spc.store_id in (" + storeList + ")  " +
                    " and pc.is_active = true and  " +
                    " if(pc.valid_from is not null and pc.valid_to is  not null,(curdate() between date(pc.valid_from) and date(pc.valid_to)),true) " +
                    " and  " +
                    " if(pc.valid_from is not null and pc.valid_to is null,(curdate() >= date(pc.valid_from)),true) " +
                    " and  " +
                    " if(pc.valid_from is null and pc.valid_to is not null,(curdate() < date(pc.valid_to)),true) " +
                    " group by pc.id";
                myCategoryQueryParams = [...storeListParams];
            }
        }
        else {
            myCategoryQuery = " select mc.main_group_category_id as mainGroupCategoryId,s.slug as slug,spc.store_id as storeId,pc.code as promoCode, pc.banner_image as bannerImage,pc.id as promoCodeId, s.logo_path as logoPath, '0' as isMyCategory, " +
                " s.name as storeName, pc.description as offerDescription, sl.logo_path as storeFavIcon " +
                " from promo_code as pc " +
                " inner join store_promo_code as spc on spc.promo_code_id = pc.id " +
                " inner join store as s on s.id = spc.store_id " +
                " inner join seller as sl on sl.id = s.seller_id " +
                " inner join store_main_category as smc on smc.store_id = s.id " +
                " inner join main_category as mc on mc.id = smc.main_category_id " +
                " where spc.store_id in (" + storeList + ")  " +
                " and pc.is_active = true and  " +
                " if(pc.valid_from is not null and pc.valid_to is  not null,(curdate() between date(pc.valid_from) and date(pc.valid_to)),true) " +
                " and  " +
                " if(pc.valid_from is not null and pc.valid_to is null,(curdate() >= date(pc.valid_from)),true) " +
                " and  " +
                " if(pc.valid_from is null and pc.valid_to is not null,(curdate() < date(pc.valid_to)),true) " +
                " group by pc.id";
            myCategoryQueryParams = [...storeListParams];
        }
        //connection.query(myCategoryQuery, function (error, results, fields) { 
        queryExecution.queryExecution(client, jsonObj, event, myCategoryQuery, myCategoryQueryParams, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let results = response.result;
            if (results.length > 0) {
                for (let i = 0; i < results.length; i++) {
                    if (results[i].storeId != '' && existStore.indexOf(results[i].storeId) == -1) {
                        promocodeStoreList[i] = {
                            storeId: results[i].storeId,
                            bannerImage: (results[i].bannerImage == null || results[i].bannerImage == '') ? '' : results[i].bannerImage,
                            logoPath: (results[i].logoPath == null || results[i].logoPath == '') ? '' : results[i].logoPath,
                            isMyCategory: results[i].isMyCategory,
                            storeName: (results[i].storeName == null || results[i].storeName == '') ? '' : results[i].storeName,
                            storeFavIcon: (results[i].storeFavIcon == null || results[i].storeFavIcon == '') ? '' : results[i].storeFavIcon,
                            slug: (results[i].slug == null || results[i].slug == '') ? '' : results[i].slug,
                            mainGroupCategoryId: (results[i].mainGroupCategoryId == null || results[i].mainGroupCategoryId == '') ? '' : results[i].mainGroupCategoryId
                        }
                        existStore.push(results[i].storeId)
                    }
                    promocodeDetails[i] = {
                        storeId: results[i].storeId,
                        promoCode: results[i].promoCode,
                        bannerImage: (results[i].bannerImage == null || results[i].bannerImage == '') ? '' : results[i].bannerImage,
                        promoCodeId: results[i].promoCodeId,
                        logoPath: (results[i].logoPath == null || results[i].logoPath == '') ? '' : results[i].logoPath,
                        isMyCategory: results[i].isMyCategory,
                        storeName: (results[i].storeName == null || results[i].storeName == '') ? '' : results[i].storeName,
                        offerDescription: (results[i].offerDescription == null || results[i].offerDescription == '') ? '' : results[i].offerDescription,
                        storeFavIcon: (results[i].storeFavIcon == null || results[i].storeFavIcon == '') ? '' : results[i].storeFavIcon
                    }
                }
                const data = {
                    success: "1",
                    result:
                        [{
                            promoCodeImagePath: promoCodeImagePath,
                            myCategoryLogoPath: myCategoryLogoPath,
                            myCategoryFavIconPath: myCategoryFavIconPath,
                            storeLogoPath: storeLogoPath,
                            storeFavIconPath: storeFavIconPath,
                            promocodeDetails: promocodeDetails,
                            storeList: promocodeStoreList
                        }],
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(data);
            }
            else {
                const data = {
                    success: "1",
                    result:
                        [{
                            promoCodeImagePath: promoCodeImagePath,
                            myCategoryLogoPath: myCategoryLogoPath,
                            myCategoryFavIconPath: myCategoryFavIconPath,
                            storeLogoPath: storeLogoPath,
                            storeFavIconPath: storeFavIconPath,
                            promocodeDetails: promocodeDetails,
                            storeList: promocodeStoreList
                        }],
                    errorMessage: "",
                    successMessage: "Promo Code List Empty"
                };
                callback(data);
            }

        });
    });
}
module.exports = methods;