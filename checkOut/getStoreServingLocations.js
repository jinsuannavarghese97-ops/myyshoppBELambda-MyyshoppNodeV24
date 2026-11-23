const queryExecution = require('../queryExecution')
let methods = {};

methods.getStoreServingLocations = function (client, jsonObj, event, callback) {
    let queryString = " select c.name AS cityName,c.id AS cityId, l.name as locationName,l.id as locationId,l.pin_code as pinCode " +
        " FROM store s " +
        " INNER JOIN location_group_type sl ON sl.store_id = s.id " +
        " INNER JOIN location l ON l.id = sl.location_id " +
        " INNER JOIN city c  ON c.id = l.city_id " +
        " INNER JOIN state st  ON st.id = c.state_id " +
        " WHERE s.is_active = TRUE AND s.is_approved = TRUE " +
        " AND sl.is_active = TRUE  AND st.is_active = TRUE AND l.is_active = true AND l.is_approved = true " +
        " AND c.is_active = true AND " +
        " st.is_active = TRUE " +
        " AND  " +
        " ((EXISTS(SELECT 1 FROM store_categories sc WHERE sc.store_id = st.id AND sc.is_active = TRUE)) ) " +
        " AND s.id =? AND c.id = ?" +
        " GROUP BY l.id " +
        " ORDER BY l.name"
    queryExecution.queryExecution(client, jsonObj, event, queryString, [event.storeId, event.cityId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        let locationData = []
        for (let i = 0; i < results.length; i++) {
            const locationDetails = {
                cityId: results[i].cityId,
                cityName: results[i].cityName,
                locationId: results[i].locationId,
                locationName: results[i].locationName,
                zip: results[i].pinCode
            }
            locationData.push(locationDetails)
        }
        const responseData = {
            success: "1",
            successMessage: locationData.length > 0 ? "Success" : "No data found.",
            locationData: locationData,
            errorMessage: ""
        }
        callback(responseData);
    });
}
module.exports = methods;
