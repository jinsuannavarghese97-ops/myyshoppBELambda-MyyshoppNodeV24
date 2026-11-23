let methods = {};
let queryExecution = require('../queryExecution');
methods.completelyMatched =function (client,jsonObj,event, callback) {
        var wquery = "";
        let offset = event.offset ? event.offset : 0
        let max = event.max ? event.max : 10
		let wqueryValue = []
		const removeQuotes = (str) => {
			return str.split("'").join('');
				};
        
        if(event.selectType =="1" ){
		    wquery = wquery +   " and si.category like ? "
			wqueryValue.push(removeQuotes("'%"+event.selectInput+"%'"))
		}
		if(event.selectType == "2" ){
			wquery = wquery + " and si.item_code like ? "
			wqueryValue.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "3" ){
			wquery = wquery + " and si.item_name like ? "
			wqueryValue.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "4" ){
			wquery = wquery + " and b.name like ? "
			wqueryValue.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "5" ){
			wquery = wquery + " and p.name like ? "
			wqueryValue.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "6" ){
			wquery = wquery + " and cl1.name like ? "
			wqueryValue.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "7" ){
			wquery = wquery + " and cl2.name like ? "
			wqueryValue.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "8" ){
			wquery = wquery + " and cl3.name like ? "
			wqueryValue.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		
         let query= " SELECT  si.`category` AS category,si.`seller_item_code` AS sellerItemCode,si.`bar_code` AS barCode,si.`seller_item_name` AS sellerItemName,si.`item_name` AS itemName, " +
					" si.`brand_name` AS brandName,si.`pack_name` AS packName,si.`category_level1name` AS categoryLevel1Name,si.`category_level2name` AS categoryLevel2Name, " +
					" si.`category_level3name` AS categoryLevel3Name,si.`item_id` AS itemId,si.`seller_item_id` AS sellerItemId, concat(ifnull(si.`brand_name`,''),' ',si.`seller_item_name`,' ',si.`pack_name`) as concatedItemName " +
					" FROM seller_item_list  AS si " +
					" WHERE seller_id = ? AND seller_item_status = 'E' "+wquery+
					" LIMIT ?,? ;"+
					
					" select count(*) as totalCount " +
    				" FROM seller_item_list  AS si " +
    				" WHERE seller_id = ? AND seller_item_status = 'E' "+wquery+";"+ 
    				
    				" select count(*) as totalCount " +
    				" FROM seller_item_list  AS si " +
    				" WHERE seller_id = ? AND seller_item_status = 'P' "+wquery+";"+
    				 
    				" select count(*) as totalCount " +
					 " FROM seller_item_list  AS si " +
					 " WHERE seller_id = ? AND seller_item_status = 'N' "+wquery+";"+
					 
    				" select count(*) as totalCount "+
                    " FROM seller_item_list  AS si "+
                    " INNER JOIN seller_item as s on si.seller_item_id = s.id and s.seller_id = ?"+
                    " WHERE s.seller_id = ? AND s.auto_map_status = 'S' "+wquery+";"
    				 
		queryExecution.queryExecution(client, jsonObj, event, query,[event.sellerId,...wqueryValue,parseInt(offset),parseInt(max),event.sellerId,...wqueryValue,event.sellerId,...wqueryValue,event.sellerId,...wqueryValue,event.sellerId,event.sellerId,...wqueryValue], function (response){
        	if (response.success == '0') {
                callback(response);
            }
            else{
                const responseData = {
                    success: "1",
                    result: {
                        "result": response.result[0],
                        "totalCount": response.result[1][0].totalCount,
                        "partiallyMapped": response.result[2][0].totalCount,
		                "exactMapped": response.result[1][0].totalCount,
		                "notMapped": response.result[3][0].totalCount,
		                "autoMapped": response.result[4][0].totalCount,
                    },
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(responseData);
            }
        })
   
}
module.exports = methods;