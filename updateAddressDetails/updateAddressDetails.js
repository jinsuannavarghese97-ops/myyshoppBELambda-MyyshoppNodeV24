const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    console.log("....innnnnnnn")
    let name = event.name
    let address1 = event.address1
    let address2 = event.address2
    let zip = event.zip
    let mobile = event.mobile
    let alternateno = event.alternateno
    let buyerId = event.buyerId
    let locationId = event.locationId
    let addressTitle = event.addressTitle
    let buyerDeliveryAddressId = event.buyerDeliveryAddressId
    let updateAddressQuery;
    let updateAddressParams = [];

    if (event.buyerDeliveryAddressId != 0 && event.buyerDeliveryAddressId != '0' && event.buyerDeliveryAddressId != undefined) {
        updateAddressQuery = `
            UPDATE buyer_delivery_address 
            SET 
                name = ?, 
                address1 = ?, 
                address2 = ?, 
                zip = ?, 
                telephone_number = ?, 
                alternate_number = ?, 
                buyer_id = ?, 
                location_id = ?, 
                title = ?, 
                is_active = true, 
                version = 0, 
                is_default = false, 
                is_default_mobile = false 
            WHERE 
                id = ?
        `;

        updateAddressParams = [
            event.name,
            event.address1,
            event.address2,
            event.zip,
            event.mobile,
            event.alternateno,
            event.buyerId,
            event.locationId,
            event.addressTitle,
            event.buyerDeliveryAddressId
        ];

    }
    else {
        updateAddressQuery = `
            INSERT INTO buyer_delivery_address 
            (
                name, 
                address1, 
                address2, 
                zip, 
                telephone_number, 
                alternate_number, 
                buyer_id, 
                location_id, 
                title, 
                is_active, 
                version, 
                is_default, 
                is_default_mobile
            ) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, true, 0, false, false)
        `;

        updateAddressParams = [
            event.name,
            event.address1,
            event.address2,
            event.zip,
            event.mobile,
            event.alternateno,
            event.buyerId,
            event.locationId,
            event.addressTitle
        ];

    }
    console.log("..updateAddressQuery....",updateAddressQuery,updateAddressParams)
    queryExecution.queryExecution(client, jsonObj, event, updateAddressQuery, updateAddressParams, function (response) {
         console.log("..response....",response)
        callback(response);
    });
}
module.exports = methods;
