const methods = {};
let queryExecution = require('../queryExecution');
methods.homePageDetails = function(client,jsonObj,event,callback) {
 
    let mayCategoryId = jsonObj.myCategoryId
    let siteData = []
    let bannerData = []
    let categoryData = []

    let siteQuery = " SELECT s.id AS siteCategoryId,si.id as siteId, s.`group_name` as groupCategoryName,s.`seo_title` as seoTitle,s.`seo_description` as seoDescription,"+
                    "s.`logo_path` as logoPath,s.`bannerbutton_text` as bannerButtonText,s.`fb_client_id` as FBClientId,s.`google_client_id` as googleClientId,"+
                    "s.`show_whatsapp_link` as watzappLink,s.`alternate_contact_no` as altContactNo ,s.`contact_no` as contactNo,s.`whats_app_description` as watzappDescription,"+
                    "s.`show_contact_details` as showContactDetails,s.`contact_email` as contactEmail, " +
                    " (SELECT GROUP_CONCAT(sc.`main_category_id` SEPARATOR ',') FROM `site_category_group` AS s1 " +
                    " INNER JOIN `site_category_group_category` AS sc ON sc.`site_category_group_id` = s1.id where s1.id = s.id GROUP BY s1.id) AS categoryList, " +
                    " (SELECT GROUP_CONCAT(ss.`store_id` SEPARATOR ',') FROM `site_category_group` AS s1 " +
                    " INNER JOIN `site_category_group_stores` AS ss ON ss.`site_category_group_id` = s1.id where s1.id = ? GROUP BY s.id) AS storeList, " +
                    " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 's3Address'),'/',  " +
                    " (SELECT config_value  FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
                    " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/' " +
                    " ) AS image_path,'groupHomeBannerNoImage.jpg' as bannerNoImage,s.has_home_banner as hasHomeBanner, " +
                    " CONCAT((SELECT config_value  FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
                    " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
                    " (SELECT config_value  FROM configuration WHERE config_key = 'mainCategoryImagePath'),'/' " +
                    " ) AS mainCategoryImagePath,s.display_city as displayCity,s.`has_buy_option` as hasBuyOption,s.`has_contact_us_form` as hasContactUsForm " +
                    " FROM  `site_category_group` AS s " +
                    " inner join site as si on s.id = si.site_category_group"+
                    " WHERE s.id = ?"
    queryExecution.queryExecution(client, jsonObj, event, siteQuery,[mayCategoryId,mayCategoryId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let siteResults = response.result
        if(siteResults.length > 0){

            let bannerQuery = " SELECT b.id AS bannerID, b.url AS url, b.image_path AS image_path, " +
                              " b.name as bannerName,b.description as description " +
                              " FROM `site_category_group_banner` AS b " +
                              " WHERE b.is_active=TRUE AND b.is_approved=TRUE AND b.site_category_group_id=? AND b.banner_type_id=23 AND b.rank>0 AND (CURDATE() BETWEEN DATE(b.from_date) AND DATE(b.to_date))"
            
            queryExecution.queryExecution(client, jsonObj, event, bannerQuery,[mayCategoryId], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let bannerResults = response.result
                let myCategoryStoreQuery = " and st.id in ("+siteResults[0].storeList.map(() => '?').join(', ')+")"
                let categoryQuery = " SELECT * FROM ((SELECT DISTINCT mc.name AS NAME,mc.id AS id,mc.`image_path` AS `image_path`,mc.is_rental AS rental,mc.sort_order AS sortOrder "+
                                    " FROM store AS st  LEFT JOIN location_group_type AS sl ON sl.store_id = st.id " +
                                    " INNER JOIN city AS c ON c.id = st.city_id  INNER JOIN location AS l ON l.id = sl.location_id " +
                                    " INNER JOIN seller AS s ON s.id = st.seller_id  INNER JOIN store_main_category AS smc ON smc.store_id = st.id and smc.main_category_id in ("+siteResults[0].categoryList.map(() => '?').join(', ')+") " +
                                    " INNER JOIN `main_category` AS mc  ON mc.id = smc.main_category_id  WHERE l.is_active = TRUE AND l.is_approved = TRUE and mc.is_active = true  " +myCategoryStoreQuery+
                                    " AND sl.is_active = TRUE AND st.is_active = TRUE AND st.is_approved = TRUE  AND s.is_active = TRUE AND s.is_approved = TRUE " +
                                    " AND s.has_location = TRUE AND st.is_non_storedig_store = FALSE  AND  ((  (EXISTS(SELECT 1 FROM store_categories sc " +
                                    " WHERE sc.store_id = st.id AND sc.is_active = TRUE))  OR  (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = st.id AND rsi.is_active = TRUE)) " +
                                    " OR  (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = st.id AND ci.is_active = TRUE)) " +
                                    " OR  (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = st.id AND psc.is_active = TRUE)) " +
                                    " OR  (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = st.id AND fi.is_active = TRUE)) " +
                                    " OR  (EXISTS(SELECT 1 FROM `ed_store_videos` AS edsv WHERE edsv.store_id = st.id AND edsv.is_active = TRUE)) ) "+
                                    " OR  (EXISTS(SELECT 1 FROM `rent_item` AS ri WHERE ri.store_id = st.id AND ri.is_active = TRUE)  ))  ) " +
                                    " UNION " +
                                    " ( SELECT DISTINCT mc.name AS NAME,mc.id AS id,mc.`image_path` AS `image_path`,mc.is_rental AS rental,mc.sort_order AS sortOrder " +
                                    " FROM store AS st  INNER JOIN city AS c ON c.id = st.city_id  INNER JOIN seller AS s ON s.id = st.seller_id  " +
                                    " INNER JOIN store_main_category AS smc ON smc.store_id = st.id and smc.main_category_id in ("+siteResults[0].categoryList.map(() => '?').join(', ')+") " +
                                    " INNER JOIN `main_category` AS mc  ON mc.id = smc.main_category_id " +
                                    " WHERE  st.is_active = TRUE AND st.is_approved = TRUE AND s.is_active = TRUE AND s.is_approved = TRUE and mc.is_active = true" +myCategoryStoreQuery+
                                    " AND s.has_location = FALSE AND st.is_non_storedig_store = FALSE " +
                                    " AND  ((  (EXISTS(SELECT 1 FROM store_categories sc WHERE sc.store_id = st.id AND sc.is_active = TRUE)) " +
                                    " OR  (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = st.id AND rsi.is_active = TRUE)) " +
                                    " OR  (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = st.id AND ci.is_active = TRUE)) " +
                                    " OR  (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = st.id AND psc.is_active = TRUE)) " +
                                    " OR  (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = st.id AND fi.is_active = TRUE)) "+
                                    " OR  (EXISTS(SELECT 1 FROM `ed_store_videos` AS edsv WHERE edsv.store_id = st.id AND edsv.is_active = TRUE)) ) "+
                                    " OR  (EXISTS(SELECT 1 FROM `rent_item` AS ri WHERE ri.store_id = st.id AND ri.is_active = TRUE)  )) " +
                                    " ))AS category " +
                                    " GROUP BY id " +
                                    " ORDER BY sortOrder "
                                    
                //connection.query(categoryQuery, function (error, categoryResults, fields) {
                queryExecution.queryExecution(client, jsonObj, event, categoryQuery,[...siteResults[0].categoryList,...siteResults[0].storeList,...siteResults[0].categoryList,...siteResults[0].storeList], function (response) {
                    if (response.success == '0') {
                        callback(response);
                    }
                    let categoryResults = response.result

                   let footerLinkQuery = " Select sf.`name` as name,sf.`url` as url,sf.`content` as content,sf.`id` as footerLinkId,sf.is_media as isMedia " +
                                         " from `site_category_group_footer_links` as sf " +
                                         " where sf.`site_category_group_id` = ?"
                    
                    //connection.query(footerLinkQuery, function (error, footerLinkResults, fields) {  
                    queryExecution.queryExecution(client, jsonObj, event, footerLinkQuery,[mayCategoryId], function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        let footerLinkResults = response.result
                        
                        let hasLocationQuery = " select count(*) as totalCount " +
                                               " from store_main_category sm " +
                                               " inner join store as st on st.id = sm.store_id " +
                                               " inner join seller as s on s.id = st.seller_id " +
                                               " where sm.main_category_id in ("+siteResults[0].categoryList.map(() => '?').join(', ')+") AND s.has_location = TRUE "
                                               
                        //connection.query(hasLocationQuery, function (error, hasLocationResults, fields) {
                        queryExecution.queryExecution(client, jsonObj, event, hasLocationQuery,[siteResults[0].categoryList], function (response) {
                            if (response.success == '0') {
                                callback(response);
                            }
                            let hasLocationResults = response.result
                            let hasLocation = true
                            if(hasLocationResults[0].totalCount > 0){
                                hasLocation = true
                            }
                            else{
                                hasLocation = false
                            }
                            siteResults[0].hasLocation = hasLocation
                            if(!siteResults[0].bannerButtonText){
                                siteResults[0].bannerButtonText = 'START SHOPPING'
                            }
                            let resultData ={
                                "siteData": siteResults,
                                "bannerData":bannerResults,
                                "categoryData":categoryResults,
                                "footerData":footerLinkResults,
                            }
                            const data = {
                                success: "1",
                                result:resultData,
                                errorMessage: "",
                                successMessage: "Success"
                            };
                            callback(data);
                        });
                    });
                    
                });
            });
        }
        
        
        
        
    });
}
module.exports = methods;