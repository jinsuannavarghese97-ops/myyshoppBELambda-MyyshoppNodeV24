const queryExecution = require('../queryExecution')
let methods = {};


methods.statusChangeAdmin = function (client, jsonObj, event, callback) {
    let status = (event.status == 'true') ? 1 : 0
    let dbName
    switch (event.type) {

        case "siteCategoryGroup":
            dbName = "site_category_group"
            break;

        case "banner":
            dbName = "site_category_group_banner"
            break;
        default:
    }
    let dQuery = " update "+dbName+" set is_active = ? where id =?; "
    let val = [status, event.ids]
    queryExecution.queryExecution(client, jsonObj, event, dQuery, val, function (queryStringResult) {
        queryStringResult.result = queryStringResult.result ? [] : []
        callback(queryStringResult);
    })
}

methods.categoryList = function (client, jsonObj, event, callback) {
    let dQuery = " select id,name " +
        " from main_category " +
        " where is_active is true " +//and name like '"+event.txtInput+"%'"
        " order by name "

    queryExecution.queryExecution(client, jsonObj, event, dQuery, [], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        if (results.length > 0) {
            const response = {
                success: "1",
                successMessage: "Success.",
                result: results,
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: [],
                errorMessage: "No data found."
            }
            callback(response)
        }
    })
}

methods.locationList = function (client, jsonObj, event, callback) {
    let isCity = "0", isLocation = "0"
    event.countryId = event.countryId ? event.countryId : "1"
    let dQuery = " select id,name " +
        " from state " +
        " where is_active is true and country_id = ?";
    let dQueryParams = [event.countryId];
    if (event.stateId) {
        dQuery = dQuery + " and id = ?";
        dQueryParams.push(event.stateId);
    }
    dQuery = dQuery + " order by name; "

    if (event.stateId) {
        isCity = "1"
        dQuery = dQuery + " select id,name " +
            " from city " +
            " where is_active is true and state_id = ?";
        dQueryParams.push(event.stateId);
        if (event.cityId) {
            dQuery = dQuery + " and id = ?";
            dQueryParams.push(event.cityId);
        }
        dQuery = dQuery + " order by name; "

    }
    if (event.cityId) {
        isLocation = "1"
        let locationSearch = "";
        let locationSearchParams = [];
        if (event.txtInput) {
            locationSearch = " and (l.name like ? OR l.pin_code like ?) ";
            locationSearchParams.push(event.txtInput + "%", "%" + event.txtInput + "%");
        }
        dQuery = dQuery + " select lgt.location_id as id, l.name as name, if(scgl.id is null,'0','1') as locationExist " +
            " from store as s " +
            " inner join location_group_type as lgt on s.id = lgt.store_id and lgt.is_active is true and lgt. store_id in ( " +
            " select store_id from site_category_group_stores where site_category_group_id = ? " +
            " ) " +
            " inner join location as l on lgt.location_id = l.id and l.is_active is true and l.is_approved is true and l.city_id = ? " + locationSearch +
            " left join site_category_group_locations as scgl on scgl.location_id = l.id and scgl.site_category_group_id = ? " +
            " where s.is_active is true " +
            " group by l.id " +
            " order by l.name; ";
        dQueryParams.push(event.siteCategoryGroupId, event.cityId, ...locationSearchParams, event.siteCategoryGroupId);

    }
    //console.log("dQuery....", dQuery,dQueryParams)
    queryExecution.queryExecution(client, jsonObj, event, dQuery, dQueryParams, function (queryStringResult) {
         //console.log("queryStringResult....",queryStringResult)
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        //  console.log("results....",results)
        if (results.length > 0) {
            const response = {
                success: "1",
                successMessage: "Success.",
                result: {
                    locationList: isLocation == "1" ? results[2] : [],
                    city: isCity == "1" ? results[1] : [],
                    state: isCity == "1" ? results[0] : results
                },
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: [],
                errorMessage: "No data found."
            }
            callback(response)
        }
    })
}


methods.deleteCategory = function (client, jsonObj, event, callback) {

    let dQuery = " delete from site_category_group_stores where id in ( select scgs.id " +
        " from site_category_group as scg " +
        " inner join site_category_group_category as scgc on scgc.site_category_group_id = scg.id and scgc.site_category_group_id = ? and scgc.id = ?" +
        " inner join store_main_category as smc on smc.main_category_id = scgc.main_category_id " +
        " inner join site_category_group_stores as scgs on scgs.store_id = smc.store_id); " +

        " delete from site_category_group_category where id = ?; "
    let val = [event.siteCategoryGroupCategoryId, event.siteCategoryGroupId, event.siteCategoryGroupCategoryId]
    queryExecution.queryExecution(client, jsonObj, event, dQuery, val, function (queryStringResult) {
        queryStringResult.result = queryStringResult.result ? [] : []
        callback(queryStringResult);
    })
}

methods.addCategory = function (client, jsonObj, event, callback) {
    let dQuery = "INSERT INTO site_category_group_category " +
        " (version, main_category_id, site_category_group_id) " +
        " values " +
        "(0, ?, ?);"
    let val = [event.mainCategoryId, event.siteCategoryGroupId]
    queryExecution.queryExecution(client, jsonObj, event, dQuery, val, function (queryStringResult) {
        queryStringResult.result = queryStringResult.result ? [] : []
        callback(queryStringResult);
    })
}


module.exports = methods;