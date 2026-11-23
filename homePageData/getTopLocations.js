let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.getTopLocations = function (client, jsonObj, event, callback) {

    let sellerId = jsonObj.sellerId;
    let topSearchData = [];

    if (sellerId) {

        let topSearchQuery = " (SELECT l.id locationId,l.name as locationName,COUNT(*) AS magnitude " +
            " FROM sale AS s " +
            " INNER JOIN `sale_order` AS so ON so.sale_id = s.id " +
            " INNER JOIN `buyer_delivery_address` AS bda ON bda.id = s.`buyer_delivery_address_id` AND bda.`is_active` = TRUE " +
            " INNER JOIN location AS l ON l.id = bda.`location_id` AND l.`is_active` = TRUE AND l.`is_approved` = TRUE " +
            " WHERE so.store_id IN (Select GROUP_CONCAT(s.`id` SEPARATOR ',') storeList from store as s where s.is_active = true and s.seller_id = ? group by s.seller_id ) " +
            " GROUP BY l.id) " +
            " UNION " +
            " (select l.id locationId,l.name as locationName,COUNT(*) AS magnitude " +
            " FROM store s " +
            " INNER JOIN location_group_type sl ON sl.store_id = s.id " +
            " INNER JOIN location l ON l.id = sl.location_id " +
            " INNER JOIN city c ON c.id = l.city_id " +
            " INNER JOIN state st ON st.id = c.state_id " +
            " WHERE s.is_active = TRUE AND s.is_approved = TRUE " +
            " AND sl.is_active = TRUE AND st.is_active = TRUE AND l.is_active = true AND l.is_approved = true " +
            " AND c.is_active = true AND " +
            " st.is_active = TRUE AND s.id in (Select GROUP_CONCAT(s.`id` SEPARATOR ',') storeList from store as s where s.is_active = true and s.seller_id = ? group by s.seller_id )" +
            " AND " +
            " ( " +
            " (EXISTS(SELECT 1 FROM store_categories sc WHERE sc.store_id = s.id AND sc.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = s.id AND psc.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = s.id AND rsi.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = s.id AND ci.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `rent_item` AS ri WHERE ri.store_id = s.id AND ri.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = s.id AND fi.is_active = TRUE)) " +
            " ) AND s.is_embed_code_enabled = TRUE GROUP BY l.id) " +
            " ORDER BY magnitude DESC " +
            " LIMIT 5 "
        queryExecution.queryExecution(client, jsonObj, event, topSearchQuery, [jsonObj.sellerId, jsonObj.sellerId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let topSearchResults = response.result

            for (let i = 0; i < topSearchResults.length; i++) {
                let topSearchDetails = [];
                topSearchDetails = {
                    locationId: topSearchResults[i].locationId,
                    locationName: topSearchResults[i].locationName,
                    magnitude: topSearchResults[i].magnitude
                }
                topSearchData.push(topSearchDetails)
            }

            const resultDatum = {
                success: "1",
                errorMessage: "",
                successMessage: topSearchResults.length > 0 ? "Success." : "No data found.",
                result: {
                    locationDetails: topSearchResults.length > 0 ? topSearchData : []
                }
            };
            callback(resultDatum);


        });
    }
}
module.exports = methods;