let queryExecution = require('../queryExecution');
let methods = {};

methods.commonItemListing = function (client, jsonObj, event, callback) {
    let resultArray = [];
    let offset = event.offset;
    let max = event.max;
    let whereQuery = "";
    let whereQueryParams = [];
    if (event.storeId) {
        whereQuery = " AND s.id=?";
        whereQueryParams.push(event.storeId);
    }
    if (event.sellerId) {
        if (whereQuery == "") {
            whereQuery = " AND s.seller_id=? ";
            whereQueryParams.push(event.sellerId);
        }
        else {
            whereQuery = whereQuery + " AND s.seller_id= ?";
            whereQueryParams.push(event.sellerId);
        }
    }
    if (event.txtName != null && event.txtName != '') {
        whereQuery = whereQuery + " and cim.name like ? ";
        whereQueryParams.push("%" + event.txtName + "%");
    }
    if (event.cmbTypeSearch != null && event.cmbTypeSearch != '' && event.cmbTypeSearch != '00') {
        whereQuery = whereQuery + " and ct.id = ? ";
        whereQueryParams.push(event.cmbTypeSearch);
    }
    if (event.cmbBrandSearch != null && event.cmbBrandSearch != '' && event.cmbBrandSearch != '00') {
        whereQuery = whereQuery + " and cb.id = ? ";
        whereQueryParams.push(event.cmbBrandSearch);
    }
    if (event.cmbCategory1Search != null && event.cmbCategory1Search != '' && event.cmbCategory1Search != '00') {
        whereQuery = whereQuery + " and cc1.id = ? ";
        whereQueryParams.push(event.cmbCategory1Search);
    }
    if (event.cmbCategory2Search != null && event.cmbCategory2Search != '' && event.cmbCategory2Search != '00') {
        whereQuery = whereQuery + " and cc2.id = ? ";
        whereQueryParams.push(event.cmbCategory2Search);
    }
    if (event.cmbSearchCategory != null && event.cmbSearchCategory != '' && event.cmbSearchCategory != '0') {
        switch (event.cmbSearchCategory) {
            case '1':
                whereQuery = whereQuery + " and ci.is_active = true "
                break;
            case '2':
                whereQuery = whereQuery + " and ci.is_active = false "
                break;
            case '3':
                whereQuery = whereQuery + " and cim.is_active = true "
                break;
            case '4':
                whereQuery = whereQuery + " and cim.is_active = false "
                break;
            case '5':
                whereQuery = whereQuery + " and ci.is_offer = true "
                break;
        }
    }


    let queryString = " SELECT CONCAT(ct.name, ' ', cim.name,' ', IFNULL(ci.title, ''),' ',IFNULL(cim.search_name, ''), ' ', " +
        " IFNULL(ci.search_name, ''),' ',IFNULL(cb.name, ''),' ', cc1.name,' ', IFNULL(cc2.name, ''), ' ', IFNULL(cc3.name, ''),' ',IFNULL((SELECT GROUP_CONCAT(cfv.feature_value " +
        " SEPARATOR ', ') FROM cm_item AS ci1 INNER JOIN cm_item_type_features AS citf ON ci1.id = citf.cm_item_id INNER JOIN cm_type_features AS ctf ON citf.cm_type_features_id = ctf.id " +
        " INNER JOIN cm_features AS cf ON cf.id = ctf.cm_features_id INNER JOIN cm_feature_value AS cfv ON cfv.id = citf.cm_feature_value_id WHERE ci1.id = ci.id GROUP BY ci1.id), '')) AS search_string, " +
        " CONCAT(cim.id,ci.id,IFNULL(cb.id, 0),IFNULL(cii.id, 0)) AS unique_id,cim.cm_type_id AS cm_type_id,ci.id AS item_id,cim.store_id AS store_id,cim.id AS item_master_id,cim.name AS item_name,ci.description AS itemDescription,ci.title AS item_title, " +
        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'), '/',(SELECT config_value FROM " +
        " configuration WHERE config_key = 'bucketSubFolder'), '/',(SELECT  config_value FROM configuration WHERE " +
        " config_key = 's3PathCommonItem'),'/',cs3.folder_name, '/',IF(cii.image IS NULL,'no_image_common_item.jpg',cii.image)) AS item_image, " +
        " IF(CURDATE() BETWEEN DATE(ci.offer_from) AND DATE(ci.offer_to),IF(ci.is_offer,IF(ci.offer_price > 0,ci.offer_price,ci.net_amount),ci.net_amount), ci.net_amount) AS net_amount,ci.mrp AS mrp,IFNULL(cb.name, '') AS brand_name,cb.id AS brand_id,(SELECT IF(cis.id IS NULL, " +
        " ci1.available_quantity,MAX(cis.available_quantity)) FROM cm_item AS ci1 LEFT JOIN cm_item_size AS cis ON cis.cm_item_id = ci1.id " +
        " WHERE ci1.id = ci.id GROUP BY ci1.id) AS available_quantity, ci.slug AS slug,IF(CURDATE() BETWEEN DATE(ci.offer_from) AND DATE(ci.offer_to), " +
        " IF(ci.is_offer, 1, 0),0) AS is_offer,ci.offer_text AS offer_text,(SELECT GROUP_CONCAT(cs.name SEPARATOR ', ') AS size_name FROM cm_item AS ci1 " +
        " LEFT JOIN cm_item_size AS cis ON cis.cm_item_id = ci1.id INNER JOIN cm_size AS cs ON cs.id = cis.cm_size_id " +
        " WHERE ci1.id = ci.id AND cis.is_active = TRUE AND cs.is_active = TRUE GROUP BY ci1.id order by cs.id desc) AS item_size, " +
        " (SELECT  GROUP_CONCAT(cs.id SEPARATOR ', ') AS size_name FROM cm_item AS ci1 LEFT JOIN cm_item_size AS cis ON cis.cm_item_id = ci1.id INNER JOIN cm_size AS cs ON cs.id = cis.cm_size_id WHERE ci1.id = ci.id AND cis.is_active = TRUE AND cs.is_active = TRUE GROUP BY ci1.id) AS item_size_id, " +
        " (SELECT GROUP_CONCAT(cis.id SEPARATOR ', ') AS size_name FROM cm_item AS ci1 LEFT JOIN cm_item_size AS cis ON cis.cm_item_id = ci1.id WHERE  ci1.id = ci.id AND cis.is_active = TRUE  " +
        " GROUP BY ci1.id) AS cm_item_size_id,(SELECT GROUP_CONCAT(cis.available_quantity SEPARATOR ', ') AS size_name FROM cm_item AS ci1 LEFT JOIN cm_item_size AS cis ON cis.cm_item_id = ci1.id INNER JOIN cm_size AS cs ON cs.id = cis.cm_size_id WHERE ci1.id = ci.id AND cis.is_active = TRUE AND cs.is_active = TRUE " +
        " GROUP BY ci1.id order by cs.id desc) AS item_size_quantity,cc1.id AS category_level1_id,cc1.name AS category_level1_name,cc2.id AS category_level2_id,cc2.name AS category_level2_name,cc3.id AS category_level3_id,cc3.name AS category_level3_name,cc.colour_code AS colour_code,cc.name AS colour_name,cc.id AS colour_id, " +
        " cs.name AS size_name,cs.id AS size_id,cf.id AS cm_features_id,cf.name AS cm_features_name,cfv.feature_value AS feature_value, " +
        " cfv.id AS feature_value_id,ci.ranking AS sort_order,if(s.has_contact_us_without_price is true,true,false) AS hasContactUsWithoutPrice,if(s.has_buy_option is true,true,false) AS hasBuyOption,s.store_button_name AS storeButtonName,ci.max_buy_count AS maxBuyCount,cc1.web_image_path AS web_image_path,cr.symbol AS currencySymbol " +
        " FROM cm_item_master AS cim INNER JOIN store s ON cim.store_id = s.id INNER JOIN currency AS cr ON cr.id = s.currency_id INNER JOIN cm_type_main_category AS ctmc ON cim.cm_type_id = ctmc.cm_type_id INNER JOIN cms3image_type AS cs3 ON cs3.main_category = ctmc.main_category_id INNER JOIN cm_item AS ci ON cim.id = ci.cm_item_master_id " +
        " INNER JOIN cm_type AS ct ON ct.id = cim.cm_type_id INNER JOIN cm_category1 AS cc1 ON cim.cm_category1_id = cc1.id " +
        " LEFT JOIN cm_category2 AS cc2 ON cim.cm_category2_id = cc2.id LEFT JOIN cm_category3 AS cc3 ON cim.cm_category3_id = cc3.id LEFT JOIN " +
        " cm_menu_sort_order AS cmso ON cmso.type_id = cc1.id LEFT JOIN cm_brand AS cb ON cb.id = cim.cm_brand_id LEFT JOIN cm_item_images AS cii ON ci.id = cii.cm_item_id AND cii.is_default = TRUE LEFT JOIN cm_item_colour AS cic ON cic.cm_item_id = ci.id LEFT JOIN cm_colour AS cc ON cc.id = cic.cm_colour_id " +
        " LEFT JOIN cm_item_size AS cis ON cis.cm_item_id = ci.id LEFT JOIN cm_size AS cs ON cs.id = cis.cm_size_id LEFT JOIN " +
        " cm_item_type_features AS citf ON ci.id = citf.cm_item_id LEFT JOIN cm_type_features AS ctf ON citf.cm_type_features_id = ctf.id LEFT JOIN " +
        " cm_features AS cf ON cf.id = ctf.cm_features_id LEFT JOIN cm_feature_value AS cfv ON cfv.id = citf.cm_feature_value_id " +
        " WHERE (cb.is_active = TRUE OR cb.is_active IS NULL) AND (cc3.is_active = TRUE OR cc3.is_active IS NULL) AND (cc2.is_active = TRUE " +
        //" OR cc2.is_active IS NULL) AND cc1.is_active = TRUE AND ci.is_active = TRUE AND  cim.store_id = " + event.storeId + whereQuery + " " +
        " OR cc2.is_active IS NULL) AND cc1.is_active = TRUE AND ci.is_active = TRUE " + whereQuery +
        " GROUP BY ci.id ORDER BY ci.ranking ASC , ci.itembuy_count DESC , ci.item_view_count DESC  limit ?,?; " +
        " SELECT COUNT(*) as totalCount FROM (SELECT cim.id " +
        " FROM cm_item_master AS cim INNER JOIN store s ON cim.store_id = s.id INNER JOIN currency AS cr ON cr.id = s.currency_id INNER JOIN cm_type_main_category AS ctmc ON cim.cm_type_id = ctmc.cm_type_id INNER JOIN cms3image_type AS cs3 ON cs3.main_category = ctmc.main_category_id INNER JOIN cm_item AS ci ON cim.id = ci.cm_item_master_id " +
        " INNER JOIN cm_type AS ct ON ct.id = cim.cm_type_id INNER JOIN cm_category1 AS cc1 ON cim.cm_category1_id = cc1.id " +
        " LEFT JOIN cm_category2 AS cc2 ON cim.cm_category2_id = cc2.id LEFT JOIN cm_category3 AS cc3 ON cim.cm_category3_id = cc3.id LEFT JOIN " +
        " cm_menu_sort_order AS cmso ON cmso.type_id = cc1.id LEFT JOIN cm_brand AS cb ON cb.id = cim.cm_brand_id LEFT JOIN cm_item_images AS cii ON ci.id = cii.cm_item_id AND cii.is_default = TRUE LEFT JOIN cm_item_colour AS cic ON cic.cm_item_id = ci.id LEFT JOIN cm_colour AS cc ON cc.id = cic.cm_colour_id " +
        " LEFT JOIN cm_item_size AS cis ON cis.cm_item_id = ci.id LEFT JOIN cm_size AS cs ON cs.id = cis.cm_size_id LEFT JOIN " +
        " cm_item_type_features AS citf ON ci.id = citf.cm_item_id LEFT JOIN cm_type_features AS ctf ON citf.cm_type_features_id = ctf.id LEFT JOIN " +
        " cm_features AS cf ON cf.id = ctf.cm_features_id LEFT JOIN cm_feature_value AS cfv ON cfv.id = citf.cm_feature_value_id " +
        " WHERE (cb.is_active = TRUE OR cb.is_active IS NULL) AND (cc3.is_active = TRUE OR cc3.is_active IS NULL) AND (cc2.is_active = TRUE " +
        //" OR cc2.is_active IS NULL) AND cc1.is_active = TRUE AND ci.is_active = TRUE AND  cim.store_id = " + event.storeId + whereQuery + " " +
        " OR cc2.is_active IS NULL) AND cc1.is_active = TRUE AND ci.is_active = TRUE  " + whereQuery +
        " GROUP BY ci.id ORDER BY ci.ranking ASC , ci.itembuy_count DESC , ci.item_view_count DESC ) as a ;"
    console.log(queryString);
    const queryParams = [...whereQueryParams, parseInt(offset), parseInt(max), ...whereQueryParams];
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryParams, function (response) {

        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        if (results.length > 0) {
            resultArray = results[0]


            for (let i = 0; i < resultArray.length; i++) {
                let item_size = resultArray[i].item_size
                let splitItemSize = item_size ? item_size.split(',') : []

                let item_size_quantity = resultArray[i].item_size_quantity
                let splitItemSizeQuantity = item_size_quantity ? item_size_quantity.split(',') : []

                let itemSizeId = resultArray[i].item_size_id
                let splitItemSizeId = itemSizeId ? itemSizeId.split(',') : []

                let cmItemSizeId = resultArray[i].cm_item_size_id
                let splitCmItemSizeId = cmItemSizeId ? cmItemSizeId.split(',') : []

                let sizeDetails = []
                for (let k = 0; k < splitItemSize.length; k++) {
                    sizeDetails[k] = {
                        sizeName: splitItemSize[k],
                        sizeQuantity: splitItemSizeQuantity[k],
                        mrp: resultArray[i].mrp,
                        netAmount: resultArray[i].net_amount,
                        itemSizeId: splitItemSizeId[k],
                        cmItemSizeId: splitCmItemSizeId[k]
                    }
                }
                resultArray[i].sizeDetails = sizeDetails
            }

            const response = {
                "success": "1",
                "successMessage": "Success",
                "result": JSON.parse(JSON.stringify(results[0]).replace(/\:null/gi, "\:\"\"")),
                "count": results[1][0].totalCount,

                "errorMessage": ""
            }
            console.log("response.....", response)
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
