let mysql = require('mysql');
const methods = {};
const queryExecution = require('../queryExecution');
methods.location = function(client, jsonObj, event, callback) {

    let locationKeywordSearch = ""
    let listQuery = ""
    const removeQuotes = (str) => {
        return str.split("'").join('');
            };
    let listQueryval = [],
        cityQry = "",cityQryVal = []
    let locationQry = ""
    let locationQryVal = []
    if (jsonObj.cityId) {
        cityQry = " and c.id = ?" 
        cityQryVal.push(jsonObj.cityId)
    }
    let locationKeywordSearchVal = []
    if (jsonObj.locationKeyword) {
        locationKeywordSearch = " and (l.name like ? OR l.pin_code like ?  OR c.name like ? OR st.name like ?) "
        locationKeywordSearchVal.push(removeQuotes("'%" + jsonObj.locationKeyword + "%'"),removeQuotes("'%" + jsonObj.locationKeyword + "%'"),removeQuotes("'%" + jsonObj.locationKeyword + "%'"),removeQuotes("'%" + jsonObj.locationKeyword + "%'"))
    }
    let locationOrderByQuery= " LOWER(TRIM(l.name))"
    if(jsonObj.storeId || jsonObj.sellerId)
    {
        locationOrderByQuery=" sl.rank asc,LOWER(TRIM(l.name)) "
    }
    console.log("locationOrderByQuery....",locationOrderByQuery)
    
    if (jsonObj.myCategoryId && jsonObj.myCategoryId > 0) {
        listQuery = " SELECT s.display_city as displayCity " +
            " FROM `site_category_group_locations` AS sl " +
            " INNER JOIN site_category_group AS s ON sl.`site_category_group_id` = s.id " +
            " INNER JOIN location as l on sl.location_id = l.id " +
            " INNER JOIN city c  ON c.id = l.city_id " + cityQry +
            " INNER JOIN state st  ON st.id = c.state_id " +
            " WHERE s.id = ?" + locationKeywordSearch + " AND st.is_active = TRUE AND l.is_active = true AND l.is_approved = true " +
            " GROUP BY s.id; "
            listQueryval = [...cityQryVal,jsonObj.myCategoryId,...locationKeywordSearchVal]
        locationQry = " SELECT sl.location_id as locationList " +
            " FROM `site_category_group_locations` AS sl " +
            " INNER JOIN site_category_group AS s ON sl.`site_category_group_id` = s.id " +
            " INNER JOIN location as l on sl.location_id = l.id " +
            " INNER JOIN city c  ON c.id = l.city_id " + cityQry +
            " INNER JOIN state st  ON st.id = c.state_id " +
            " WHERE s.id = ?"  + locationKeywordSearch + " AND st.is_active = TRUE AND l.is_active = true AND l.is_approved = true "

            locationQryVal = [...cityQryVal,jsonObj.myCategoryId,...locationKeywordSearchVal]
    }
    else if (jsonObj.sellerId) {

        listQuery = " SELECT '0' as displayCity " +
            " FROM store s " +
            " INNER JOIN location_group_type sl ON sl.store_id = s.id " +
            " INNER JOIN location l ON l.id = sl.location_id " +
            " INNER JOIN city c  ON c.id = l.city_id " +
            " INNER JOIN state st  ON st.id = c.state_id " +
            " WHERE s.is_active = TRUE AND s.is_approved = TRUE " +
            " AND sl.is_active = TRUE  AND st.is_active = TRUE AND l.is_active = true AND l.is_approved = true " +
            " AND c.is_active = true and s.seller_id = ?"  + locationKeywordSearch +
            " and st.is_active = TRUE; "
            listQueryval.push(jsonObj.sellerId,...locationKeywordSearchVal)
        locationQry = " SELECT sl.location_id as locationList " +
            " FROM store s " +
            " INNER JOIN location_group_type sl ON sl.store_id = s.id " +
            " INNER JOIN location l ON l.id = sl.location_id " +
            " INNER JOIN city c  ON c.id = l.city_id " +
            " INNER JOIN state st  ON st.id = c.state_id " +
            " WHERE s.is_active = TRUE AND s.is_approved = TRUE " +
            " AND sl.is_active = TRUE  AND st.is_active = TRUE AND l.is_active = true AND l.is_approved = true " +
            " AND c.is_active = true and s.seller_id =?"   + locationKeywordSearch +
            " and st.is_active = TRUE "
            locationQryVal.push(jsonObj.sellerId,...locationKeywordSearchVal)

    }

     console.log('listQuery...',listQuery,listQueryval)
    //  console.log('locationQry...',locationQry)
    /*let listQuery = " SELECT GROUP_CONCAT(distinct sl.location_id SEPARATOR ',') as locationList,s.display_city as displayCity " +
                     " FROM `site_category_group_locations` AS sl " +
                     " INNER JOIN site_category_group AS s ON sl.`site_category_group_id` = s.id " +
                     " INNER JOIN location as l on l.id =sl.location_id "+
                     " WHERE s.id = " +jsonObj.myCategoryId+locationKeywordSearch+
                     " GROUP BY s.id"*/
    //connection.query(listQuery, function (error, listResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, listQuery,[...listQueryval], function(response) {
       // console.log('response.1..', response)
        if (response.success == '0') {
            callback(response);
        }
        let listResults = response.result
        let whereQuery = " and l.id in (" + locationQry + ")"
        let cityQuery = ""
        let cityQueryval = ""
        //console.log("--listResults[0].displayCity--",listResults[0].displayCity) 
        if (listResults[0] && listResults[0].displayCity == '1') {
            cityQuery = " and c.id = ? "  
            console.log("--cityQuery--", cityQuery)
            cityQueryval.push(jsonObj.cityId)
        }
        let storeQry = ""
        let storeQryval = []
        if (jsonObj.storeId) {
            storeQry = " and s.id = ? "  
            storeQryval.push(jsonObj.storeId)
        }
        let sellerQry = ""
        let sellerQryval = []

        if (jsonObj.sellerId) {
            sellerQry = " and s.seller_id = ?"
            sellerQryval.push(jsonObj.sellerId)
        }
        let locationQuery = " select IF(l.pin_code != NULL OR l.pin_code != '',CONCAT(l.name,' (',l.pin_code,')'),l.name) as locationName,l.id as locationId,CONCAT(c.name,'(',st.name,')') as cityName,c.id as cityId,CONCAT(l.name,' (',c.name,')') as location,l.name as locationNameOnly,st.id as stateId,st.name as stateName,c.name as city " +
            " FROM store s " +
            " INNER JOIN location_group_type sl ON sl.store_id = s.id " +
            " INNER JOIN location l ON l.id = sl.location_id " + whereQuery +
            " INNER JOIN city c  ON c.id = l.city_id " + cityQuery +
            " INNER JOIN state st  ON st.id = c.state_id " +
            " WHERE s.is_active = TRUE AND s.is_approved = TRUE " +
            " AND sl.is_active = TRUE  AND st.is_active = TRUE AND l.is_active = true AND l.is_approved = true " +
            " AND c.is_active = true AND " +
            " st.is_active = TRUE" + sellerQry +locationKeywordSearch+
            " AND  " + 
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
            " OR " +
            " (EXISTS(SELECT 1 FROM `sp_service_provider_category` AS ss WHERE ss.store_id = s.id AND ss.is_active = TRUE)) " +
            " )" + storeQry +
            " GROUP BY l.id " +
            " ORDER BY "+locationOrderByQuery+" "
        console.log('locationQuery.1..', locationQuery)
        let params = [...locationQryVal,...cityQueryval,...sellerQryval,...locationKeywordSearchVal,...storeQryval]
        //connection.query(locationQuery, function (error, locationResults, fields) {
        queryExecution.queryExecution(client, jsonObj, event, locationQuery,params, function(response) {
            // console.log('response..2..',response)
            if (response.success == '0') {
                callback(response);
            }
            let locationResults = response.result
            let resultData = {
                "locationDetails": locationResults,
            }
           // console.log("locationResults......", locationResults)
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
