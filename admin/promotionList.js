const queryExecution = require('../queryExecution')
let methods = {};

methods.promotionList = function (client, jsonObj, event, callback) {
	if (event.siteCategoryGroupId) {
		let promotionQuery = " SELECT  pct.name as promocodeTypeName, pct.id AS promocodeTypeId " +
			" FROM promocode_type as pct ; " +

			" SELECT  pct.name as promocodeTypeName, pc.id AS promocodeId, pc.available_quantity AS availQty, pc.card_type_id AS cardType, pc.code AS CODE, pc.description AS description, pc.discount_percentage AS dispercentage, " +
			" pc.discount_price AS disprice, pc.discount_type AS disType, if(pc.is_active is true,'1','0') AS active, if(pc.is_cashback is true,'1','0') AS cashback, if(pc.is_promo_code,'1','0') AS isPromoCode, pc.max_price AS maxPrice, " +
			" pc.min_price AS minPrice, pc.promocode_type_id AS promocodeTypeId, pc.total_quantity AS totalQty, DATE_FORMAT(pc.valid_from,'%d/%m/%Y') AS validFrom, pc.from_day as fromDay, pc.to_day as toDay, pc.from_hour as fromHour, pc.to_hour as toHour, " +
			" DATE_FORMAT(pc.valid_to,'%d/%m/%Y') AS validTo, pc.min_purchase_amount AS minPurchaseAmount, if(pc.is_app is true,'1','0') as isApp, pc.banner_image as bannerImage, " +
			" pcf.id AS promocodeFreeItemId, pcf.item_name as itemName, pcf.item_image_name as itemImageName, if(pcf.is_active is true,'1','0') AS freeItemActive, pcf.max_price AS freeItemMaxPrice, pcf.min_price AS freeItemMinPrice, " +
			" pcb.id AS promoCodeBillBreakerId, pcb.discount_percentage AS dispercentageBillBreaker, pcb.discount_price AS dispriceBillBreaker, pcb.discount_type AS disTypeBillBreaker, if(pcb.is_active is true,'1','0') AS activeBillBreaker, pcb.max_price AS maxPriceBillBreaker, pcb.min_price AS minPriceBillBreaker, " +
			// " (SELECT config_value FROM configuration WHERE config_key = 's3bucketAccessKey') as accessKey, " +
			// " (SELECT config_value FROM configuration WHERE config_key = 's3bucketSecretKey') as secretKey " +
			" FROM promocode_type as pct " +
			" LEFT JOIN promo_code AS pc on pct.id = pc.promocode_type_id and pct.is_active is true " +
			" LEFT JOIN `group_promo_code` AS spc ON spc.`promo_code_id` = pc.id " +
			" LEFT JOIN promo_code_bill_breaker AS pcb on pcb.promo_code_id = pc.id " +
			" LEFT JOIN promo_code_free_article AS pcf on pcf.promo_code_id = pc.id " +
			" WHERE spc.`site_category_group_id` = ? " +
			" ORDER BY pc.promocode_type_id; "
		queryExecution.queryExecution(client, jsonObj, event, promotionQuery, [event.siteCategoryGroupId], function (queryStringResult) {
			let typeList = queryStringResult.result[0] //JSON.parse(JSON.stringify(queryStringResult[0]).replace(/\:null/gi, "\:\"\""))
			let lists = queryStringResult.result[1]
			for (let i = 0; i < typeList.length; i++) {
				let typeListData = []
				for (let j = 0; j < lists.length; j++) {
					if (typeList[i].promocodeTypeId == lists[j].promocodeTypeId) {
						typeListData.push(lists[j])
					}
				}
				typeList[i].promoDetails = typeListData
			}
			queryStringResult.result = typeList
			callback(JSON.parse(JSON.stringify(queryStringResult).replace(/\:null/gi, "\:\"\"")));
		});
	}
}
module.exports = methods;