const queryExecution = require('../queryExecution')
const methods = {};
methods.saveWhatsAppMessageContentSiteDetails = function (client, jsonObj, event, callback) {
    let whereQuery = "";
    let whereQueryParams = [];
    if (event.messageContentSiteId) {
        whereQuery = " and id!= ?";
        whereQueryParams = [event.messageContentSiteId];
    }
    let checkDataExistQuery = "select site_id ,id from whatsapp_message_content_site where site_id= ?" + whereQuery
    console.log(checkDataExistQuery)
    //client.query(checkDataExistQuery, function (error, checkDataExistQueryResult, fields) {
    queryExecution.queryExecution(client, "", event, checkDataExistQuery, [event.siteId, ...whereQueryParams], function (finalResponse) {
        if (finalResponse.success == '0') {
            const response = {
                success: "0",
                successMessage: "",
                errorMessage: "Something went wrong"
            };
            callback(response);
        }
        else {

            if (finalResponse.result.length > 0) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: " Data Already Exists "
                };
                callback(response);
            }
            else {
                let saveMessageContentSiteDetailsQuery = "";
                let saveMessageContentSiteDetailsQueryParams = [];
                if (event.messageContentSiteId) {
                    let saveMessageContentSiteDetailsQuery = `
                        UPDATE whatsapp_message_content_site 
                        SET 
                            version = version + 1, 
                            access_token = ?, 
                            from_number = ?, 
                            whatsapp_message_content_id = ?, 
                            site_id = ?, 
                            is_active = ? 
                        WHERE id = ?;
                    `;

                    saveMessageContentSiteDetailsQueryParams = [
                        event.accessToken,
                        event.fromNumber,
                        event.whatsappMessageContentId,
                        event.siteId,
                        event.isActive,
                        event.messageContentSiteId
                    ];
                }
                else {
                    saveMessageContentSiteDetailsQuery = `
                        INSERT INTO whatsapp_message_content_site 
                        (version, access_token, from_number, whatsapp_message_content_id, site_id, is_active) 
                        VALUES (?, ?, ?, ?, ?, ?);
                    `;

                    saveMessageContentSiteDetailsQueryParams = [
                        0, // version
                        event.accessToken,
                        event.fromNumber,
                        event.whatsappMessageContentId,
                        event.siteId,
                        event.isActive
                    ];

                }

                queryExecution.queryExecution(client, "", event, saveMessageContentSiteDetailsQuery, saveMessageContentSiteDetailsQueryParams, function (dbRresponse) {
                    if (dbRresponse.success == '0') {
                        const response = {
                            success: "0",
                            successMessage: "",
                            errorMessage: "Something went wrong"
                        };
                        callback(response);
                    }
                    else {

                        const result = {
                            success: "1",
                            successMessage: "Success",
                            errorMessage: ""
                        };
                        callback(result);
                    }

                });
            }
        }

    });
}
module.exports = methods;
