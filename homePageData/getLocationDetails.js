let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.getLocationDetails = function (client, jsonObj, event, locationParams, callback) {
    let IsEmbed = true;
    let sellerId = locationParams.sellerId;
    let cityId = locationParams.cityId;
    let locationData = [];
    let keyQuery = "";
    let keyQueryParams = [];
    let key = locationParams.locationKeyWord;
    if (key) {
        keyQuery = keyQuery + " and (l.name like ? or l.pin_code like ?) ";
        keyQueryParams.push(key + "%", key + "%");
    }
    if (IsEmbed == true) {
        let locationQuery = " select IF(l.pin_code != NULL OR l.pin_code != '',CONCAT(l.name,' (',l.pin_code,')'),l.name) as locationName,l.id as locationId " +
            " FROM store s " +
            " INNER JOIN location_group_type sl ON sl.store_id = s.id " +
            " INNER JOIN location l ON l.id = sl.location_id " +
            " INNER JOIN city c ON c.id = l.city_id " + " and c.id = ? " +
            " INNER JOIN state st ON st.id = c.state_id " +
            " WHERE s.is_active = TRUE AND s.is_approved = TRUE " +
            " AND sl.is_active = TRUE AND st.is_active = TRUE AND l.is_active = true AND l.is_approved = true " +
            " AND c.is_active = true AND " +
            " st.is_active = TRUE AND s.id in (Select id as sellerId from store where seller_id = ? and is_active is true )" + keyQuery +
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
            " ) AND s.is_embed_code_enabled = TRUE " +
            " GROUP BY l.id " +
            " ORDER BY l.name ";
        const locationQueryParams = [cityId, sellerId, ...keyQueryParams];
        console.log("........",locationQuery,locationQueryParams)
        queryExecution.queryExecution(client, jsonObj, event, locationQuery, locationQueryParams, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let locationResults = response.result
            if (locationResults.length > 0) {
                for (let i = 0; i < locationResults.length; i++) {
                    let locationDetails = [];
                    locationDetails = {
                        locationId: locationResults[i].locationId,
                        locationName: locationResults[i].locationName,
                    }
                    locationData.push(locationDetails)

                }
                console.log("....locationData...",locationData)
                const resultDatum = {
                    success: "1",
                    errorMessage: "",
                    successMessage: "Success.",
                    result: {
                        locationDetails: locationData
                    }
                };

                callback(resultDatum);
            }
            else {
                const locationData = {
                    success: "1",
                    errorMessage: "",
                    successMessage: "No Data Found.",
                    result: {
                        locationDetails: []
                    }
                };
                callback(locationData);
            }

        });
    }
}
module.exports = methods;