const methods = {};
let queryExecution = require('../queryExecution');
methods.mappedAndUnMappedRestaurantItemsListing = function (client, jsonObj, event, callback) {
    let limitQry = ""
    let wQuery = ""
    let wQueryCount = ""
    let wQueryVal = []
    let wQueryCountVal = []
    let limitQryVal = []
    const removeQuotes = (str) => {
        return str.split("'").join('');
    };
    if (event.max) {
        limitQry = " limit ?,? "
        limitQryVal.push(parseInt(event.offset), parseInt(event.max))
    }
    if (event.searchType == "mapped") {
        wQuery = wQuery + " and rd.status='S' "
    }
    if (event.searchType == "unMapped") {
        wQuery = wQuery + " and rd.status='F' "
    }
    if (event.isActive) {
        if (event.isActive == "true") {
            wQuery = wQuery + " and rd.is_active=true "
            wQueryCount = wQueryCount + " and rd.is_active=true "
        }
        else if (event.isActive == "false") {
            wQuery = wQuery + " and rd.is_active=false "
            wQueryCount = wQueryCount + " and rd.is_active=false "
        }
    }
    if (event.storeId) {
        wQuery = wQuery + " and rd.store_id=? "
        wQueryCount = wQueryCount + " and rd.store_id=? "
        wQueryVal.push(event.storeId)
        wQueryCountVal.push(event.storeId)
    }
    if (event.searchInput) {
        wQuery = wQuery + " and (rd.item_name like ? OR rd.cuisine like ? OR rd.course  like ? OR rd.course_type  like ? )"
        wQueryCount = wQueryCount + " and (rd.item_name like ? OR rd.cuisine like ? OR rd.course  like ? OR rd.course_type  like ? )"
        wQueryVal.push(removeQuotes("'%" + event.searchInput + "%'", removeQuotes("'%" + event.searchInput + "%'"), removeQuotes("'%" + event.searchInput + "%'"), removeQuotes("'%" + event.searchInput + "%'")))
        wQueryCountVal.push(removeQuotes("'%" + event.searchInput + "%'", removeQuotes("'%" + event.searchInput + "%'"), removeQuotes("'%" + event.searchInput + "%'"), removeQuotes("'%" + event.searchInput + "%'")))
    }
    let mappedUnMappedItemsQuery = "select rd.id, rd.created_on, rd.created_by, rd.store_id as storeId, s.name as storeName,rd.cuisine, rd.item_name as itemName,rd. pack_size as packSize,rd. price," +
        " rd.course_type as courseType, rd.course, if(rd.is_active is true,true,false) as isActive, rd.status," +
        " rd.error_msg, rd.gravy_or_dry, rd.description from " +
        " rt_store_item_bulk_upload_data as rd " +
        " inner join store as s on s.id=rd.store_id " +
        " where rd.id!='' " + wQuery + limitQry + ""
    let unMappedItemsCountQuery = " select count(*) as totalCount from rt_store_item_bulk_upload_data as rd " +
        " inner join store as s on s.id=rd.store_id where  status='F' " + wQueryCount
    let mappedItemsCountQuery = " select count(*) as totalCount from rt_store_item_bulk_upload_data as rd " +
        " inner join store as s on s.id=rd.store_id where  status='S' " + wQueryCount

    let mappedUnMappedItemsFinalQuery = mappedUnMappedItemsQuery + ";" + unMappedItemsCountQuery + ";" + mappedItemsCountQuery;
    console.log(mappedUnMappedItemsFinalQuery);
    let val = [...wQueryVal, ...limitQryVal, ...wQueryCountVal, ...wQueryCountVal]

    queryExecution.queryExecution(client, jsonObj, event, mappedUnMappedItemsFinalQuery, val, function (mappedUnMappedItemsFinalQueryResult) {
        if (mappedUnMappedItemsFinalQueryResult.success == '0') {
            callback(mappedUnMappedItemsFinalQueryResult);
        }
        let results = mappedUnMappedItemsFinalQueryResult.result
        if (results[0].length > 0) {
            let itemsResult = {
                itemsResult: results[0],
                mappedItemsCount: results[2][0].totalCount,
                unMappedItemsCount: results[1][0].totalCount,

            }
            const response = {
                success: "1",
                successMessage: "Success.",
                result: itemsResult,
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: {},
                errorMessage: "No Data Found"
            }
            callback(response)
        }




    })
}
module.exports = methods;