const queryExecution = require('../queryExecution')
let methods = {};

methods.getCmDeliverySlot = function (client, jsonObj, event, callback) {

    let storeId = event.storeId
    let queryString = " SELECT gt.id as groupTypeId,gt.cm_delivers_in_to_days as cm_delivers_in_to_days,gt.cm_delivers_in_from_days as cm_delivers_in_from_days,gt.`delivery_slot1` AS slot1,lgt.store_id AS storeId, " +
        " DATE_FORMAT(DATE_ADD(CURDATE(),INTERVAL gt.cm_delivers_in_from_days DAY),'%d-%b-%Y') AS fromDate " +
        " ,DATE_FORMAT(DATE_ADD(CURDATE(),INTERVAL gt.cm_delivers_in_to_days DAY),'%d-%b-%Y') AS toDate " +
        " FROM `location_group_type` AS lgt " +
        " INNER JOIN `group_type` AS gt ON gt.id = lgt.`group_type_id` " +
        " WHERE lgt.store_id =? and lgt.location_id =? group by lgt.store_id;"

    queryExecution.queryExecution(client, jsonObj, event, queryString, [storeId, event.locationId], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        if (results.length > 0) {
            let slots = []
            for (let i = 0; i < results.length; i++) {
                let deliverySlot = (results[i].cm_delivers_in_to_days == results[i].cm_delivers_in_from_days) ? "Delivers on " + results[i].toDate : "Delivers between " + results[i].fromDate + " and " + results[i].toDate
                let deliverySlotShow = (results[i].cm_delivers_in_to_days == results[i].cm_delivers_in_from_days) ? "Delivers on " + results[i].toDate + "(" + results[i].cm_delivers_in_to_days + " days)" : "Delivers between " + results[i].fromDate + " and " + results[i].toDate + "(" + results[i].cm_delivers_in_from_days + " to " + results[i].cm_delivers_in_to_days + " days)"
                const deliveryData = {
                    groupTypeId: results[i].groupTypeId,
                    storeId: results[i].storeId,
                    cm_delivers_in_to_days: results[i].cm_delivers_in_to_days,
                    cm_delivers_in_from_days: results[i].cm_delivers_in_from_days,
                    slot1: results[i].slot1,
                    fromDate: results[i].fromDate,
                    toDate: results[i].toDate,
                    deliverySlotShow: deliverySlotShow,
                    deliverySlot: deliverySlot
                }
                slots.push(deliveryData)
            }
            const data = {
                success: "1",
                slots: slots,
                errorMessage: "",
                successMessage: "Success."
            };
            callback(data);
        }
        else {
            const data = {
                success: "1",
                errorMessage: "",
                successMessage: "No data found."
            };
            callback(data);
        }

    })
}
module.exports = methods;
