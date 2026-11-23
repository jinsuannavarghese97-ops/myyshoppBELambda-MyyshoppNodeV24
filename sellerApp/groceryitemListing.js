let queryExecution = require('../queryExecution');
let methods = {};

methods.groceryitemListing = function (client, jsonObj, event, callback) {

    let offset = event.offset;
    let max = event.max;
    let cquery = "";
    let cqueryParams = [];
    let searchKey = "";
    let isMapped = "";
    let noMapped = "";

    if (event.storeId) {
        cquery = "and s.id= ?";
        cqueryParams.push(event.storeId);
    }
    if (event.sellerId) {
        if (cquery == "") {
            cquery = "and s.seller_id=?";
            cqueryParams.push(event.sellerId);
        }
        else {
            cquery = cquery + "and s.seller_id=?";
            cqueryParams.push(event.sellerId);
        }

    }
    console.log(cquery, "--------------")
    if (event.searchCategory != null && event.searchCategory == "1" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and i.name like ?") : (cquery + " and i.name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "2" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and b.name like ?") : (cquery + " and b.name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "3" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and cl1.name like ?") : (cquery + " and cl1.name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "4" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and cl2.name like ?") : (cquery + " and cl2.name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "5" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and cl3.name like ?") : (cquery + " and cl3.name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "6" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and si.item_name like ?") : (cquery + " and si.item_name like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "7" && event.searchText != null && event.searchText.trim() != "") {
        noMapped = "Y"
        cquery = cquery == "" ? (" and si.category like ?") : (cquery + " and si.category like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.searchCategory != null && event.searchCategory == "8" && event.searchText != null && event.searchText.trim() != "") {
        searchKey = "Y"
        cquery = cquery == "" ? (" and si.item_code like ?") : (cquery + " and si.item_code like ?");
        cqueryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.selectMapped == "1" || event.selectMapped == "2") {
        noMapped = "Y"
        isMapped = event.selectMapped == "1" ? true : false
        cquery = cquery == "" ? (" and si.is_approved = ? and si.is_active = ? ") : (cquery + " and si.is_approved = ? and si.is_active = ? ");
        cqueryParams.push(isMapped, isMapped);
    }



    let queryString = " SELECT city_id,seller_id,store_id,category_level1_id,category_level2_id,category_level3_id,brand_id,brand_name,itemDescription,item_name,item_names,store_item_stock_ids, " +
        " item_codes,item_prices,mrps,seller_item_ids,stock_quantities,pack_names,logo_paths,logo_path_thumbs,price_min,price_max,is_offers, " +
        " IF(LOCATE('1', is_offers) > 0, 1, 0) AS is_offer,is_swap_items,unit,unit_type,pack_ids,item_ids,seller_item_name,item_ranking,slug,is_loose_item,denomination, " +
       // " variation,category_group_name,offer_text,unit_filter,hasBuyOption,displayItemPrice,currencySymbol,imagePath,s3bucketAccessKey,s3bucketSecretKey " +
       " variation,category_group_name,offer_text,unit_filter,hasBuyOption,displayItemPrice,currencySymbol,imagePath " +
        " FROM (SELECT COUNT(city_id) AS group_count,city_id,seller_id,store_id,category_level1_id,category_level2_id,category_level3_id,brand_id,brand_name, " +
        " itemDescription,item_name,search_item_name,GROUP_CONCAT(item_names SEPARATOR '|') AS item_names,store_item_stock_id  AS store_item_stock_ids, " +
        " GROUP_CONCAT(item_code SEPARATOR '|') AS item_codes,GROUP_CONCAT(net_amount SEPARATOR '|') AS item_prices,GROUP_CONCAT(mrp SEPARATOR '|') AS mrps, " +
        " GROUP_CONCAT(seller_item_id SEPARATOR '|') AS seller_item_ids,GROUP_CONCAT(stock_quantity SEPARATOR '|') AS stock_quantities,GROUP_CONCAT(pack_name " +
        " SEPARATOR '|') AS pack_names,GROUP_CONCAT(logo_path SEPARATOR '|') AS logo_paths,GROUP_CONCAT(logo_path_thumb SEPARATOR '|') AS logo_path_thumbs, " +
        " GROUP_CONCAT(pack_id SEPARATOR '|') AS pack_ids,GROUP_CONCAT(item_id SEPARATOR '|') AS item_ids,GROUP_CONCAT(is_offer SEPARATOR '|') AS is_offers, " +
        " GROUP_CONCAT(is_swap_item SEPARATOR '|') AS is_swap_items,GROUP_CONCAT(unit SEPARATOR '|') AS unit,GROUP_CONCAT(unit_type SEPARATOR '|') AS unit_type, " +
        " GROUP_CONCAT(slug SEPARATOR '|') AS slug,MIN(net_amount) AS price_min,MAX(net_amount) AS price_max,seller_item_name,MIN(ranking) AS item_ranking, " +
        " is_loose_item,denomination,variation,category_group_name,GROUP_CONCAT(offer_text SEPARATOR '|') AS offer_text,MAX(unit) AS unit_filter,hasContactUsWithoutPrice, " +
        //" hasBuyOption,storeButtonName,displayItemPrice,currencySymbol,imagePath,s3bucketAccessKey,s3bucketSecretKey FROM (SELECT " +
       " hasBuyOption,storeButtonName,displayItemPrice,currencySymbol,imagePath FROM (SELECT " +
       " TRIM(REPLACE(CONCAT(sis.item_name, ' ', IFNULL(b.name, ''), ' ', IFNULL(p.name, ''), ' ', IFNULL(cl1.name, ''), ' ', IFNULL(cl2.name, ''), ' ', IFNULL(cl3.name, ''), ' ', inames.name, ' ', IFNULL(i.search_names, '')), '  ', ' ')) AS search_item_name, " +
        " sis.id AS store_item_stock_id,sis.store_id,sis.city_id,sis.item_code,i.description AS itemDescription,i.name AS item_name,sis.item_name AS item_names,sis.net_amount,sis.mrp, " +
        " sis.seller_item_id,sis.stock_quantity,IFNULL(i.brand_id, 0) AS brand_id,IFNULL(b.name, '') AS brand_name,IFNULL(p.name, '') AS pack_name,s.seller_id, " +
        " sis.item_id AS item_id,IFNULL(p.id, 0) AS pack_id,IFNULL(i.category_level1_id, 0) AS category_level1_id,IFNULL(i.category_level2_id, 0) AS category_level2_id, " +
        " IFNULL(i.category_level3_id, 0) AS category_level3_id,IF(sis.is_offer, 1, 0) AS is_offer,IF(sis.is_swap_item, 1, 0) AS is_swap_item, " +
        " IFNULL(sis.unit, 0) AS unit,IFNULL(sis.unit_type, '') AS unit_type,IF(i.logo_path IS NULL OR i.logo_path = '', 'empty', i.logo_path) AS logo_path, " +
        " IF(i.logo_path_thumb IS NULL OR i.logo_path_thumb = '', 'empty', i.logo_path_thumb) AS logo_path_thumb,sis.item_name AS seller_item_name, " +
        " sis.ranking,seo.slug,IF(i.is_loose_item = TRUE, 1, 0) AS is_loose_item,i.denomination AS denomination,i.variation AS variation,cg.name AS category_group_name, " +
        " IFNULL(sis.offer_text, '0') AS offer_text,s.has_contact_us_without_price AS hasContactUsWithoutPrice,if(s.has_buy_option is true,true,false) AS hasBuyOption,s.store_button_name AS storeButtonName, " +
        " if(s.display_item_price is true,true,false) AS displayItemPrice,cr.symbol AS currencySymbol,CONCAT((SELECT " +
        " config_value FROM configuration WHERE config_key = 'cdnImagePath'), '/', (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'), '/', (SELECT  " +
       // " config_value FROM configuration WHERE config_key = 'itemImagesFolder')) AS imagePath,(SELECT `config_value` FROM `configuration` WHERE " +
        // " `config_key` = 's3bucketAccessKey') AS s3bucketAccessKey,(SELECT  `config_value` FROM `configuration` WHERE `config_key` = 's3bucketSecretKey') AS s3bucketSecretKey " +
        " config_value FROM configuration WHERE config_key = 'itemImagesFolder')) AS imagePath " +
        " FROM store_item_stock sis INNER JOIN store_item_stock_seo seo ON seo.city_id = sis.city_id AND seo.store_item_stock_id = sis.id INNER JOIN seller_item si ON si.id = sis.seller_item_id " +
        " INNER JOIN store s ON s.id = sis.store_id AND s.city_id = sis.city_id INNER JOIN currency AS cr ON cr.id = s.currency_id INNER JOIN city c ON c.id = sis.city_id " +
        " INNER JOIN item i ON i.id = sis.item_id INNER JOIN item_category_group icg ON icg.item_id = i.id INNER JOIN category_group cg ON cg.id = icg.category_group_id " +
        "LEFT OUTER JOIN brand b ON b.id = i.brand_id INNER JOIN item_names inames ON inames.item_id = i.id LEFT OUTER JOIN pack p ON p.id = i.pack_id " +
        " INNER JOIN category_level1 cl1 ON cl1.id = i.category_level1_id INNER JOIN category_level2 cl2 ON cl2.id = i.category_level2_id LEFT OUTER JOIN category_level3 cl3 ON cl3.id = i.category_level3_id " +
        " AND cl3.is_active = 1 AND cl3.is_approved = 1 WHERE  s.is_active = 1 AND s.is_approved = 1 AND c.is_active = 1 AND i.is_active = 1 " +
        " AND i.is_approved = 1 AND p.is_active = 1 AND p.is_approved = 1 AND cl1.is_active = 1 AND cl1.is_approved = 1 AND cl2.is_active = 1 AND cl2.is_approved = 1 " + cquery +
        " ) tempTables GROUP BY store_item_stock_ids, city_id , seller_id , store_id , category_level1_id , category_level2_id , category_level3_id , brand_id , brand_name , item_name , is_loose_item = FALSE , denomination) t2 limit ?,?; " +
        " SELECT Count(*) as totalCount " +
        " FROM (SELECT COUNT(city_id) AS group_count,city_id,seller_id,store_id,category_level1_id,category_level2_id,category_level3_id,brand_id,brand_name, " +
        " item_name,search_item_name,GROUP_CONCAT(item_names SEPARATOR '|') AS item_names,store_item_stock_id  AS store_item_stock_ids, " +
        " GROUP_CONCAT(item_code SEPARATOR '|') AS item_codes,GROUP_CONCAT(net_amount SEPARATOR '|') AS item_prices,GROUP_CONCAT(mrp SEPARATOR '|') AS mrps, " +
        " GROUP_CONCAT(seller_item_id SEPARATOR '|') AS seller_item_ids,GROUP_CONCAT(stock_quantity SEPARATOR '|') AS stock_quantities,GROUP_CONCAT(pack_name " +
        " SEPARATOR '|') AS pack_names,GROUP_CONCAT(logo_path SEPARATOR '|') AS logo_paths,GROUP_CONCAT(logo_path_thumb SEPARATOR '|') AS logo_path_thumbs, " +
        " GROUP_CONCAT(pack_id SEPARATOR '|') AS pack_ids,GROUP_CONCAT(item_id SEPARATOR '|') AS item_ids,GROUP_CONCAT(is_offer SEPARATOR '|') AS is_offers, " +
        " GROUP_CONCAT(is_swap_item SEPARATOR '|') AS is_swap_items,GROUP_CONCAT(unit SEPARATOR '|') AS unit,GROUP_CONCAT(unit_type SEPARATOR '|') AS unit_type, " +
        " GROUP_CONCAT(slug SEPARATOR '|') AS slug,MIN(net_amount) AS price_min,MAX(net_amount) AS price_max,seller_item_name,MIN(ranking) AS item_ranking, " +
        " is_loose_item,denomination,variation,category_group_name,GROUP_CONCAT(offer_text SEPARATOR '|') AS offer_text,MAX(unit) AS unit_filter,hasContactUsWithoutPrice, " +
       // " hasBuyOption,storeButtonName,displayItemPrice,currencySymbol,imagePath,s3bucketAccessKey,s3bucketSecretKey FROM (SELECT " +
       " hasBuyOption,storeButtonName,displayItemPrice,currencySymbol,imagePath FROM (SELECT " +
       " TRIM(REPLACE(CONCAT(sis.item_name, ' ', IFNULL(b.name, ''), ' ', IFNULL(p.name, ''), ' ', IFNULL(cl1.name, ''), ' ', IFNULL(cl2.name, ''), ' ', IFNULL(cl3.name, ''), ' ', inames.name, ' ', IFNULL(i.search_names, '')), '  ', ' ')) AS search_item_name, " +
        " sis.id AS store_item_stock_id,sis.store_id,sis.city_id,sis.item_code,i.name AS item_name,sis.item_name AS item_names,sis.net_amount,sis.mrp, " +
        " sis.seller_item_id,sis.stock_quantity,IFNULL(i.brand_id, 0) AS brand_id,IFNULL(b.name, '') AS brand_name,IFNULL(p.name, '') AS pack_name,s.seller_id, " +
        " sis.item_id AS item_id,IFNULL(p.id, 0) AS pack_id,IFNULL(i.category_level1_id, 0) AS category_level1_id,IFNULL(i.category_level2_id, 0) AS category_level2_id, " +
        " IFNULL(i.category_level3_id, 0) AS category_level3_id,IF(sis.is_offer, 1, 0) AS is_offer,IF(sis.is_swap_item, 1, 0) AS is_swap_item, " +
        " IFNULL(sis.unit, 0) AS unit,IFNULL(sis.unit_type, '') AS unit_type,IF(i.logo_path IS NULL OR i.logo_path = '', 'empty', i.logo_path) AS logo_path, " +
        " IF(i.logo_path_thumb IS NULL OR i.logo_path_thumb = '', 'empty', i.logo_path_thumb) AS logo_path_thumb,sis.item_name AS seller_item_name, " +
        " sis.ranking,seo.slug,IF(i.is_loose_item = TRUE, 1, 0) AS is_loose_item,i.denomination AS denomination,i.variation AS variation,cg.name AS category_group_name, " +
        " IFNULL(sis.offer_text, '0') AS offer_text,s.has_contact_us_without_price AS hasContactUsWithoutPrice,if(s.has_buy_option is true,true,false) AS hasBuyOption,s.store_button_name AS storeButtonName, " +
        " if(s.display_item_price is true,true,false) AS displayItemPrice,cr.symbol AS currencySymbol,CONCAT((SELECT " +
        " config_value FROM configuration WHERE config_key = 'cdnImagePath'), '/', (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'), '/', (SELECT  " +
        // " config_value FROM configuration WHERE config_key = 'itemImagesFolder')) AS imagePath,(SELECT `config_value` FROM `configuration` WHERE " +
        // " `config_key` = 's3bucketAccessKey') AS s3bucketAccessKey,(SELECT  `config_value` FROM `configuration` WHERE `config_key` = 's3bucketSecretKey') AS s3bucketSecretKey " +
        " config_value FROM configuration WHERE config_key = 'itemImagesFolder')) AS imagePath " +

        " FROM store_item_stock sis INNER JOIN store_item_stock_seo seo ON seo.city_id = sis.city_id AND seo.store_item_stock_id = sis.id INNER JOIN seller_item si ON si.id = sis.seller_item_id " +
        " INNER JOIN store s ON s.id = sis.store_id AND s.city_id = sis.city_id INNER JOIN currency AS cr ON cr.id = s.currency_id INNER JOIN city c ON c.id = sis.city_id " +
        " INNER JOIN item i ON i.id = sis.item_id INNER JOIN item_category_group icg ON icg.item_id = i.id INNER JOIN category_group cg ON cg.id = icg.category_group_id " +
        "LEFT OUTER JOIN brand b ON b.id = i.brand_id INNER JOIN item_names inames ON inames.item_id = i.id LEFT OUTER JOIN pack p ON p.id = i.pack_id " +
        " INNER JOIN category_level1 cl1 ON cl1.id = i.category_level1_id INNER JOIN category_level2 cl2 ON cl2.id = i.category_level2_id LEFT OUTER JOIN category_level3 cl3 ON cl3.id = i.category_level3_id " +
        " AND cl3.is_active = 1 AND cl3.is_approved = 1 WHERE  s.is_active = 1 AND s.is_approved = 1 AND c.is_active = 1 AND i.is_active = 1 " +
        " AND i.is_approved = 1 AND p.is_active = 1 AND p.is_approved = 1 AND cl1.is_active = 1 AND cl1.is_approved = 1 AND cl2.is_active = 1 AND cl2.is_approved = 1 " + cquery +
        //" AND s.id = " + event.storeId + cquery + ") tempTables GROUP BY store_item_stock_id,city_id , seller_id , store_id , category_level1_id , category_level2_id , category_level3_id , brand_id , brand_name , item_name , is_loose_item = FALSE , denomination) t2 ;"
        " ) tempTables GROUP BY store_item_stock_id,city_id , seller_id , store_id , category_level1_id , category_level2_id , category_level3_id , brand_id , brand_name , item_name , is_loose_item = FALSE , denomination) t2 ;"
    console.log("....queryString-----------------------------------------------", queryString);
    const queryParams = [...cqueryParams, parseInt(offset), parseInt(max), ...cqueryParams];
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryParams, function (response) {

        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        if (results.length > 0) {
            const response = {
                "success": "1",
                "successMessage": "Success",
                "result": JSON.parse(JSON.stringify(results[0]).replace(/\:null/gi, "\:\"\"")),
                "count": results[1][0].totalCount,

                "errorMessage": ""
            }
            callback(response)
        }
        else {
            const response = {
                "success": "1",
                "successMessage": "No data found matching the criteria.",
                "errorMessage": ""
            }
            callback(response)
        }
    });
}
module.exports = methods;
