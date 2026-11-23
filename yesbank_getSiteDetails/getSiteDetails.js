const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    let subquery = "";
    let subQueryParams = [];
    let subSite = "";
    let fields = "";
    if (event.siteUrl) {
        subSite = " inner join site_sub_domain as ssd on ssd.site_id = s.id " +
            " left join store_main_category as smc on smc.store_id = ssd.store_id " +
            " left join main_category as mc on mc.id = smc.main_category_id "
        subquery = "  ssd.site_url = ?";
        subQueryParams.push(event.siteUrl);
        fields = " ,if(ssd.store_id is not null,'1','0') as subDomainFlag, ssd.store_id as storeId,mc.main_group_category_id as mainGroupCategoryId "
    } else if (event.sellerId) {
        subquery = "  sl.id = ?";
        subQueryParams.push(event.sellerId);
        fields = " ,'0' as subDomainFlag, '' as storeId,'' as mainGroupCategoryId "
    } else if (event.categoryId) {
        subquery = "  s.site_category_group = ?";
        subQueryParams.push(event.categoryId);
        fields = " ,'0' as subDomainFlag, '' as storeId,'' as mainGroupCategoryId "
    }

    let queryString = "select if((s.site_category_group = null or s.site_category_group = 'null'),0,s.site_category_group) as siteCategoryGroupId,s.id as siteId, s.seller_id as sellerId, s.sub_domain_url as subDomainUrl, s.authentication_api_url as authenticationApiUrl, " +
        " if(s.has_authentication_api is true,'1','0') as hasAuthenticationApi, s.group_id as groupId, s.google_analytics_script as googleAnalyticsScript, " +
        "s.site_category_group as siteCategoryGroup, s.promotional_sms_count as promotionalSmsCount, s.sms_sender as smsSender, " +
        "s.transactional_sms_count as transactionalSmsCount, s.from_date as fromDate, s.to_date as toDate, " +
        "s.site_url as siteUrl, sl.alternate_email_id as alternateEmailId, sl.alternate_mobile_number as alternateMobileNumber, " +
        "sl.city_id as cityId, c.name as cityName, sl.description as description, sl.first_name as firstName, sl.last_name as lastName, " +
        "sl.logo_path as logoPath, sl.retail_group_name as retailGroupName, sl.telephone_number as telephoneNumber, " +
        "if(sl.is_embed_code_enabled is true,'1','0')  as isEmbedCodeEnabled, s.theme_id as themeId, sl.app_store_url as appStoreUrl, " +
        "sl.google_play_url as googlePlayUrl, if(sl.has_buy_option is true,'1','0')  as hasBuyOption, if(sl.has_contact_us_form is true,'1','0') as hasContactUsForm, " +
        " if(sl.has_home_page is true,'1','0') as hasHomePage, if(sl.has_location is true,'1','0') as hasLocation,if(sl.is_app_android_exist is true,'1','0')  as isAppAndroidExist, " +
        " if(sl.is_app_ios_exist is true,'1','0') as isAppIosExist, sl.home_page_html as homePageHtml, if(sl.is_my_site is true,'1','0') as isMySite, " +
        " if(sl.is_singlelevel_menu is true,'1','0') as isSinglelevelMenu, if(sl.is_trial_room_enabled is true,'1','0') as isTrialRoomEnabled,if( sl.region_id is true,'1','0') as regionId, " +
        "sl.retail_group_name as retailGroupName, sl.has_blog as hasBlog, if(sl.is_service_provider is true,'1','0') as isServiceProvider, " +
        " if(sl.has_home_theme is true,'1','0') as hasHomeTheme, sl.aadhar_no as aadharNo,if(sl.has_theme_details_set is true,'1','0')  as hasThemeDetailsSet, " +
        "sfl.id as id, if(sfl.is_media is true,'1','0') as media, sfl.name as name, " +
        "sfl.url as url, sfl.content as content, sfl.share_url as shareUrl, if(sl.has_blog is true,'1','0') as hasBlog,b.id as blogGroupId,b.name as blogName, " +
        " IF(sc.`fb_client_id`,sc.`fb_client_id`,(SELECT `config_value` FROM `configuration` WHERE  `config_key` = 'fbAppId')) AS fbAppId, " +
        " IF(sc.`google_client_id`,sc.`google_client_id`,(SELECT `config_value` FROM `configuration` WHERE  `config_key` = 'googleClientId')) AS googleClientId, " +
        " (SELECT `config_value` FROM `configuration` WHERE  `config_key` = 's3bucketAccessKey') AS s3bucketAccessKey, " +
        " (SELECT `config_value` FROM `configuration` WHERE  `config_key` = 's3bucketSecretKey') AS s3bucketSecretKey,if(scg.display_city is true,'1','0') as displayCity, " +
        " scg.`logo_path` as logoPathLokal " + fields +
        "from site as s " + subSite +
        "left join seller as sl on s.seller_id = sl.id and sl.is_active IS TRUE and sl.is_approved IS TRUE " +
        "left join city as c on sl.city_id = c.id " +
        "left join seller_footer_links as sfl on sfl.seller_id = sl.id " +
        "left join blog_group as b on b.seller_id = sl.id " +
        "  LEFT JOIN `seller_configuration` AS sc ON sc.`seller_id` = sl.id " +
        " left join site_category_group as scg on scg.id = s.site_category_group " +
        "where  " + subquery + ";"
    //console.log("queryString ",queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString, subQueryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        let sitedata = [];
        let sellerdata = [];
        let sellerFooterData = [];
        let bannerData = [];
        let storeData = [];

        sitedata[0] = {
            storeId: results[0].storeId ? results[0].storeId : "",
            subDomainFlag: results[0].subDomainFlag ? results[0].subDomainFlag : "0",
            mainGroupCategoryId: results[0].mainGroupCategoryId ? results[0].mainGroupCategoryId : "",
            siteId: results[0].siteId,
            siteCategoryGroupId: results[0].siteCategoryGroupId,
            displayCity: results[0].displayCity,
            sellerId: results[0].sellerId,
            subDomainUrl: results[0].subDomainUrl,
            authenticationApiUrl: results[0].authenticationApiUrl,
            hasAuthenticationApi: results[0].hasAuthenticationApi,
            groupId: results[0].groupId,
            googleAnalyticsScript: (results[0].googleAnalyticsScript == null) ? '' : results[0].googleAnalyticsScript,
            siteCategoryGroup: results[0].siteCategoryGroup,
            promotionalSmsCount: (results[0].promotionalSmsCount == null) ? '' : results[0].promotionalSmsCount,
            smsSender: (results[0].smsSender == null) ? '' : results[0].smsSender,
            transactionalSmsCount: results[0].transactionalSmsCount,
            fromDate: (results[0].fromDate == null) ? '' : results[0].fromDate,
            toDate: (results[0].toDate == null) ? '' : results[0].toDate,
            siteUrl: results[0].siteUrl,
            fbAppId: results[0].fbAppId,
            googleClientId: results[0].googleClientId,
            s3bucketAccessKey: "",//results[0].s3bucketAccessKey,
            s3bucketSecretKey: "", //results[0].s3bucketSecretKey,
            themeId: (results[0].themeId == null) ? '' : results[0].themeId,
            homeBannerPath: (results[0].siteCategoryGroupId != 0) ? 'https://d37ky63zmmmzfj.cloudfront.net/production/siteCategoryLogoPath/' + results[0].siteCategoryGroupId + '-homeBanner.jpg' : 'https://d37ky63zmmmzfj.cloudfront.net/production/storeimages/thumb/' + results[0].sellerId + '-homeBanner.jpg',
            logoPath: (results[0].logoPath == null) ? 'https://d37ky63zmmmzfj.cloudfront.net/production/siteCategoryLogoPath/thumb/' + results[0].logoPathLokal : 'https://d37ky63zmmmzfj.cloudfront.net/production/storeimages/thumb/' + results[0].logoPath,
            logoPathSML: (results[0].logoPath == null) ? 'https://d37ky63zmmmzfj.cloudfront.net/production/siteCategoryLogoPath/thumb/SML_' + results[0].logoPathLokal : 'https://d37ky63zmmmzfj.cloudfront.net/production/storeimages/thumb/SML_' + results[0].logoPath
        }
        // //console.log("b....")
        sellerdata[0] = {
            alternateEmailId: (results[0].alternateEmailId == null) ? '' : results[0].alternateEmailId,
            alternateMobileNumber: (results[0].alternateMobileNumber == null) ? '' : results[0].alternateMobileNumber,
            cityId: (results[0].cityId == null) ? '' : results[0].cityId,
            cityName: (results[0].cityName == null) ? '' : results[0].cityName,
            description: (results[0].description == null) ? '' : results[0].description,
            firstName: (results[0].firstName == null) ? '' : results[0].firstName,
            lastName: (results[0].lastName == null) ? '' : results[0].lastName,
            logoPath: (results[0].logoPath == null) ? '' : 'https://s3.amazonaws.com/storedigfiles/production/storeimages/thumb/' + results[0].logoPath,
            homeBannerPath: 'https://s3.amazonaws.com/storedigfiles/production/storeimages/thumb/' + results[0].sellerId + '-homeBanner.jpg',
            retailGroupName: (results[0].retailGroupName == null) ? '' : results[0].retailGroupName,
            telephoneNumber: (results[0].telephoneNumber == null) ? '' : results[0].telephoneNumber,
            isEmbedCodeEnabled: (results[0].isEmbedCodeEnabled == null) ? '' : results[0].isEmbedCodeEnabled,
            //theme: (results[0].themeId == null) ? '' : results[0].themeId,
            appStoreUrl: (results[0].appStoreUrl == null) ? '' : results[0].appStoreUrl,
            googlePlayUrl: (results[0].googlePlayUrl == null) ? '' : results[0].googlePlayUrl,
            hasBuyOption: (results[0].hasBuyOption == null) ? '' : results[0].hasBuyOption,
            hasContactUsForm: (results[0].hasContactUsForm == null) ? '' : results[0].hasContactUsForm,
            hasHomePage: (results[0].hasHomePage == null) ? '' : results[0].hasHomePage,
            hasLocation: (results[0].hasLocation == null) ? '' : results[0].hasLocation,
            isAppAndroidExist: (results[0].isAppAndroidExist == null) ? '' : results[0].isAppAndroidExist,
            isAppIosExist: (results[0].isAppIosExist == null) ? '' : results[0].isAppIosExist,
            homePageHtml: (results[0].homePageHtml == null) ? '' : results[0].homePageHtml,
            isMySite: (results[0].isMySite == null) ? '' : results[0].isMySite,
            isSinglelevelMenu: (results[0].isSinglelevelMenu == null) ? '' : results[0].isSinglelevelMenu,
            isTrialRoomEnabled: (results[0].isTrialRoomEnabled == null) ? '' : results[0].isTrialRoomEnabled,
            regionId: (results[0].regionId == null) ? '' : results[0].regionId,
            retailGroupName: (results[0].retailGroupName == null) ? '' : results[0].retailGroupName,
            hasBlog: (results[0].hasBlog == null) ? '' : results[0].hasBlog,
            blogGroupId: (results[0].blogGroupId == null) ? '' : results[0].blogGroupId,
            blogName: (results[0].blogName == null) ? '' : results[0].blogName,
            isServiceProvider: (results[0].isServiceProvider == null) ? '' : results[0].isServiceProvider,
            hasHomeTheme: (results[0].hasHomeTheme == null) ? '' : results[0].hasHomeTheme,
            aadharNo: (results[0].aadharNo == null) ? '' : results[0].aadharNo,
            hasThemeDetailsSet: (results[0].hasThemeDetailsSet == null) ? '' : results[0].hasThemeDetailsSet
        }
        //console.log("c....")
        for (let i = 0; i < results.length; i++) {
            sellerFooterData[i] = {
                id: results[i].id,
                media: results[i].media,
                name: results[i].name,
                sellerId: results[i].sellerId,
                url: results[i].url,
                content: results[i].content,
                shareUrl: (results[i].shareUrl == null) ? '' : results[i].shareUrl
            }
        }
        //console.log("1....")
        let joinQuery = '';
        let whereQuery = '';
        let whereQueryParams = [];
        if (event.locationId != 'null' && event.locationId != '' && event.locationId != null) {
            joinQuery = " inner join location_group_type as lgt on st.id = lgt.store_id "
            whereQuery = " and lgt.location_id = ?";
            whereQueryParams.push(event.locationId);
        }
        if (results[0].sellerId != 0) {
            let sellerId = results[0].sellerId;
            let storeQuery = "SELECT if(st.opening_time_morning,concat('Today ',st.opening_time_morning,' - ',if(st.closing_time_evening,st.closing_time_evening,st.closing_time_morning)),'') as timming,c.id as cityId,st.id AS storeId,st.name AS storeName,s.id AS sellerId,mc.main_group_category_id as mainCategoryId, " +
                "c.name as cityName, st.alternate_number2 as alternateNumber2,st.alternate_number1 as alternateNumber1,st.alternate_email as alternateEmail, " +
                "st.whatsapp_description as whatsappDescription, st.locality as locality,st.footer_description as footerDescription, " +
                "sc.mobile_number as mobileNumber,st.telephone_number as telephoneNumber, if(st.has_reservation_option is true,'1','0') as hasReservationOption, " +
                " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/'," +
                " (SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
                "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
                "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/', " +
                " if(st.logo_path is null,'default.jpg',st.logo_path)) AS storeLogoPath,if(st.has_gallery is true,'1','0') as hasGallery, " +
                " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/'," +
                " (SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
                "(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
                "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/SML_', " +
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
                " st.seo_title as seo_title, st.seo_description as seo_description ,st.seo_keywords as seo_keywords,st.slug as slug " +
                "FROM store AS st " +
                "INNER JOIN seller AS s ON s.id = st.seller_id " +
                " inner join store_main_category as smc on smc.store_id=st.id " +
                " inner join main_category as mc on mc.id=smc.main_category_id " +
                "INNER JOIN city AS c ON st.city_id = c.id " + joinQuery +
                "LEFT JOIN sec_user as sc on st.sec_user_id = sc.id " +
                // " left join theme as th on th.id = smc.theme_id "+
                "WHERE s.is_active =TRUE AND s.is_approved = TRUE AND s.is_embed_code_enabled = TRUE " + whereQuery +
                " AND st.is_embed_code_enabled = TRUE AND s.id= ? ";
            console.log("storeQuery ", storeQuery)
            queryExecution.queryExecution(client, jsonObj, event,  storeQuery, [...whereQueryParams, sellerId], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let results3 = response.result
                storeData[0] = {
                    storeId: results3[0].storeId,
                    storeName: results3[0].storeName,
                    sellerId: results3[0].sellerId,
                    locality: results3[0].locality,
                    cityName: results3[0].cityName,
                    alternateNumber2: results3[0].alternateNumber2,
                    alternateNumber1: results3[0].alternateNumber1,
                    alternateEmail: results3[0].alternateEmail,
                    mainCategoryId: results3[0].mainCategoryId,
                    whatsappDescription: results3[0].whatsappDescription,
                    footerDescription: results3[0].footerDescription,
                    mobileNumber: results3[0].mobileNumber,
                    telephoneNumber: results3[0].telephoneNumber,
                    storeLogoPath: results3[0].storeLogoPath,
                    storeLogoPathSmall: results3[0].storeLogoPathSmall,
                    hasGallery: results3[0].hasGallery,
                    imagePath: results3[0].imagePath,
                    restaurantImagePath: results3[0].restaurantImagePath,
                    cmImagePath: results3[0].cmImagePath,
                    hasReservationOption: results3[0].hasReservationOption,
                    solarPath: results3[0].solarPath,
                    seoTitle: results3[0].seo_title,
                    seoDescription: results3[0].seo_description,
                    seoKeywords: results3[0].seo_keywords,
                    slug: results3[0].slug,
                    cityId: results3[0].cityId,
                    timming: results3[0].timming
                }
                if (results3[0].storeId) {
                    let queryString2 = "Select banner_type_id,category_id,description,image_path,if(is_active is true,'1','0'),if(is_approved is true,'1','0')" +
                        " name,rank,store_id,to_date,url,main_category_id,sub_heading,theme_id,seller_id  from banner " +
                        "where theme_id IS NULL and store_id = ? and is_active = true " +
                        "and is_approved = true and banner_type_id = 9 and rank > 0 " +
                        "AND (CURDATE() BETWEEN DATE(from_date) AND DATE(to_date)) " +
                        "order by rank ASC , RAND(); " +
                        "SELECT " +
                        "CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
                        "(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/'," +
                        "(SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder')  " +
                        ") AS imageAddressPath; ";

                    queryExecution.queryExecution(client, jsonObj, event, queryString2, [results3[0].storeId], function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        let results2 = response.result
                        for (let i = 0; i < results2[0].length; i++) {
                            bannerData[i] = {
                                id: results2[0][i].id,
                                bannerTypeId: (results2[0][i].banner_type_id == null) ? '' : results2[0][i].banner_type_id,
                                categoryId: (results2[0][i].category_id == null) ? '' : results2[0][i].category_id,
                                description: (results2[0][i].description == null) ? '' : results2[0][i].description,
                                imagePath: (results2[0][i].image_path == null) ? '' : results2[1][0].imageAddressPath + "/" + results2[0][i].image_path,
                                isActive: (results2[0][i].is_active == null) ? '' : results2[0][i].is_active,
                                isApproved: (results2[0][i].is_approved == null) ? '' : results2[0][i].is_approved,
                                name: (results2[0][i].name == null) ? '' : results2[0][i].name,
                                rank: (results2[0][i].rank == null) ? '' : results2[0][i].rank,
                                storeId: (results2[0][i].store_id == null) ? '' : results2[0][i].store_id,
                                toDate: (results2[0][i].to_date == null) ? '' : results2[0][i].to_date,
                                url: (results2[0][i].url == null) ? '' : results2[0][i].url,
                                mainCategory_id: (results2[0][i].main_category_id == null) ? '' : results2[0][i].main_category_id,
                                subHeading: (results2[0][i].sub_heading == null) ? '' : results2[0][i].sub_heading,
                                themeId: (results2[0][i].theme_id == null) ? '' : results2[0][i].theme_id,
                                sellerId: (results2[0][i].seller_id == null) ? '' : results2[0][i].seller_id
                            }
                        }
                        const responseData = {
                            success: "1",
                            successMessage: "success",
                            result: {
                                "sitedata": sitedata,
                                "sellerdata": sellerdata,
                                "sellerFooterData": sellerFooterData,
                                "bannerData": bannerData,
                                "storeData": storeData
                            },
                            errorMessage: "",
                        }
                        callback(responseData);
                    });
                } else {
                    const responseData = {
                        success: "1",
                        successMessage: "success",
                        result: {
                            "sitedata": sitedata,
                            "sellerdata": sellerdata,
                            "sellerFooterData": sellerFooterData,
                            "bannerData": bannerData,
                            "storeData": storeData
                        },
                        errorMessage: "",
                    }
                    callback(responseData);
                }
            });
        } else {
            const responseData = {
                success: "1",
                successMessage: "success",
                result: {
                    "sitedata": sitedata,
                    "sellerdata": sellerdata,
                    "sellerFooterData": sellerFooterData,
                    "bannerData": bannerData,
                    "storeData": storeData
                },
                errorMessage: "",
            }
            callback(responseData);
        }
    });

}
module.exports = methods;