var mysql = require('mysql');
var methods = {};
methods.sellerPayment = function (jsonObj, callback) {
    var pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField(field, useDefaultTypeCasting) { if ((field.type === "BIT") && (field.length === 1)) { var bytes = field.buffer(); return (bytes[0] === 1); } return (useDefaultTypeCasting()); }
    })
    pool.getConnection(function (err, connection) {
        var subQuery = "";
        let subQueryParams = [];
        var storeId = jsonObj.storeId
        var sellerPaymentFromDate = jsonObj.sellerPaymentFromDate
        var sellerPaymentToDate = jsonObj.sellerPaymentToDate
        var sellerId = jsonObj.sellerId
        var sellerPaymentOffset = jsonObj.sellerPaymentOffset
        var sellerPaymentMax = jsonObj.sellerPaymentMax
        var paymentResult = []
        var storeDetails = []
        var result = []

        if (storeId != "" && storeId != null && storeId != "0") {
            subQuery = " and st.id = ? ";
            subQueryParams.push(storeId);
        }
        if (sellerPaymentFromDate != "" && sellerPaymentFromDate != null && sellerPaymentToDate != "" && sellerPaymentToDate != null) {
            subQuery = subQuery + " and date(sa.created_on) between ? and ?";
            subQueryParams.push(sellerPaymentFromDate, sellerPaymentToDate);
        }
        else if ((sellerPaymentFromDate != "" && sellerPaymentFromDate != null) && (sellerPaymentToDate == "" || sellerPaymentToDate == null)) {
            subQuery = subQuery + " and date(sa.created_on) >= ? ";
            subQueryParams.push(sellerPaymentFromDate);
        }
        else if ((sellerPaymentFromDate == "" || sellerPaymentFromDate == null) && (sellerPaymentToDate != "" && sellerPaymentToDate != null)) {
            subQuery = subQuery + " and date(sa.created_on) <= ? ";
            subQueryParams.push(sellerPaymentToDate);
        }

        var queryString = " select count(*) as countto,st.seller_id as sellerid,st.name as storename,sum(cast(sa.gross_amount as decimal(18,2)))as tot,sa.payment_type_id as paymentTypeId,pt.name as paytype,date(sa.created_on) as saledate,st.id as storeId from store as st  " +
            " inner join seller as s on s.id=st.seller_id  " +
            " inner join sale_order as so on so.store_id=st.id  " +
            " inner join sale as sa on sa.id=so.sale_id  " +
            " inner join buyer as b on b.id=sa.buyer_id " +
            " inner join payment_type as pt on pt.id=sa.payment_type_id " +
            " where st.seller_id= ? " + subQuery +
            " group by st.id,pt.id ; " +

            " select count(*) as countto,st.seller_id as sellerid,st.name as storename,sum(cast(sa.gross_amount as decimal(18,2)))as tot,sa.payment_type_id as paymentTypeId,pt.name as paytype,date(sa.created_on) as saledate,st.id as storeId from store as st  " +
            " inner join seller as s on s.id=st.seller_id  " +
            " inner join sale_order as so on so.store_id=st.id  " +
            " inner join sale as sa on sa.id=so.sale_id  " +
            " inner join buyer as b on b.id=sa.buyer_id " +
            " inner join payment_type as pt on pt.id=sa.payment_type_id " +
            " where st.seller_id= ?" + subQuery +
            " group by st.id,pt.id " +
            " limit ?,? ; " +

            " select st.id as sId,st.name as strName,st.locality as locality  from store st " +
            " inner join seller as slr on slr.id = st.seller_id " +
            " where slr.id = ? and st.is_active=true  group by st.id  ; " +

            " select sa.payment_type_id as paymentTypeId,st.id as storeId," +
            " so.id as orderid,concat('Rs ',cast(sa.gross_amount as decimal(18,2)) ) as totalamount, " +
            " ifnull(concat(b.first_name,' ',b.last_name),'')as username " +
            " from store as st " +
            " inner join seller as s on s.id=st.seller_id " +
            " inner join sale_order as so on so.store_id=st.id " +
            " inner join sale as sa on sa.id=so.sale_id " +
            " inner join buyer as b on b.id=sa.buyer_id " +
            " inner join payment_type as pt on pt.id=sa.payment_type_id " +
            " where st.seller_id= ? " + subQuery + " ;";
        const queryParams = [
            sellerId,
            ...subQueryParams,
            sellerId,
            ...subQueryParams,
            parseInt(sellerPaymentOffset),
            parseInt(sellerPaymentMax),
            sellerId,
            sellerId,
            ...subQueryParams
        ];

        //console.log(queryString)
        connection.query(queryString, queryParams, function (error, queryStringResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting seller payment details"
                };
                return callback(response);
            }
            else if (queryStringResult.length > 0) {

                for (var i = 0; i < queryStringResult[1].length; i++) {
                    var temp1 = {};
                    temp1.totalCount = queryStringResult[1][i].countto == null ? '' : queryStringResult[1][i].countto,
                        temp1.sellerId = queryStringResult[1][i].sellerid == null ? '' : queryStringResult[1][i].sellerid,
                        temp1.storeName = queryStringResult[1][i].storename == null ? '' : queryStringResult[1][i].storename,
                        temp1.grossAmount = queryStringResult[1][i].tot == null ? '' : queryStringResult[1][i].tot,
                        temp1.storeId = queryStringResult[1][i].storeId == null ? '' : queryStringResult[1][i].storeId,
                        temp1.paymentTypeId = queryStringResult[1][i].paymentTypeId == null ? '' : queryStringResult[1][i].paymentTypeId,
                        temp1.paymentType = queryStringResult[1][i].paytype == null ? '' : queryStringResult[1][i].paytype,
                        temp1.saleDate = queryStringResult[1][i].saledate == null ? '' : queryStringResult[1][i].saledate
                    temp1.paymentDetails = [];

                    for (var k = 0; k < queryStringResult[3].length; k++) {
                        var temp2 = {};
                        if ((queryStringResult[1][i].paymentTypeId == queryStringResult[3][k].paymentTypeId) && (queryStringResult[1][i].storeId == queryStringResult[3][k].storeId)) {

                            temp2.orderIdForDetails = queryStringResult[3][k].orderid == null ? '' : queryStringResult[3][k].orderid,
                                temp2.grossAmountForDetails = queryStringResult[3][k].totalamount == null ? '' : queryStringResult[3][k].totalamount,
                                temp2.buyerNameForDetails = queryStringResult[3][k].username == null ? '' : queryStringResult[3][k].username

                            temp1.paymentDetails.push(temp2);
                        }
                    }
                    paymentResult.push(temp1);

                }

                var totalCount = queryStringResult[0].length
                for (var j = 0; j < queryStringResult[2].length; j++) {
                    storeDetails[j] = {
                        storeId: queryStringResult[2][j].sId == null ? '' : queryStringResult[2][j].sId,
                        storeName: queryStringResult[2][j].strName == null ? '' : queryStringResult[2][j].strName,
                        locality: queryStringResult[2][j].locality == null ? '' : queryStringResult[2][j].locality
                    }
                }
                result = {
                    paymentResult: paymentResult,
                    storeDetails: storeDetails,
                    totalCount: totalCount
                }

                const response = {
                    success: "1",
                    result: result,
                    errorMessage: "",
                    successMessage: "success"
                }
                return callback(response);
            }
            else {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "No Data Found"
                };
                return callback(response);
            }
        });

    });
}
module.exports = methods;