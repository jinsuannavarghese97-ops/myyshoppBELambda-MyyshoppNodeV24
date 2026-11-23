const queryExecution = require('../queryExecution')
const methods = {};
methods.getStoreDataWithStoreId = function (client, event, callback) {
    let query = " select s.id as storeId, s.name as storeName, mc.main_group_category_id, smc.main_category_id,su.email_id as emailId, su.mobile_number as mobileNumber " +
        "   from store as s " +
        "  inner join sec_user as su on su.id = s.sec_user_id " +
        "  inner join store_main_category as smc on smc.store_id = s.id " +
        "  inner join main_category as mc on mc.id = smc.main_category_id where s.id = ?; "
    console.log('query...', query)
    queryExecution.queryExecution(client, "", event, query, [event.storeId], function (response) {
        console.log('response.result.........', response)
        if (response.success == '0') {
            callback(response);
        }
        else {
            let query = " SELECT l.name, lgt.location_id, c.id as cityId, c.name as cityName " +
                "  FROM location_group_type as lgt " +
                " inner join store as s on s.id = lgt.store_id " +
                "  inner join group_type as gt on gt.id = lgt.group_type_id " +
                "  inner join location as l on lgt.location_id = l.id and l.city_id = s.city_id   " +
                " inner join city as c on c.id = s.city_id " +
                "   where lgt.store_id = ? and lgt.is_active = true and gt.is_active = true and gt.is_approved = true limit 1  "

            console.log('query...', query)
            queryExecution.queryExecution(client, "", event, query, [response.result[0].storeId], function (response1) {
                if (response1.success == '0') {
                    callback(response);
                }
                else {
                    var obj = [{
                        emailId: response.result[0].emailId,
                        mobileNumber: response.result[0].mobileNumber,
                        storeId: response.result[0].storeId,
                        storeName: response.result[0].storeName,
                        main_group_category_id: response.result[0].main_group_category_id,
                        main_category_id: response.result[0].main_category_id,
                        locationName: response1.result[0].name,
                        locationId: response1.result[0].location_id,
                        cityId: response1.result[0].cityId,
                        cityName: response1.result[0].cityName,


                    }]
                    const result = {
                        success: "1",
                        data: obj,
                        successMessage: "Success",
                        errorMessage: ""
                    };
                    callback(result);
                }
            });
        }
    });
}
module.exports = methods;
