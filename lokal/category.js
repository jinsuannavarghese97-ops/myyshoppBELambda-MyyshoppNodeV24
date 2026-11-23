let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.category = function(client, jsonObj, event, callback) {
    let locationQuery = '';
    let params = []
    let categoryQry = ""
    if (jsonObj.myCategoryId) {
        categoryQry = " and smc.main_category_id in ( " +
            " SELECT sc.`main_category_id` " +
            " FROM `site_category_group` AS s " +
            " INNER JOIN `site_category_group_category` AS sc ON sc.`site_category_group_id` = s.id  " +
            " where s.id = ? " +
            " ) "
            params.push(jsonObj.myCategoryId)
    }
    
    let listQuery = ""
    if (jsonObj.myCategoryId) {
        listQuery = " SELECT ss.`store_id` " +
            " FROM `site_category_group` AS s " +
            " INNER JOIN `site_category_group_stores` AS ss ON ss.`site_category_group_id` = s.id " +
            " where s.id = ? "
            params.push(jsonObj.myCategoryId)
    }
    else if (jsonObj.sellerId) {
        listQuery = " SELECT id as storeList from store where seller_id =?;"
        params.push(jsonObj.sellerId)
    }
    if (jsonObj.locationId) {
        locationQuery = '  and sl.location_id = ? '  
        params.push(jsonObj.locationId)

    }
    let myCategoryStoreQuery = " and st.id in (" + listQuery + ")"
    let categoryQuery = " SELECT * FROM ((SELECT DISTINCT mc.name AS NAME,mc.id AS id,mc.alternative_name as alternativeName,mc.seo_title as seoTitle, mc.seo_description as seoDescription, mc.seo_keyword as seoKeyword, mc.seo_slug as seoSlug, mc.seo_h1 as seoH1,if(mc.is_rental is true,'1','0') AS rental,mc.sort_order AS sortOrder ," +
        " CONCAT((SELECT config_value  FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
        " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT config_value  FROM configuration WHERE config_key = 'mainCategoryImagePath'),'/',mc.image_path) AS `image_path` " +
        " FROM store AS st  " +
        " INNER JOIN location_group_type AS sl ON sl.store_id = st.id " +
        " INNER JOIN city AS c ON c.id = st.city_id  INNER JOIN location AS l ON l.id = sl.location_id " +
        " INNER JOIN seller AS s ON s.id = st.seller_id  INNER JOIN store_main_category AS smc ON smc.store_id = st.id " + categoryQry +
        " INNER JOIN `main_category` AS mc  ON mc.id = smc.main_category_id  WHERE l.is_active = TRUE AND l.is_approved = TRUE and mc.is_active = true  " + myCategoryStoreQuery +
        " AND sl.is_active = TRUE AND st.is_active = TRUE AND st.is_approved = TRUE  AND s.is_active = TRUE AND s.is_approved = TRUE " +
        " AND s.has_location = TRUE " + locationQuery + "   AND  ((  (EXISTS(SELECT 1 FROM store_categories sc " +
        " WHERE sc.store_id = st.id AND sc.is_active = TRUE))  OR  (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = st.id AND rsi.is_active = TRUE)) " +
        " OR  (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = st.id AND ci.is_active = TRUE)) " +
        " OR  (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = st.id AND psc.is_active = TRUE)) " +
        " OR  (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = st.id AND fi.is_active = TRUE)) " +
        " OR  (EXISTS(SELECT 1 FROM `ed_store_videos` AS edsv WHERE edsv.store_id = st.id AND edsv.is_active = TRUE)) ) " +
        " OR  (EXISTS(SELECT 1 FROM `rent_item` AS ri WHERE ri.store_id = st.id AND ri.is_active = TRUE)  ))  ) " +
        " UNION " +
        " ( SELECT DISTINCT mc.name AS NAME,mc.id AS id,mc.alternative_name as alternativeName,mc.seo_title as seoTitle, mc.seo_description as seoDescription, mc.seo_keyword as seoKeyword, mc.seo_slug as seoSlug, mc.seo_h1 as seoH1,if(mc.is_rental is true,'1','0') AS rental,mc.sort_order AS sortOrder, " +
         " CONCAT((SELECT config_value  FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
        " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT config_value  FROM configuration WHERE config_key = 'mainCategoryImagePath'),'/',mc.image_path) AS `image_path` " +
        " FROM store AS st  INNER JOIN city AS c ON c.id = st.city_id  INNER JOIN seller AS s ON s.id = st.seller_id  " +
        " INNER JOIN store_main_category AS smc ON smc.store_id = st.id " + categoryQry +
        " INNER JOIN `main_category` AS mc  ON mc.id = smc.main_category_id " +
        " WHERE  st.is_active = TRUE AND st.is_approved = TRUE AND s.is_active = TRUE AND s.is_approved = TRUE and mc.is_active = true" + myCategoryStoreQuery +
        " AND s.has_location = FALSE " +
        " AND  ((  (EXISTS(SELECT 1 FROM store_categories sc WHERE sc.store_id = st.id AND sc.is_active = TRUE)) " +
        " OR  (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = st.id AND rsi.is_active = TRUE)) " +
        " OR  (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = st.id AND ci.is_active = TRUE)) " +
        " OR  (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = st.id AND psc.is_active = TRUE)) " +
        " OR  (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = st.id AND fi.is_active = TRUE)) " +
        " OR  (EXISTS(SELECT 1 FROM `ed_store_videos` AS edsv WHERE edsv.store_id = st.id AND edsv.is_active = TRUE)) ) " +
        " OR  (EXISTS(SELECT 1 FROM `rent_item` AS ri WHERE ri.store_id = st.id AND ri.is_active = TRUE)  )) " +
        " ))AS category " +
        " GROUP BY id " +
        " ORDER BY sortOrder ;"
        
        console.log("categoryQuery...",categoryQuery)
    queryExecution.queryExecution(client, jsonObj, event, categoryQuery,[...params,...params], function(response) {
        if (response.success == '0') {
            callback(response);
        }
        let categoryResults = response.result
        console.log("categoryResults...",categoryResults)
        let resultData = {
            "category": categoryResults
        }
        const data = {
            success: "1",
            result: resultData,
            errorMessage: "",
            successMessage: resultData.category.length > 0 ? "Success" : "No data found"
        };
        console.log("data...", data)
        callback(data);
    })
    
}
module.exports = methods;
