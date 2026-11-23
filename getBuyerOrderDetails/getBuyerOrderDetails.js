const queryExecution = require('../queryExecution')
let methods = {};

methods.index = function (client, jsonObj, event, callback) {

    let orderId = event.orderId
    let orderItemdata = [];
    let orderItemQuery = " select soi.id as itemId,soi.item_name as itemName,soi.item_code as itemCode,soi.quantity as quantity," +
        " soi.net_amount as itemPrice,soi.mrp as itemMrp,b.name as brandName,if(it.is_loose_item = false,p.name,concat(soi.unit,' ',soi.unit_type)) as packName, " +
        " it.is_loose_item as looseItem,sos.unit as stockUnit,sos.net_amount as stockNetAmount,sos.unit_type as stockUnitType, '' as  size_name " +
        " from sale_order_item as soi " +
        " inner join sale_order as so on so.id = soi.sale_order_id " +
        " INNER JOIN store_item_stock as sos ON sos.id = soi.store_item_stock_id " +
        " inner join sale as s on s.id = so.sale_id " +
        "  INNER JOIN item it ON it.id = soi.item_id " +
        " INNER JOIN pack p ON p.id = it.pack_id  " +
        "  LEFT OUTER JOIN brand as b ON it.brand_id=b.id " +
        " where so.id = ? "
    //connection.query(orderItemQuery, function (error, orderItemResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, orderItemQuery, [orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let orderItemResults = response.result

        for (let i = 0; i < orderItemResults.length; i++) {
            let orderItemDetails = [];
            orderItemDetails = {
                itemName: orderItemResults[i].itemName,
                itemCode: orderItemResults[i].itemCode,
                itemMrp: orderItemResults[i].itemMrp,
                itemPrice: orderItemResults[i].itemPrice,
                quantity: orderItemResults[i].quantity,
            }
            orderItemdata.push(orderItemDetails)
        }
        const responseData = {
            success: "1",
            result: {
                "orderItemDetails": orderItemdata,

            },
            errorMessage: "",
            successMessage: orderItemResults.length > 0 ? "Success" : "No data found."
        };
        callback(responseData);


    })
    let orderQuery = "select so.id as orderId,os.name as orderStatus,so.message as message,so.consumer_number as consumerNumber,p.name as paymentType," +
        " date_format(s.sale_date,'%d-%b-%Y %I:%i %p') as orderDate,so.delivery_slot as deliverySlot,bsa.name as buyerName, bsa.address1 as buyerAddress1," +
        " bsa.address2 as buyerAddress2,so.delivery_charge as deliverCharge,so.promocode_item_name as promoCodeItemName,so.promo_code_amount as promoCodeAmount," +
        " so.promo_code_id as promoCode,so.gross_amount as orderNetAmount,l.name as locationName,c.name as cityName,sta.name as stateName,bsa.telephone_number as buyerTelephone," +
        " bsa.zip as zipcode,su.email_id as buyerEmail,bsa.id as buyerAddressId,s.site_id as siteId,s.created_by as created,so.dine_in_no_of_people as dineIn," +
        " so.`is_dine_in` as isDineIn,so.`is_store_pick_up` as isStorePickUp " +
        "  from sale as s " +
        " inner join sale_order as so on s.id = so.sale_id " +
        "  inner join sale_order_status as sos on so.id = sos.sale_order_id " +
        " inner join order_status as os on os.id = sos.order_status_id " +
        " inner join buyer_delivery_address as bsa on bsa.id = s.buyer_delivery_address_id " +
        " inner join location as l on l.id= bsa.location_id " +
        " inner join city as c on c.id = l.city_id " +
        "  inner join state as sta on sta.id = c.state_id " +
        " inner join store as st on st.id = so.store_id " +
        "  inner join sec_user as su on su.id = s.buyer_id " +
        " inner join payment_type as p on p.id = s.payment_type_id " +
        " where s.is_active = true " +
        " and sos.is_current_status = true " +
        "and so.id = ? "

    //connection.query(orderQuery, function (error, orderResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, orderQuery, callback, [orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let orderResults = response.result

        for (let i = 0; i < orderResults.length; i++) {
            let orderDetails = [];
            orderDetails = {
                orderId: orderResults[i].orderId,
                orderStatus: orderResults[i].orderStatus,
                orderDate: orderResults[i].orderDate,
                buyerAddress1: orderResults[i].buyerAddress1,
                paymentType: orderResults[i].paymentType,
            }
            orderItemdata.push(orderDetails)
        }
        const responseData = {
            success: "1",
            result: {
                "orderDetails": orderItemdata,

            },
            errorMessage: "",
            successMessage: orderResults.length > 0 ? "Success" : "No data found."
        };
        callback(responseData);

    })
    let storeAddressQuery = " select st.email_footer_text as email_footer_text,st.name as storeName,st.address1 as storeAddress1,st.address2 as storeAddress2," +
        " c.name as cityName,s.name as stateName,st.id,st.locality as locality," +
        " su.email_id as email,st.telephone_number as telephone,su.mobile_number as mobile " +
        "  from store as st " +
        " inner join sale_order as so on so.store_id = st.id  " +
        " inner join sec_user as su on su.id = st.sec_user_id " +
        " inner join city as c on c.id = st.city_id  " +
        " inner join state as s on s.id = c.state_id " +
        " where so.id = ? "

    /*connection.query(storeAddressQuery, function (error, storeAddressResults, fields) {
       connection.release();*/
    queryExecution.queryExecution(client, jsonObj, event, storeAddressQuery, callback, [orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let storeAddressResults = response.result

        for (let i = 0; i < storeAddressResults.length; i++) {
            let storeAddressDetails = [];
            storeAddressDetails = {
                storeName: storeAddressResults[i].storeName,
                storeAddress: storeAddressResults[i].storeAddress1,
                cityName: storeAddressResults[i].cityName,
                stateName: storeAddressResults[i].stateName,
                mobile: storeAddressResults[i].mobile,
            }
            orderItemdata.push(storeAddressDetails)
        }
        const responseData = {
            success: "1",
            result: {
                "storeAddressDetails": orderItemdata,

            },
            errorMessage: "",
            successMessage: storeAddressResults.length > 0 ? "Success" : "No data found."
        };
        callback(responseData)

    })
}
module.exports = methods;