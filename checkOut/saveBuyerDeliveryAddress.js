const queryExecution = require('../queryExecution')
let methods = {};

methods.saveBuyerDeliveryAddress = function (client, jsonObj, event, callback) {


    let name = event.name
    let address1 = event.address1
    let address2 = event.address2
    let zip = event.zip
    let mobile = event.mobile
    let alternateno = event.alternateno
    let locationId = event.locationId
    let addressTitle = event.addressTitle
    let buyerDeliveryAddressId = event.buyerDeliveryAddressId
    let buyerId = event.buyerId
    let isDefaultAddress = event.isDefaultAddress
    let queryString
    let defaultUpdate = ""
    let defaultUpdateValues = []
    if (isDefaultAddress == '1') {
        defaultUpdate = " update buyer_delivery_address set is_default = false where buyer_id =? and location_id = ?;"
        defaultUpdateValues.push(event.buyerId, locationId)
    }
    if (buyerDeliveryAddressId != 0 && buyerDeliveryAddressId != '0' && buyerDeliveryAddressId != undefined) {
        queryString = "UPDATE buyer_delivery_address SET name=?,address1=?,address2=?,zip=?,telephone_number=?,alternate_number=?,buyer_id=?,location_id=?,title=?,is_active=true,version=0,is_default=" + isDefaultAddress + ",is_default_mobile=false WHERE id = ?; "
        defaultUpdateValues.push(name, address1, address2, zip, mobile, alternateno, buyerId, locationId, addressTitle, buyerDeliveryAddressId)
    }
    else {
        queryString = "INSERT INTO buyer_delivery_address (name,address1,address2,zip,telephone_number,alternate_number,buyer_id,location_id,title,is_active,version,is_default,is_default_mobile) values " +
            " (?,?,?,?,?,?,?,?,?,true,0," + isDefaultAddress + ",false); "
        defaultUpdateValues.push(name, address1, address2, zip, mobile, alternateno, buyerId, locationId, addressTitle)
    }
    queryString = queryString + defaultUpdate
    queryExecution.queryExecution(client, jsonObj, event, queryString, defaultUpdateValues, function (response) {
        callback(response)
    });

}
module.exports = methods;