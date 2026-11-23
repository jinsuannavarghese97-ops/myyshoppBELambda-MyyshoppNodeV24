const queryExecution = require('../queryExecution')
let methods = {};

methods.addLocation = function (client, jsonObj, event, callback) {
    let dQuery = " INSERT INTO site_category_group_locations " +
        " (version, city_id, is_active, location_id, site_category_group_id) " +
        " values " +
        " (0, ?, true, ?, ?); "
    queryExecution.queryExecution(client, jsonObj, event, dQuery, [event.cityId, event.locationId, event.siteCategoryGroupId], function (queryStringResult) {
        queryStringResult.result = []
        callback(queryStringResult);
    })
}

methods.deleteLocation = function (client, jsonObj, event, callback) {
    let dQuery = "delete from site_category_group_locations where location_id = ? and site_category_group_id =?;"
    queryExecution.queryExecution(client, jsonObj, event, dQuery, [event.locationId, event.siteCategoryGroupId], function (queryStringResult) {
        queryStringResult.result = []
        callback(queryStringResult);
    })
}


methods.locationStores = function (client, jsonObj, event, callback) {
    let dQuery = " select group_concat(s.name) as storeNames " +
        " from site_category_group as scg " +
        " inner join site_category_group_locations as scgl on scgl.site_category_group_id = scg.id and scgl.location_id = ? and scgl.site_category_group_id = ? and scgl.is_active is true " +
        " inner join site_category_group_stores as scgs on scgs.site_category_group_id = scg.id and scgl.site_category_group_id = ? and scgs.is_active is true " +
        " inner join store as s on scgs.store_id = s.id and s.is_active is true " +
        "inner join location_group_type as lgt on s.id = lgt.store_id and lgt.is_active is true and lgt.location_id = ? "
    /*" where scgs.store_id in ( "+
    " select s.id "+
    " from site_category_group_stores as scgs "+
    " inner join store as s on scgs.store_id = s.id and s.is_active is true "+
    " inner join location_group_type as lgt on s.id = lgt.store_id and lgt.is_active is true and lgt.location_id = "+event.locationId+
    " where s.is_active is true and scgs.site_category_group_id = "+event.siteCategoryGroupId+
    " group by lgt.location_id "+
    " ); "*/
    queryExecution.queryExecution(client, jsonObj, event, dQuery, [event.locationId, event.siteCategoryGroupId, event.siteCategoryGroupId, event.locationId], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        if (results.length > 0) {
            const response = {
                success: "1",
                successMessage: "Success.",
                result: [{
                    storeList: results[0].storeNames,
                    storeCount: results[0].storeNames.split(',').length
                }],
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "1",
                successMessage: "No stores in this location.",
                result: [{
                    storeList: [],
                    storeCount: 0
                }],
                errorMessage: ""
            }
            callback(response)
        }
    })
}


methods.locationDetails = function (client, jsonObj, event, callback) {
    let searchQry = ""
    let val = []
    const removeQuotes = (str) => {
        return str.split("'").join('');
    };
    if (event.searchKeyword) {
        searchQry = " and l.name like ?"
        val.push(removeQuotes("'" + event.searchKeyword + "%'"))
    }
    let dQuery = " SELECT count(*) as count " +
        " FROM site_category_group as scg " +
        " INNER JOIN site_category_group_locations as scgl on scg.id = scgl.site_category_group_id and scgl.site_category_group_id = ?" +
        " INNER JOIN location as l on scgl.location_id = l.id and l.is_active is true and l.is_approved is true " + searchQry +
        " INNER JOIN city as c on l.city_id = c.id and c.is_active is true and c.is_approved is true " +
        " INNER JOIN state as s on c.state_id = s.id and s.is_active is true " +
        " INNER JOIN country as cn on cn.id = s.country_id and cn.is_active is true " +
        " ORDER BY scgl.id desc; " +

        " SELECT l.id as locationId,l.pin_code, l.name as location, c.id as cityId, c.name as cityName, s.id as stateId, s.name as stateName " +
        " FROM site_category_group as scg " +
        " INNER JOIN site_category_group_locations as scgl on scg.id = scgl.site_category_group_id and scgl.site_category_group_id = ?" +
        " INNER JOIN location as l on scgl.location_id = l.id and l.is_active is true and l.is_approved is true " + searchQry +
        " INNER JOIN city as c on l.city_id = c.id and c.is_active is true and c.is_approved is true " +
        " INNER JOIN state as s on c.state_id = s.id and s.is_active is true " +
        " INNER JOIN country as cn on cn.id = s.country_id and cn.is_active is true " +
        " ORDER BY scgl.id desc " +
        " limit ?,?;"



    queryExecution.queryExecution(client, jsonObj, event, dQuery, [event.siteCategoryGroupId, ...val, event.siteCategoryGroupId, ...val, parseInt(event.offset), parseInt(event.max)], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        if (results.length > 0) {
            const response = {
                success: "1",
                successMessage: results[0][0].count > 0 ? "Success." : "No Locations Found.",
                result: [{
                    locationList: results[1],
                    locationCount: results[0][0].count
                }],
                errorMessage: ""
            }
            callback(response)
        }
    })
}

module.exports = methods;