const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    // console.log("client...........",client)
    console.log(event)
    let subquery = "";
    let subqueryParams = [];
    let subqueryWithStore = "";
    let subqueryWithStoreParams = [];
    let subSite = ""
    let fields = ""
    let sellerQry = "";
    let sellerQryParams = [];
    if (event.siteUrl) {
        subSite = " left join store_main_category as smc on smc.store_id = (IF(ssd.store_id IS NULL," +
            " IF(ssd.seller_id IS NULL,'',(SELECT id FROM store WHERE seller_id = ssd.seller_id  LIMIT 1)),ssd.store_id)) " +
            " left join main_category as mc on mc.id = smc.main_category_id " +
            " left join store as st on ssd.store_id = st.id  " +
            " left join seller as sl on ssd.seller_id = sl.id "
        subquery = "  trim(ssd.site_url) = ? ";
        subqueryParams.push(event.siteUrl.trim());
        subqueryWithStore = "  trim(ssd.site_url) = ? and (st.id is null or st.is_active = true ) ";
        subqueryWithStoreParams.push(event.siteUrl.trim());
        sellerQry = " and s.id = (select if(s.seller_id,s.seller_id,0) from site as s inner join site_sub_domain as ssd on ssd.site_id = s.id where trim(ssd.site_url) = ? )";
        sellerQryParams.push(event.siteUrl.trim());
        fields = " ,IF(ssd.seller_id IS NOT NULL,1,if(ssd.store_id IS NOT NULL, '1', '0')) as subDomainFlag, if(ssd.store_id is null,if ( ssd.seller_id is null,'',(select id from store where seller_id=ssd.seller_id order by ranking asc limit 1)),ssd.store_id) as storeId ,if(mc.main_group_category_id is null,'',mc.main_group_category_id) as mainGroupCategoryId,if(mc.id is null,'',mc.id) as mainCategoryId,if(ssd.store_id is null,(if(ssd.seller_id IS NULL,'',(SELECT su.mobile_number FROM store AS st INNER JOIN sec_user AS su ON su.id = st.sec_user_id WHERE st.seller_id = ssd.seller_id order by st.ranking asc LIMIT 1))),(SELECT su.mobile_number from store as st inner join sec_user as su on su.id = st.sec_user_id where st.id = ssd.store_id order by st.ranking asc limit 1)) as storeMobileNumber,if(ssd.store_id is null,(if(ssd.seller_id IS NULL,'',(SELECT su.email_id FROM store AS st INNER JOIN sec_user AS su ON su.id = st.sec_user_id WHERE st.seller_id = ssd.seller_id LIMIT 1))),(SELECT su.email_id from store as st inner join sec_user as su on su.id = st.sec_user_id where st.id = ssd.store_id limit 1)) as storeEmail "
    } else if (event.sellerId) {
        subquery = "  s.seller_id = ? ";
        subqueryParams.push(event.sellerId);
        subqueryWithStore = "  s.seller_id = ? ";
        subqueryWithStoreParams.push(event.sellerId);
        sellerQry = " and s.id = ? ";
        sellerQryParams.push(event.sellerId);
        fields = " ,'0' as subDomainFlag, '' as storeId,'' as mainGroupCategoryId,'' as mainCategoryId,'' as storeMobileNumber,'' as storeEmail "
    } else if (event.categoryId) {
        subquery = "  s.site_category_group = ? ";
        subqueryParams.push(event.categoryId);
        subqueryWithStore = "  s.site_category_group = ? ";
        subqueryWithStoreParams.push(event.categoryId);
        fields = " ,'0' as subDomainFlag, '' as storeId,'' as mainGroupCategoryId,'' as mainCategoryId,'' as storeMobileNumber,'' as storeEmail "
        sellerQry = " and s.id = (select if(s.seller_id,s.seller_id,0) from site as s  where s.site_category_group =? )";
        sellerQryParams.push(event.categoryId);
    }

    let joinQuery = ''
    let whereQuery = '';
    let whereQueryParams = [];
    if (event.locationId != 'null' && event.locationId != '' && event.locationId != null) {
        joinQuery = " inner join location_group_type as lgt on st.id = lgt.store_id "
        whereQuery = " and lgt.location_id = ? ";
        whereQueryParams.push(event.locationId);
    }

    let queryString = "select s.decimal_count as decimalCount,if(s.has_parcel = true,'1','0') as hasParcel, if(s.facebook_pixel_id is null,'',s.facebook_pixel_id) as fbPixelId, if(s.theme_custom_colour is null,'',s.theme_custom_colour) as themeCustomColor,if(t.name is null,'',t.name) as themeName,if(s.has_authentication_api is true,'1','0') as hasAuthentication,if(s.has_multiple_checkout is true,'1','0') as hasMultipleCheckout,if(s.authentication_api_url is null,'',s.authentication_api_url) as authenticationApi,if(s.google_analytics_id is null,'',s.google_analytics_id) as googleAnalyticsId,s.theme_id as themeId,if((s.site_category_group = null or s.site_category_group = 'null'),0,s.site_category_group) as siteCategoryGroupId,s.id as siteId, if(s.site_category_group>0 ,ssd.seller_id,s.seller_id) as sellerId, ssd.site_url as siteUrl,IF(ssd.seller_id IS NULL,'',ssd.seller_id) AS siteSubDomainSellerId,IF(ssd.seller_id IS NOT NULL, '1', '0') AS subDomainSellerFlag,if(s.has_global_delivery is true,true,false) as hasGlobalDelivery,s.isPincodeBased,if(s.non_default_sms_gateway_enabled is true,true,false) as nonDefaultSmsGatewayEnabled  " + fields +
        " from site as s " +
        " inner join site_sub_domain as ssd on ssd.site_id = s.id   " + subSite +
        " left join theme as t on t.id = s.theme_id " +
        " where  " + subqueryWithStore + " group by s.id;" +

        " select ct.country_code as countryCode,ct.id as countryId, s.seller_id as sellerId, sl.city_id as cityId, c.name as cityName, sl.description as description, " +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/'," +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/' ) as imagePaths, " +
        " sl.logo_path as logoPath, sl.retail_group_name as retailGroupName, sl.telephone_number as telephoneNumber,  " +
        " if(sl.has_home_page is true,'1','0') as hasHomePage, if(sl.has_contact_us_form is true,'1','0') as hasContactUsForm,  " +
        " if(sl.has_location is true,'1','0') as hasLocation, " +
        " sl.home_page_html as homePageHtml, sl.app_store_url as appStoreUrl, " +
        " sfl.id as id, if(sfl.is_media is true,'1','0') as media, sfl.name as name, sfl.url as url,  " +
        " sfl.content as content, sfl.share_url as shareUrl,sl.google_play_url as googlePlayUrl,if(sl.is_app_ios_exist is true,'1','0') as isAppIosExist,if(sl.is_app_android_exist is true,'1','0')  as isAppAndroidExist,s.has_global_delivery,s.isPincodeBased " +
        " from site as s   " +
        " inner join site_sub_domain as ssd on ssd.site_id = s.id   " +
        " inner join seller as sl on s.seller_id = sl.id and sl.is_active IS TRUE and sl.is_approved IS TRUE  " +
        " inner join city as c on sl.city_id = c.id  " +
        " inner join state as st on st.id = c.state_id  " +
        " inner join country as ct on ct.id = st.country_id  " +
        " left join seller_footer_links as sfl on sfl.seller_id = sl.id  " +
        //" inner join blog_group as b on b.seller_id = sl.id    "+
        " left join `seller_configuration` AS sc ON sc.`seller_id` = sl.id   " +
        " where  " + subquery + ";" +

        " select  scg.id,scg.alternate_contact_no,scg.bannerbutton_text,scg.button_colour,scg.contact_email,scg.contact_no,scg.fb_client_id,if(scg.has_global_search is true,'true','false') as hasGlobalSearch, " +
        " scg.google_client_id,scg.group_name,if(scg.has_buy_option is true,'1','0') as has_buy_option, " +
        " if(scg.has_category_in_home_page is true,'1','0') as has_category_in_home_page, " +
        " if(scg.has_category_selection is true,'1','0') as has_category_selection,if(scg.has_contact_us_form is true,'1','0') as has_contact_us_form, " +
        " if(scg.has_home_banner is true,'1','0') as has_home_banner,if(scg.has_registration_form is true,'1','0') as has_registration_form, " +
        " if(scg.show_contact_details is true,'1','0') as show_contact_details,if(scg.show_whatsapp_link is true,'1','0') as show_whatsapp_link, " +
        " if(scg.display_city is true,'1','0') as display_city,if(scgfl.is_media is true,'1','0') as is_media,scg.header_footer_colour,  " +
        " scg.home_page_html, scg.logo_path, scg.master_theme_id, scg.seo_description, scg.seo_keyword, scg.seo_title, scg.slug, scg.theme, " +
        " scg.whats_app_description ,scgfl.content, scgfl.name, scgfl.share_url, scgfl.url,scg.`logo_path` as logoPathLokal,if(scg.has_seller_registration is true ,'1','0') as hasSellerRegisteration ,if(scgfl.is_app is true ,true,false) as isApp,s.has_global_delivery,s.isPincodeBased" +
        " from site as s   " +
        " inner join site_sub_domain as ssd on ssd.site_id = s.id  " +
        " inner join site_category_group as scg on scg.id = s.site_category_group  " +
        " left JOIN site_category_group_footer_links scgfl on scgfl.site_category_group_id = scg.id " +
        " where " + subquery + " and scg.is_active is true group by scgfl.id; " +

        " SELECT ct.country_code as countryCode, " +
        " if(st.opening_time_morning,concat('Today ',st.opening_time_morning,' - ',if(st.closing_time_evening,st.closing_time_evening,st.closing_time_morning)),'') as timming,c.id as cityId,st.id AS storeId,st.name AS storeName,s.id AS sellerId,mc.main_group_category_id as mainGroupCategoryId,mc.id as mainCategoryId, " +
        " c.name as cityName, st.alternate_number2 as alternateNumber2,st.alternate_number1 as alternateNumber1,st.alternate_email as alternateEmail, " +
        " st.whatsapp_description as whatsappDescription, st.locality as locality,st.footer_description as footerDescription, " +
        " sc.mobile_number as mobileNumber,sc.email_id as emailId,st.telephone_number as telephoneNumber, if(st.has_reservation_option is true,'1','0') as hasReservationOption, " +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/'," +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/', " +
        " if(st.logo_path is null,'default.jpg',st.logo_path)) AS storeLogoPath,if(st.has_gallery is true,'1','0') as hasGallery, " +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/'," +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/SML_', " +
        " if(st.logo_path is null,'default.jpg',st.logo_path)) AS storeLogoPathSmall, " +
        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
        " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder')) as imagePath, " +
        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
        " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT  config_value FROM configuration WHERE config_key = 's3PathRestaurant')) as restaurantImagePath ," +
        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
        " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT  config_value FROM configuration WHERE config_key = 's3PathCommonItem'),'/clothing/') as cmImagePath, " +
        //  " CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/',(select config_value from configuration where config_key = 'bucketSubFolder'),'/', (select config_value from configuration where config_key = 's3PathCommonItem'),'/clothing/')as cmImagePath"+
        "  (SELECT config_value  FROM configuration WHERE config_key = 'solarPath') as solarPath,  " +
        " st.seo_title as seo_title, st.seo_description as seo_description ,st.seo_keywords as seo_keywords,st.slug as slug,st.address1,st.address2,st.zip_code " +
        " FROM store AS st " +
        " INNER JOIN seller AS s ON s.id = st.seller_id " + sellerQry +
        " inner join store_main_category as smc on smc.store_id=st.id " +
        " inner join main_category as mc on mc.id=smc.main_category_id " +
        " INNER JOIN city AS c ON st.city_id = c.id " + joinQuery +
        " inner join state as ste on ste.id = c.state_id  " +
        " inner join country as ct on ct.id = ste.country_id  " +
        " LEFT JOIN sec_user as sc on st.sec_user_id = sc.id " +
        " left join theme as th on th.id = smc.theme_id " +
        " WHERE s.is_active =TRUE AND s.is_approved = TRUE AND s.is_embed_code_enabled = TRUE " + whereQuery +
        " AND st.is_embed_code_enabled = TRUE; " +

        " select seo.* " +
        " from site as s " +
        " inner join site_sub_domain as ssd on ssd.site_id = s.id   " + subSite +
        " inner join site_seo as seo on seo.site_id = s.id " +
        "where  " + subquery + " group by s.id;"

    let queryStringParams = [...subqueryWithStoreParams, ...subqueryParams, ...subqueryParams, ...sellerQryParams, ...whereQueryParams, ...subqueryParams];
    console.log("queryString...", queryString)
    console.log("queryStringParams....", queryStringParams)
    // console.log('GET SITE DETAILS queryString...........',queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryStringParams, function (response) {
         console.log(".................",response.result)
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        console.log('results[0].length.....', results[0])
        if (results[0].length < 1) {
            const responseData = {
                success: "0",
                successMessage: "",
                errorMessage: "Site not found.",
            }
            callback(responseData);
        }
        let sitedata = [];
        let sellerdata = [];
        let sellerFooterData = [];
        let siteCategoryData = [];
        let siteFooterData = [];

        if (results[1].length > 0) {
             console.log("..........result[1]...",results[1])
            for (let i = 0; i < results[1].length; i++) {
                sellerFooterData[i] = {
                    id: results[1][i].id,
                    media: results[1][i].media,
                    name: results[1][i].name,
                    sellerId: results[1][i].sellerId,
                    url: results[1][i].url,
                    content: results[1][i].content,
                    shareUrl: (results[1][i].shareUrl == null) ? '' : results[1][i].shareUrl
                }
            }
            sellerdata[0] = {
                "countryCode": results[1][0].countryCode,
                "countryId" :  results[1][0].countryId,
                "siteUrl": results[1][0].siteUrl,
                "favIcon": results[1][0].imagePaths + '/SML_' + results[1][0].logoPath,
                "sellerId": results[1][0].sellerId,
                "cityId": (results[1][0].cityId == null) ? '' : results[1][0].cityId,
                "cityName": (results[1][0].cityName == null) ? '' : results[1][0].cityName,
                "description": (results[1][0].description == null) ? '' : results[1][0].description,
                "logoPath": (results[1][0].logoPath == null) ? '' : results[1][0].imagePaths + results[1][0].logoPath,
                "homeBannerPath": results[1][0].imagePaths + "/0-homeBanner.jpg",
                "retailGroupName": (results[1][0].retailGroupName == null) ? '' : results[1][0].retailGroupName,
                "telephoneNumber": (results[1][0].telephoneNumber == null) ? '' : results[1][0].telephoneNumber,
                "hasHomePage": results[1][0].hasHomePage,
                "hasLocation": results[1][0].hasLocation,
                "homePageHtml": (results[1][0].homePageHtml == null) ? '' : results[1][0].homePageHtml,
                "appStoreUrl": (results[1][0].appStoreUrl == null) ? '' : results[1][0].appStoreUrl,
                "googlePlayUrl": (results[1][0].googlePlayUrl == null) ? '' : results[1][0].googlePlayUrl,
                "isAppAndroidExist": (results[1][0].isAppAndroidExist == null) ? '' : results[1][0].isAppAndroidExist,
                "isAppIosExist": (results[1][0].isAppIosExist == null) ? '' : results[1][0].isAppIosExist,
                "hasContactUsForm": (results[1][0].hasContactUsForm == null) ? '' : results[1][0].hasContactUsForm,
                "sellerFooterData": sellerFooterData,
                "storeData": results[3]
            }
            let colorList = results[0][0].themeCustomColor ? results[0][0].themeCustomColor.split('\\|') : []
            //    console.log(".....1....colorList..", colorList)
            //let colorArr
            sitedata = results[0]
            sitedata[0].homeBannerPath = results[1][0].imagePaths + + results[0].sellerId + '-homeBanner.jpg',
                sitedata[0].logoPath = results[1][0].imagePaths + results[1][0].logoPath
            sitedata[0].logoPathSML = results[1][0].imagePaths + 'SML_' + results[1][0].logoPath
            sitedata[0].sellerData = sellerdata
            sitedata[0].siteCategoryData = siteCategoryData
            sitedata[0].seoDetails = results[4]
            sitedata[0].themeCustomColor = colorList
            console.log(".....1....sitedata..", sitedata[0].sellerData)
            const resultData = {
                success: "1",
                successMessage: "Success",
                results: {
                    siteData: sitedata
                },
                errorMessage: ""
            }


            // console.log("sellerdata.....",sellerdata[0].storeData)
            callback(resultData)
        }
        else if (results[2].length > 0) {
            //  console.log("..........result[2]...",results[2])
            for (let i = 0; i < results[2].length; i++) {
                siteFooterData[i] = {
                    id: results[2][i].id,
                    media: results[2][i].media,
                    name: results[2][i].name,
                    sellerId: results[2][i].sellerId,
                    url: results[2][i].url,
                    content: results[2][i].content,
                    shareUrl: (results[2][i].shareUrl == null) ? '' : results[2][i].shareUrl
                }
            }

            siteCategoryData[0] = results[2][0]
            siteCategoryData[0].logo_path = (results[2][0].logo_path == null) ? '' : 'https://s3.amazonaws.com/storedigfiles/production/storeimages/thumb/' + results[2][0].logo_path
            siteCategoryData[0].siteFooterData = siteFooterData
            sitedata = results[0]
            let colorList = results[0][0].themeCustomColor ? results[0][0].themeCustomColor.split('|') : []
            //  console.log(".....2...colorList...", colorList)
            sitedata[0].themeCustomColor = colorList
            sitedata[0].homeBannerPath = 'https://d37ky63zmmmzfj.cloudfront.net/production/siteCategoryLogoPath/' + results[2][0].id + '-homeBanner.jpg'
            sitedata[0].logoPath = 'https://d37ky63zmmmzfj.cloudfront.net/production/siteCategoryLogoPath/thumb/' + results[2][0].logoPathLokal
            sitedata[0].logoPathSML = 'https://d37ky63zmmmzfj.cloudfront.net/production/siteCategoryLogoPath/thumb/SML_' + results[2][0].logoPathLokal
            sitedata[0].sellerData = sellerdata
            sitedata[0].siteCategoryData = siteCategoryData
            sitedata[0].seoDetails = results[4]
            // console.log("sitedata..2222..", sitedata)
            const resultData = {
                success: "1",
                successMessage: "Success2",
                results: {
                    siteData: sitedata
                },
                errorMessage: ""
            }

            //console.log("resultData.1111...",resultData)
            callback(resultData)
        }
        else {
            sitedata = results[0]
            sitedata[0].seoDetails = results[4]
            const resultData = {
                success: "1",
                successMessage: "Success",
                results: {
                    siteData: sitedata
                },
                errorMessage: ""
            }

            // console.log("resultData..2222..",resultData)
            callback(resultData)
        }
    });
}
module.exports = methods;