let methods = {};
const queryExecution = require('../queryExecution');
methods.commonItem = function (client, jsonObj, event, callback) {
    let searchQry = "";
    let searchQryParams = [];
    if (event.keyword) {
        searchQry = " and (cim.name like ? or ci.title like ?)";
        searchQryParams.push(event.keyword + "%", event.keyword + "%");
    }
    let resultsQuery = " SELECT cim.id " +
        " FROM cm_item_master AS cim " +
        " INNER JOIN store s on cim.store_id=s.id and s.id = ? " +
        " INNER JOIN cm_type_main_category AS ctmc ON cim.cm_type_id = ctmc.cm_type_id " +
        " INNER JOIN cms3image_type AS cs3 ON cs3.main_category = ctmc.main_category_id " +
        " INNER JOIN cm_item AS ci ON cim.id = ci.cm_item_master_id " +
        " INNER JOIN cm_type AS ct ON ct.id = cim.cm_type_id " +
        " INNER JOIN cm_category1 AS cc1 ON cim.cm_category1_id = cc1.id " +
        " LEFT JOIN cm_category2 AS cc2 ON cim.cm_category2_id = cc2.id " +
        " LEFT JOIN cm_category3 AS cc3 ON cim.cm_category3_id = cc3.id " +
        " LEFT JOIN cm_menu_sort_order AS cmso ON cmso.type_id = cc1.id " +
        " LEFT JOIN cm_brand AS cb ON cb.id = cim.cm_brand_id " +
        " LEFT JOIN cm_item_images AS cii ON ci.id = cii.cm_item_id AND cii.is_default = TRUE " +
        " LEFT JOIN cm_item_colour AS cic on cic.cm_item_id = ci.id " +
        " LEFT JOIN cm_colour AS cc ON cc.id = cic.cm_colour_id " +
        " LEFT JOIN cm_item_size AS cis ON cis.cm_item_id = ci.id " +
        " LEFT JOIN cm_size AS cs ON cs.id = cis.cm_size_id " +
        " LEFT JOIN cm_item_type_features AS citf ON ci.id = citf.cm_item_id " +
        " LEFT JOIN cm_type_features AS ctf ON citf.cm_type_features_id = ctf.id " +
        " LEFT JOIN cm_features AS cf ON cf.id = ctf.cm_features_id " +
        " LEFT JOIN cm_feature_value AS cfv ON cfv.id = citf.cm_feature_value_id " +
        " WHERE (cb.is_active = TRUE OR cb.is_active IS NULL) AND (cc3.is_active = TRUE OR cc3.is_active IS NULL) " +
        " AND (cc2.is_active = TRUE OR cc2.is_active IS NULL) AND cc1.is_active = TRUE AND ci.is_active = TRUE AND cim.is_active = TRUE " + searchQry +
        " GROUP BY ci.id ; " +

        " SELECT cim.name as itemName,ci.title as title,IF(CURDATE() BETWEEN DATE(ci.offer_from) AND DATE(ci.offer_to),IF(ci.is_offer,IF(ci.offer_price > 0,ci.offer_price,ci.net_amount),ci.net_amount),ci.net_amount) AS net_amount,ci.mrp AS mrp,IFNULL(cb.name, '') AS brandName,cs.name AS sizeName, " +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'), '/', (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'), '/', (SELECT config_value FROM configuration WHERE config_key = 's3PathCommonItem'), '/', cs3.folder_name, '/', IF( cii.image IS NULL, 'no_image_common_item.jpg', cii.image)) AS itemImage " +
        " FROM cm_item_master AS cim " +
        " INNER JOIN store s on cim.store_id=s.id and s.id = ? " +
        " INNER JOIN cm_type_main_category AS ctmc ON cim.cm_type_id = ctmc.cm_type_id " +
        " INNER JOIN cms3image_type AS cs3 ON cs3.main_category = ctmc.main_category_id " +
        " INNER JOIN cm_item AS ci ON cim.id = ci.cm_item_master_id " +
        " INNER JOIN cm_type AS ct ON ct.id = cim.cm_type_id " +
        " INNER JOIN cm_category1 AS cc1 ON cim.cm_category1_id = cc1.id " +
        " LEFT JOIN cm_category2 AS cc2 ON cim.cm_category2_id = cc2.id " +
        " LEFT JOIN cm_category3 AS cc3 ON cim.cm_category3_id = cc3.id " +
        " LEFT JOIN cm_menu_sort_order AS cmso ON cmso.type_id = cc1.id " +
        " LEFT JOIN cm_brand AS cb ON cb.id = cim.cm_brand_id " +
        " LEFT JOIN cm_item_images AS cii ON ci.id = cii.cm_item_id AND cii.is_default = TRUE " +
        " LEFT JOIN cm_item_colour AS cic on cic.cm_item_id = ci.id " +
        " LEFT JOIN cm_colour AS cc ON cc.id = cic.cm_colour_id " +
        " LEFT JOIN cm_item_size AS cis ON cis.cm_item_id = ci.id " +
        " LEFT JOIN cm_size AS cs ON cs.id = cis.cm_size_id " +
        " LEFT JOIN cm_item_type_features AS citf ON ci.id = citf.cm_item_id " +
        " LEFT JOIN cm_type_features AS ctf ON citf.cm_type_features_id = ctf.id " +
        " LEFT JOIN cm_features AS cf ON cf.id = ctf.cm_features_id " +
        " LEFT JOIN cm_feature_value AS cfv ON cfv.id = citf.cm_feature_value_id " +
        " WHERE (cb.is_active = TRUE OR cb.is_active IS NULL) AND (cc3.is_active = TRUE OR cc3.is_active IS NULL) " +
        " AND (cc2.is_active = TRUE OR cc2.is_active IS NULL) AND cc1.is_active = TRUE AND ci.is_active = TRUE AND cim.is_active = TRUE " + searchQry +
        " GROUP BY ci.id " +
        " ORDER BY ci.itembuy_count DESC , ci.item_view_count DESC " +
        " limit ?,?;"
    queryExecution.queryExecution(client, jsonObj, event, resultsQuery, [event.storeId, ...searchQryParams, event.storeId, ...searchQryParams, parseInt(event.offset), parseInt(event.max)], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        if (results[1].length > 0) {
            response = {
                success: "1",
                errorMessage: "",
                successMessage: "Success.",
                result: results[1],
                count: results[0].length
            };
            callback(response);
        }

        else {
            response = {
                success: "0",
                errorMessage: "",
                successMessage: "No Data Found.",
                result: [],
                count: 0
            };
            callback(response);
        }


    });
}
module.exports = methods;