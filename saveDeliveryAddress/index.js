const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {

    let queryString = "";
    let queryStringParams = [];

    if (event.isDefaultAddress == 'true') {
        queryString = queryString + " UPDATE buyer_delivery_address SET is_default = false where buyer_id =  ?; "
        queryStringParams.push(event.buyerId);
    }
    if (event.buyerDeliveryAddressId != 0 && event.buyerDeliveryAddressId != '0' && event.buyerDeliveryAddressId != undefined) {
        console.log("if1...",event.buyerDeliveryAddressId)
        queryString = queryString + `
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
                is_default = ${event.isDefaultAddress}, 
                is_default_mobile = false, 
                latitude = ?, 
                longitude = ? 
            WHERE 
                id = ?;
            `;
        queryStringParams.push(
            event.name,
            event.address1,
            event.address2,
            event.zip,
            event.mobile,
            event.alternateno,
            event.buyerId,
            event.locationId,
            event.addressTitle,
            event.latitude,
            event.longitude,
            event.buyerDeliveryAddressId
        );
    } else {
        console.log("else2...",event.buyerDeliveryAddressId)
        queryString = queryString + `
            INSERT INTO buyer_delivery_address 
                (name, address1, address2, zip, telephone_number, alternate_number, buyer_id, location_id, title, is_active, version, is_default, is_default_mobile, latitude, longitude) 
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, true, 0, ${event.isDefaultAddress}, false, ?, ?);
            `;
        queryStringParams.push(
            event.name,
            event.address1,
            event.address2,
            event.zip,
            event.mobile,
            event.alternateno,
            event.buyerId,
            event.locationId,
            event.addressTitle,
            event.latitude,
            event.longitude
        );
    }

    if (event.billingSameAsShipping == false) {
        console.log("if...event.billingSameAsShipping==false1")
        queryString = queryString + `
            INSERT INTO buyer_billing_address 
                (first_name, address1, address2, zip, telephone_number, buyer_id, is_active, version, is_default, city_id, location_id) 
            VALUES 
                (?, ?, ?, ?, ?, ?, true, 0, 0, (SELECT city_id FROM location WHERE id = ?), ?);
            `;
        queryStringParams.push(
            event.billingName,
            event.billingAddress1,
            event.billingAddress2,
            event.billingZip,
            event.billingMobile,
            event.buyerId,
            event.billinglocationId,
            event.billinglocationId
        );
    }
    else {
        console.log("if...event.billingSameAsShipping==false2")
        queryString = queryString + `
            INSERT INTO buyer_billing_address 
                (first_name, address1, address2, zip, telephone_number, buyer_id, is_active, version, is_default, city_id, location_id) 
            VALUES 
                (?, ?, ?, ?, ?, ?, true, 0, 0, (SELECT city_id FROM location WHERE id = ?), ?);
            `;
        queryStringParams.push(
            event.name,
            event.address1,
            event.address2,
            event.zip,
            event.mobile,
            event.buyerId,
            event.locationId,
            event.locationId
        );
    }
    console.log(queryStringParams,'..queryString.....', queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryStringParams, function (response) {
        //  console.log("response...",response);
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        // console.log("results...",results);
        //if(results.insertId==0)
        let buyerBillingAddressId = ""
        let buyerDeliveryAddressId = ""
        if (event.isDefaultAddress == 'true') {
            console.log("results....if.....")
            buyerDeliveryAddressId = (results[1].insertId != 0) ? results[1].insertId : event.buyerDeliveryAddressId
            buyerBillingAddressId = (results[2].insertId != 0) ? results[2].insertId : ""
        }
        else {
            console.log("results....else.....")
            buyerDeliveryAddressId = (results[0].insertId != 0) ? results[0].insertId : event.buyerDeliveryAddressId
            buyerBillingAddressId = (results[1].insertId != 0) ? results[1].insertId : ""
        }
        let deliverySlotDetails = []


        if (results) {
            const response = {
                success: "1",
                result: {
                    buyerDeliveryAddressId: buyerDeliveryAddressId,
                    buyerBillingAddressId: buyerBillingAddressId
                },
                errorMessage: "",
                successMessage: "Success."
            };
            callback(response);
        } else {
            const response = {
                success: "0",
                result: {},
                errorMessage: "",
                successMessage: "Failed.",
            };
            callback(response);
        }

    });
}
module.exports = methods;
