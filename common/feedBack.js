const queryExecution = require('../queryExecution');
const methods = {};

// Data for the "order feedback" page. Called as functionName "common/feedBack" with { buyerId }.
// Returns result.userFeedbackDetails (buyer name / phone / email / store) and result.userOrderDetails
// (delivered orders that have no feedback yet). Same queries and response as the original /myshopp
// Lambda function; only the plumbing changed to this backend's queryExecution helper.
methods.feedBack = function (client, event, callback) {
    const buyerId = event.buyerId;
    const feedbackOrderData = [];
    const userOrderData = [];

    const userFeedbackQuery =
        " select bsa.telephone_number as buyerTelephone,su.email_id as buyerEmail,st.name as storeName,bsa.name as buyerName " +
        " from sale as s " +
        " inner join sale_order as so on s.id = so.sale_id " +
        " inner join sale_order_status as sos on so.id = sos.sale_order_id " +
        " inner join order_status as os on os.id = sos.order_status_id " +
        " inner join buyer_delivery_address as bsa on bsa.id = s.buyer_delivery_address_id " +
        " inner join store as st on st.id = so.store_id " +
        " inner join sec_user as su on su.id = s.buyer_id " +
        " where s.is_active = true and s.is_draft = false " +
        " and sos.is_current_status = true and s.buyer_id = ? " +
        " group by s.buyer_id ";

    const failure = {
        success: "0",
        successMessage: "",
        errorMessage: "Something went wrong"
    };

    queryExecution.queryExecution(client, "", event, userFeedbackQuery, [buyerId], function (feedbackResponse) {
        if (feedbackResponse.success == "0") {
            return callback(failure);
        }
        const userFeedbackResults = feedbackResponse.result;
        for (let i = 0; i < userFeedbackResults.length; i++) {
            feedbackOrderData.push({
                buyerName: userFeedbackResults[i].buyerName,
                buyerTelephone: userFeedbackResults[i].buyerTelephone,
                buyerEmail: userFeedbackResults[i].buyerEmail,
                storeName: userFeedbackResults[i].storeName
            });
        }

        const userOrderQuery =
            " select sos.sale_order_id as orderId,st.name AS storeName,st.id As storeId " +
            " from sale_order_status as sos " +
            " inner join sale_order as so on so.id = sos.sale_order_id " +
            " inner join sale as s on s.id = so.sale_id " +
            " left join feedback as f on f.sale_order_id = so.id " +
            " inner join store as st on st.id = so.store_id " +
            " where f.id is null and sos.order_status_id = 4 and s.buyer_id = ? " +
            " order by orderId asc";

        queryExecution.queryExecution(client, "", event, userOrderQuery, [buyerId], function (orderResponse) {
            if (orderResponse.success == "0") {
                return callback(failure);
            }
            const userOrderResults = orderResponse.result;
            for (let i = 0; i < userOrderResults.length; i++) {
                userOrderData.push({
                    orderId: userOrderResults[i].orderId,
                    storeId: userOrderResults[i].storeId,
                    storeName: userOrderResults[i].storeName
                });
            }
            callback({
                success: "1",
                result: {
                    "userOrderDetails": userOrderData,
                    "userFeedbackDetails": feedbackOrderData
                },
                errorMessage: "",
                successMessage: "Success"
            });
        });
    });
};
module.exports = methods;
