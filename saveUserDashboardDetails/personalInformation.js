let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.personalInformation = function (client, jsonObj, event, callback) {
    let numberOfkids = (jsonObj.numberOfkids == '' || jsonObj.numberOfkids == null) ? 0 : jsonObj.numberOfkids
    let queryString = "";
    let queryStringParams = [];
    if (jsonObj.userId != 0 && jsonObj.userId != '0' && jsonObj.userId != undefined) {
        queryString = `
            UPDATE buyer 
            SET 
                first_name = ?, 
                last_name = ?, 
                gender = ?, 
                is_married = ? 
            WHERE 
                id = ?;
            
            UPDATE sec_user 
            SET 
                display_name = ? 
            WHERE 
                id = ?;
            `;

        queryStringParams = [
            jsonObj.firstName,
            jsonObj.lastName,
            jsonObj.gender,
            jsonObj.married,
            jsonObj.userId,
            jsonObj.firstName + " " + jsonObj.lastName,
            jsonObj.userId
        ];

    }
    // else{
    // queryString = "INSERT INTO kids (version,buyer_id,date_of_birth,gender,is_active,name) values (0,"+event.userId+",'"+event.kidsbirth+"',"+event.kidsgender+",true,'"+event.kidsName+"')"
    // }
    // connection.query(queryString, function (error, results, fields) {
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryStringParams, function (response) {
        callback(response);
    });
}
module.exports = methods;
