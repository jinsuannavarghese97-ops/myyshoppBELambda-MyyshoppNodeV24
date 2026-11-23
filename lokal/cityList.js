let methods = {};
let queryExecution = require('../queryExecution');
methods.city = function (client, jsonObj, event, callback) {

    let listQuery = " SELECT GROUP_CONCAT(distinct sl.`city_id` SEPARATOR ',') as cityList " +
        " FROM `site_category_group_locations` AS sl " +
        " INNER JOIN site_category_group AS s ON sl.`site_category_group_id` = s.id " +
        " WHERE s.id = ? " +
        " GROUP BY s.id"

    //connection.query(listQuery, function (error, listResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, listQuery, [jsonObj.myCategoryId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let listResults = response.result
        const removeQuotes = (str) => {
            return str.split("'").join('');
        };
        let whereQuery = ""
        let whereQueryValues = []
        let storeQry = ""
        if (event.storeId) {
            storeQry = " and s.id = ? "
            whereQueryValues.push(event.storeId)
        }

        let subQuery = ""
        if (jsonObj.cityKeyWord) {
            subQuery = " and c.name like ?"
            whereQueryValues.push(removeQuotes("'" + jsonObj.cityKeyWord + "%'"))
        }
        if (listResults.length > 0) {
            whereQuery = " and c.id in ("+listResults[0].cityList+")"
           

        }
        let cityQuery = " SELECT  CONCAT(c.name,' (',s.name,')') AS cityName,c.id AS cityId " +
            " FROM city AS c " +
            " INNER JOIN state AS s ON s.id = c.state_id " +
            " WHERE EXISTS(SELECT 1 from store s " +
            " INNER JOIN location_group_type sl " +
            " ON sl.store_id = s.id " +
            " INNER JOIN location l ON l.id = sl.location_id " +
            " WHERE l.city_id = c.id And s.is_active = TRUE " + storeQry +
            " AND s.is_approved = TRUE  AND sl.is_active = TRUE " +
            " AND l.is_active = TRUE AND l.is_approved = TRUE and " +
            " ( " +
            " (EXISTS(SELECT 1 FROM store_categories sc WHERE sc.store_id = s.id AND sc.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = s.id AND psc.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = s.id AND rsi.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = s.id AND ci.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = s.id AND fi.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `sp_service_provider_category` AS ss WHERE ss.store_id = s.id AND ss.is_active = TRUE)) " +
            " ) " +
            " )" +
            " AND EXISTS (SELECT 1 " +
            " FROM state st " +
            " WHERE st.id = c.state_id " +
            " AND st.is_active = TRUE)" +
            " AND c.is_active = true " + subQuery + whereQuery +
            " order by c.name "
        //connection.query(cityQuery, function (error, cityResults, fields) {
        queryExecution.queryExecution(client, jsonObj, event, cityQuery, [...whereQueryValues], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let cityResults = response.result
            let resultData = {
                "cityDetails": cityResults,
            }
            const data = {
                success: "1",
                result: resultData,
                errorMessage: "",
                successMessage: "Success"
            };
            callback(data);
        });
    });
}
module.exports = methods;