let queryExecution = require('../queryExecution');
let methods = {};

methods.saveSetPermission = function (client, jsonObj, event, callback) {
    let userType = "";
    let idCol = "";
    let userTypeId = 0;

    if (jsonObj.store_id) {
        userType = "store";
        idCol = "store_id";
        userTypeId = jsonObj.store_id;
    }
    else if (!jsonObj.store_id && jsonObj.seller_id) {
        userType = "seller";
        idCol = "seller_id";
        userTypeId = jsonObj.seller_id;
    }
    else if (!jsonObj.store_id && !jsonObj.seller_id && jsonObj.site_id) {
        userType = "site";
        idCol = "site_id";
        userTypeId = jsonObj.site_id;
    }
    else {
        const response = {
            success: "0",
            successMessage: "",
            errorMessage: "Something went wrong.",
            errorType: "Store/Seller/Site id is required"
        }
        callback(response);
    }
    console.log("user: ", userType);

    try {
        jsonObj.topMenuMainDetails.forEach(menu => {
            var topMenuCheckQry = `SELECT id FROM ${userType}_top_menu_main where ${idCol} = ? and top_menu_main_id = ?`;
            queryExecution.queryExecution(client, jsonObj, event, topMenuCheckQry, [userTypeId, menu.topMenuMainId], async function (response) {
                if (response.result.length == 0) {
                    var topMenuMainInsertQry = `INSERT INTO ${userType}_top_menu_main ` +
                        `(${idCol}, top_menu_main_id, is_active) ` +
                        `values ` +
                        `(?, ?, ?)`;

                    queryExecution.queryExecution(client, jsonObj, event, topMenuMainInsertQry, [userTypeId, menu.topMenuMainId, menu.is_active], async function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                    });
                }
                else {
                    var topMenuMainUpdateQry = `UPDATE ${userType}_top_menu_main SET is_active = ? WHERE ${idCol} = ? and top_menu_main_id = ?`;
                    queryExecution.queryExecution(client, jsonObj, event, topMenuMainUpdateQry, [menu.is_active, userTypeId, menu.topMenuMainId], async function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                    });
                }
            });
        });

        jsonObj.leftMenuMainDetails.forEach(menu => {
            var leftMenuCheckQry = `SELECT id FROM ${userType}_left_menu_main where ${idCol} = ? and left_menu_main_id = ?`;
            queryExecution.queryExecution(client, jsonObj, event, leftMenuCheckQry, [userTypeId, menu.leftMenuMainId], async function (response) {
                if (response.result.length == 0) {
                    var leftMenuMainInsertQry = `INSERT INTO ${userType}_left_menu_main ` +
                        `(${idCol}, left_menu_main_id, is_active) ` +
                        `values ` +
                        `(?, ?, ?)`;

                    queryExecution.queryExecution(client, jsonObj, event, leftMenuMainInsertQry, [userTypeId, menu.leftMenuMainId, menu.is_active], async function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                    });
                }
                else {
                    var leftMenuMainUpdateQry = `UPDATE ${userType}_left_menu_main SET is_active = ? WHERE ${idCol} = ? and left_menu_main_id = ?`;
                    queryExecution.queryExecution(client, jsonObj, event, leftMenuMainUpdateQry, [menu.is_active, userTypeId, menu.leftMenuMainId], async function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                    });
                }
            });

            menu.leftMenuSubDetails.forEach(subMenu => {
                var leftSubMenuCheckQry = `SELECT id FROM ${userType}_left_menu_sub where ${idCol} = ? and left_menu_sub_id = ?`;
                queryExecution.queryExecution(client, jsonObj, event, leftSubMenuCheckQry, [userTypeId, subMenu.leftMenuSubId], async function (response) {
                    if (response.result.length == 0) {
                        var leftMenuSubInsertQry = `INSERT INTO ${userType}_left_menu_sub ` +
                            `(${idCol}, left_menu_sub_id, is_active) ` +
                            `values ` +
                            `(?, ?, ?)`;

                        queryExecution.queryExecution(client, jsonObj, event, leftMenuSubInsertQry, [userTypeId, subMenu.leftMenuSubId, subMenu.is_active], async function (response) {
                            if (response.success == '0') {
                                callback(response);
                            }
                        });
                    }
                    else {
                        var leftMenuSubUpdateQry = `UPDATE ${userType}_left_menu_sub SET is_active = ? WHERE ${idCol} = ? and left_menu_sub_id = ?`;
                        queryExecution.queryExecution(client, jsonObj, event, leftMenuSubUpdateQry, [subMenu.is_active, userTypeId, subMenu.leftMenuSubId], async function (response) {
                            if (response.success == '0') {
                                callback(response);
                            }
                        });
                    }
                });
            })
        });

        // jsonObj.leftMenuSubDetails.forEach(menu => {
        //     var leftSubMenuCheckQry = `SELECT id FROM ${userType}_left_menu_sub where ${idCol} = ${userTypeId} and left_menu_sub_id = ${menu.leftMenuSubId}`;
        //     queryExecution.queryExecution(client, jsonObj, event, leftSubMenuCheckQry, async function (response) {
        //         if (response.result.length == 0) {
        //             var leftMenuMainInsertQry = `INSERT INTO ${userType}_left_menu_sub ` +
        //                 `(${idCol}, left_menu_sub_id, is_active) ` +
        //                 `values ` +
        //                 `(${userTypeId}, ${menu.leftMenuSubId}, ${menu.is_active})`;

        //             queryExecution.queryExecution(client, jsonObj, event, leftMenuMainInsertQry, async function (response) {
        //                 if (response.success == '0') {
        //                     callback(response);
        //                 }
        //             });
        //         }
        //         else {
        //             var leftMenuMainUpdateQry = `UPDATE ${userType}_left_menu_sub SET is_active = ${menu.is_active}  WHERE ${idCol} = ${userTypeId} and left_menu_sub_id = ${menu.leftMenuSubId}`;
        //             queryExecution.queryExecution(client, jsonObj, event, leftMenuMainUpdateQry, async function (response) {
        //                 if (response.success == '0') {
        //                     callback(response);
        //                 }
        //             });
        //         }
        //     });
        // });

    } catch (error) {
        const response = {
            success: "0",
            successMessage: "",
            errorMessage: "Something went wrong.",
            errorType: "Exception"
        }
        callback(response);
    }
}
module.exports = methods;