let methods = {};
let queryExecution = require('../queryExecution');
methods.storeView = function (client, event, jsonObj, callback) {
    if (event.timeZone) {
        let num = event.timeZone.slice(1);
        let symbol = event.timeZone.toString(0)[0] == '-' ? '+' : '-'
        let hours = (num / 60);
        let rhours = Math.floor(hours);
        rhours = rhours.toString.length == 1 ? '0' + rhours : rhours
        let minutes = (hours - rhours) * 60;
        let rminutes = Math.round(minutes);
        event.timeZone = symbol + rhours + ':' + rminutes
        event.time = symbol + num
    }
    event.time = event.time ? event.time : '+330'
    event.timeZone = event.timeZone ? event.timeZone : '+05:30'
    let queryString = `
        INSERT INTO store_view (version, is_active, store_id, viewed_date)
        VALUES (0, true, ?, CONVERT_TZ(now(), '+00:00', ?));
        
        UPDATE store
        SET view_count = view_count + 1
        WHERE id = ?;
    `;
    let queryStringParams = [event.storeId, event.timeZone, event.storeId];

    console.log("queryString ", queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryStringParams, function (response) {
        console.log("response ", response)
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        const data = {
            success: "1",
            result: [],
            errorMessage: "",
            successMessage: "Success"
        };

        callback(data);
    });
}
module.exports = methods;
