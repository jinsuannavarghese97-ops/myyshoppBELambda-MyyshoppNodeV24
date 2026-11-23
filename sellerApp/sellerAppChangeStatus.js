let mysql = require('mysql');
let smsCommon = require('../pothys/commonSMS/smsCommon.js');
const smsSettings = require('../smsSettings.js');
let queryExecution = require('../queryExecution');
let aws = require("aws-sdk");
let nodemailer = require('nodemailer');
let ses = new aws.SES();
let s3 = new aws.S3();
let methods = {};
function test() {
    return "success"
}
methods.sellerAppChangeStatus = function (client, jsonObj, event, callback) {
    jsonObj = event
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
    //console.log("event.time ",event.time)
    event.time = event.time ? event.time : '+330'
    event.timeZone = event.timeZone ? event.timeZone : '+05:30'
    // console.log('1.....')
    let orderStatusQuery = " UPDATE `sale_order_status` SET `is_current_status` = FALSE WHERE `sale_order_id` = ? ";
    //console.log('1.orderStatusQuery....',orderStatusQuery)
    queryExecution.queryExecution(client, jsonObj, event, orderStatusQuery, [jsonObj.orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let orderStatusResults = response.result;
        let orderStatusCreateQuery = `
            INSERT INTO sale_order_status 
            (comments, created_by, created_on, is_active, is_current_status, order_status_id, sale_order_id, status_date) 
            VALUES (?, ?, CONVERT_TZ(NOW(), '+00:00', ?), TRUE, TRUE, ?, ?, CONVERT_TZ(NOW(), '+00:00', ?));

            UPDATE sale_order 
            SET order_status_id = ? 
            WHERE id = ?;
        `;

        let orderStatusCreateQueryParams = [
            jsonObj.comments,
            jsonObj.userId,
            event.timeZone,
            jsonObj.orderStatusId,
            jsonObj.orderId,
            event.timeZone,
            jsonObj.orderStatusId,
            jsonObj.orderId
        ];

        //console.log('1.orderStatusCreateQuery....',orderStatusCreateQuery)
        queryExecution.queryExecution(client, jsonObj, event, orderStatusCreateQuery, orderStatusCreateQueryParams, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let orderStatusCreateResults = response.result;
            let smsEmailType
            if (event.orderStatusId == 8) {
                smsEmailType = 5
            }
            else if (event.orderStatusId == 5) {
                smsEmailType = 6
            }
            else if (event.orderStatusId == 3) {
                smsEmailType = 7
            }
            else if (event.orderStatusId == 4) {
                smsEmailType = 8
            }

            else if (event.orderStatusId == 2) {//inprogress
                smsEmailType = 0
            }
            else if (event.orderStatusId == 6) {//returned
                smsEmailType = 0
            }
            else {
                smsEmailType = 0
            }
            event.smsEmailType = smsEmailType
            let detailsQry = `
                SELECT 
                    st.name AS storeName,
                    stsec.email_id AS storeEmail,
                    so.gross_amount AS grossAmount,
                    c.symbol AS currency,
                    so.id AS orderId,
                    bda.name AS buyerName,
                    bda.telephone_number AS buyerMobile,
                    sec.email_id AS buyerEmail 
                FROM sale_order AS so 
                INNER JOIN sale AS s ON s.id = so.sale_id 
                INNER JOIN buyer_delivery_address AS bda ON bda.id = s.buyer_delivery_address_id 
                INNER JOIN sec_user AS sec ON sec.id = bda.buyer_id 
                INNER JOIN store AS st ON st.id = so.store_id 
                INNER JOIN currency AS c ON c.id = st.currency_id 
                INNER JOIN sec_user AS stsec ON stsec.id = st.sec_user_id 
                WHERE so.id = ?;

                SELECT id AS siteId 
                FROM site 
                WHERE seller_id = ?;

                SELECT IF(mcd.hassms IS TRUE, 'true', 'false') AS hasSms, mcd.sms_text AS smsText 
                FROM message_content_details AS mcd 
                WHERE store_id = ? 
                AND sms_or_email_message_type_id = ? 
                AND mcd.hassms IS TRUE;

                SELECT sc.email_user_id AS emailUser, retail_group_name 
                FROM seller_configuration AS sc 
                INNER JOIN seller AS s ON s.id = sc.seller_id 
                WHERE s.id = ?;

                SELECT 
                    (SELECT c.config_value FROM configuration AS c WHERE c.config_key = 'emailUserName') AS emailUserName,
                    (SELECT c.config_value FROM configuration AS c WHERE c.config_key = 'bccStoreDigEmail') AS bccStoreDigEmail,
                    (SELECT c.config_value FROM configuration AS c WHERE c.config_key = 'adminStoreDigEmail') AS adminStoreDigEmail;
            `;

            let detailsQryParams = [
                event.orderId,
                event.userId,
                event.storeId,
                smsEmailType,
                event.userId
            ];

            //console.log('1.detailsQry....',detailsQry)
            queryExecution.queryExecution(client, jsonObj, event, detailsQry, detailsQryParams, function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let detailsResult = response.result;
                if (detailsResult[2].length > 0 && null != detailsResult[2][0].smsText && '' != detailsResult[2][0].smsText) {
                    event.message = detailsResult[2][0].smsText
                } else if (event.orderStatusId == 8) {
                    event.message = "Dear {{buyerName}}, Your Order No: {{orderNo}}  for {{currency}} {{netAmount}} has been confirmed by {{storeName}} , Thank you."
                } else if (event.orderStatusId == 5) {
                    event.message = "Dear {{buyerName}}, We regret to inform you your Order No: {{orderNo}} for {{currency}} {{netAmount}} from {{storeName}} has been cancelled. Please visit again soon. Thank you."
                } else if (event.orderStatusId == 3) {
                    event.message = "Dear {{buyerName}}, Your Order No: {{orderNo}} for {{currency}} {{netAmount}}  has been dispatched by {{storeName}} ,  Thank you."
                } else if (event.orderStatusId == 4) {
                    event.message = "Dear {{buyerName}}, Your Order No: {{orderNo}} for {{currency}} {{netAmount}}  has been Delivered by {{storeName}} , Thank you."
                }

                let emailSubject = ''
                let EMAIL_TEXT = ''
                if (event.orderStatusId) {
                    if (event.orderStatusId == 8) {
                        let comment
                        emailSubject = detailsResult[0][0].storeName + " Order Confirmation "
                        if (jsonObj.comments != '') {
                            comment = " Note : " + jsonObj.comments + ".<br><br>"
                        } else {
                            comment = ''
                        }
                        EMAIL_TEXT = " Hi " + detailsResult[0][0].buyerName + " , <br><br>" +
                            " Your Order No  : " + event.orderId + " has been confirmed.<br>" + comment +

                            " Thank you for shopping with " + detailsResult[0][0].storeName + ". Hope to see you shop with us soon.<br><br>" +
                            " Thank you,<br>" +
                            " Team " + detailsResult[0][0].storeName + "<br>" +
                            " <a>Support : " + detailsResult[0][0].storeEmail + "</a><br>"
                    } else if (event.orderStatusId == 5) {
                        let comment
                        emailSubject = detailsResult[0][0].storeName + " Order Cancellation "
                        if (jsonObj.comments != '') {
                            comment = " Reason : " + jsonObj.comments + ".<br><br>"
                        } else {
                            comment = ''
                        }
                        EMAIL_TEXT = " Hi " + detailsResult[0][0].buyerName + " , <br><br>" +
                            " Your Order No  : " + event.orderId + " has been cancelled.<br>" + comment +

                            " Thank you for shopping with " + detailsResult[0][0].storeName + ". Hope to see you shop with us soon.<br><br>" +
                            " Thank you,<br>" +
                            " Team " + detailsResult[0][0].storeName + "<br>" +
                            " <a>Support : " + detailsResult[0][0].storeEmail + " </a><br>"
                    } else if (event.orderStatusId == 3) {
                        let comment = ''
                        if (jsonObj.comments != '') {
                            comment = " Note : " + jsonObj.comments + ".<br><br>"
                        }
                        emailSubject = " Your Order Out for Delivery "
                        EMAIL_TEXT = " Hi " + detailsResult[0][0].buyerName + " , <br><br>" +
                            " Your Order No  : " + event.orderId + " is out for delivery.<br><br>" + comment +

                            " Thank you for shopping with " + detailsResult[0][0].storeName + ". Hope to see you shop with us soon.<br><br>" +
                            " Thank you,<br>" +
                            " Team " + detailsResult[0][0].storeName + " <br>" +
                            " <a>Support : " + detailsResult[0][0].storeEmail + "</a><br>"
                    }
                    else if (event.orderStatusId == 2) {
                        let comment = ''
                        if (jsonObj.comments != '') {
                            comment = " Note : " + jsonObj.comments + ".<br><br>"
                        }
                        emailSubject = " Your Order is In Process "
                        EMAIL_TEXT = " Hi " + detailsResult[0][0].buyerName + " , <br><br>" +
                            " Your Order No  : " + event.orderId + " is in process.<br><br>" + comment +

                            " Thank you for shopping with " + detailsResult[0][0].storeName + ". Hope to see you shop with us soon.<br><br>" +
                            " Thank you,<br>" +
                            " Team " + detailsResult[0][0].storeName + " <br>" +
                            " <a>Support : " + detailsResult[0][0].storeEmail + "</a><br>"
                    }
                    else if (event.orderStatusId == 4) {
                        let comment = ''
                        if (jsonObj.comments != '') {
                            comment = " Note : " + jsonObj.comments + ".<br><br>"
                        }
                        emailSubject = detailsResult[0][0].storeName + " Order Delivered Confirmation "
                        EMAIL_TEXT = " Hi " + detailsResult[0][0].buyerName + " , <br><br>" +
                            " Your Order No  : " + event.orderId + " is delivered.<br>" + comment +

                            " Thank you for shopping with " + detailsResult[0][0].storeName + ". Hope to see you shop with us soon.<br><br>" +
                            " Thank you,<br>" +
                            " Team " + detailsResult[0][0].storeName + "<br>" +
                            " <a>Support : " + detailsResult[0][0].storeEmail + "</a><br>"
                    }
                    let emailUserName

                    if (detailsResult[3].length > 0) {
                        if (detailsResult[3][0].emailUser != null && detailsResult[3][0].emailUser != '') {
                            emailUserName = detailsResult[3][0].retail_group_name + ' <' + detailsResult[3][0].emailUser + '>'
                        } else {
                            emailUserName = 'MyyShopp Support <' + detailsResult[4][0].emailUserName + '>'
                        }
                    } else {
                        emailUserName = 'MyyShopp Support <' + detailsResult[4][0].emailUserName + '>'
                    }
                    setInterval(test, 150);
                    let mailOptions = {
                        from: emailUserName,
                        subject: emailSubject,
                        html: EMAIL_TEXT,
                        to: detailsResult[0][0].buyerEmail,
                        bcc: detailsResult[4][0].bccStoreDigEmail,
                        cc: detailsResult[4][0].adminStoreDigEmail
                    };
                    let transporter = nodemailer.createTransport({
                        SES: ses
                    });

                    // send email
                    console.log('mailOptions....', mailOptions)
                    /*transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            console.log("errr.....",err)
                            const response = {
                                success: "0",
                                errorMessage: err,
                                successMessage: "Email not sent ",
                            };
                            callback(response);
                        } 
                        else {*/
                    event.buyerName = detailsResult[0][0].buyerName
                    //event.message = event.message.replace('{{orderNo}}', event.orderId)
                    event.currency = detailsResult[0][0].currency
                    event.grossAmount = parseFloat(detailsResult[0][0].grossAmount).toFixed(2)
                    event.storeName = detailsResult[0][0].storeName
                    event.mobileNumber = detailsResult[0][0].buyerMobile
                    event.siteId = detailsResult[1][0].siteId
                    const response = {
                        success: "1",
                        successMessage: "Status updated successfully",
                        errorMessage: ""
                    };
                    callback(response)
                    //console.log('event....last...',event)
                    //smsSettings.smsSettings(client, jsonObj, event, queryExecution,  function (response1) {

                    //});
                    //}
                    //});
                }
            })
        });
    });
}
module.exports = methods;
