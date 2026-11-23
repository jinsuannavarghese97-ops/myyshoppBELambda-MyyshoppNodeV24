const queryExecution = require('../queryExecution')
let methods = {};

methods.getDeliverySlot = function (client, jsonObj, event, callback) {
    let resultData
    let storeGroupDeleryDetails = []
    let storeSellerDeleryDetails = []
    let storeId = event.storeId
    let locationId = event.locationId
    let queryString = "select s.name as storeName,gtds.delivery_slot as deliverySlot, " +
        " gt.minimum_order_value as minimumOrderValue, gt.delivery_charges as deliveryCharges, " +
        " gt.will_not_deliver as willNotDeliver, " +
        " gt.express_delivery_charge as expressDeliveryCharge, " +
        " if(gt.is_express_delivery is true,'1','0') as isExpressDelivery, " +
        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
        " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT  config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/', " +
        " if(s.logo_path is null,'default.jpg',s.logo_path)) AS image_path " +
        " from group_type as gt  " +
        " inner join location_group_type as lgt on lgt.group_type_id=gt.id  " +
        " inner join group_type_delivery_slot as gtds on gtds.group_type_id=gt.id  " +
        " inner join store as s on lgt.store_id=s.id " +
        " where gt.is_active=true and lgt.is_active=true and gtds.is_active=true  " +
        " and gt.is_approved=true and lgt.store_id=? and  " +
        " lgt.location_id = ?"
    //console.log("queryString..........",queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString, [storeId, locationId], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        if (results.length == '0') {
            let queryString2 = " SELECT st.name as storeName,s.delivery_charges as deliveryCharges, s.delivery_slot1 as deliverySlot,  s.minimum_order_value as minimumOrderValue ,s.will_not_deliver as willNotDeliver, s.express_delivery_charge as expressDeliveryCharge, s.has_express_delivery as isExpressDelivery " +
                " ,CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', " +
                " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
                " (SELECT  config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/', " +
                " if(st.image_path is null,'default.jpg',st.image_path)) AS image_path " +
                " from seller as s  " +
                " inner join store as st on st.seller_id = s.id  " +
                " where st.id =?"
            queryExecution.queryExecution(client, jsonObj, event, queryString, [storeId], function (queryString2Result) {
                if (queryStringResult.success == '0') {
                    callback(queryStringResult);
                }
                let results2 = queryString2Result.result
                for (let i = 0; i < results2.length; i++) {
                    storeSellerDeleryDetails[i] = {
                        storeId: storeId,
                        storeName: results2[i].storeName,
                        deliverySlot: results2[i].deliverySlot,
                        imagePath: results[i].image_path,
                        minimumOrderValue: results2[i].minimumOrderValue == null ? 0 : results2[i].minimumOrderValue,
                        deliveryCharges: results2[i].deliveryCharges == null ? 0 : results2[i].deliveryCharges,
                        //groupTypeId: results[i].groupTypeId,
                        willNotDeliver: results2[i].willNotDeliver,
                        expressDeliveryCharge: results2[i].expressDeliveryCharge == null ? 0 : results2[i].expressDeliveryCharge,
                        isExpressDelivery: results2[i].isExpressDelivery,
                        from: "seller"
                    }
                }

                const response = {
                    success: '1',
                    successMessage: results.length > 0 ? "Success" : "No data found.",
                    storeSellerDeleryDetails: storeSellerDeleryDetails,
                    errorMessage: ""
                }
                callback(response);


                //callback(callback(storeSellerDeleryDetails)
            });
        }
        else {
            for (let i = 0; i < results.length; i++) {
                storeGroupDeleryDetails[i] = {
                    storeId: storeId,
                    storeName: results[i].storeName,
                    deliverySlot: results[i].deliverySlot,
                    imagePath: results[i].image_path,
                    minimumOrderValue: results[i].minimumOrderValue == null ? 0 : results[i].minimumOrderValue,
                    deliveryCharges: results[i].deliveryCharges == null ? 0 : results[i].deliveryCharges,
                    //groupTypeId: results[i].groupTypeId,
                    willNotDeliver: results[i].willNotDeliver,
                    expressDeliveryCharge: results[i].expressDeliveryCharge == null ? 0 : results[i].expressDeliveryCharge,
                    isExpressDelivery: results[i].isExpressDelivery,
                    from: "groupType"
                }
            }

            const response = {
                success: '1',
                successMessage: storeGroupDeleryDetails.length > 0 ? "Success" : "No data found.",
                storeGroupDeleryDetails: storeGroupDeleryDetails,
                errorMessage: ""
            }
            callback(response);
        }
    })
}
module.exports = methods;
