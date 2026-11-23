var mysql = require('mysql');
var request = require("request");
var smsCommon = require('./smsCommon.js');
var methods = {};
let queryExecution = require('../queryExecution');
methods.userOrdersms = function (client, jsonObj, event, callback) {
    var pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField(field, useDefaultTypeCasting) {
            if ((field.type === "BIT") && (field.length === 1)) {
                var bytes = field.buffer();
                return (bytes[0] === 1);
            }
            return (useDefaultTypeCasting());
        }
    });
    pool.getConnection(function (err, connection) {

        // //console.log("event.saleId...")

        //var storeId = jsonObj.storeId
        //var sellerId = jsonObj.sellerId
        var saleId = jsonObj.saleId
        var smsSender
        var smsCount = 1
        var smsSenderObj = null;
        var message
        //var storePath = Configuration.findByConfigKey("s3Address").configValue + '/' + Configuration.findByConfigKey("storeDigS3BucketName").configValue + '/' + Configuration.findByConfigKey("bucketSubFolder").configValue + '/' + Configuration.findByConfigKey("storeImagesFolder").configValue + '/thumb'


        var buyerAddressQuery = " select s.buyer_delivery_address_id ,bda.id , bda.address1,bda.name as buyerName " +
            " from sale as s " +
            " inner join buyer_delivery_address as bda on bda.id=s.buyer_delivery_address_id " +
            " s.id= ?";
        //console.log("buyerAddressQuery..." + buyerAddressQuery)
        connection.query(buyerAddressQuery, [saleId], function (error, buyerResult, fields) {

            var itemQuery = " SELECT s.id as saleId,so.id as saleOrderId,st.id as storeId,sis.id as sisId, " +
                " Replace(soi.item_name,':',' ') as itemName,sis.item_code as itemCode,b.name as brandName,p.name as packName, " +
                " soi.quantity as quantity,soi.mrp as mrp,soi.net_amount as netAmount,so.delivery_charge as deliveryCharge " +
                " ,so.consumer_number as conNumber,so.delivery_slot as slot, " +
                " it.is_loose_item as looseItem,sis.unit as stockUnit,sis.net_amount as stockNetAmount,sis.unit_type as stockUnitType " +
                " FROM sale as s " +
                " INNER JOIN sale_order as so ON s.id = so.sale_id " +
                " INNER JOIN store as st ON st.id = so.store_id " +
                " INNER JOIN sale_order_item as soi ON soi.sale_order_id = so.id " +
                " INNER JOIN store_item_stock as sis ON sis.id = soi.store_item_stock_id " +
                " INNER JOIN item it ON it.id = soi.item_id " +
                " INNER JOIN pack p ON p.id = it.pack_id " +
                " LEFT OUTER JOIN brand as b ON it.brand_id=b.id " +
                " WHERE s.id = ?";

            //console.log("itemQuery.." + itemQuery)
            connection.query(itemQuery, [saleId], function (error, itemResult, fields) {
                var addressQuery = " SELECT su.display_name as displayName,bsa.name as buyerName,bsa.address1 as buyerAddress1,bsa.address2 as buyerAddress2,date_format(s.sale_date,'%d %M %Y') as saleDate, " +
                    " l.name as locationName,c.name as cityName,sta.name as stateName,bsa.telephone_number as buyerTelephone, " +
                    " su.email_id as buyerEmail,bsa.zip as zipCode,su.mobile_number as mobileNumber,pt.name as paymentType " +
                    " FROM sale AS s " +
                    " inner join buyer_delivery_address as bsa on bsa.id = s.buyer_delivery_address_id " +
                    " inner join location as l on l.id= bsa.location_id " +
                    " inner join city as c on c.id = l.city_id " +
                    " inner join state as sta on sta.id = c.state_id " +
                    " inner join sec_user as su on su.id = s.buyer_id " +
                    " inner join payment_type as pt on pt.id = s.payment_type_id " +
                    " WHERE s.id = ?";
                //console.log("addressQuery..." + addressQuery)
                connection.query(addressQuery, [saleId], function (error, addressResult, fields) {

                    var storeQuery = " SELECT p.paymentid as transactionId, s.payment_type_id as payment_type_id, st.email_footer_text as email_footer_text,s.id as saleId,so.id as saleOrderId,st.id as storeId,st.name as storeName,st.telephone_number as ph,date_format(s.sale_date,'%d/%M/%Y') as saleDate," +
                        //" IFNULL(CONCAT('" + storePath + "','/',st.logo_path),CONCAT('" + storePath + "','/',st.logo_path)) as storeImage, "+
                        " so.message as message,so.consumer_number as conNumber,so.delivery_slot as slot,so.delivery_charge as deliveryCharge,so.gross_amount as orderNetAmount,s.net_amount as saleNetAmount,s.created_by as created,so.promo_code_amount as promoCodeAmount,so.promo_code_id as promoCode,so.net_amount as netAmount,so.dine_in_no_of_people as dineIn,so.promocode_item_name as promoCodeItemName,so.`is_dine_in` as isDineIn,so.`is_store_pick_up` as isStorePickUp " +
                        " FROM sale as s " +
                        " INNER JOIN sale_order as so ON s.id = so.sale_id " +
                        " INNER JOIN store as st ON st.id = so.store_id " +
                        " INNER JOIN seller as se on se.id = st.seller_id " +
                        " left join payment as p on p.id = s.payment_id " +
                        " WHERE s.id = ?";


                    //console.log("storeQuery.." + storeQuery)
                    connection.query(storeQuery, [saleId], function (error, storequeryResult, fields) {
                        for (var j = 0; j < storequeryResult.length; j++) {
                            var itemQueryAdmin = " SELECT s.id as saleId,so.id as saleOrderId,st.id as storeId,sis.id as sisId, " +
                                " Replace(soi.item_name,':',' ') as itemName,sis.item_code as itemCode,b.name as brandName,p.name as packName, " +
                                " soi.quantity as quantity,soi.mrp as mrp,soi.net_amount as netAmount,so.delivery_charge as deliveryCharge " +
                                " ,so.consumer_number as conNumber,so.delivery_slot as slot, " +
                                " it.is_loose_item as looseItem,sis.unit as stockUnit,sis.net_amount as stockNetAmount,sis.unit_type as stockUnitType " +
                                " FROM sale as s " +
                                " INNER JOIN sale_order as so ON s.id = so.sale_id " +
                                " INNER JOIN store as st ON st.id = so.store_id " +
                                " INNER JOIN sale_order_item as soi ON soi.sale_order_id = so.id " +
                                " INNER JOIN store_item_stock as sis ON sis.id = soi.store_item_stock_id " +
                                " INNER JOIN item it ON it.id = soi.item_id " +
                                " INNER JOIN pack p ON p.id = it.pack_id " +
                                " LEFT OUTER JOIN brand as b ON it.brand_id=b.id " +
                                " WHERE so.id = ?";
                            //console.log("itemQueryAdmin..." + itemQueryAdmin)
                            connection.query(itemQueryAdmin, [storequeryResult[j].saleOrderId], function (error, itemQueryResult, fields) {
                                var storeQueryAdmin = " SELECT st.email_footer_text as email_footer_text,s.id as saleId,st.telephone_number as ph,so.id as saleOrderId,st.id as storeId,st.name as storeName,date_format(s.sale_date,'%d/%M/%Y') as saleDate," +
                                    //" IFNULL(CONCAT('" + storePath + "','/',st.logo_path),CONCAT('" + storePath + "','/',st.logo_path)) as storeImage, "+
                                    " so.message as message,so.consumer_number as conNumber,so.delivery_slot as slot,so.delivery_charge as deliveryCharge,so.gross_amount as orderNetAmount,s.net_amount as saleNetAmount,s.created_by as created,so.promo_code_amount as promoCodeAmount,so.promo_code_id as promoCode,so.net_amount as netAmount,so.dine_in_no_of_people as dineIn,so.promocode_item_name as promoCodeItemName,so.`is_dine_in` as isDineIn,so.`is_store_pick_up` as isStorePickUp " +
                                    " FROM sale as s " +
                                    " INNER JOIN sale_order as so ON s.id = so.sale_id " +
                                    " INNER JOIN store as st ON st.id = so.store_id " +
                                    " INNER JOIN seller as se on se.id = st.seller_id " +
                                    " WHERE so.id = ?";
                                //console.log("storeQueryAdmin..." + storeQueryAdmin)

                                connection.query(storeQueryAdmin, [storequeryResult[0].saleOrderId], function (error, storequeryResultAdmin, fields) {

                                    var storeAdmin = " select s.id as storeId,sec.email_id,cu.symbol as currencyName,s.name as storeName,sec.mobile_number as mobileNumber " +
                                        " from store as s " +
                                        " inner join sec_user as sec on sec.id=s.sec_user_id " +
                                        " inner join currency as cu on cu.id=s.currency_id " +
                                        " where s.id = ?";
                                    //console.log("storeAdmin.." + storeAdmin)
                                    connection.query(storeAdmin, [storequeryResultAdmin[0].storeId], function (error, storeAdminResult, fields) {

                                        //console.log("sttt...." + storeAdminResult[0].storeId)

                                        var smsQuery = " select sms.transactional_sms_count as transactional_sms_count, " +

                                            " sms.is_cc_email_id as is_cc_email_id, sms.cc_email_id as cc_email_id,sms.is_sms_mobile as is_sms_mobile,sms.sms_mobile as sms_mobile " +

                                            " from store_sms_details as sms " +

                                            " where sms.store_id = ? and sms.is_active = true and (CURDATE() between DATE(sms.from_date) and Date(sms.to_date)) "
                                        connection.query(smsQuery, [storeAdminResult[0].storeId], function (error, smsResult, fields) {
                                            if (smsResult.length > 0) {
                                                var storeSmsQuery = " select ssd.promotional_sms_count as promotionalSmsCount,ssd.transactional_sms_count as transactionalSmsCount," +

                                                    " ssd.sms_sender as smsSender,ssd.store_id as storeId " +

                                                    " from store_sms_details as ssd " +

                                                    " inner join store as s on s.id=ssd.store_id " +

                                                    " where ssd.store_id = ?";

                                                connection.query(storeSmsQuery, [storeAdminResult[0].storeId], function (error, storeSmsResult, fields) {
                                                    var queryString = "SELECT  ( " + "select c.config_value as configValue " +

                                                        "from configuration as c " +

                                                        "where c.config_key = 'smsLoginName' " +

                                                        ") AS smsLoginName, " +

                                                        "( " +

                                                        "select c.config_value as configValue " +

                                                        "from configuration as c " +

                                                        "where c.config_key = 'smsApiPassword' " +

                                                        ") AS smsApiPassword, " +

                                                        "( " +

                                                        "select c.config_value as configValue " +

                                                        "from configuration as c " +

                                                        "where c.config_key = 'smsSender' " +

                                                        ") AS smsSender "

                                                    connection.query(queryString, function (error, queryResult, fields) {
                                                        if (storeSmsResult[0].smsSender != null || storeSmsResult[0].smsSender != '') {
                                                            smsSender = storeSmsResult[0].smsSender
                                                        } else {
                                                            smsSender = queryString.smsSender
                                                        }
                                                        if (storeSmsResult[0].transactionalSmsCount > 0) {
                                                            var messageContactQuery = "select mcd.hassms as hassms,mcd.message_text as messageText,mcd.sms_text as smstext " +
                                                                " from message_content_details as mcd " +
                                                                " where mcd.store_id= ? and mcd.sms_or_email_message_type_id=4"
                                                            connection.query(messageContactQuery, [storeAdminResult[0].storeId], function (error, messageResult, fields) {
                                                                if (messageResult[0].hassms == true) {

                                                                    storeSmsResult[0].transactionalSmsCount = storeSmsResult[0].transactionalSmsCount - 1
                                                                    if (null != messageResult[0].smstext && '' != messageResult[0].smstext) {
                                                                        var msgReplace
                                                                        msgReplace = messageResult[0].smstext
                                                                        var msgReplace1 = msgReplace.replace("{{orderNo}}", storequeryResultAdmin[0].saleOrderId)
                                                                        var msgReplace2 = msgReplace1.replace("{{currency}}", storeAdminResult[0].currencyName)
                                                                        var msgReplace3 = msgReplace2.replace("{{netAmount}}", storequeryResultAdmin[0].orderNetAmount)
                                                                        var msgReplace4 = msgReplace3.replace("{{storeName}}", storeAdminResult[0].storeName)
                                                                        var msgReplace5 = msgReplace4.replace("{{telephoneNumber}}", addressResult[0].buyerTelephone)
                                                                        var msgReplace6 = msgReplace5.replace("{{buyerName}}", addressResult[0].buyerName)
                                                                        message = msgReplace6
                                                                    } else {
                                                                        message = "Dear " + addressResult[0].buyerName + ", We have recieved your Order No: " + storequeryResultAdmin[0].saleOrderId + " amounting to " + storeAdminResult[0].currencyName + " " + parseFloat(storequeryResultAdmin[0].orderNetAmount).toFixed(2) + ". " + storeAdminResult[0].storeName + " will contact you soon, Thank you"
                                                                    }
                                                                    event.message = message;
                                                                    event.mobileNumber = addressResult[0].buyerTelephone
                                                                    smsCommon.smsCommon(client, jsonObj, event, function (response) {
                                                                        if (storeSmsResult[0].transactionalSmsCount > 0) {
                                                                            // //console.log("storeSmsResult[0].transactionalSmsCount store..." + storeSmsResult[0].transactionalSmsCount)
                                                                            var messageContactQuery = "select mcd.hassms as hassms,mcd.message_text as messageText,mcd.sms_text as smstext " +
                                                                                " from message_content_details as mcd " +
                                                                                " where mcd.store_id= ? and mcd.sms_or_email_message_type_id=3"
                                                                            connection.query(messageContactQuery, [storeAdminResult[0].storeId], function (error, messageResult, fields) {
                                                                                if (messageResult[0].hassms == true) {
                                                                                    //console.log("hasssmsss storee")
                                                                                    storeSmsResult[0].transactionalSmsCount = storeSmsResult[0].transactionalSmsCount - 1
                                                                                    if (null != messageResult[0].smstext && '' != messageResult[0].smstext) {
                                                                                        var msgReplace
                                                                                        msgReplace = messageResult[0].smstext
                                                                                        var msgReplace1 = msgReplace.replace("{{orderNo}}", storequeryResultAdmin[0].saleOrderId)
                                                                                        var msgReplace2 = msgReplace1.replace("{{currency}}", storeAdminResult[0].currencyName)
                                                                                        var msgReplace3 = msgReplace2.replace("{{netAmount}}", storequeryResultAdmin[0].orderNetAmount)
                                                                                        var msgReplace4 = msgReplace3.replace("{{storeName}}", storeAdminResult[0].storeName)
                                                                                        var msgReplace5 = msgReplace4.replace("{{telephoneNumber}}", addressResult[0].buyerTelephone)
                                                                                        var msgReplace6 = msgReplace5.replace("{{buyerName}}", addressResult[0].buyerName)
                                                                                        message = msgReplace6
                                                                                        //console.log("tablee messge.storee." + message)
                                                                                        // });

                                                                                    } else {
                                                                                        message = "Dear " + storeAdminResult[0].storeName + ", You have an Order: " + storequeryResultAdmin[0].saleOrderId + ", Bill Amount: " + storeAdminResult[0].currencyName + " " + parseFloat(storequeryResultAdmin[0].orderNetAmount).toFixed(2) + " from " + addressResult[0].buyerName + ", Mob:" + addressResult[0].buyerTelephone + ". Thank you MyyShopp.com"
                                                                                    }
                                                                                    event.message = message;
                                                                                    event.mobileNumber = storeAdminResult[0].mobileNumber
                                                                                    smsCommon.smsCommon(client, jsonObj, event, function (response) {
                                                                                        callback(response);
                                                                                    });
                                                                                } else {
                                                                                    const response = {
                                                                                        success: "0",
                                                                                        errorMessage: "",
                                                                                        successMessage: "SMS option deactivated"
                                                                                    };
                                                                                    return callback(response);
                                                                                }
                                                                                if (messageResult[0].hassms == true && smsResult[0].is_sms_mobile == true && storeSmsResult[0].transactionalSmsCount > 0 && smsResult[0].sms_mobile != null && smsResult[0].sms_mobile != '') {
                                                                                    var mobileNumbers = smsResult[0].sms_mobile.split(",")
                                                                                    for (var i = 0; i < mobileNumbers.length; i++) {
                                                                                        if (storeSmsResult[0].transactionalSmsCount > 0) {
                                                                                            storeSmsResult[0].transactionalSmsCount = storeSmsResult[0].transactionalSmsCount - 1
                                                                                            event.message = message;
                                                                                            event.mobileNumber = mobileNumbers[i]
                                                                                            smsCommon.smsCommon(client, jsonObj, event, function (response) {
                                                                                                //callback(null,response)
                                                                                                //console.log("v3333333333333333333333 ", response)
                                                                                                callback(response);
                                                                                            });
                                                                                        } else {
                                                                                            const response = {
                                                                                                success: "0",
                                                                                                errorMessage: "Insufficient sms.",
                                                                                                successMessage: ""
                                                                                            };
                                                                                            return callback(response);
                                                                                        }
                                                                                    }
                                                                                }

                                                                            });
                                                                        } else {
                                                                            const response = {
                                                                                success: "0",
                                                                                errorMessage: "Insufficient sms.",
                                                                                successMessage: ""
                                                                            };
                                                                            return callback(response);
                                                                        }
                                                                    });
                                                                } else {
                                                                    const response = {
                                                                        success: "0",
                                                                        errorMessage: "",
                                                                        successMessage: "SMS option deactivated"
                                                                    };
                                                                    return callback(response);
                                                                }

                                                            });


                                                        } else {
                                                            const response = {
                                                                success: "0",
                                                                errorMessage: "Insufficient sms.",
                                                                successMessage: ""
                                                            };
                                                            return callback(response);
                                                        }

                                                    })
                                                })
                                            } else {
                                                var smsDataQry = " select ssd.transactional_sms_count as transactionalSmsCount,ssd.sms_sender as smsSender " +
                                                    " from site as ssd " +
                                                    " where ssd.id = ?;"
                                                //console.log(smsDataQry, " smsDataQry")
                                                connection.query(smsDataQry, [event.siteId], function (error, smsDataResult, fields) {
                                                    //console.log(smsDataResult)
                                                    if (error) {
                                                        const response = {
                                                            success: "0",
                                                            errorMessage: "Insufficient sms.",
                                                            successMessage: ""
                                                        };
                                                        return callback(response);
                                                    } else if (smsDataResult.length > 0) {
                                                        //console.log(parseInt(smsDataResult[0].transactionalSmsCount))
                                                        if (parseInt(smsDataResult[0].transactionalSmsCount) > 0) {
                                                            //Buyer
                                                            event.mobileNumber = addressResult[0].buyerTelephone
                                                            event.message = "Dear " + addressResult[0].buyerName + ", We have recieved your Order No: " + storequeryResultAdmin[0].saleOrderId +
                                                                " amounting to " + storeAdminResult[0].currencyName + " " + parseFloat(storequeryResultAdmin[0].orderNetAmount).toFixed(2) + ". " +
                                                                storeAdminResult[0].storeName + " will contact you soon, Thank you"
                                                            smsDataResult[0].transactionalSmsCount = parseInt(smsDataResult[0].transactionalSmsCount) - 1


                                                            smsCommon.smsCommon(client, jsonObj, event, function (response) {
                                                                //callback(response);
                                                                if (parseInt(smsDataResult[0].transactionalSmsCount) > 0) {
                                                                    event.mobileNumber = storeAdminResult[0].mobileNumber
                                                                    event.message = "Dear " + storeAdminResult[0].storeName + ", You have an Order: " + storequeryResultAdmin[0].saleOrderId +
                                                                        ", Bill Amount: " + storeAdminResult[0].currencyName + " " + storequeryResultAdmin[0].orderNetAmount + " from " + addressResult[0].buyerName +
                                                                        ", Mob:" + addressResult[0].buyerTelephone + ". Thank you MyyShopp.com"
                                                                    smsDataResult[0].transactionalSmsCount = parseInt(smsDataResult[0].transactionalSmsCount) - 1

                                                                    smsCommon.smsCommon(client, jsonObj, event, function (response) {
                                                                        callback(response);
                                                                    });
                                                                } else {
                                                                    const response = {
                                                                        success: "0",
                                                                        errorMessage: "Insufficient sms.",
                                                                        successMessage: ""
                                                                    };
                                                                    return callback(response);
                                                                }
                                                            });
                                                        } else {
                                                            const response = {
                                                                success: "0",
                                                                errorMessage: "Insufficient sms.",
                                                                successMessage: ""
                                                            };
                                                            return callback(response);
                                                        }
                                                    } else {
                                                        const response = {
                                                            success: "0",
                                                            errorMessage: "Insufficient sms.",
                                                            successMessage: ""
                                                        };
                                                        return callback(response);
                                                    }
                                                });
                                            }
                                        })
                                    })
                                })
                            })
                        }
                    }) //storeQuery
                })
            })
        })
    });
}
module.exports = methods;