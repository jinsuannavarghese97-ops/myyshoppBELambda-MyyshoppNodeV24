let queryExecution = require('../queryExecution');
let methods = {};

methods.sellerAppOrderManagementMain = function (client, jsonObj, event, callback) {
    console.log("start...", new Date().getSeconds())
    let forStoreGroup = "";
    let subQuery = "",
        subQueryParams = [],
        storeQry = "",
        storeQryParams = [],
        storeQryCount = "",
        storeQryCountParams = [];
    let offset = event.offset;
    let max = event.max;
    if (event.storeId) {
        storeQry = " and st.id = ? ";
        storeQryParams.push(event.storeId);
        storeQryCount = " where store_id = ? ";
        storeQryCountParams.push(event.storeId);
    }
    if (event.sellerId) {
        storeQry = storeQry + " and st.seller_id = ? ";
        storeQryParams.push(event.sellerId);
    }
    if (event.cmbColName != "" && event.cmbColName != null && event.cmbColName != "0") {
        if (event.cmbColName == 'id') {
            subQuery = subQuery + " and so.id like ?";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
        if (event.cmbColName == 'storeName') {
            subQuery = subQuery + " and st.name" + " like ?";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
        if (event.cmbColName == 'created_by') {
            subQuery = subQuery + " and s.created_by =? ";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
        if (event.cmbColName == 'buyerName') {
            subQuery = subQuery + " and bda.name " + " like ?";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
        if (event.cmbColName == 'email_id') {
            subQuery = subQuery + " and su.email_id= ?";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
        if (event.cmbColName == 'mobile_number') {
            subQuery = subQuery + " and su.mobile_number= ?";
            subQueryParams.push("%" + event.txtSearchInput.trim() + "%");
        }
    }
    if (event.cmbStatus != "0" && event.cmbStatus != null && event.cmbStatus != "") {
        if (event.cmbStatus == "999") {
            subQuery = subQuery + " and os.id not in (1,4) "
        }
        else {
            subQuery = subQuery + " and os.id = ?";
            subQueryParams.push(event.cmbStatus);
        }

    }
    if (event.txtFrom != "" && event.txtFrom != null) {

        let fromdate = event.txtFrom.split("/")
            .reverse()
            .join("-")
        let todate = event.txtTo.split("/")
            .reverse()
            .join("-")
        subQuery = subQuery + " and DATE_FORMAT(s.sale_date,'%Y-%m-%d') between ? and  ?";
        subQueryParams.push(fromdate, todate);
    }

    let queryString = " select ifnull(s.device,'') as device, if(p.paymentId is null,'',p.paymentId) as paymentId,cr.symbol AS currencySymbol,mc.main_group_category_id as mainGroupCategoryId,st.seller_id as sellerId,so.id as orderId,date_format(s.sale_date,'%d-%m-%Y %I:%i %p') as orderDate,DATE_FORMAT(s.sale_date, '%d-%m-%y %I:%i %p') AS orderDate2,st.name as storeName,os.name as orderStatus,so.gross_amount as orderAmount,st.id as storeId,st.locality as locality,if(s.is_catering_sale is true,'1','0') as cateringsale, " +
        " su.display_name as display_name,s.created_by as created_by,os.id as statusId,su.mobile_number as mobile_number,su.email_id as email_id,bda.name as buyerName,bda.telephone_number as buyerTelephone ,so.delivery_slot  as deliverySlot,s.payment_type_id as paymentTypeId,pt.name as paymentType " +
        //" ,if(db.id is null,'',db.id) as deliveryBoyId ,if(db.name is null,'',db.name) as deliveryBoyName "+
        " from sale_order as so " +
        " inner join main_category as mc on mc.id = so.main_category_id " +
        " inner join sale as s on s.id = so.sale_id " +
        " inner join payment_type as pt on pt.id=s.payment_type_id " +
        " inner join store as st on st.id = so.store_id " + storeQry +
        " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
        " inner join sale_order_status as sos on so.id = sos.sale_order_id " +
        " inner join order_status as os on os.id = sos.order_status_id " +
        " inner join sec_user as su on su.id = s.buyer_id " +
        " inner join buyer_delivery_address as bda on bda.id=s.buyer_delivery_address_id " +
        " left join payment as p on p.id = s.payment_id " +
        // " left join delivery_boy_orders as dbo on dbo.sale_order_id = so.id "+
        // " left join delivery_boy as db on db.id = dbo.delivery_boy_id "+
        " where s.is_active = true and s.is_draft = false " + forStoreGroup +
        " and sos.is_current_status = true and so.main_category_id not in (12) " + subQuery + " group by so.id ORDER BY s.created_on  desc limit ?,?; " +

        " select count(*) as totalCount from(select so.id " +
        " from sale_order as so " +
        " inner join main_category as mc on mc.id = so.main_category_id " +
        " inner join sale as s on s.id = so.sale_id " +
        " inner join payment_type as pt on pt.id=s.payment_type_id " +
        " inner join store as st on st.id = so.store_id " + storeQry +
        " inner join sale_order_status as sos on so.id = sos.sale_order_id " +
        " inner join order_status as os on os.id = sos.order_status_id " +
        " inner join sec_user as su on su.id = s.buyer_id " +
        // " left join delivery_boy_orders as dbo on dbo.sale_order_id = so.id "+
        // " left join delivery_boy as db on db.id = dbo.delivery_boy_id "+
        "  inner join buyer_delivery_address as bda on bda.id=s.buyer_delivery_address_id " +
        " where s.is_active = true  and s.is_draft = false " + forStoreGroup +
        " and sos.is_current_status = true and so.main_category_id not in (12) " + subQuery + " group by so.id)as total ;" +

        " select count(*) as count from sale_order " + storeQryCount + ";" +

        "select db.id,db.name,dbo.sale_order_id AS saleOrderId from delivery_boy as db inner join delivery_boy_orders as dbo on db.id=dbo.delivery_boy_id ;";
        
    const queryParams = [...storeQryParams, ...subQueryParams, parseInt(offset), parseInt(max), ...storeQryParams, ...subQueryParams, ...storeQryCountParams];

   // console.log('000000000000000000ORDERmanagementqueryString....', queryString)
   // console.log("1...", queryParams)
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryParams, function (response) {
       // console.log("2...", response)
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        if (results[0].length > 0) {
            for (let i = 0; i < results[0].length; i++) {

                results[0][i].deliveryBoyId = ""
                results[0][i].deliveryBoyName = ""
                for (let j = 0; j < results[3].length; j++) {

                    if (results[0][i].orderId == results[3][j].saleOrderId) {
                        results[0][i].deliveryBoyId = results[3][j].id
                        results[0][i].deliveryBoyName = results[3][j].name
                    }
                }

            }
            //console.log("results[0].length--------",results[0].length)
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
