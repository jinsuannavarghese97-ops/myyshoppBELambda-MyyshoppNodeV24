let methods = {};
let queryExecution = require('../queryExecution');
methods.mappedList =function (client,jsonObj,event, callback) {
        var wquery = "";
        let offset = event.offset ? event.offset : 0
        let max = event.max ? event.max : 10
		let wqueryValues = []
		const removeQuotes = (str) => {
			return str.split("'").join('');
				};
        if(event.selectType =="1" ){
		    wquery = wquery +   " and si.category like ? "
			wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))
		}
		if(event.selectType == "2" ){
			wquery = wquery + " and si.item_code like ? "
			wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "3" ){
			wquery = wquery + " and si.item_name like ? "
			wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "4" ){
			wquery = wquery + " and b.name like ? "
			wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "5" ){
			wquery = wquery + " and p.name like ? "
			wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "6" ){
			wquery = wquery + " and cl1.name like ? "
			wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "7" ){
			wquery = wquery + " and cl2.name like ? "
			wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "8" ){
			wquery = wquery + " and cl3.name like ? "
			wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		
         let query= " SELECT  si. category  AS category,si. item_code  AS itemCode,i.name  AS itemName,si.item_name AS displayName, " +
					" b.name AS brand,p.name AS pack_name,cl1.name AS category_level1_name,cl2.name AS category_level2_name,cl3.name AS category_level3_name, " +
					" si.id AS sellerItemId,ifnull(si.barcode,'') AS barcode " +
					" FROM  seller_item  AS si " +
					" INNER JOIN item AS i ON i.id = si.item_id " +
					" INNER JOIN pack p ON i.pack_id = p.id " +
					" INNER JOIN category_level1 cl1 ON cl1.id = i.category_level1_id " +
					" INNER JOIN category_level2 cl2 ON cl2.id = i.category_level2_id " +
					" LEFT OUTER JOIN category_level3 cl3 ON cl3.id = i.category_level3_id " +
					" LEFT OUTER JOIN brand b ON i.brand_id = b.id " +
					" WHERE si.seller_id = ? AND si. item_id IS NOT NULL " +wquery+
					" ORDER BY si.item_name LIMIT ?,? ;"+
					" SELECT  COUNT(*) AS totalCount " +
    				 " FROM  seller_item  AS si " +
    				 " INNER JOIN item AS i ON i.id = si.item_id " +
    				 " INNER JOIN pack p ON i.pack_id = p.id " +
    				 " INNER JOIN category_level1 cl1 ON cl1.id = i.category_level1_id " +
    				 " INNER JOIN category_level2 cl2 ON cl2.id = i.category_level2_id " +
    				 " LEFT OUTER JOIN category_level3 cl3 ON cl3.id = i.category_level3_id " +
    				 " LEFT OUTER JOIN brand b ON i.brand_id = b.id " +
    				 " WHERE si.seller_id = ? AND si. item_id IS NOT NULL " +wquery+
    				 " ORDER BY si.item_name; "+
    				 
    				 " select count(*) as totalCount " +
    				" FROM seller_item_list  AS si " +
    				" WHERE seller_id = ? AND seller_item_status = 'E' "+wquery+";"+ 
    				
    				" select count(*) as totalCount " +
    				" FROM seller_item_list  AS si " +
    				" WHERE seller_id = ? AND seller_item_status = 'P' "+wquery+";"+
    				 
    				" select count(*) as totalCount " +
					 " FROM seller_item_list  AS si " +
					 " WHERE seller_id =? AND seller_item_status = 'N' "+wquery+";"+
					 
    				" select count(*) as totalCount "+
                    " FROM seller_item_list  AS si "+
                    " INNER JOIN seller_item as s on si.seller_item_id = s.id and s.seller_id = ?"+
                    " WHERE s.seller_id = ? AND s.auto_map_status = 'S' "+wquery+";"
					let val = [event.sellerId,...wqueryValues,parseInt(offset),parseInt(max),event.sellerId,...wqueryValues,event.sellerId,...wqueryValues,event.sellerId,...wqueryValues,event.sellerId,...wqueryValues,event.sellerId,event.sellerId,...wqueryValues]
    			
        queryExecution.queryExecution(client, jsonObj, event, query,val, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            else{
                const responseData = {
                    success: "1",
                    result: {
                        "result": response.result[0],
                        "totalCount": response.result[1][0].totalCount,
                        "partiallyMapped": response.result[3][0].totalCount,
		                "exactMapped": response.result[2][0].totalCount,
		                "notMapped": response.result[4][0].totalCount,
		                "autoMapped": response.result[5][0].totalCount,
                    },
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(responseData);
            }
        })
   
}
module.exports = methods;