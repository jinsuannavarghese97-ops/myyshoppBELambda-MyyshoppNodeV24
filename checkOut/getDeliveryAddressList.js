//params: buyerId

const queryExecution = require('../queryExecution')
let methods = {};

methods.getDeliveryAddressList = function (client, jsonObj, event, callback) {

    let andQry = ""
    let andQryValues = []
    andQryValues.push(event.buyerId)
    if (event.buyerDeliveryAddressId) {
        andQry = andQry + " and bda.id =?"
        andQryValues.push(event.buyerDeliveryAddressId)
    }
    if (event.locationId) {
        andQry = andQry + " and bda.location_id =?"
        andQryValues.push(event.locationId)
    }
    let queryString = " select s.display_name as buyerName,bda.alternate_number as altNum,bda.id as buyerDelId,s.email_id as email,bda.name as name,bda.address1 as address1,bda.address2 as address2,c.id as cityId, " +
        " bda.telephone_number as telephoneNumber,bda.title as title,l.id as locationId,l.name AS location,bda.zip as zip,c.name as city, " +
        " st.id as stateId,if(bda.is_default is true,'1','0') as isDefaultAddress, st.name as stateName,bda.latitude as latitude,bda.longitude as longitude " +
        " from buyer_delivery_address as bda " +
        " inner join buyer as b on b.id = bda.buyer_id" +
        " inner join  sec_user as s on s.id = bda.buyer_id " +
        " INNER JOIN location l ON bda.location_id = l.id " +
        " INNER JOIN city c ON l.city_id = c.id AND c.is_active = true " +
        " INNER JOIN state st  ON st.id = c.state_id and st.is_active = TRUE" +
        " where bda.buyer_id= ?" +
        " AND bda.is_active = true " +
        " AND l.is_approved = true " +
        " AND l.is_active = true " + andQry +
        " order by bda.is_default desc "

    queryExecution.queryExecution(client, jsonObj, event, queryString, andQryValues, function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        let deliveryAddressList = []

        for (let i = 0; i < results.length; i++) {
            let deliveryAddress = []
            deliveryAddress = {
                buyerId: event.buyerId,
                buyerName: results[i].buyerName,
                isDefaultAddress: (results[i].isDefaultAddress != null ? results[i].isDefaultAddress : '0'),
                email: (results[i].email != null ? results[i].email : ''),
                buyerDeliveryAddressId: results[i].buyerDelId,
                address1: (results[i].address1 == null) ? '' : results[i].address1,
                address2: (results[i].address2 == null) ? '' : results[i].address2,
                cityName: (results[i].city == null) ? '' : results[i].city,
                stateName: (results[i].stateName == null) ? '' : results[i].stateName,
                locationName: (results[i].location == null) ? '' : results[i].location,
                name: (results[i].name == null) ? '' : results[i].name,
                telephoneNumber: (results[i].telephoneNumber == null) ? '' : results[i].telephoneNumber,
                title: (results[i].title == null) ? '' : results[i].title,
                zip: (results[i].zip == null) ? '' : results[i].zip,
                cityId: (results[i].cityId == null) ? '' : results[i].cityId,
                stateId: (results[i].stateId == null) ? '' : results[i].stateId,
                locationId: (results[i].locationId == null) ? '' : results[i].locationId,
                altNum: (results[i].altNum == null) ? '' : results[i].altNum,
                latitude: (results[i].latitude == null) ? '' : results[i].latitude,
                longitude: (results[i].longitude == null) ? '' : results[i].longitude
            }
            deliveryAddressList.push(deliveryAddress)

        }
        var resultData = {
            deliveryAddressList: deliveryAddressList
        }
        const response = {
            success: '1',
            result: resultData,
            successMessage: deliveryAddressList.length > 0 ? "Success" : "No data found.",
            errorMessage: ""
        }
        callback(response);
    });
};
module.exports = methods;