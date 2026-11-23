let methods = {};
const queryExecution = require('../queryExecution');
methods.groceryItem = function (client, jsonObj, event, callback) {
    let searchQry = "";
    let searchQryParams = [];
    if (event.keyword) {
        searchQry = " and i.name like ?"
        searchQryParams.push(event.keyword + "%");
    }
    let resultsQuery = " select sis.id as id " +
        " FROM store_item_stock sis " +
        " INNER JOIN store_item_stock_seo sseo ON sseo.store_item_stock_id = sis.id AND sseo.city_id = sis.city_id and sis.store_id in (select id from store where seller_id = ?) " +
        " INNER JOIN store s ON s.city_id = sis.city_id AND s.id = sis.store_id  AND s.is_active = 1  AND s.is_approved = 1 " +
        " INNER JOIN currency AS cr ON cr.id = s.currency_id " +
        " INNER JOIN  item i ON i.id = sis.item_id AND i.is_active = 1 AND i.is_approved = 1 " +
        " INNER JOIN item_names inames ON inames.item_id = i.id " +
        " INNER JOIN seller_item si ON si.id = sis.seller_item_id AND si.is_active = TRUE AND si.is_approved = TRUE and si.seller_id = ? " +
        " INNER JOIN item_category_group icg ON icg.item_id = i.id " +
        " INNER JOIN category_group cg ON cg.id = icg.category_group_id " +
        " INNER JOIN category_level1 cl1 ON cl1.id = i.category_level1_id AND cl1.is_active = 1 AND cl1.is_approved = 1 " +
        " INNER JOIN category_level2 cl2 ON cl2.id = i.category_level2_id  AND cl2.is_active = 1 AND cl2.is_approved = 1 " +
        " LEFT OUTER JOIN category_level3 cl3 ON cl3.id = i.category_level3_id AND cl3.is_active = 1 AND cl3.is_approved = 1 " +
        " LEFT OUTER JOIN pack p ON p.id = i.pack_id " +
        " LEFT OUTER JOIN brand b ON b.id = i.brand_id " +
        " LEFT OUTER JOIN currency c ON c.id = s.currency_id " +
        " WHERE sis.is_active = 1  AND sis.stock_quantity > 0 AND s.is_active = 1 AND s.is_approved = 1 AND sseo.slug IS NOT NULL " + searchQry + " order by sis.unit ASC; " +

        " select i.name as itemName, cast(sis.mrp as decimal(18,2)) as mrp, cast(sis.net_amount as decimal(18,2)) as netAmount,p.name as packName,b.name as brandName,CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT config_value FROM configuration WHERE config_key = 'itemImagesFolder'),'/',i.logo_path_thumb) AS imagePath " +
        " FROM store_item_stock sis " +
        " INNER JOIN store_item_stock_seo sseo ON sseo.store_item_stock_id = sis.id AND sseo.city_id = sis.city_id and sis.store_id  in (select id from store where seller_id = ?) " +
        " INNER JOIN store s ON s.city_id = sis.city_id AND s.id = sis.store_id  AND s.is_active = 1  AND s.is_approved = 1 " +
        " INNER JOIN currency AS cr ON cr.id = s.currency_id " +
        " INNER JOIN  item i ON i.id = sis.item_id AND i.is_active = 1 AND i.is_approved = 1 " +
        " INNER JOIN item_names inames ON inames.item_id = i.id " +
        " INNER JOIN seller_item si ON si.id = sis.seller_item_id AND si.is_active = TRUE AND si.is_approved = TRUE and si.seller_id = ? " +
        " INNER JOIN item_category_group icg ON icg.item_id = i.id " +
        " INNER JOIN category_group cg ON cg.id = icg.category_group_id " +
        " INNER JOIN category_level1 cl1 ON cl1.id = i.category_level1_id AND cl1.is_active = 1 AND cl1.is_approved = 1 " +
        " INNER JOIN category_level2 cl2 ON cl2.id = i.category_level2_id  AND cl2.is_active = 1 AND cl2.is_approved = 1 " +
        " LEFT OUTER JOIN category_level3 cl3 ON cl3.id = i.category_level3_id AND cl3.is_active = 1 AND cl3.is_approved = 1 " +
        " LEFT OUTER JOIN pack p ON p.id = i.pack_id " +
        " LEFT OUTER JOIN brand b ON b.id = i.brand_id " +
        " LEFT OUTER JOIN currency c ON c.id = s.currency_id " +
        " WHERE sis.is_active = 1  AND sis.stock_quantity > 0 AND s.is_active = 1 AND s.is_approved = 1 AND sseo.slug IS NOT NULL " + searchQry + " order by sis.unit ASC " +
        " limit ?,?;";
    const params = [event.sellerId, event.sellerId, ...searchQryParams, event.sellerId, event.sellerId, ...searchQryParams, parseInt(event.offset), parseInt(event.max)];
    queryExecution.queryExecution(client, jsonObj, event, resultsQuery, params, function (response) {
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