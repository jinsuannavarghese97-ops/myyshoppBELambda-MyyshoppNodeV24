let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.globalLocations = function(client,jsonObj, event, callback) {
    let cityQry = ""
    let stateQuery = ''
    let val = []
    const removeQuotes = (str) => {
        return str.split("'").join('');
            };
    if(event.cityId){
        cityQry = " and c.id = ? "+
        val.push(event.cityId)
    }
    if(event.countryId){
      stateQuery =  " and st.country_id = ? "
        val.push(event.countryId)
    }

    let listQuery = " select IF(l.pin_code,l.pin_code,'') as pinCode,l.name as location,c.name as city,IF(l.pin_code != NULL OR l.pin_code != '',CONCAT(l.name,' (',l.pin_code,')'),l.name) as locationName,l.id as locationId,CONCAT(c.name,'(',st.name,')') as cityName,c.id as cityId,st.name as stateName,st.id as stateId" +
        " FROM location l " +
        " INNER JOIN city c  ON c.id = l.city_id " +cityQry+
        " INNER JOIN state st  ON st.id = c.state_id " +stateQuery+
        " WHERE (l.name like ? OR l.pin_code like ? OR c.name like ? OR st.name like ?) " +
        " and l.is_active = true AND l.is_approved = true " +
        " AND c.is_active = true AND " +
        " st.is_active = TRUE "+
        /*" AND  " +
        " ( " +
        " (EXISTS(SELECT 1 FROM store_categories sc WHERE sc.store_id = s.id AND sc.is_active = TRUE)) " +
        " OR " +
        " (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = s.id AND psc.is_active = TRUE)) " +
        " OR " +
        " (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = s.id AND rsi.is_active = TRUE)) "+
        " OR " +
        " (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = s.id AND ci.is_active = TRUE)) "+
        " OR " +
        " (EXISTS(SELECT 1 FROM `rent_item` AS ri WHERE ri.store_id = s.id AND ri.is_active = TRUE)) "+
        " OR " +
        " (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = s.id AND fi.is_active = TRUE)) " +
        " OR "+
        " (EXISTS(SELECT 1 FROM `sp_service_provider_category` AS ss WHERE ss.store_id = s.id AND ss.is_active = TRUE)) " +
        " )"+*/
        " GROUP BY l.id " +
        " ORDER BY l.name "
       
    queryExecution.queryExecution(client, jsonObj, event, listQuery,[...val,removeQuotes("'%" + event.locationKeyword + "%'"),removeQuotes("'%" + event.locationKeyword + "%'"),removeQuotes("'%" + event.locationKeyword + "%'"),removeQuotes("'%" + event.locationKeyword + "%'")], function(response) {
        console.log(".response......",response)
        if (response.success == '0') {
            callback(response);
        }
        let listResults = response.result
        const responseData = {
            success: "1",
            result: listResults,
            errorMessage: "",
            successMessage: "Success"
        };
        callback(responseData);
    });
}
module.exports = methods;