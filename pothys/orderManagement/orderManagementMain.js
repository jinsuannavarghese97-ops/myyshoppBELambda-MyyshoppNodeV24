const mysql = require('mysql');
const methods = {};
methods.orderManagementMain = function (client, jsonObj, event, queryExecution, callback) {

    let forStoreGroup = ""
    let subQuery = "",
        storeQry = "",
        storeQryCount = "";
    let subQueryParams = [];
    let offset = event.offset;
    let max = event.max;
    let storeQryParams = [];
    let storeQryCountParams = [];
    if (event.storeId) {
        storeQry = " and st.id = ?";
        storeQryCount = " where store_id = ?";
        storeQryParams.push(event.storeId);
        storeQryCountParams.push(event.storeId);
    }
    console.log("storeQry..", storeQry)
    if (event.cmbColName != "" && event.cmbColName != null && event.cmbColName != "0") {
        if (event.cmbColName == 'id') {
            subQuery = subQuery + " and so.id like ?";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
        if (event.cmbColName == 'storeName') {
            subQuery = subQuery + " and st.name like ?";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
        if (event.cmbColName == 'created_by') {
            subQuery = subQuery + " and s.created_by = ?";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
        if (event.cmbColName == 'display_name') {
            subQuery = subQuery + " and su.display_name like ?";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
        if (event.cmbColName == 'email_id') {
            subQuery = subQuery + " and su.email_id=?";
            subQueryParams.push(event.txtSearchInput.trim());
        }
        if (event.cmbColName == 'mobile_number') {
            subQuery = subQuery + " and su.mobile_number= ?";
            subQueryParams.push(event.txtSearchInput.trim());
        }
        if (event.cmbColName == 'ondc_order_number') {
            subQuery = subQuery + " and s.ondc_order_number like ?";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
    }
    if (event.cmbStatus != "0" && event.cmbStatus != null && event.cmbStatus != "") {

        subQuery = subQuery + " and os.id = ?";
        subQueryParams.push(event.cmbStatus);
    }
    if (event.txtFrom != "" && event.txtFrom != null) {

        let fromdate = event.txtFrom.split("/")
            .reverse()
            .join("-")
        let todate = event.txtTo.split("/")
            .reverse()
            .join("-")
        subQuery = subQuery + " and DATE_FORMAT(s.sale_date,'%Y-%d-%m') between ? and  ?";
        subQueryParams.push(fromdate, todate);
    }
    let siteGroupCategoryJoinQry = ""
    let siteGroupCategorywhereQry = "";
    let siteGroupCategorywhereQryParams = [];

    if (event.siteCategoryGroupId) {
        siteGroupCategoryJoinQry = "  inner join site_category_group_stores as scgs on scgs.store_id=st.id "
        siteGroupCategorywhereQry = " and scgs.site_category_group_id= ?";
        siteGroupCategorywhereQryParams.push(event.siteCategoryGroupId);
    }
    console.log("siteGroupCategorywhereQry..", siteGroupCategorywhereQry);
    let queryString = " select ifnull(s.device,'') as device, if(p.paymentId is null,'',p.paymentId) as paymentId,cr.symbol AS currencySymbol,mc.main_group_category_id as mainGroupCategoryId,st.seller_id as sellerId,so.id as orderId,date_format(s.sale_date,'%d-%b-%Y %k:%i') as orderDate,st.name as storeName,os.name as orderStatus,so.gross_amount as orderAmount,st.id as storeId,st.locality as locality,if(s.is_catering_sale is true,'1','0') as cateringsale ,if(s.from_ondc is true ,'1','0') as fromOndc,s.ondc_order_number as ondcOrderNumber,s.ondc_fullfillment_states_id as ondcFullfillmentStatesId,ofs.ondc_state_name as ondcStateName ,ocs.reason as ondcCancellReason,ocs.code as ondcCancellReasonCode,so.cancelled_convenience_fee as cancelledConvenienceFee , so.cancelled_tax as cancelledTax ,so.cancelled_total as cancelledTotal ,s.ondc_covenient_fee as ondcConvenientFee,ondclog.on_init_json as ondcOnInitJson,ondclog.on_status_json as ondcLogisticsOnStatusJson " +
        " from sale_order as so " +
        " inner join main_category as mc on mc.id = so.main_category_id " +
        " inner join sale as s on s.id = so.sale_id " +
        " inner join store as st on st.id = so.store_id " + storeQry + siteGroupCategoryJoinQry +
        " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
        " inner join sale_order_status as sos on so.id = sos.sale_order_id " +
        " inner join order_status as os on os.id = sos.order_status_id " +
        //" inner join sale_order_item  as soi on soi.sale_order_id = so.id "+
        " inner join sec_user as su on su.id = s.buyer_id " +
        " left join ondc_fullfillment_states as ofs on ofs.id = s.ondc_fullfillment_states_id " +
        " left join ondc_cancell_reason as ocs on ocs.id = s.ondc_cancell_reason_id " +
        " left join payment as p on p.id = s.payment_id " +
        " left join ondc_logistics as ondclog on ondclog.sale_order_id=so.id " +
        " where s.is_active = true and s.is_draft = false " + forStoreGroup + siteGroupCategorywhereQry +
        " and sos.is_current_status = true and so.main_category_id not in (12) " + subQuery + " group by so.id ORDER BY s.created_on  desc limit ?,?; " +

        " select count(*) as totalCount from(select so.id " +
        " from sale_order as so " +
        " inner join main_category as mc on mc.id = so.main_category_id " +
        " inner join sale as s on s.id = so.sale_id " +
        " inner join store as st on st.id = so.store_id " + storeQry + siteGroupCategoryJoinQry +
        " inner join sale_order_status as sos on so.id = sos.sale_order_id " +
        " inner join order_status as os on os.id = sos.order_status_id " +
        //" inner join sale_order_item  as soi on soi.sale_order_id = so.id "+
        " inner join sec_user as su on su.id = s.buyer_id " +
        " left join ondc_fullfillment_states as ofs on ofs.id = s.ondc_fullfillment_states_id " +
        " left join ondc_cancell_reason as ocs on ocs.id = s.ondc_cancell_reason_id " +
        " left join payment as p on p.id = s.payment_id " +
        " left join ondc_logistics as ondclog on ondclog.sale_order_id=so.id " +
        " where s.is_active = true  and s.is_draft = false " + forStoreGroup + siteGroupCategorywhereQry +
        " and sos.is_current_status = true and so.main_category_id not in (12) " + subQuery + " group by so.id)as total ;" +

        " select count(*) as count from sale_order " + storeQryCount + ";" +
        "select db.id,db.name,db.contact_no,dbo.sale_order_id AS saleOrderId,dbo.id AS deliveryBoyOrdersId from delivery_boy as db inner join delivery_boy_orders as dbo on db.id=dbo.delivery_boy_id ;";
    const params = [
        ...storeQryParams,
        ...siteGroupCategorywhereQryParams,
        ...subQueryParams,
        parseInt(offset),
        parseInt(max),
        ...storeQryParams,
        ...siteGroupCategorywhereQryParams,
        ...subQueryParams,
        ...storeQryCountParams
    ];
    console.log("queryString....", queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString, params, function (response) {
        //  console.log("response....",response)
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        if (results[0].length > 0) {
            for (let i = 0; i < results[0].length; i++) {
                let providerName = ""
                let deliveryCharge = ""
                let currency = ""
                if (results[0][i].ondcLogisticsOnStatusJson) {
                    results[0][i].ondcLogisticsOnStatusJson = JSON.parse(results[0][i].ondcLogisticsOnStatusJson)
                }
                if (results[0][i].ondcOnInitJson) {

                    let onInitJson = JSON.parse(results[0][i].ondcOnInitJson);
                    results[0][i].ondcOnInitJson = onInitJson
                    providerName = onInitJson.message.order.provider.id
                    deliveryCharge = onInitJson.message.order.quote.price.value
                    currency = onInitJson.message.order.quote.price.currency
                }

                results[0][i].ondcLogisticsDeliveryCharge = deliveryCharge
                results[0][i].ondcLogisticsDeliveryChargeCurrency = currency
                results[0][i].ondcProviderName = providerName
                let orderAmount = parseFloat(results[0][i].orderAmount) - parseFloat(results[0][i].cancelledTotal)
                orderAmount = orderAmount - parseFloat(results[0][i].cancelledConvenienceFee)
                results[0][i].orderAmount = (Math.round(orderAmount * 100) / 100).toFixed(2);
                results[0][i].deliveryBoyId = ""
                results[0][i].deliveryBoyName = ""
                results[0][i].deliveryBoyContactNo = ""
                results[0][i].deliveryBoyOrdersId = ""
                if (results[3].length > 0) {
                    for (let j = 0; j < results[3].length; j++) {

                        if (results[0][i].orderId == results[3][j].saleOrderId) {
                            results[0][i].deliveryBoyId = results[3][j].id
                            results[0][i].deliveryBoyName = results[3][j].name
                            results[0][i].deliveryBoyContactNo = results[3][j].contact_no
                            results[0][i].deliveryBoyOrdersId = results[3][j].deliveryBoyOrdersId
                        }
                    }
                }
            }
            console.log(results[0])
            const response = {
                "success": "1",
                "successMessage": "Success",
                "result": results[0],
                "count": results[1][0].totalCount,
                "errorMessage": ""
            }
            callback(response)
        }
        else {
            const response = {
                "success": "1",
                "successMessage": "No data found matching the criteria.",
                "errorMessage": ""
            }
            callback(response)
        }
    });
}
module.exports = methods;
