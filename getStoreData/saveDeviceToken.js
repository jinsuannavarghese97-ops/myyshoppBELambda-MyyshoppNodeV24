var mysql = require('mysql');
var methods = {};
let queryExecution = require('../queryExecution');
methods.saveDeviceToken = function (client, jsonObj, event, callback) {
    var pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
    });
    pool.getConnection(function (err, connection) {
        if (err) {
            const response = {
                "success": "0",
                "successMessage": "",
                "errorMessage": "Something went wrong1."
            }
            callback(response);
        }
        else {
            var bundleId = jsonObj.bundleId
            var deviceId = jsonObj.deviceId
            var notificationTypeId = jsonObj.notificationTypeId
            var userId = jsonObj.userId
            var deviceTypeId = jsonObj.deviceTypeId
            var deviceToken = jsonObj.deviceToken
            var saveDeviceQuery
            let response
            var appDetailQuery = " select app.id as appDetailsId from app_details as app " +
                " where app.bundle_id= ?";
            connection.query(appDetailQuery, [bundleId], function (errorAppDetails, appDetailResults, fields) {
                if (errorAppDetails) {
                    const response = {
                        "success": "0",
                        "successMessage": "",
                        "errorMessage": "Something went wrong."
                    }
                    callback(response);
                }
                else if (appDetailResults.length != 0) {
                    var existQry = `
                        SELECT id, IF(is_active = true, 'true', 'false') AS is_active
                        FROM app_user_device
                        WHERE app_device_type_id = ?
                        AND app_notification_type_id = ?
                        AND device_id = ?
                        AND device_token = ?
                        AND user_id = ?
                        AND app_details_id = ?;
                    `;
                    var existQryParams = [deviceTypeId, notificationTypeId, deviceId, deviceToken, userId, appDetailResults[0].appDetailsId];

                    connection.query(existQry, existQryParams, function (errorExist, deviceExist, fields) {
                        if (errorExist) {
                            const response = {
                                "success": "0",
                                "successMessage": "",
                                "errorMessage": "Something went wrong."
                            }
                            callback(response);
                        }
                        else if (deviceExist.length > 0) {
                            if (deviceExist[0].is_active == 'true') {
                                const response = {
                                    "success": "1",
                                    "successMessage": "Already exists.",
                                    "errorMessage": ""
                                }
                                callback(response);
                            }
                            else if (deviceExist[0].is_active == 'false') {
                                saveDeviceQuery = " UPDATE app_user_device set is_active = true where id = ? ;"
                                console.log(saveDeviceQuery, " saveDeviceQuery")
                                connection.query(saveDeviceQuery, [deviceExist[0].id], function (errorUpdate, saveDeviceResults, fields) {
                                    connection.release();
                                    console.log(errorUpdate, " errorUpdate")
                                    if (errorUpdate) {
                                        const response = {
                                            "success": "0",
                                            "successMessage": "",
                                            "errorMessage": "Something went wrong."
                                        }
                                        callback(response);
                                    }
                                    else if (saveDeviceResults) {
                                        const response = {
                                            "success": "1",
                                            "successMessage": "Updated successfully.",
                                            "errorMessage": ""
                                        }
                                        callback(response);
                                    }

                                })
                            }
                        }
                        else if (deviceExist.length == 0) {
                            var saveDeviceQuery = `
                                INSERT INTO app_user_device
                                (version, bundle_id, device_id, app_notification_type_id, user_id, app_device_type_id, device_token, app_details_id, is_active)
                                VALUES (0, ?, ?, ?, ?, ?, ?, ?, 1);
                            `;
                            var saveDeviceQueryParams = [bundleId, deviceId, notificationTypeId, userId, deviceTypeId, deviceToken, appDetailResults[0].appDetailsId];

                            console.log("saveDeviceQuery...." + saveDeviceQuery)
                            connection.query(saveDeviceQuery, saveDeviceQueryParams, function (errorSave, saveDeviceResults, fields) {
                                connection.release();
                                if (errorSave) {
                                    const response = {
                                        "success": "0",
                                        "successMessage": "",
                                        "errorMessage": "Something went wrong."
                                    }
                                    callback(response);
                                }
                                else if (saveDeviceResults) {
                                    const response = {
                                        "success": "1",
                                        "successMessage": "Saved successfully.",
                                        "errorMessage": ""
                                    }
                                    callback(response);
                                }
                            })
                        }
                    })
                }
                else {
                    const response = {
                        "success": "0",
                        "successMessage": "",
                        "errorMessage": "Something went wrong."
                    }
                    callback(response);

                }

            })

        }
    })

}
module.exports = methods;