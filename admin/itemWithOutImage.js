const queryExecution = require('../queryExecution')
let methods = {};

methods.itemWithOutImage = function (client, jsonObj, event, callback) {

	var wquery = ""
	var params = event
	console.log('params......', params)
	var storeId = params.storeId
	var sqlLimit = ""
	let sqlLimitVal = []
	const removeQuotes = (str) => {
		return str.split("'").join('');
	};
	let values = []
	if (params.max) {
		sqlLimit = " limit ?,? "
		sqlLimitVal.push(parseInt(params.offset), parseInt(params.max))
	}
	if (params.cmbStatus != "" && params.cmbStatus != null && params.cmbStatus != "0") {

		if (params.cmbStatus == "true") {


			wquery = wquery + " and t.is_active = ? "
			values.push(params.cmbStatus)
		}

		if (params.cmbStatus == "false") {


			wquery = wquery + " and t.is_active = ? "
			values.push(params.cmbStatus)

		}


	}

	if (params.cmbSelect != null && params.cmbSelect != "" && params.cmbSelect != "0") {

		if (params.cmbSelect == '1') {
			wquery = wquery + " and t.name like ? "
			values.push(removeQuotes("'" + params.txtInput.trim() + "%'"))

		}
		if (params.cmbSelect == '2') {
			wquery = wquery + " and c.name like ? "
			values.push(removeQuotes("'" + params.txtInput.trim() + "%'"))

		}
		if (params.cmbSelect == '3') {
			wquery = wquery + " and d.name like ? "
			values.push(removeQuotes("'" + params.txtInput.trim() + "%'"))

		}
		if (params.cmbSelect == '4') {
			wquery = wquery + " and e.name like ? "
			values.push(removeQuotes("'" + params.txtInput.trim() + "%'"))

		}
		if (params.cmbSelect == '5') {
			wquery = wquery + " and t.id like ? "
			values.push(removeQuotes("'" + params.txtInput.trim() + "%'"))

		}
	}
	if (params.cmbLogoSelect != "" && params.cmbLogoSelect != null && params.cmbLogoSelect != "0") {
		if (params.cmbLogoSelect == "1") {

			wquery = wquery + " and t.logo_path  ='noimage2x.jpg' "
		}
		if (params.cmbLogoSelect == "2") {

			wquery = wquery + " and t.logo_path_thumb  ='noimage1x.jpg' "
		}
	}

	var maicategoryQuery = " Select m.id as maincatoryId,m.main_group_category_id as mainGroupCategoryId from main_category as m inner join store_main_category as smc on smc.main_category_id = m.id where smc.store_id = ? "
	console.log('maicategoryQuery.....', maicategoryQuery)
	queryExecution.queryExecution(client, jsonObj, event, maicategoryQuery, [params.storeId, ...values], function (mainQueryResult) {
		let results = mainQueryResult.result
		if (results.length > 0) {
			console.log('results.....', results)
			var maingroup = results[0].mainGroupCategoryId
			console.log('maingroup......', maingroup)
			var dQuery = ""
			if (maingroup == 1 || params.cmbLogoSelect1 == "2" || storeId == null) {

				dQuery = " SELECT stk.seller_id,t.id,t.name AS itemName,if(t.is_active=1,true,false) as isActive,t.logo_path_thumb AS tlthumb," +
					"stk.item_code AS sitem,s.id AS sid,c.name AS cname,t.logo_path AS tlogo," +
					" d.name AS dname,e.name AS ename ,b.name AS bname,p.name AS pname " +
					" FROM seller_item  AS stk " +
					"INNER JOIN item AS t ON t.id=stk.item_id  " +
					" inner join seller as sl on sl.id=stk.seller_id " +
					" INNER JOIN store AS s ON s.seller_id=sl.id " +
					" INNER JOIN category_level1 AS c ON c.id =t.category_level1_id " +
					" INNER JOIN category_level2 AS d ON d.id =t.category_level2_id " +
					" LEFT JOIN category_level3 AS e ON e.id=t.category_level3_id" +
					" LEFT JOIN brand AS b ON b.id=t.brand_id  " +
					" left JOIN pack AS p ON p.id=t.pack_id " +
					" WHERE (t.logo_path LIKE 'noimage2x.jpg%' OR t.logo_path_thumb LIKE 'noimage1x.jpg%') AND t.is_active = TRUE and stk.is_active=true " +
					" AND s.id = ?" + wquery +
					" group by t.id " +
					" ORDER BY t.id ASC "

			}
			if (params.cmbLogoSelect1 == "1" || storeId == null) {

				dQuery = " SELECT stk.store_id,t.id,t.name AS itemName,if(t.is_active=1,true,false) as isActive,t.logo_path_thumb AS tlthumb," +
					"stk.item_code AS sitem,s.id AS sid,c.name AS cname,t.logo_path AS tlogo," +
					" d.name AS dname,e.name AS ename ,b.name AS bname,p.name AS pname " +
					" FROM store_item_stock AS stk " +
					"INNER JOIN item AS t ON t.id=stk.item_id  " +
					"INNER JOIN store AS s ON s.id=stk.store_id " +
					" INNER JOIN category_level1 AS c ON c.id =t.category_level1_id " +
					" INNER JOIN category_level2 AS d ON d.id =t.category_level2_id " +
					" LEFT JOIN category_level3 AS e ON e.id=t.category_level3_id" +
					" LEFT JOIN brand AS b ON b.id=t.brand_id  " +
					" left JOIN pack AS p ON p.id=t.pack_id " +
					" WHERE (t.logo_path LIKE 'noimage2x.jpg%' OR t.logo_path_thumb LIKE 'noimage1x.jpg%') AND t.is_active = TRUE and stk.is_active=true " +
					" AND stk.store_id = ?" + wquery +
					" group by t.id " +
					" ORDER BY t.id ASC "


			}

			if (maingroup == 5 || storeId == null) {

				dQuery = " SELECT t.store_id,t.id,t.name AS itemName,if(t.is_active=1,true,false) as isActive,t.id AS sitem,c.name AS cname, d.name AS dname,e.name AS ename " +
					" FROM rt_store_item AS t " +
					" INNER JOIN rt_course AS c ON c.id =t.rt_course_id " +
					" INNER JOIN rt_course_type AS d ON d.id =t.rt_course_type_id " +
					" INNER JOIN rt_cuisine AS e ON e.id=t.rt_cuisine_id " +
					" WHERE t.image is null and t.store_id = ?" + wquery +
					" ORDER BY t.store_id,t.id ASC "

			}
			if (maingroup == 21 || storeId == null) {

				dQuery = " SELECT stk.store_id,t.id,t.name AS itemName,if(t.is_active=1,true,false) as isActive,t.logo_path_thumb AS tlthumb," +
					"stk.item_code AS sitem,s.id AS sid,c.name AS cname,t.logo_path AS tlogo," +
					" d.name AS dname,e.name AS ename ,b.name AS bname,p.name AS pname " +
					" FROM ph_store_item_stock AS stk " +
					"INNER JOIN ph_item AS t ON t.id=stk.item_id  " +
					"INNER JOIN store AS s ON s.id=stk.store_id " +
					" INNER JOIN ph_category_level1 AS c ON c.id =t.ph_category_level1_id " +
					" INNER JOIN ph_category_level2 AS d ON d.id =t.ph_category_level2_id " +
					" LEFT JOIN ph_category_level3 AS e ON e.id=t.ph_category_level3_id" +
					" LEFT JOIN ph_brand AS b ON b.id=t.ph_brand_id  " +
					" INNER JOIN ph_pack AS p ON p.id=t.ph_pack_id " +
					" WHERE (t.logo_path LIKE 'noimage2x.jpg%' OR t.logo_path_thumb LIKE 'noimage1x.jpg%') AND t.is_active = TRUE " +
					" AND stk.store_id = ?" + wquery +
					" group by t.id " +
					" ORDER BY t.id ASC "

			}
			if (maingroup == 6 || storeId == null) {

				dQuery = " SELECT t.store_id,t.id,t.name AS itemName,if(t.is_active=1,true,false) as isActive,item.id AS sitem,c.name AS cname, d.name AS dname,e.name AS ename ,b.name AS bname " +
					" FROM fur_item_master AS t  " +
					" INNER JOIN fur_item AS item ON t.id=item.fur_item_master_id  " +
					" INNER JOIN fur_category1 AS c ON c.id =t.fur_category1_id  " +
					" LEFT JOIN fur_category2 AS d ON d.id =t.fur_category2_id  " +
					" LEFT JOIN fur_category3 AS e ON e.id=t.fur_category3_id  " +
					" LEFT JOIN fur_brand AS b ON b.id=t.fur_brand_id  " +
					" left join fur_item_images as imgs on imgs.fur_item_id = item.id  " +
					" WHERE imgs.image_path is null and t.store_id = ?" + wquery +
					" ORDER BY t.store_id,t.id ASC "

			}
			if (maingroup == 10 || maingroup == 8 || maingroup == 9 || maingroup == 11 || maingroup == 19 || maingroup == 18 || maingroup == 12 || storeId == null) {


				dQuery = " SELECT t.store_id,t.id,t.name AS itemName,if(t.is_active=1,true,false) as isActive,item.id AS sitem,c.name AS cname, d.name AS dname,e.name AS ename ,b.name AS bname " +
					" FROM cm_item_master AS t " +
					" INNER JOIN cm_item AS item ON t.id=item.cm_item_master_id " +
					" INNER JOIN cm_category1 AS c ON c.id =t.cm_category1_id " +
					" LEFT JOIN cm_category2 AS d ON d.id =t.cm_category2_id " +
					" LEFT JOIN cm_category3 AS e ON e.id=t.cm_category3_id " +
					" LEFT JOIN cm_brand AS b ON b.id=t.cm_brand_id " +
					" left join cm_item_images as imgs on imgs.cm_item_id = item.id " +
					" WHERE imgs.image is null and t.store_id = ?" + wquery +
					" ORDER BY t.store_id,t.id ASC "

			}

			var query1 = dQuery + sqlLimit
			var query2 = dQuery
			var finalQuery = query1 + ";" + query2
			console.log('finalQuery.....', finalQuery)
			queryExecution.queryExecution(client, jsonObj, event, finalQuery, [storeId, ...values, ...sqlLimitVal, storeId, ...values], function (subQueryResult) {
				var subResult = subQueryResult.result
				if (subResult[0].length > 0) {
					const response = {
						success: "1",
						successMessage: "Success",
						result: {
							resultData: JSON.parse(JSON.stringify(subResult[0]).replace(/\:null/gi, "\:\"\"")),
							resultCount: subResult[1].length
						},
						errorMessage: ""
					}
					callback(response)
				}
				else {
					const response = {
						success: "0",
						successMessage: "",
						result: [],
						errorMessage: "No Data Found"
					}
					callback(response)
				}
			});
		}
	});
}
module.exports = methods;