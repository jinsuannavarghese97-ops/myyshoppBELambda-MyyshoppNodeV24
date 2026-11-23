let methods = {};
const queryExecution = require('../queryExecution');
methods.restaurantItem = function (client, jsonObj, event, callback) {
    let searchQry = "";
    let searchQryParams = [];
    if (event.keyword) {
        searchQry = " and rsi.name like ?";
        searchQryParams.push(event.keyword + "%");
    }
    let resultsQuery = " select rsi.id as id " +
        " FROM rt_store_item rsi " +
        " INNER JOIN rt_spice s ON s.id = rsi.rt_spice_id AND s.is_active = TRUE and rsi.store_id = ? " +
        " INNER JOIN rt_store_item_size rsis ON rsis.rt_store_item_id = rsi.id AND rsis.is_active = TRUE " +
        " INNER JOIN rt_item_size ris ON rsis.rt_item_size_id = ris.id AND ris.is_active = TRUE " +
        " LEFT JOIN rt_user_wish_list rwl ON rsi.id = rwl.item_id AND sec_user_id = 0 " +
        " INNER JOIN rt_course co ON rsi.rt_course_id = co.id AND co.is_active = TRUE " +
        " INNER JOIN rt_cuisine c ON rsi.rt_cuisine_id = c.id AND c.is_active = TRUE " +
        " INNER JOIN rt_course_type ct ON rsi.rt_course_type_id = ct.id AND ct.is_active = TRUE " +
        " INNER JOIN store AS st ON st.id = rsi.store_id " +
        " INNER JOIN currency AS cu ON cu.id = st.currency_id " +
        " LEFT JOIN rt_store_item_image AS rsii ON rsi.id = rsii.rt_store_item_id AND rsii.is_default = TRUE " +
        " WHERE rsi.is_active = 1 " + searchQry +
        " GROUP BY rsi.id ; " +

        " select rsi.name as itemName, CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT config_value FROM configuration WHERE config_key = 's3PathRestaurant'),'/',IFNULL(rsii.image_name, 'ResNoImage.jpg')) AS itemImage,if(s.image is null,'',s.image) AS spiceImg,s.name AS spiceType, ris.name AS sizeName, rsis.rt_item_size_id AS sizeId,IF((NOW() BETWEEN rsis.offer_from AND rsis.offer_to) AND (rsis.is_offer = TRUE),'1','0') AS isOffer, ct.name AS courseTypeName, IF(rsis.offer_text IS NULL,'',rsis.offer_text) AS offerText, cast(IF((NOW() BETWEEN rsis.offer_from AND rsis.offer_to) AND (rsis.is_offer = TRUE), rsis.net_amount, rsis.price) as decimal(18,2)) AS netAmount " +
        " FROM rt_store_item rsi " +
        " INNER JOIN rt_spice s ON s.id = rsi.rt_spice_id AND s.is_active = TRUE and rsi.store_id = ? " +
        " INNER JOIN rt_store_item_size rsis ON rsis.rt_store_item_id = rsi.id AND rsis.is_active = TRUE " +
        " INNER JOIN rt_item_size ris ON rsis.rt_item_size_id = ris.id AND ris.is_active = TRUE " +
        " LEFT JOIN rt_user_wish_list rwl ON rsi.id = rwl.item_id AND sec_user_id = 0 " +
        " INNER JOIN rt_course co ON rsi.rt_course_id = co.id AND co.is_active = TRUE " +
        " INNER JOIN rt_cuisine c ON rsi.rt_cuisine_id = c.id AND c.is_active = TRUE " +
        " INNER JOIN rt_course_type ct ON rsi.rt_course_type_id = ct.id AND ct.is_active = TRUE " +
        " INNER JOIN store AS st ON st.id = rsi.store_id " +
        " INNER JOIN currency AS cu ON cu.id = st.currency_id " +
        " LEFT JOIN rt_store_item_image AS rsii ON rsi.id = rsii.rt_store_item_id AND rsii.is_default = TRUE " +
        " WHERE rsi.is_active = 1 " + searchQry +
        " GROUP BY rsi.id " +
        " ORDER BY rsi.ranking ASC , rsi.item_buy_count DESC , rsi.item_view_count DESC " +
        " limit ?,?;";
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