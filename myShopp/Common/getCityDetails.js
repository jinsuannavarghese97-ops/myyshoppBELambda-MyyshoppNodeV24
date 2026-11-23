var mysql = require('mysql');
var methods = {};

methods.getCityDetails = function (jsonObj, callback) {
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
        var stateId = jsonObj.stateId
        var cityDetails = []
        var queryString = " select c.id, c.name as cityName " +
            " from city as c " +
            " inner join state as s on c.state_id = s.id " +
            " and s.id = ?";

        connection.query(queryString, [stateId], function (error, queryStringResult, fields) {
            if (error) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong in getting city details"
                };
                return callback(response);
            }
            else if (queryStringResult.length > 0) {
                for (var i = 0; i < queryStringResult.length; i++) {
                    cityDetails[i] = {
                        cityId: queryStringResult[i].id == null ? '' : queryStringResult[i].id,
                        cityName: queryStringResult[i].cityName == null ? '' : queryStringResult[i].cityName
                    }
                }

                const response = {
                    success: "1",
                    result: cityDetails,
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