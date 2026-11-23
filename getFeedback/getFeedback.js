const queryExecution = require('../queryExecution')
let methods = {};

methods.index = function (client, jsonObj, event, callback) {

    let buyerId = event.buyerId
    let feedbackOrderData = [];
    let userFeedbackQuery
    let userOrderQuery
    let userOrderData = [];

    userFeedbackQuery = " select bsa.telephone_number as buyerTelephone,su.email_id as buyerEmail,st.name as storeName,bsa.name as buyerName " +
        " from sale as s " +
        " inner join sale_order as so on s.id = so.sale_id " +
        " inner join sale_order_status as sos on so.id = sos.sale_order_id " +
        " inner join order_status as os on os.id = sos.order_status_id " +
        " inner join buyer_delivery_address as bsa on bsa.id = s.buyer_delivery_address_id " +
        " inner join store as st on st.id = so.store_id " +
        " inner join sec_user as su on su.id = s.buyer_id " +
        " where s.is_active = true and s.is_draft = false " +
        " and sos.is_current_status = true and s.buyer_id = ? " +
        " group by s.buyer_id "
    queryExecution.queryExecution(client, jsonObj, event, userFeedbackQuery, [buyerId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let userFeedbackResults = response.result
        for (let i = 0; i < userFeedbackResults.length; i++) {
            let userFeedbackDetails = {
                buyerName: userFeedbackResults[i].buyerName,
                buyerTelephone: userFeedbackResults[i].buyerTelephone,
                buyerEmail: userFeedbackResults[i].buyerEmail,
                storeName: userFeedbackResults[i].storeName
            }
            feedbackOrderData.push(userFeedbackDetails)
        }

        userOrderQuery = " select sos.sale_order_id as orderId,st.name AS storeName,st.id As storeId " +
            " from sale_order_status as sos " +
            " inner join sale_order as so on so.id = sos.sale_order_id " +
            " inner join sale as s on s.id = so.sale_id " +
            " left join feedback as f on f.sale_order_id = so.id " +
            "  inner join store as st on st.id = so.store_id " +
            " where f.id is null and sos.order_status_id = 4 and s.buyer_id = ? order by orderId asc"
        queryExecution.queryExecution(client, jsonObj, event, userOrderQuery, [buyerId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let userOrderResults = response.result
            for (let i = 0; i < userOrderResults.length; i++) {
                let userOrderDetails = [];
                userOrderDetails = {
                    orderId: userOrderResults[i].orderId,
                    storeId: userOrderResults[i].storeId,
                    storeName: userOrderResults[i].storeName,
                }
                userOrderData.push(userOrderDetails)
            }
            const responseData = {
                success: "1",
                result: {
                    "userOrderDetails": userOrderData,
                    "userFeedbackDetails": feedbackOrderData

                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(responseData);

        })


    })


}
module.exports = methods;