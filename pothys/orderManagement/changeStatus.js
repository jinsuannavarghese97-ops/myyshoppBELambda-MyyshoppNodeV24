let mysql = require('mysql');
let smsCommon = require('../commonSMS/smsCommon.js');
let whatsAppSendMessages = require('../../whatsappSendMsg.js');
let ondcUpdateCall = require('./ondcUpdateCall.js');
let saveOrUpdateSaleOrderPackingDetails = require('./saveOrUpdateSaleOrderPackingDetails.js');
let aws = require("aws-sdk");
let nodemailer = require('nodemailer');
let ses = new aws.SES();
let s3 = new aws.S3();
let methods = {};

function test() {
    return "success"
}
methods.changeStatus = async function (client, jsonObj, event, queryExecution, smsSettings, callback) {
    console.log("event...dd..", event)
    let dateTime = new Date().getTime();
    console.log("Inside change StatusdateTime.......", dateTime)
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
    var taxTotal = 0
    event.time = event.time ? event.time : '+330';
    event.timeZone = event.timeZone ? event.timeZone : '+05:30';
    let queryParams = [];
    let checkSaleFromOndcQuery = "select if(from_ondc is true,1,0) as from_ondc,id as saleId from sale where id=(select sale_id from sale_order where id= ?);";
    queryParams.push(jsonObj.orderId);
    let orderStatusQuery = checkSaleFromOndcQuery + " UPDATE `sale_order_status` SET `is_current_status` = FALSE WHERE `sale_order_id` = ?;";
    queryParams.push(jsonObj.orderId);
    let updateSaleOndcQuery = "";
    let updateSaleOndcQueryParams = [];

    //---------------------------modified by sherin on 02-08-2023-----------item wise cancel-------------------
    let saleDetailsQry = "";
    let updateQry = "";
    let updateQryParams = [];
    if (jsonObj.orderStatusId == 5) {

        saleDetailsQry = " select soi.id as saleOrderItemId,so.store_id as storeId,s.ondc_covenient_fee,s.net_amount  " +
            " ,if(st.item_wise_tax is true,true,false) as item_wise_tax,if(st.item_price_including_tax is true,true,false) as item_price_including_tax,soi.store_item_stock_id ,so.cancelled_tax,soi.quantity as itemQuantity " +
            " from sale as s " +
            "  inner join sale_order as so on s.id=so.sale_id " +
            " inner join store as st on st.id=so.store_id " +
            " inner join sale_order_item as soi on soi.sale_order_id=so.id " +
            " where so.id=?;";
        queryParams.push(jsonObj.orderId);

    }
    let saleOrderDetQuery = "select SUM(net_amount*quantity) as totalAmount from sale_order_item where sale_order_id= ? and status=5;";
    queryParams.push(jsonObj.orderId);
    //-----------------------------------end---------------------------------------------------
    console.log("orderStatusQuery + saleDetailsQry......", orderStatusQuery + saleDetailsQry)

    await queryExecution.queryExecution(client, jsonObj, event, orderStatusQuery + saleDetailsQry + saleOrderDetQuery, queryParams, async function (response) {
        console.log("response....", response)
        if (response.success == '0') {
            callback(response);
        }
        let orderStatusResults = response.result;
        console.log("orderStatusResults....", orderStatusResults)

        //---------------------------modified by sherin on 02-08-2023-----------item wise cancel-------------------
        let saleOrderItemIds = ""
        let itemTaxQuery = ""
        let taxQry = ""
        let siteQry = "select id from site where id=1 ;"

        if (saleDetailsQry) {
            if (orderStatusResults[0][0].from_ondc == 1) {
                console.log("orderStatusResults[2]....", orderStatusResults[2], orderStatusResults[2].length)
                let storeId = orderStatusResults[2].length > 0 ? orderStatusResults[2][0].storeId : event.storeId
                if (orderStatusResults[0][0].from_ondc == 1) {
                    updateQry = updateQry + " UPDATE sale SET ondc_cancell_reason_id= ? WHERE id= ? ;";
                    updateQryParams.push(jsonObj.ondcCancellReasonId, orderStatusResults[0][0].saleId);
                }

                for (let k = 0; k < orderStatusResults[2].length; k++) {
                    let saleOrderItemId = orderStatusResults[2][k].saleOrderItemId
                    if (saleOrderItemIds) {
                        saleOrderItemIds = saleOrderItemIds + "," + orderStatusResults[2][k].saleOrderItemId
                    }
                    else {
                        saleOrderItemIds = orderStatusResults[2][k].saleOrderItemId
                    }
                    updateQry = updateQry + " UPDATE sale_order_item SET status=5 WHERE id= ? ;";
                    updateQryParams.push(saleOrderItemId);

                    if (orderStatusResults[0][0].from_ondc == 1) {
                        updateQry = updateQry ? updateQry + " UPDATE sale_order_item SET ondc_fullfillment_states_id =7 ,cancelled_quantity=quantity, cancelled_by='Seller',cancelled_at= ?,ondc_cancel_reason_id= ? WHERE id=? ;" : " UPDATE sale_order_item SET ondc_fullfillment_states_id =7 ,cancelled_quantity=quantity,cancelled_by='Seller',cancelled_at= ?, ondc_cancel_reason_id= ? WHERE id= ?;"
                        updateQryParams.push(dateTime, jsonObj.ondcCancellReasonId, saleOrderItemId);
                    }
                }
                itemTaxQuery = " select sis.id as storeItemStockId,sis.item_price,tg.id as taxGroupId,tg.group_name as taxGroupName,tg.tax_percentage as taxGroupPercentage, " +
                    " group_concat(tgd.tax_name) as taxName,group_concat(tgd.tax_percentage) as taxPercentage, " +
                    " group_concat(tgd.id) as taxGroupdetailsId,itgd.item_id as itemId " +
                    " from tax_group as tg " +
                    " inner join tax_group_details as tgd on tg.id=tgd.tax_group_id " +
                    " inner join item_tax_group_details as itgd on tg.id=itgd.tax_group_id " +
                    " inner join store_item_stock as sis on sis.item_id=itgd.item_id " +
                    " inner join sale_order_item as soi on soi.store_item_stock_id=sis.id " +
                    " where tg.is_active=true and tgd.is_active=true and soi.id in ("+saleOrderItemIds+")  group by soi.id ; "

                taxQry = " SELECT st.`tax_name` AS taxName,st.`tax_percentage` AS taxPercentage,st.`apply_tax_on_id` AS applyTax,st.id as storeTaxId, " +
                    "IF(st.`apply_tax_on_id`, " +
                    " (SELECT sd.tax_percentage FROM store_tax_details AS sd WHERE st.`apply_tax_on_id` = sd.id) " +
                    " ,NULL) AS applyTaxPercentage,st.store_id as storeId " +
                    " FROM `store_tax_details` AS st " +
                    //" inner join store as sto on sto.id=st.store_id " +
                    " WHERE st.is_active = true and st.`store_id` in ("+storeId+");"
            }
        }

        console.log(" itemTaxQuery + taxQry + siteQry...........", itemTaxQuery + taxQry + siteQry)
        await queryExecution.queryExecution(client, jsonObj, event, itemTaxQuery + taxQry + siteQry, [], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let itemTaxQueryResult = []
            let TaxQueryResult = []
            console.log(" response.result..............", response)
            itemTaxQueryResult = response.result[0] ? response.result[0] : [];
            TaxQueryResult = response.result[1] ? response.result[1] : [];
            if (orderStatusResults[0][0].from_ondc == 1) {
                if (orderStatusResults[2]) {
                    if (orderStatusResults[2][0].item_wise_tax == true) {

                        if (itemTaxQueryResult.length > 0) {
                            for (let s = 0; s < itemTaxQueryResult.length; s++) {

                                let itemTaxAmount = (parseFloat(itemTaxQueryResult[s].item_price) / 100) * itemTaxQueryResult[s].taxGroupPercentage
                                let itemsId = itemTaxQueryResult[s].storeItemStockId
                                itemTaxAmount = itemTaxAmount * orderStatusResults[2][0].itemQuantity
                                console.log("itemTaxAmount....................", itemTaxAmount)
                                taxTotal = taxTotal ? (parseFloat(taxTotal) + parseFloat(itemTaxAmount)) : itemTaxAmount
                                console.log("cancelllllllllllltaxTotal....................", taxTotal)
                                // breakupArray.push({
                                //     "@ondc/org/item_id": itemsId,
                                //     "title": "Item Tax",
                                //     "@ondc/org/title_type": "tax",
                                //     "price": {
                                //         "currency": "INR",
                                //         "value": itemTaxAmount.toFixed(2).toString()
                                //     }
                                // })
                            }
                        }
                        if (orderStatusResults[2][0].cancelled_tax) {
                            taxTotal = taxTotal + parseFloat((orderStatusResults[2][0].cancelled_tax))
                        }
                    }

                    if (orderStatusResults[2][0].item_wise_tax != true) {
                        if (TaxQueryResult.length > 0) {
                            for (var m = 0; m < TaxQueryResult.length; m++) {

                                var taxAmount = 0;

                                if (TaxQueryResult[m].applyTax != "" && TaxQueryResult[m].applyTax != null) {
                                    taxAmount = (orderStatusResults[3][0].totalAmount / 100) * TaxQueryResult[m].applyTaxPercentage
                                    taxAmount = (taxAmount / 100) * TaxQueryResult[m].taxPercentage
                                }
                                else {
                                    taxAmount = (orderStatusResults[3][0].totalAmount / 100) * TaxQueryResult[m].taxPercentage
                                }

                                console.log("taxAmount................", taxAmount)
                                taxTotal = taxTotal + parseFloat(taxAmount)


                            }
                        }
                    }


                }
            }
            //}
            console.log("canceltaxTotal..........", taxTotal)
            //--------------------end------------------------------------------   
            console.log("------", orderStatusResults[0])
            let cancellTotal = 0
            if (orderStatusResults[3]) {
                if (orderStatusResults[3][0].totalAmount) {
                    cancellTotal = orderStatusResults[3][0].totalAmount
                }
            }
            if (orderStatusResults[0].length > 0) {
                if (orderStatusResults[0][0].from_ondc == 1) {
                    updateSaleOndcQuery = `
                        UPDATE sale 
                        SET 
                        ondc_fullfillment_states_id = ?, 
                        cancelled_tax = ?, 
                        cancelled_total = ? 
                        WHERE id = ?;
                        
                        UPDATE ondc_sale_orde_status_history 
                        SET 
                        is_current_status = false 
                        WHERE sale_order_id = ?;
                        
                        INSERT INTO ondc_sale_orde_status_history 
                        (version, comments, created_by, created_on, is_active, is_current_status, ondc_fullfillment_states_id, sale_order_id, status_date) 
                        VALUES 
                        (0, '', ?, NOW(), 1, 1, ?, ?, NOW());
                    `;
                    updateSaleOndcQueryParams.push(
                        jsonObj.ondcStatus,
                        taxTotal,
                        cancellTotal,
                        orderStatusResults[0][0].saleId,
                        jsonObj.orderId,
                        jsonObj.userId,
                        jsonObj.ondcStatus,
                        jsonObj.orderId
                    );
                }
            }
            console.log("updateSaleOndcQuery...", updateSaleOndcQuery)

            let orderStatusCreateQuery = updateSaleOndcQuery + `
                INSERT INTO sale_order_status 
                (comments, created_by, created_on, is_active, is_current_status, order_status_id, sale_order_id, status_date) 
                VALUES (?, ?, CONVERT_TZ(NOW(), '+00:00', ?), TRUE, TRUE, ?, ?, CONVERT_TZ(NOW(), '+00:00', ?));
                
                UPDATE sale_order 
                SET 
                  order_status_id = ?, 
                  cancelled_tax = ?, 
                  cancelled_total = ? 
                WHERE id = ?;
            `;
            const orderStatusCreateQueryParams = [
                ...updateSaleOndcQueryParams,
                jsonObj.comments,
                jsonObj.userId,
                event.timeZone,
                jsonObj.orderStatusId,
                jsonObj.orderId,
                event.timeZone,
                jsonObj.orderStatusId,
                taxTotal,
                cancellTotal,
                jsonObj.orderId
            ];

            queryExecution.queryExecution(client, jsonObj, event, orderStatusCreateQuery + updateQry, [...orderStatusCreateQueryParams, ...updateQryParams], function (response) {
                if (response.success == '0') {
                    console.log("errror in query..................", orderStatusCreateQuery + updateQry)
                    callback(response);
                }
                let orderStatusCreateResults = response.result;
                let smsEmailType

                if (event.orderStatusId == 8) { //verified,accepted
                    smsEmailType = 5 //Order Confirmed
                }
                else if (event.orderStatusId == 5) { //cancelled --ondc_fullfillment_statesId(7)
                    smsEmailType = 6 //Order Cancel
                }

                else if (event.orderStatusId == 3) { //Out for Delivery,In-progress
                    smsEmailType = 7 //Dispatched
                }

                else if (event.orderStatusId == 4) { //Delivered,Completed --ondc_fullfillment_statesId(6)
                    smsEmailType = 8 //Delivered
                }

                else if (event.orderStatusId == 2) { //inprogress
                    smsEmailType = 0
                }

                else if (event.orderStatusId == 6) { //returned
                    smsEmailType = 0
                }
                else {
                    smsEmailType = 0
                }
                event.smsEmailType = smsEmailType
                let detailsQry = `
                    SELECT 
                        s.from_ondc, 
                        ofs.ondc_state_name, 
                        st.name as storeName, 
                        stsec.email_id as storeEmail, 
                        so.gross_amount as grossAmount, 
                        c.symbol as currency, 
                        so.id as orderId, 
                        bda.name as buyerName, 
                        bda.telephone_number as buyerMobile, 
                        sec.email_id as buyerEmail
                    FROM sale_order as so 
                    INNER JOIN sale as s on s.id = so.sale_id 
                    LEFT JOIN ondc_fullfillment_states as ofs on s.ondc_fullfillment_states_id = ofs.id 
                    INNER JOIN buyer_delivery_address as bda on bda.id = s.buyer_delivery_address_id 
                    INNER JOIN sec_user as sec on sec.id = bda.buyer_id 
                    INNER JOIN store as st on st.id = so.store_id 
                    INNER JOIN currency as c on c.id = st.currency_id 
                    INNER JOIN sec_user as stsec on stsec.id = st.sec_user_id 
                    WHERE so.id = ?;

                    SELECT id as siteId 
                    FROM site 
                    WHERE seller_id = ?;

                    SELECT IF(mcd.hassms = true, 'true', 'false') as hasSms, mcd.sms_text as smsText 
                    FROM message_content_details as mcd 
                    WHERE store_id = ? 
                    AND sms_or_email_message_type_id = ? 
                    AND mcd.hassms = true;

                    SELECT sc.email_user_id as emailUser, s.retail_group_name 
                    FROM seller_configuration as sc 
                    INNER JOIN seller as s on s.id = sc.seller_id 
                    WHERE s.id = ?;

                    SELECT 
                        (SELECT c.config_value FROM configuration as c WHERE c.config_key = 'emailUserName') AS emailUserName, 
                        (SELECT c.config_value FROM configuration as c WHERE c.config_key = 'bccStoreDigEmail') AS bccStoreDigEmail, 
                        (SELECT c.config_value FROM configuration as c WHERE c.config_key = 'adminStoreDigEmail') AS adminStoreDigEmail;

                    SELECT site_id as siteId 
                    FROM site_sub_domain 
                    WHERE store_id = ?;

                    SELECT name as orderStatus 
                    FROM order_status 
                    WHERE id = ?;
                `;

                const detailsParams = [
                    event.orderId,
                    event.userId,
                    event.storeId,
                    smsEmailType,
                    event.userId,
                    event.storeId,
                    event.orderStatusId
                ];


                console.log("detailsQry...", detailsQry)
                queryExecution.queryExecution(client, jsonObj, event, detailsQry, detailsParams, function (response) {
                    if (response.success == '0') {
                        callback(response);
                    }
                    let detailsResult = response.result;
                    console.log("detailsResult....", detailsResult)
                    let orderStatus = ""
                    if (detailsResult[6].length > 0) {
                        orderStatus = detailsResult[6][0].orderStatus
                    }
                    console.log("----orderStatus...", orderStatus)
                    if (detailsResult[2].length > 0 && null != detailsResult[2][0].smsText && '' != detailsResult[2][0].smsText) {
                        event.message = detailsResult[2][0].smsText
                    }
                    else if (event.orderStatusId == 8) {
                        event.message = "Dear {{buyerName}}, Your Order No: {{orderNo}}  for {{currency}} {{netAmount}} has been confirmed by {{storeName}} , Thank you."
                    }
                    else if (event.orderStatusId == 5) {
                        event.message = "Dear {{buyerName}}, We regret to inform you your Order No: {{orderNo}} for {{currency}} {{netAmount}} from {{storeName}} has been cancelled. Please visit again soon. Thank you."
                    }
                    else if (event.orderStatusId == 3) {
                        event.message = "Dear {{buyerName}}, Your Order No: {{orderNo}} for {{currency}} {{netAmount}}  has been dispatched by {{storeName}} ,  Thank you."
                    }
                    else if (event.orderStatusId == 4) {
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
                            }
                            else {
                                comment = ''
                            }
                            EMAIL_TEXT = " Hi " + detailsResult[0][0].buyerName + " , <br><br>" +
                                " Your Order No  : " + event.orderId + " has been confirmed.<br>" + comment +

                                " Thank you for shopping with " + detailsResult[0][0].storeName + ". Hope to see you shop with us soon.<br><br>" +
                                " Thank you,<br>" +
                                " Team " + detailsResult[0][0].storeName + "<br>" +
                                " <a>Support : " + detailsResult[0][0].storeEmail + "</a><br>"
                        }
                        else if (event.orderStatusId == 5) {
                            let comment
                            emailSubject = detailsResult[0][0].storeName + " Order Cancellation "
                            if (jsonObj.comments != '') {
                                comment = " Reason : " + jsonObj.comments + ".<br><br>"
                            }
                            else {
                                comment = ''
                            }
                            EMAIL_TEXT = " Hi " + detailsResult[0][0].buyerName + " , <br><br>" +
                                " Your Order No  : " + event.orderId + " has been cancelled.<br>" + comment +

                                " Thank you for shopping with " + detailsResult[0][0].storeName + ". Hope to see you shop with us soon.<br><br>" +
                                " Thank you,<br>" +
                                " Team " + detailsResult[0][0].storeName + "<br>" +
                                " <a>Support : " + detailsResult[0][0].storeEmail + " </a><br>"
                        }
                        else if (event.orderStatusId == 3) {
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
                            let status = ""
                            if (jsonObj.comments != '') {
                                comment = " Note : " + jsonObj.comments + ".<br><br>"
                            }
                            if (detailsResult[0][0].from_ondc) {
                                emailSubject = " Your Order is " + detailsResult[0][0].ondc_state_name
                                status = detailsResult[0][0].ondc_state_name + "."
                            }
                            else {
                                emailSubject = " Your Order is In Process "
                                status = " in process. "
                            }

                            EMAIL_TEXT = " Hi " + detailsResult[0][0].buyerName + " , <br><br>" +
                                " Your Order No  : " + event.orderId + " is " + status + "<br><br>" + comment +

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
                            }
                            else {
                                emailUserName = 'MyyShopp Support <' + detailsResult[4][0].emailUserName + '>'
                            }
                        }
                        else {
                            emailUserName = 'MyyShopp Support <' + detailsResult[4][0].emailUserName + '>'
                        }
                        setInterval(test, 150);
                        // let mailOptions = {
                        //     from: emailUserName,
                        //     subject: emailSubject,
                        //     html: EMAIL_TEXT,
                        //     to: detailsResult[0][0].buyerEmail,
                        //     bcc: detailsResult[4][0].bccStoreDigEmail,
                        //     cc: detailsResult[4][0].adminStoreDigEmail
                        // };

                        // let transporter = nodemailer.createTransport({
                        //     SES: ses
                        // });

                        // send email
                        // transporter.sendMail(mailOptions, async function(err, info) {
                        //     if (err) {
                        //         const response = {
                        //             success: "0",
                        //             errorMessage: err,
                        //             successMessage: "Email not sent ",
                        //         };
                        //         callback(response);
                        //     }
                        //     else {
                        console.log("call sendSmsAndEmail()...");
                        sendSmsAndEmail()
                        async function sendSmsAndEmail() {
                            console.log("inside sendSmsAndEmail() function...");
                            console.log("-----------detailsResult[1][0]---", detailsResult[1])
                            event.buyerName = detailsResult[0][0].buyerName
                            //event.message = event.message.replace('{{orderNo}}', event.orderId)
                            event.currency = detailsResult[0][0].currency
                            event.grossAmount = parseFloat(detailsResult[0][0].grossAmount).toFixed(2)
                            event.storeName = detailsResult[0][0].storeName
                            event.mobileNumber = detailsResult[0][0].buyerMobile
                            event.fromPage = "orderChangeStatus"
                            if (detailsResult[1].length > 0) {
                                event.siteId = detailsResult[1][0].siteId
                            }
                            else {
                                if (detailsResult[5].length > 0) {
                                    event.siteId = detailsResult[5][0].siteId
                                }
                                else {
                                    event.siteId = 0;
                                }
                            }
                            let response = {
                                success: "1",
                                result: { orderStatus: orderStatus },
                                successMessage: "Status updated successfully",
                                errorMessage: ""
                            };

                            await saveOrUpdateSaleOrderPackingDetails.saveOrUpdateSaleOrderPackingDetails(client, jsonObj, event, queryExecution, async function (responseSaveOrUpdateSaleOrderPackingDetails) {
                                console.log("responseSaveOrUpdateSaleOrderPackingDetails Response........", responseSaveOrUpdateSaleOrderPackingDetails)
                                await smsSettings.smsSettings(client, jsonObj, event, queryExecution, async function (response1) {
                                    await whatsAppSendMessages.whatsAppSendMessages(client, jsonObj, event, queryExecution, async function (responseWhatsAppSendMessages) {
                                        console.log("....whatsAppSendMessages Response........", responseWhatsAppSendMessages)
                                        if ((detailsResult[0][0].buyerEmail) && (detailsResult[0][0].buyerEmail != '') && (detailsResult[0][0].buyerEmail != null) && (detailsResult[0][0].buyerEmail != 'null')) {
                                            let mailOptions = {
                                                from: emailUserName,
                                                subject: emailSubject,
                                                html: EMAIL_TEXT,
                                                to: detailsResult[0][0].buyerEmail,
                                                bcc: detailsResult[4][0].bccStoreDigEmail,
                                                cc: detailsResult[4][0].adminStoreDigEmail
                                            };
                                            let transporter = await nodemailer.createTransport({
                                                SES: ses
                                            });
                                            let sendMail = await transporter.sendMail(mailOptions)

                                        }
                                        if (detailsResult[0][0].from_ondc) {
                                            await ondcUpdateCall.ondcUpdateCall(client, jsonObj, event, queryExecution, async function (response2) {
                                                console.log("Inside-if-FromOndc.........");

                                                response = {
                                                    success: "1",
                                                    result: { orderStatus: orderStatus },
                                                    successMessage: "Status updated successfully",
                                                    errorMessage: ""
                                                };
                                            })
                                        }

                                        else {
                                            console.log("Inside-else-FromOndc.........");
                                            response = {
                                                success: "1",
                                                result: { orderStatus: orderStatus },
                                                successMessage: "Status updated successfully",
                                                errorMessage: ""
                                            };
                                        }


                                        callback(response)
                                    });
                                });
                                ///////////////////////////////////////////////////////////////////
                            });
                            //}
                            //});
                        }
                    }
                })
            });
        });

    });
}
module.exports = methods;
