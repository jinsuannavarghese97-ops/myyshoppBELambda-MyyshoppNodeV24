var mysql = require('mysql');
var methods = {};
methods.unsuscribePush = function (jsonObj, callback) {
    var pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
    });
    pool.getConnection(function (err, connection) {

        var bundleId = jsonObj.bundleId
        var deviceId = jsonObj.deviceId
        var notificationTypeId = jsonObj.notificationTypeId
        var userId = jsonObj.userId
        var deviceTypeId = jsonObj.deviceTypeId
        var deviceToken = jsonObj.deviceToken
        var saveDeviceQuery
        let response
        var appDetailQuery = `
            UPDATE app_user_details
            SET is_active = false
            WHERE app_device_type_id = ?
            AND app_notification_type_id = ?
            AND device_id = ?
            AND device_token = ?
            AND user_id = ?
            AND bundle_id = ?;
        `;
        var appDetailQueryParams = [deviceTypeId, notificationTypeId, deviceId, deviceToken, userId, bundleId];

        connection.query(appDetailQuery, appDetailQueryParams, function (errorAppDetails, appDetailResults, fields) {
            if (errorAppDetails) {
                const response = {
                    "success": "0",
                    "successMessage": "",
                    "errorMessage": "Something went wrong."
                }
                callback(response)
            }
            else {
                const response = {
                    "success": "1",
                    "successMessage": "Unsuscribed successfuly",
                    "errorMessage": ""
                }
                callback(response)
            }
        })


    })

}
module.exports = methods;