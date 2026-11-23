const queryExecution = require('../queryExecution')
let methods = {};

methods.storeList = function (client, jsonObj, event, callback) {
    let subQry = ""
    let storeSearch = ""
    const removeQuotes = (str) => {
        return str.split("'").join('');
    };
    let params = []
    let storeParams = []
    if (event.cmbSelect == "storeName") {
        subQry = " and st.name like ? "
        params.push(removeQuotes("'" + event.txtInput + "%'"))
    }
    else if (event.cmbSelect == "sellerName") {
        subQry = " and sl.retail_group_name like ? "
        params.push(removeQuotes("'" + event.txtInput + "%'"))

    }
    else if (event.cmbSelect == "locality") {
        subQry = " and st.locality like ? "
        params.push(removeQuotes("'" + event.txtInput + "%'"))

    }
    if (event.searchKey) {
        storeSearch = " and s.name like ? "
        storeParams.push(removeQuotes("'" + event.txtInput + "%'"))

    }
    let dQuery = " select scgs.id " +
        " from site_category_group_stores as scgs " +
        " inner join store as st on scgs.store_id = st.id and st.is_active is true " +
        " inner join seller as sl on sl.id = st.seller_id and sl.is_active is true " +
        " inner join sec_user as su on st.sec_user_id = su.id " +
        " where scgs.site_category_group_id = ? and scgs.is_active is true " + subQry + "; " +

        " select scgs.id as siteCategoryGroupStoresId, scgs.site_category_group_id as siteCategoryGroupId, " +
        " st.id as storeId, st.name as storeName, sl.id as sellerId, sl.retail_group_name as sellerName, " +
        " su.email_id as emailId, su.mobile_number as mobileNumber, st.locality as locality " +
        " from site_category_group_stores as scgs " +
        " inner join store as st on scgs.store_id = st.id and st.is_active is true " +
        " inner join seller as sl on sl.id = st.seller_id and sl.is_active is true " +
        " inner join sec_user as su on st.sec_user_id = su.id " +
        " where scgs.site_category_group_id = ? and scgs.is_active is true " + subQry +
        " order by scgs.id desc " +
        " limit ?,?; " +

        " select s.id as storeId, s.name as storeName " +
        " from site_category_group_category as scgc " +
        " inner join store_main_category as smc on scgc.main_category_id = smc.main_category_id " +
        " inner join store as s on smc.store_id = s.id and s.is_active is true " +
        " inner join seller as sl on sl.id = s.seller_id and sl.is_active is true " +
        " where scgc.site_category_group_id = ?" +
        " and s.id not in ( " +
        " select store_id " +
        " from site_category_group_stores " +
        " where site_category_group_id = ?" +
        " ) " + storeSearch +
        " group by s.id " +
        " order by s.name "


      //console.log("dQuery.......",dQuery,event.siteCategoryGroupId, ...params, event.siteCategoryGroupId, parseInt(event.offset), parseInt(event.max), event.siteCategoryGroupId, event.siteCategoryGroupId, ...storeParams)          
    queryExecution.queryExecution(client, jsonObj, event, dQuery, [event.siteCategoryGroupId, ...params, event.siteCategoryGroupId, ...params, parseInt(event.offset), parseInt(event.max), event.siteCategoryGroupId, event.siteCategoryGroupId, ...storeParams], function (queryStringResult) {
       // console.log("queryStringResult...", queryStringResult)
       // console.log("queryStringResult...", queryStringResult)
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        if (results[1].length > 0 || results[2].length > 0) {
            const response = {
                success: "1",
                successMessage: results[1].length > 0 ? "Success." : "No data found.",
                result: {
                    storeData: results[1],
                    storeList: results[2],
                    count: results[0].length
                },
                errorMessage: ""
            }
            console.log("response....", response)
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

methods.addStore = function (client, jsonObj, event, callback) {
    let dQuery = " INSERT INTO site_category_group_stores " +
        " (version, is_active, site_category_group_id, store_id) " +
        " values " +
        " (0, true, ?, ?); " +

        " select lgt.location_id as id, lgt.city_id as cityId " +
        " from store as s " +
        " inner join location_group_type as lgt on s.id = lgt.store_id and lgt.is_active is true and lgt. store_id = ?" +
        " left join site_category_group_locations as scgl on scgl.location_id = lgt.location_id and scgl.site_category_group_id = ?" +
        " where s.is_active is true " +
        " and scgl.id is null " +
        " group by lgt.location_id " +
        " order by lgt.location_id; "
    console.log("dQuery ", dQuery)
    queryExecution.queryExecution(client, jsonObj, event, dQuery, [event.siteCategoryGroupId, event.storeId, event.storeId, event.siteCategoryGroupId], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result[1]
        if (results.length > 0) {
            let pushData = []
            let values = []
            for (let i = 0; i < results.length; i++) {
                pushData.push("(0, ?, true,?,?)")
                values.push(results[i].cityId, results[i].id, event.siteCategoryGroupId)
            }

            dQuery = " INSERT INTO site_category_group_locations " +
                " (version, city_id, is_active, location_id, site_category_group_id) " +
                " values " + pushData + ";"
            queryExecution.queryExecution(client, jsonObj, event, dQuery, [...values], function (queryStringResult) {
                queryStringResult.result = []
                callback(queryStringResult);
            })
        }
        else {
            const response = {
                success: "1",
                successMessage: "Success.",
                result: [],
                errorMessage: ""
            }
            callback(response)
        }
    })
}

methods.deleteStore = function (client, jsonObj, event, callback) {
    let dQuery = "delete from site_category_group_stores where store_id = ? and site_category_group_id = ?;"
    queryExecution.queryExecution(client, jsonObj, event, dQuery, [event.storeId, event.siteCategoryGroupId], function (queryStringResult) {
        queryStringResult.result = []
        callback(queryStringResult);
    })
}

module.exports = methods;