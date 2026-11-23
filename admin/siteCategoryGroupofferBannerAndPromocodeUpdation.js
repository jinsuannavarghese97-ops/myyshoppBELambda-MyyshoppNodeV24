const queryExecution = require('../queryExecution');
let methods = {};

methods.siteCategoryGroupAddOfferBannerAndPromocode = function (client, jsonObj, event, callback) {
    //   let offerBannerQuery = "call insert_store_banner("+event.siteCategoryGroupId+","+event.userId+",'"+event.fromDate+"','"+event.toDate+"') ;"
    let offerBannerQuery = "call insert_store_banner(?) ;"

    let promoCodeQry = "call promo_code_insert(?) ;"
    let updateQuery = offerBannerQuery + promoCodeQry
    console.log("updateQuery....", updateQuery)
    client.query(updateQuery, [event.siteCategoryGroupId, event.siteCategoryGroupId], function (error, results, fields) {
        console.log("results..", results)
        // console.log("error..",error)
        if (error) {
            const response =
            {
                success: "0",
                successMessage: "",
                errorMessage: "Something went wrong"
            };
            callback(response);
        } else {
            const response = {
                success: "1",
                successMessage: "Success.",
                // result:results,
                errorMessage: ""
            }
            callback(response)
        }
    })


}
module.exports = methods;