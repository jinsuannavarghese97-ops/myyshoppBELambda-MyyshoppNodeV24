const queryExecution = require('../queryExecution')
let methods = {};


methods.stateList = function (client, jsonObj, event, callback) {

    let queryString = " SELECT s.name as stateName,s.id as stateId " +
        " FROM location_group_type lgt " +
        " INNER JOIN location l on l.id = lgt.location_id " +
        " INNER JOIN city c on c.id = l.city_id " +
        " INNER JOIN state s on s.id = c.state_id " +
        " where lgt.store_id = ?"
    " group by s.id; " +

        " SELECT s.id as stateId,l.id as locationId,l.name as locationName,l.pin_code as pinCode,c.id as cityId,c.name as cityName " +
        " FROM location_group_type lgt " +
        " INNER JOIN location l on l.id = lgt.location_id " +
        " INNER JOIN city c on c.id = l.city_id " +
        " INNER JOIN state s on s.id = c.state_id " +
        " where lgt.store_id = ?"
    " group by l.id; " +

        " SELECT s.id as stateId,c.id as cityId,c.name as cityName " +
        " FROM location_group_type lgt " +
        " INNER JOIN city c on c.id = lgt.city_id " +
        " INNER JOIN state s on s.id = c.state_id " +
        " where lgt.store_id = ?"
    " group by c.id; "

    let queryStringParams = [event.storeId, event.storeId, event.storeId];

    queryExecution.queryExecution(client, jsonObj, event, queryString, queryStringParams, function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let states = queryStringResult.result[0];
        let locations = queryStringResult.result[1];
        let city = queryStringResult.result[2];
        let stateList = [];
        if (states.length > 0) {
            states.forEach((state, indexState) => {
                let locationList = [], cityList = []
                if (locations.length > 0) {
                    let i = 0
                    locations.forEach((location, indexLOcation) => {
                        if (state.stateId == location.stateId) {
                            locationList[i] = {
                                id: location.locationId,
                                name: location.locationName + " (" + location.pinCode + ")",
                                cityId: location.cityId,
                                cityName: location.cityName
                            }
                            i++
                        }
                    });
                }
                if (city.length > 0) {
                    let i = 0
                    city.forEach((location, indexLOcation) => {
                        if (state.stateId == location.stateId) {
                            cityList[i] = {
                                id: location.cityId,
                                name: location.cityName
                            }
                            i++
                        }
                    });
                }

                console.log("......", locationList)
                //console.log("......",city)
                stateList[indexState] = {
                    id: state.stateId,
                    name: state.stateName,
                    locationList: locationList,
                    city: city
                }
            });
            const response = {
                success: "1",
                successMessage: "Success.",
                result: stateList,
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: [],
                errorMessage: "No data found."
            }
            callback(response)
        }
    })
}
module.exports = methods;