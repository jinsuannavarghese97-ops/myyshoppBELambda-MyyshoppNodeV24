const queryExecution = require('../queryExecution')
let methods = {};

methods.ondcOrderDetails = function (client, jsonObj, event, callback) {
    console.log("event....", event)
    let limitQry = ""
    let subQuery = ""
    let values = []
    let limitQryVal = []
    const removeQuotes = (str) => {
        return str.split("'").join('');
    };
    if (event.max) {
        limitQry = "limit  ?,?"
        limitQryVal.push(parseInt(event.offset), parseInt(event.max))
    }
    if (event.searchKey == 'networkOrderId') {
        subQuery = subQuery + " and os.ondc_order_id like ? "
        values.push(removeQuotes("'%" + event.searchValue + "%'"))
    }
    else if (event.searchKey == 'networkTransactionId') {
        subQuery = subQuery + " and REPLACE(json_extract(json_extract(os.ondc_json,'$.context'),'$.transaction_id'),'\"','') like ?"
        values.push(removeQuotes("'%" + event.searchValue + "%'"))

    }
    else if (event.searchKey == 'sellerNPorderId') {
        subQuery = subQuery + " and so.id like ? "
        values.push(removeQuotes("'%" + event.searchValue + "%'"))

    }
    else if (event.searchKey == 'storeName') {
        subQuery = subQuery + " and st.name like ? "
        values.push(removeQuotes("'%" + event.searchValue + "%'"))

    }
    if (event.fromDate != "" && event.fromDate != null && event.toDate != "" && event.toDate != null) {
        subQuery = (subQuery + " and  date(s.created_on) >= ? and  date(s.created_on) <= ?")
        values.push(event.fromDate, event.toDate)

    }
    else if ((event.fromDate != "" && event.fromDate != null) && (event.toDate == "" || event.toDate == null)) {
        subQuery = (subQuery + " and   date(s.created_on) >= ? ")
        values.push(event.fromDate)

    }
    else if ((event.fromDate == "" || event.fromDate == null) && (event.toDate != "" && event.toDate != null)) {
        subQuery = (subQuery + " and  date(s.created_on) <= ? ")
        values.push(event.toDate)

    }
    if (event.storeId) {
        subQuery = subQuery + " and st.id= ? "
        values.push(event.storeId)

    }
    let orderDetailsQuery = "select s.created_on as orderCreateDateTime , so.id as sellerNPOrderId,soi.store_item_stock_id as itemId, " +
        "soi.quantity as qty ,os.ondc_order_id as networkOrderId ,st.name as nameOfSeller ,st.zip_code as sellerPinCode ,soi.cancelled_by as cancelledBy, " +
        "if(orr.reason ,orr.reason ,ocr.reason ) as cancellationOrReturnReason,so.net_amount as totalOrderValue,bda.zip as deliveryPincode," +
        "c.name as deliveryCity,ost.ondc_status as orderStatus, REPLACE(json_extract(json_extract(os.ondc_json,'$.context'),'$.bap_id'),'\"','') as buyerNPname," +
        "REPLACE(json_extract(json_extract(os.ondc_json,'$.context'),'$.bpp_id'),'\"','') as sellerNPname,REPLACE(json_extract(json_extract(os.ondc_json,'$.context'),'$.transaction_id'),'\"','') as networkTransactionId, " +
        "'MSN' as sellerNPtype,'0.00' as totalShippingCharge ,soi.cancelled_at as cancelledAtDateTime ,so.cancelled_total as totalRefundAmount,sis.item_name as SKUname,sis.id as SKUcode,'Grocery' as orderCategory ,ondclog.ready_to_ship_datetime  as readyToShipDateTime,ondclog.shiped_datetime as shippedAtDateAndTime,'' as deliveryType , " +
        " '' as logisticSellerNPname ,ondclog.order_id as logisticNetworkOrderId ,ondclog.transaction_id as logisticNetworkTransactionId ,ondclog.delivered_datetime as deliveredAtDateTime,(select ci.name from city as ci where st.city_id=ci.id) as sellerCity,ondclog.on_confirm_json as ondcLogisticsOnConfirmJson,st.id as storeId  " +
        "from sale as s " +
        "INNER JOIN sale_order as so ON s.id = so.sale_id  " +
        "INNER JOIN sale_order_item as soi ON soi.sale_order_id = so.id " +
        " INNER JOIN store_item_stock as sis on sis.id=soi.store_item_stock_id " +
        "inner join sale_order_status as sos on so.id = sos.sale_order_id and sos.is_current_status = true " +
        "inner join order_status as ost on ost.id = sos.order_status_id " +
        "INNER JOIN ondc_sale AS os ON os.ondc_order_id = s.ondc_order_number " +
        "INNER JOIN store as st ON st.id = so.store_id " +
        "LEFT JOIN ondc_return_reason as orr ON orr.id = soi.ondc_return_reason_id " +
        "LEFT JOIN ondc_cancell_reason as ocr ON ocr.id = soi.ondc_cancel_reason_id " +
        "LEFT JOIN ondc_logistics AS ondclog ON ondclog.sale_order_id=so.id " +
        "INNER JOIN buyer_delivery_address as bda on bda.id = s.buyer_delivery_address_id " +
        "inner join location as l on l.id= bda.location_id " +
        "inner join city as c on c.id = l.city_id " +
        "WHERE s.from_ondc = true " + subQuery +
        " ORDER BY so.id desc " + limitQry + ";" +

        " select count(*)as totalCount " +
        "from sale as s " +
        "INNER JOIN sale_order as so ON s.id = so.sale_id  " +
        "INNER JOIN sale_order_item as soi ON soi.sale_order_id = so.id " +
        " INNER JOIN store_item_stock as sis on sis.id=soi.store_item_stock_id " +
        "inner join sale_order_status as sos on so.id = sos.sale_order_id and sos.is_current_status = true " +
        "inner join order_status as ost on ost.id = sos.order_status_id " +
        "INNER JOIN ondc_sale AS os ON os.ondc_order_id = s.ondc_order_number " +
        "INNER JOIN store as st ON st.id = so.store_id " +
        "LEFT JOIN ondc_return_reason as orr ON orr.id = soi.ondc_return_reason_id " +
        "LEFT JOIN ondc_cancell_reason as ocr ON ocr.id = soi.ondc_cancel_reason_id " +
        "LEFT JOIN ondc_logistics AS ondclog ON ondclog.sale_order_id=so.id " +
        "INNER JOIN buyer_delivery_address as bda on bda.id = s.buyer_delivery_address_id " +
        "inner join location as l on l.id= bda.location_id " +
        "inner join city as c on c.id = l.city_id " +
        "WHERE s.from_ondc = true " + subQuery +
        " ORDER BY so.id desc  ;"

    console.log("orderDetailsQuery.....", orderDetailsQuery);
    queryExecution.queryExecution(client, jsonObj, event, orderDetailsQuery, [...values, ...limitQryVal, ...values], function (queryStringResult) {
        // console.log("queryStringResult.....",queryStringResult);
        let result = queryStringResult.result[0]

        if (result.success == '0') {
            callback(result);
        }
        else {
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    if (result[i].ondcLogisticsOnConfirmJson) {
                        let ondcLogisticsOnConfirmJson = JSON.parse(result[i].ondcLogisticsOnConfirmJson);
                        let providerName = ondcLogisticsOnConfirmJson.message.order.provider.id;
                        console.log("providerName....", providerName);
                        result[i].providerName = providerName
                        result[i].logisticSellerNPname = providerName
                    }
                    else {
                        result[i].providerName = ""
                    }
                }

            }
            // console.log(result);
            let response = {
                success: "1",
                result: result,
                totalCount: queryStringResult.result[1][0].totalCount,
                errorMessage: "",
                successMessage: "Success"
            };

            callback(response);
        }

        // console.log("queryStringResult.....",result);

    });

}
module.exports = methods;