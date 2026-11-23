const queryExecution = require('../queryExecution')
let methods = {};
methods.index = function (client, jsonObj, event, callback) {
    let wquery = " ";
    let wqueryParams = [];
    let textId = event.textId
    let orderId = event.orderId
    let fromDateQuery = event.fromDateQuery
    let toDateQuery = event.toDateQuery
    let statusQuery = event.statusQuery
    let currentUserId = event.currentUserId
    if (textId != "" && textId != null) {
        wquery = wquery + " and st.name like ? ";
        wqueryParams.push(textId + "%");
    }
    if (orderId != "" && orderId != null) {
        wquery = wquery + " and so.id = ? "
        wqueryParams.push(orderId);
    }
    if (fromDateQuery != "" && fromDateQuery != null) {
        console.log("fromDateQuery")
        wquery = wquery + " and date(s.sale_date) = ? ";
        wqueryParams.push(fromDateQuery);
    }
    if (toDateQuery != "" && toDateQuery != null) {
        console.log("toDateQuery")
        wquery = wquery + " and date(s.sale_date)= ? "
        wqueryParams.push(toDateQuery);
    }
    if (fromDateQuery != "" && fromDateQuery != null && toDateQuery != "" && toDateQuery != null) {
        wquery = wquery + " and date(s.sale_date) between ? and ? "
        wqueryParams.push(fromDateQuery, toDateQuery);
    }
    if (statusQuery != "" && statusQuery != null) {
        wquery = wquery + " and os.name = ? "
        wqueryParams.push(statusQuery);
    }
    let orderData = [];
    let orderReportQuery = " select so.id as orderId,so.main_category_id as mainCategoryId, date_format(s.sale_date, '%d %M %Y') as orderDate," +
        " st.name as storeName,st.locality as locality,os.name as orderStatus, so.gross_amount as orderAmount,s.buyer_id as buyerId, " +
        " (select date_format(status_date, '%d %M %Y') from sale_order_status where sale_order_id = orderId and order_status_id = 4 limit 1) as deliveredDate " +
        " from sale_order as so  " +
        "  inner join sale as s ON s.id = so.sale_id " +
        " inner join store as st ON st.id = so.store_id " +
        " inner join  sale_order_status as sos ON so.id = sos.sale_order_id " +
        " inner join  order_status as os ON os.id = sos.order_status_id " +
        " where s.is_active = true " +
        " and s.is_draft = false " +
        " and s.buyer_id = ? " +
        " and sos.is_current_status = true " + wquery +
        " group by so.id " +
        " ORDER BY s.created_on desc "
    const orderReportQueryParams = [currentUserId, ...wqueryParams];
    queryExecution.queryExecution(client, jsonObj, event, orderReportQuery, orderReportQueryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let orderResults = response.result
        console.log("orderResults....", orderResults)
        for (let i = 0; i < orderResults.length; i++) {
            let orderDetails = [];
            orderDetails = {
                orderNumber: orderResults[i].orderId,
                storeName: orderResults[i].storeName,
                orderDate: orderResults[i].orderDate,
                deliveryDate: orderResults[i].deliveredDate,
                orderStatus: orderResults[i].orderStatus,
                amount: orderResults[i].orderAmount,

            }
        }
        //   console.log("orderData.....",orderData)
        const responseData = {
            success: "1",
            result: {
                "orderDetails": orderData,
            },
            errorMessage: "",
            successMessage: orderResults.length > 0 ? "Success" : "No data found."
        };
        callback(responseData);
    })

}
module.exports = methods;