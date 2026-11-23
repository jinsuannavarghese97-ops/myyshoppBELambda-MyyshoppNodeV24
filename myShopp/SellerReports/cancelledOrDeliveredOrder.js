var mysql = require('mysql');
var methods = {};
methods.cancelledOrDeliveredOrder = function (jsonObj, callback) {
	var pool = mysql.createPool({
		host: jsonObj.dbhost,
		user: jsonObj.dbuser,
		password: jsonObj.dbpassword,
		database: jsonObj.dbdatabase,
		debug: false,
		multipleStatements: true,
		typeCast: function castField(field, useDefaultTypeCasting) { if ((field.type === "BIT") && (field.length === 1)) { var bytes = field.buffer(); return (bytes[0] === 1); } return (useDefaultTypeCasting()); }
	});
	pool.getConnection(function (err, connection) {
		var result = []
		var orderResult = []
		var storeResult = []
		var subQry = "";
		let subQryParams = [];
		var sellerId = jsonObj.sellerId
		var storeId = jsonObj.storeId
		var cancelDeliverOrderOrderStatusId = jsonObj.cancelDeliverOrderOrderStatusId
		var cancelDeliverOrderFromDate = jsonObj.cancelDeliverOrderFromDate
		var cancelDeliverOrderToDate = jsonObj.cancelDeliverOrderToDate
		var cancelDeliverOrderOffset = jsonObj.cancelDeliverOrderOffset
		var cancelDeliverOrderMax = jsonObj.cancelDeliverOrderMax
		var orderTotalSum = 0
		var orderCountSum = 0

		if (storeId != "") {
			subQry = " and s.id = ?";
			subQryParams.push(storeId);
		}
		if (cancelDeliverOrderOrderStatusId != "") {
			if (cancelDeliverOrderOrderStatusId == "4") {
				subQry = " and so.order_status_id = ?";
				subQryParams.push(cancelDeliverOrderOrderStatusId);
			}
			if (cancelDeliverOrderOrderStatusId == "5") {
				subQry = " and so.order_status_id = ?";
				subQryParams.push(cancelDeliverOrderOrderStatusId);
			}
		}
		if (cancelDeliverOrderFromDate != "") {
			subQry = subQry + " and DATE(sal.sale_date) between ? and ?";
			subQryParams.push(cancelDeliverOrderFromDate, cancelDeliverOrderToDate);
		}
		var queryString = "SELECT COUNT(*) AS order_count, s.name as storeName,s.id as storeId, CAST(SUM(so.gross_amount) AS DECIMAL(18, 2)) AS order_total, DATE_FORMAT(sal.sale_date, '%b-%Y') AS sale_date,slr.id as slrId,os.name as statusName " +
			" FROM sale_order so" +
			" INNER JOIN store s " +
			" ON so.store_id = s.id " +
			" INNER JOIN seller slr " +
			" ON slr.id = s.seller_id " +
			" INNER JOIN sale sal " +
			" ON sal.id = so.sale_id " +
			" inner join order_status os on os.id = so.order_status_id " +
			" WHERE slr.id = ? " + subQry + " and so.order_status_id in (4,5) " +
			" GROUP BY DATE_FORMAT(sal.sale_date, '%b-%Y') desc,s.id, so.order_status_id ORDER BY sal.sale_date desc ;" +

			" SELECT COUNT(*) AS order_count, s.name as storeName,s.id as storeId, CAST(SUM(so.gross_amount) AS DECIMAL(18, 2)) AS order_total, DATE_FORMAT(sal.sale_date, '%b-%Y') AS sale_date,slr.id as slrId,os.name as statusName " +
			" FROM sale_order so" +
			" INNER JOIN store s " +
			" ON so.store_id = s.id " +
			" INNER JOIN seller slr " +
			" ON slr.id = s.seller_id " +
			" INNER JOIN sale sal " +
			" ON sal.id = so.sale_id " +
			" inner join order_status os on os.id = so.order_status_id " +
			" WHERE slr.id = ? " + subQry + " and so.order_status_id in (4,5) " +
			" GROUP BY DATE_FORMAT(sal.sale_date, '%b-%Y') desc,s.id, so.order_status_id ORDER BY sal.sale_date desc " +
			" limit ?,? ;" +

			" select s.id as storeId,s.name as storeName from store s " +
			" inner join seller as slr on slr.id = s.seller_id " +
			" where slr.id = ? and s.is_active=true  group by s.id ; ";

		const queryStringParams = [sellerId, ...subQryParams, sellerId, ...subQryParams, parseInt(cancelDeliverOrderOffset), parseInt(cancelDeliverOrderMax), sellerId];

		connection.query(queryString, queryStringParams, function (error, queryStringResult, fields) {
			if (error) {
				const response = {
					success: "0",
					successMessage: "",
					errorMessage: "Something went wrong in getting order details"
				};
				return callback(response);
			}
			else if (queryStringResult.length > 0) {
				for (var i = 0; i < queryStringResult[1].length; i++) {
					orderResult[i] = {
						orderCount: queryStringResult[1][i].order_count == null ? '' : queryStringResult[1][i].order_count,
						storeName: queryStringResult[1][i].storeName == null ? '' : queryStringResult[1][i].storeName,
						orderTotal: queryStringResult[1][i].order_total == null ? '' : queryStringResult[1][i].order_total,
						saleDate: queryStringResult[1][i].sale_date == null ? '' : queryStringResult[1][i].sale_date,
						sellerId: queryStringResult[1][i].slrId == null ? '' : queryStringResult[1][i].slrId,
						statusName: queryStringResult[1][i].statusName == null ? '' : queryStringResult[1][i].statusName,
						storeId: queryStringResult[1][i].storeId == null ? '' : queryStringResult[1][i].storeId
					}
				}
				for (var j = 0; j < queryStringResult[2].length; j++) {
					storeResult[j] = {
						storeId: queryStringResult[2][j].storeId == null ? '' : queryStringResult[2][j].storeId,
						storeName: queryStringResult[2][j].storeName == null ? '' : queryStringResult[2][j].storeName
					}
				}
				for (var k = 0; k < queryStringResult[0].length; k++) {
					orderTotalSum = orderTotalSum + queryStringResult[0][k].order_total
					orderCountSum = orderCountSum + queryStringResult[0][k].order_count
				}
				var totalCount = queryStringResult[0].length
				result = {
					orderResult: orderResult,
					storeResult: storeResult,
					totalCount: totalCount,
					orderTotalSum: orderTotalSum,
					orderCountSum: orderCountSum
				}
				//console.log(result)
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
	})

}
module.exports = methods;