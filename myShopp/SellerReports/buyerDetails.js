var mysql = require('mysql');
var methods = {};

methods.buyerDetails = function (jsonObj, callback) {
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
        var buyerDetailscmbSearch = jsonObj.buyerDetailscmbSearch
        var buyerDetailsTextSearch = jsonObj.buyerDetailsTextSearch
        var subQuery1 = "";
        let subQuery1Params = [];
        var subQuery2 = "";
        let subQuery2Params = [];
        var subQuery3 = "";
        var buyerDetailsState = jsonObj.buyerDetailsState
        var buyerDetailsCity = jsonObj.buyerDetailsCity
        var buyerDetailsTxtlastDay = jsonObj.buyerDetailsTxtlastDay
        var buyerDetailsFromDate = jsonObj.buyerDetailsFromDate
        var buyerDetailsToDate = jsonObj.buyerDetailsToDate
        var dateLastQuery = "";
        let dateLastQueryParams = [];
        var sellerId = jsonObj.sellerId
        var storeId = jsonObj.storeId
        var buyerDetailsOffset = jsonObj.buyerDetailsOffset
        var buyerDetailsMax = jsonObj.buyerDetailsMax
        var buyerDetails = []
        var result = []
        var stateDetails = []

        if (buyerDetailscmbSearch != "" && buyerDetailscmbSearch != null && buyerDetailscmbSearch != "0") {
            if (buyerDetailscmbSearch == 'buyerName') {
                subQuery1 = subQuery1 + " and su.display_name" + " like ?";
                subQuery1Params.push("%" + buyerDetailsTextSearch + "%");
            }
            if (buyerDetailscmbSearch == 'buyerEmailId') {
                subQuery1 = subQuery1 + " and su.email_id= ?";
                subQuery1Params.push(buyerDetailsTextSearch);
            }
            if (buyerDetailscmbSearch == 'buyerMobileNumber') {
                subQuery1 = subQuery1 + " and su.mobile_number= ?";
                subQuery1Params.push(buyerDetailsTextSearch);
            }
        }
        if (buyerDetailsState != "" && buyerDetailsState != null && buyerDetailsState != "0") {
            subQuery2 = " and c.state_id = ?";
            subQuery2Params.push(buyerDetailsState);
            subQuery3 = " GROUP BY s.buyer_id order by s.sale_date desc";
        }
        if (buyerDetailsCity != "" && buyerDetailsCity != null && buyerDetailsCity != "0") {
            subQuery2 = " and l.city_id = ?";
            subQuery2Params.push(buyerDetailsCity);
            subQuery3 = " GROUP BY s.buyer_id order by s.sale_date desc";
        }
        if (storeId != "" && storeId != null && storeId != "0") {
            subQuery2 = " and so.store_id = ? ";;
            subQuery2Params.push(storeId);
        }
        if (buyerDetailsTxtlastDay != "" && buyerDetailsTxtlastDay != null && buyerDetailsTxtlastDay != "0") {
            subQuery2 = " and DATE(s.created_on) < DATE(current_date- interval ? day )";
            subQuery2Params.push(buyerDetailsTxtlastDay);
        }
        if (buyerDetailsFromDate != "" && buyerDetailsFromDate != null && buyerDetailsToDate != "" && buyerDetailsToDate != null) {
            // console.log("iff")
            // def fromdate = buyerDetailsFromDate
            //  String dateString1 = buyerDetailsFromDate.toString();
            // Date date = new SimpleDateFormat("dd/MM/yyyy").parse(dateString1);
            //  String dateString2 = new SimpleDateFormat("yyyy/MM/dd").format(date);

            //  def todate = params.toId
            //  String dateString4= params.toId.toString();
            //   Date date1 = new SimpleDateFormat("dd/MM/yyyy").parse(dateString4);
            //   String dateString3 = new SimpleDateFormat("yyyy/MM/dd").format(date1);
            subQuery2 = subQuery2 + " and date(s.created_on) between ? and  ?";
            subQuery2Params.push(buyerDetailsFromDate, buyerDetailsToDate);
            dateLastQuery = " (select group_concat(date_format(s1.sale_date,'%d-%b-%y')) from sale as s1 where s1.buyer_id = s.buyer_id and (date(sale_date) between ? and ?) order by s1.id desc )  "
            dateLastQueryParams = [buyerDetailsFromDate, buyerDetailsToDate];
        }
        else if ((buyerDetailsFromDate != "" && buyerDetailsFromDate != null) && (buyerDetailsToDate == "" || buyerDetailsToDate == null)) {
            console.log("es iff")
            subQuery2 = subQuery2 + " and date(s.created_on) >= ? ";
            subQuery2Params.push(buyerDetailsFromDate);
        }
        else if ((buyerDetailsFromDate == "" || buyerDetailsFromDate == null) && (buyerDetailsToDate != "" && buyerDetailsToDate != null)) {
            subQuery2 = subQuery2 + " and date(s.created_on) <= ? ";
            subQuery2Params.push(buyerDetailsToDate);
        }
        var queryString = " select s.id as sale_id,s.buyer_id as BuyerId,su.display_name as name,su.email_id as EmailId," + (dateLastQuery == '' ? "\'\'" : dateLastQuery) + " as lastDate, " +
            " su.mobile_number as Mobile,concat(bd.address1,',',IFNULL(bd.address2,''))as Address,l.name as Location," +
            " date_format(s.created_on,'%d-%b-%y') as CreatedOn,c.name as City,st.name as State,so.sale_id as saleId," +
            " sto.name as store,sto.id as StoreId ,slr.has_location as hasLocation" +
            " from sale as s" +
            " inner join sec_user as su on su.id=s.buyer_id " +
            " inner join buyer_delivery_address as bd on bd.id=s.buyer_delivery_address_id " +
            " left join location as l on l.id=bd.location_id " +
            " inner join city as c on c.id=l.city_id " +
            " inner join state as st on st.id=c.state_id " +
            " inner join sale_order as so on so.sale_id=s.id " +
            " inner join store as sto on sto.id=so.store_id " +
            " inner join seller as slr on slr.id = sto.seller_id " +
            " where st.is_active=true and c.is_active=true and sto.is_active=true and slr.id = ? " + subQuery2 + subQuery1 +
            " GROUP BY s.buyer_id order by s.sale_date desc ; " +

            " select s.id as sale_id,s.buyer_id as BuyerId,su.display_name as name,su.email_id as EmailId," + (dateLastQuery == '' ? "\'\'" : dateLastQuery) + " as lastDate, " +
            " su.mobile_number as Mobile,concat(bd.address1,',',IFNULL(bd.address2,''))as Address,l.name as Location," +
            " date_format(s.created_on,'%d-%b-%y') as CreatedOn,c.name as City,st.name as State,so.sale_id as saleId," +
            " sto.name as store,sto.id as StoreId ,slr.has_location as hasLocation" +
            " from sale as s" +
            " inner join sec_user as su on su.id=s.buyer_id " +
            " inner join buyer_delivery_address as bd on bd.id=s.buyer_delivery_address_id " +
            " left join location as l on l.id=bd.location_id " +
            " inner join city as c on c.id=l.city_id " +
            " inner join state as st on st.id=c.state_id " +
            " inner join sale_order as so on so.sale_id=s.id " +
            " inner join store as sto on sto.id=so.store_id " +
            " inner join seller as slr on slr.id = sto.seller_id " +
            " where st.is_active=true and c.is_active=true and sto.is_active=true and slr.id = ?" + subQuery2 + subQuery1 +
            " GROUP BY s.buyer_id order by s.sale_date desc " +
            " limit ?,? ; " +

            " SELECT s.name as stateName,s.id as stateId " +
            " FROM state as s " +
            " where s.is_active = true " +
            " order by s.name ;";
            
        const queryStringParams = [
            ...dateLastQueryParams,
            sellerId,
            ...subQuery2Params,
            ...subQuery1Params,
            ...dateLastQueryParams,
            sellerId,
            ...subQuery2Params,
            ...subQuery1Params,
            parseInt(buyerDetailsOffset),
            parseInt(buyerDetailsMax)
        ];

        connection.query(queryString, queryStringParams, function (error, queryStringResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting buyer details"
                };
                return callback(response);
            }
            else if (queryStringResult.length > 0) {
                for (var i = 0; i < queryStringResult[1].length; i++) {
                    buyerDetails[i] = {
                        saleId: queryStringResult[1][i].sale_id == null ? '' : queryStringResult[1][i].sale_id,
                        buyerId: queryStringResult[1][i].BuyerId == null ? '' : queryStringResult[1][i].BuyerId,
                        buyerName: queryStringResult[1][i].name == null ? '' : queryStringResult[1][i].name,
                        buyerEmailId: queryStringResult[1][i].EmailId == null ? '' : queryStringResult[1][i].EmailId,
                        lastOrderDate: queryStringResult[1][i].lastDate == null ? '' : queryStringResult[1][i].lastDate,
                        buyerMobileNo: queryStringResult[1][i].Mobile == null ? '' : queryStringResult[1][i].Mobile,
                        buyerAddress: queryStringResult[1][i].Address == null ? '' : queryStringResult[1][i].Address,
                        location: queryStringResult[1][i].Location == null ? '' : queryStringResult[1][i].Location,
                        createdOn: queryStringResult[1][i].CreatedOn == null ? '' : queryStringResult[1][i].CreatedOn,
                        city: queryStringResult[1][i].City == null ? '' : queryStringResult[1][i].City,
                        state: queryStringResult[1][i].State == null ? '' : queryStringResult[1][i].State,
                        storeName: queryStringResult[1][i].store == null ? '' : queryStringResult[1][i].store,
                        storeId: queryStringResult[1][i].StoreId == null ? '' : queryStringResult[1][i].StoreId,
                        hasLocation: queryStringResult[1][i].hasLocation == null ? '' : queryStringResult[1][i].hasLocation
                    }
                }
                for (var j = 0; j < queryStringResult[2].length; j++) {
                    stateDetails[j] = {
                        stateId: queryStringResult[2][j].stateId == null ? '' : queryStringResult[2][j].stateId,
                        stateName: queryStringResult[2][j].stateName == null ? '' : queryStringResult[2][j].stateName
                    }
                }
                var totalCount = queryStringResult[0].length
                result = {
                    buyerDetails: buyerDetails,
                    totalCount: totalCount,
                    stateDetails: stateDetails
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