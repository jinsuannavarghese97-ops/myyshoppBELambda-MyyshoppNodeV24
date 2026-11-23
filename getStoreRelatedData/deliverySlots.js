var mysql = require('mysql');
var moment = require('moment-timezone');
var methods = {};
let queryExecution = require('../queryExecution');
methods.deliverySlots = function (jsonObj, event, callback) {
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
        var storeQuery = " (select st.name as storeName,c.name as cityName,st.id as storeId,st.locality as locality,st.slug as slug,st.delivery_slot1 as deliverySlot1,st.delivery_slot2 as deliverySlot2,st.delivery_slot3 as deliverySlot3,st.cut_of_time as cutOfTime, " +
            " IFNULL(concat((select config_value from configuration where config_key = 's3Address'),'/', " +
            " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
            " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
            " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',st.logo_path), " +
            " concat((select config_value from configuration where config_key = 's3Address'),'/', " +
            " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
            " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
            " (select config_value from configuration where config_key = 'storeImagesFolder'),'/',st.logo_path)) as imageName, " +
            " (SELECT GROUP_CONCAT(gt.`delivery_slot` SEPARATOR ',') " +
            " FROM `location_group_type` AS lt " +
            " INNER JOIN `group_type_delivery_slot` AS gt ON gt.`group_type_id` = lt.group_type_id " +
            " WHERE lt.`store_id` = st.id  AND lt.`location_id` = ?" +
            " AND lt.`is_active` = TRUE AND gt.is_active = TRUE " +
            " GROUP BY lt.id) as deliverySlot " +
            " from store as st " +
            " inner join location_group_type as sl on sl.store_id = st.id " +
            " inner join city as c on c.id = st.city_id " +
            " inner join location as l on l.id = sl.location_id " +
            " inner join seller as s on s.id = st.seller_id " +
            " inner join store_main_category as smc ON smc.store_id = st.id " +
            " inner join main_category as mc ON mc.id = smc.main_category_id " +
            " where l.is_active = true and l.is_approved = true and sl.is_active = true and st.id = ? and st.is_active = true and st.is_approved = true and s.is_active = true and s.is_approved = true and mc.id = ? and sl.location_id = ? AND s.has_location = true AND st.is_non_storedig_store = FALSE  and " +
            " (( " +
            " (EXISTS(SELECT 1 FROM store_categories sc WHERE sc.store_id = st.id AND sc.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `rt_store_item` AS rsi WHERE rsi.store_id = st.id AND rsi.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `cm_item` AS ci WHERE ci.store_id = st.id AND ci.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `ph_store_categories` AS psc WHERE psc.store_id = st.id AND psc.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `ed_store_videos` AS edsv WHERE edsv.store_id = st.id AND edsv.is_active = TRUE)) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `fur_item` AS fi WHERE fi.store_id = st.id AND fi.is_active = TRUE)) " +
            " ) " +
            " OR " +
            " (EXISTS(SELECT 1 FROM `rent_item` AS ri WHERE ri.store_id = st.id AND ri.is_active = TRUE) " +
            " )) " +
            " order by st.ranking asc )"
        ////console.log("storeQuery......."+storeQuery) 

        connection.query(storeQuery, [jsonObj.locationId, jsonObj.storeId, jsonObj.categoryId, jsonObj.locationId], function (error, storeResults, fields) {
            //console.log(storeResults) 
            connection.release();
            for (var i = 0; i < storeResults.length; i++) {

                var deliveryResultsData = storeResults[i].deliverySlot
                var deliveryResults = []
                //console.log("deliveryResults...*******...."+deliveryResults) 
                if (deliveryResultsData != null) {
                    deliveryResults = deliveryResultsData.split(',')
                }
                //////console.log("deliveryResults..."+deliveryResults)
                var deliverySlotFlag = 0
                var storeCutofTimeVal;
                var deliverySlot
                var deliverySlotArr = []
                var deliverySlotArr2 = []
                var todayCount = 0
                var daySlotCount = 0;
                //flag 0 : cut of time less than 1 day and slot outside the day
                //flag 1 : cut of time less than 1 day and slot inside the day
                //flag 2 : cut of time greater than 1 day   
                var slotCount = 0
                var slots = []
                //////console.log("deliveryResults.length..."+deliveryResults.length)
                for (var m = 0; m < deliveryResults.length; m++) {
                    // ////console.log("deliveryResults.length..."+deliveryResults.length)
                    // ////console.log(" deliveryResults[m]..."+deliveryResults[m])
                    // ////console.log("m.............................",m)
                    deliverySlot = deliveryResults[m]
                    var currentTime
                    var show1 = "no"
                    var show2 = "no"
                    var show3 = "no"
                    var storeCutofTime = 15;
                    var ONE_MINUTE_IN_MILLIS = 60000;
                    var ONE_HOUR_IN_MILLIS = 3600000;
                    storeCutofTimeVal = storeCutofTime;
                    var mydate = moment().valueOf();
                    ////console.log("mydate ",mydate)
                    var mydate11 = moment(mydate).utcOffset(330).valueOf();
                    ////console.log("mydate11 ",mydate11)
                    var mydate12 = parseInt(mydate11) + parseInt(storeCutofTime * ONE_MINUTE_IN_MILLIS)
                    ////console.log("mydate12 ",mydate12)
                    currentTime = moment(mydate12)
                    ////console.log("currentTime111111...",currentTime)
                    if (storeCutofTimeVal < 1440) {
                        if (deliverySlot != null && deliverySlot != '') {
                            //console.log("starttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt")
                            //console.log(deliveryResults[m])
                            var time1 = parseInt(deliveryResults[m].split("To ")[1].split(' ')[0])
                            var ampm1 = deliveryResults[m].split("To ")[1].split(' ')[1]
                            var timeslot1
                            if (ampm1 == "PM" && time1 != 12)
                                timeslot1 = parseInt(time1) + 12
                            else if (ampm1 == "AM" && time1 == 12)
                                timeslot1 = parseInt(time1) + 12
                            else
                                timeslot1 = time1
                            var cal1 = moment().toDate();

                            //console.log(time1,"cal1....1....",time1)
                            ////console.log("timeslot1..........",timeslot1)
                            cal1.setHours(timeslot1);
                            ////console.log("cal1...2.....",cal1)
                            cal1.setMinutes(0);
                            //console.log("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
                            //console.log("cal1....11111....",cal1)
                            //console.log("cal1....22222....",moment().tz("Asia/Kolkata").format() )
                            //console.log("cal1....33333....",moment().tz("Asia/Kolkata").add(15,'minutes').format() )
                            //console.log("cal1....44444....",mydate12)
                            //console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" )
                            cal1.setSeconds(0);
                            //if(currentTime<cal1.getTime()){
                            if (moment().tz("Asia/Kolkata").add(15, 'minutes').format() < moment(cal1).format()) {
                                deliverySlotFlag = 1
                                deliverySlotFlag = 1
                                deliverySlot = deliverySlot + ' (Today)'
                                deliverySlotArr.push(deliverySlot)
                                todayCount++
                            }
                            else {
                                deliverySlotFlag = 0
                            }
                        }

                    }
                    else {

                        var dayCount = storeCutofTimeVal / 1440

                        var currentDate1 = new Date();
                        currentDate1.setDate(currentDate1.getDate() + dayCount);
                        var currentDatePlusOne = currentDate1//.getTime();

                        var currentDate2 = new Date();
                        currentDate2.setDate(currentDate2.getDate() + parseInt(dayCount) + 1);
                        var currentDatePlusTwo = currentDate2//.getTime();

                        if (deliverySlot != null && deliverySlot != '') {
                            var time1 = parseInt(deliveryResults[m].split("To")[0].split(' ')[0])
                            var ampm1 = deliveryResults[m].split("To")[0].split(' ')[1]
                            var timeslot1
                            if (ampm1 == "PM" && time1 != 12)
                                timeslot1 = time1.toInteger() + 12
                            else if (ampm1 == "AM" && time1 == 12)
                                timeslot1 = time1.toInteger() + 12
                            else
                                timeslot1 = time1

                            var cal1 = currentDate1
                            cal1.setHours(timeslot1)
                            cal1.setMinutes(0)
                            cal1.setSeconds(0)
                            //println"currentTime..."+currentTime
                            //println"cal1..."+cal1
                            if (currentTime < cal1) {
                                deliverySlotFlag = 1
                            }
                            else {
                                deliverySlotFlag = 0
                            }
                        }
                        if (deliverySlotFlag == 1) {
                            deliverySlot = deliverySlot + ' (' + currentDatePlusOne.format('dd/MMM/yyyy') + ')'
                            deliverySlotArr.push(deliverySlot)
                            daySlotCount++
                        }
                        else {
                            daySlotCount++
                        }
                        deliverySlotFlag = 2

                    }
                }
                if (todayCount > 0) {
                    for (var m = 0; m < deliveryResults.length; m++) {
                        deliverySlot = deliveryResults[m] + ' (Tomorrow)'
                        deliverySlotArr.push(deliverySlot)
                    }
                }
                else if (daySlotCount > 0) {
                    var dayCount = storeCutofTimeVal / 1440

                    var currentDate1 = new Date();
                    currentDate1.setDate(currentDate1.getDate() + dayCount);

                    var currentDatePlusTwo = currentDate1

                    for (var m = 0; m < deliveryResults.length; m++) {
                        deliverySlot = deliveryResults[m] + ' (' + currentDatePlusTwo.format('dd/MMM/yyyy') + ')'
                        deliverySlotArr.push(deliverySlot)
                    }
                }
                else if (deliverySlotFlag == 0) {
                    for (var m = 0; m < deliveryResults.length; m++) {
                        deliverySlot = deliveryResults[m] + '(Tomorrow)'
                        deliverySlotArr.push(deliverySlot)
                    }
                }


                storeResults[i] = {
                    storeName: storeResults[i].storeName,
                    cityName: storeResults[i].cityName,
                    storeId: storeResults[i].storeId,
                    locality: storeResults[i].locality,
                    slug: storeResults[i].slug,
                    imageName: storeResults[i].imageName,
                    deliverySlot: deliverySlotArr
                }
            }

            return callback(storeResults);
        });
    });
}
module.exports = methods;

