const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    let saveRazorDetailsQuery = `
        INSERT INTO payment (
            amount, 
            amount_refunded, 
            contact, 
            created_at, 
            currency, 
            description, 
            email, 
            entity, 
            error_code, 
            error_description, 
            fee, 
            method, 
            paymentid, 
            refund_status, 
            service_tax, 
            status, 
            payment_gateways_id
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    let saveRazorDetailsParams = [
        event.amount,
        event.amount_refunded,
        event.contact,
        event.created_at,
        event.currency,
        event.description,
        event.email,
        event.entity,
        event.error_code,
        event.error_description,
        event.fee,
        event.method,
        event.id,
        event.refund_status,
        event.tax,
        event.status,
        1
    ];

    queryExecution.queryExecution(client, jsonObj, event, saveRazorDetailsQuery, saveRazorDetailsParams, function (response) {
        callback(response);
    });
}
module.exports = methods;
