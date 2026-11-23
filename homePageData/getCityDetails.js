let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.getCityDetails = function(client,jsonObj,event, cityParams, callback) {
console.log("......in...")
    let sellerId = cityParams.sellerId;
    let cityData = [];
    let keyQuery = "";
    let keyQueryParams = [];
    let storeQuery = "";
    let storeQueryParams = [];
    let key = cityParams.cityKeyWord;
    if (key != "" && key != null) {
        keyQuery = keyQuery + " and (c.name like ?) ";
        keyQueryParams.push(key + "%");
    }

    storeQuery = " and s.id in (Select s.`id` storeList from store as s where s.is_active = true and s.seller_id = ? group by s.seller_id ) ";
    storeQueryParams.push(sellerId);
    let cityQuery = " SELECT " +
        " CONCAT(c.name, ' (', st.name, ')') AS cityName, " +
        " c.id AS cityId " +
        " FROM " +
        " store as s " +
        " inner join " +
        " city AS c " +
        "  INNER JOIN " +
        "  state AS st ON st.id = c.state_id " +
        "  INNER JOIN " +
        "    location_group_type sl ON sl.store_id = s.id " +
        "  INNER JOIN " +
        "    location l ON l.id = sl.location_id " +
        "   WHERE " +
        "  l.city_id = c.id AND s.is_active = TRUE " +
        "   AND s.is_approved = TRUE " +
        "     " +
        "   AND sl.is_active = TRUE " +
        "   AND l.is_active = TRUE " +
        "    AND l.is_approved = TRUE " + storeQuery +
        // "   AND s.id IN (2 , 884) " +
        "   AND c.is_active = TRUE " +
        "   group by c.id " +
        "    ORDER BY c.name "
    console.log("cityQuery ",cityQuery,storeQueryParams)
    //connection.query(cityQuery, function (error2, cityResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, cityQuery, storeQueryParams, function(response) {
        if (response.success == '0') {
            callback(response);
        }
        let cityResults = response.result
        for (let i = 0; i < cityResults.length; i++) {
            let cityDetails = [];
            cityDetails = {
                cityId: cityResults[i].cityId,
                cityName: cityResults[i].cityName,
                city: cityResults[i].city
            }
            cityData.push(cityDetails)
        }

        const resultDatum = {
            success: "1",
            errorMessage: "",
            successMessage: "Success.",
            result:{
                cityDetails: cityData.length > 0 ? cityData:[]
            }
        };
        callback(resultDatum);

    });
}
module.exports = methods;