var mysql = require('mysql');
var moment = require('moment');
let queryExecution = require('../queryExecution');
var methods = {};
methods.rtDeliverySlots = function (jsonObj, event, callback) {
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
    var rtminimumOrderValue
    var rtdeliveryCharge
    var rtonlyFreeDelivery
    var rtdeliverySlot1
    var openAm
    var closeAm
    var openPm
    var closePm
    var openAmDateAndTime
    var closeAmDateAndTime
    var openPmDateAndTime
    var closePmDateAndTime
    var currentTime
    var storeDelivery = [];
    var rtDelivery = [];
    var storeCutofTime = 15;
    var ONE_MINUTE_IN_MILLIS = 60000;
    var storeCutofTimeVal = storeCutofTime;
    var mydate = moment().valueOf();
    var mydate11 = moment(mydate).utcOffset(330).valueOf();

    var mydate12 = parseInt(mydate11) + parseInt(storeCutofTime * ONE_MINUTE_IN_MILLIS)
    // var mydate12 = moment(mydate11).tz("Asia/Kolkata").format()
    console.log("mydate12.." + mydate12)
    currentTime = moment(mydate12).toDate();
    // currentTime = moment().tz("Asia/Kolkata").add(15,'minutes').format()

    var sellerQuery = " select sl.has_location as hasLocation,sl.delivery_charges as deliveryCharge,sl.minimum_order_value as mininmumOrderValue,s.id as storeId " +
      " from seller as sl " +
      " inner join store as s on s.seller_id =sl.id " +
      " where s.id= ? ";

    ////console.log("sellerQuery..." + sellerQuery)

    connection.query(sellerQuery, [jsonObj.storeId], function (error, sellerResults, fields) {
      // //console.log("sellerResults[0].hasLocation..." + sellerResults[0].hasLocation)

      if (sellerResults[0].hasLocation == true) {
        var locationQuery = " select lgt.is_active as isActive,lgt.location_id as locationId,lgt.store_id as storeId,gt.id groupTypeId, " +
          " gt.rt_minimum_order_value as rtMinimumOrderValue,gt.will_not_deliver as willNotDeliver,gt.rt_delivery_charge as rtDeliveryCharge," +
          " gt.rt_delivery_description as rtDeliveryDescription,gt.rt_delivery_closing_time as rtDeliveryClosingTime, " +
          " gt.rt_delivery_closing_timepm as rtDeliveryClosingTimePM,gt.rt_delivery_closing_timeam as rtDeliveryClosingTimeAM," +
          " gt.rt_delivery_opening_timeam as rtDeliveryOpeningTimeAM,gt.rt_delivery_opening_timepm rtDeliveryOpeningTimePM " +
          " from location_group_type as lgt " +
          " inner join location as lo on lo.id=lgt.location_id " +
          " inner join group_type as gt on gt.id=lgt.group_type_id " +
          " inner join store as s on s.id=lgt.store_id " +
          " where lgt.store_id= ? ";

        //console.log("locationQuery..." + locationQuery)

        connection.query(locationQuery, [sellerResults[0].storeId], function (error, locationResults, fields) {

          rtminimumOrderValue = locationResults[0].rtMinimumOrderValue
          //console.log("rtminimumOrderValue.."+rtminimumOrderValue)
          rtdeliveryCharge = locationResults[0].rtDeliveryCharge
          //console.log("rtdeliveryCharge..."+rtdeliveryCharge)
          rtonlyFreeDelivery = locationResults[0].willNotDeliver
          //console.log("rtonlyFreeDelivery..."+rtonlyFreeDelivery)
          rtdeliverySlot1 = locationResults[0].rtDeliveryDescription
          //console.log("rtdeliverySlot1..."+rtdeliverySlot1)
          openAm = locationResults[0].rtDeliveryOpeningTimeAM
          //console.log("openAm...."+openAm)
          closeAm = locationResults[0].rtDeliveryClosingTimeAM
          //console.log("closeAm..."+closeAm)
          openPm = locationResults[0].rtDeliveryOpeningTimePM
          //console.log("openPm..."+openPm)
          closePm = locationResults[0].rtDeliveryClosingTimePM
          //console.log("closePm..."+closePm)
          // //console.log("locationResults[0].rtDeliveryClosingTimePM.." + locationResults[0].rtDeliveryClosingTimePM)

          if (openAm != "" && openAm != null) {
            var time = openAm.split(" ")[0]
            var ampm = openAm.split(" ")[1]
            var timeslot
            var dateAndTime = currentTime
            //  //console.log("time..." + time)
            //  //console.log("ampm..." + ampm)
            //  //console.log("dateAndTime.." + dateAndTime)

            if (ampm.trim() == "PM" && time.split(":")[0].trim() != 12) {

              timeslot = time.trim().split(":")[0] + 12 + ":" + time.trim().split(":")[1]
              //  //console.log("timeslot..if..." + timeslot)

            }
            else if (ampm.trim() == "AM" && time.trim().split(":")[0].trim() == 12) {

              timeslot = time.trim().split(":")[0] + 12 + ":" + time.trim().split(":")[1]
              //  //console.log("timeslot..else..." + timeslot)
            }
            else {

              timeslot = time.trim()
              //  //console.log("timeslot...else.." + timeslot)
            }
            var cal1 = moment().toDate();
            //  //console.log("cal1....1....", cal1)
            cal1.setHours(timeslot.split(":")[0])
            cal1.setMinutes(timeslot.split(":")[1])
            openAmDateAndTime = cal1
            // //console.log("openAmDateAndTime.." + openAmDateAndTime)
          }



          if (closeAm != "" && closeAm != null) {
            var time = closeAm.split(" ")[0]
            var ampm = closeAm.split(" ")[1]
            var timeslot
            var dateAndTime = currentTime
            //  //console.log("time..." + time)
            //console.log("ampm..." + ampm)
            // //console.log("dateAndTime.." + dateAndTime)
            if (ampm.trim() == "PM" && time.split(":")[0].trim() != 12) {

              timeslot = time.trim().split(":")[0] + 12 + ":" + time.trim().split(":")[1]
              //console.log("timeslot..if..." + timeslot)

            }
            else if (ampm.trim() == "AM" && time.trim().split(":")[0].trim() == 12) {

              timeslot = time.trim().split(":")[0] + 12 + ":" + time.trim().split(":")[1]
              ////console.log("timeslot..else..." + timeslot)
            }
            else {

              timeslot = time.trim()
              ////console.log("timeslot...else.." + timeslot)
            }

            var cal1 = moment().toDate();
            //  //console.log("cal1....1....", cal1)
            cal1.setHours(timeslot.split(":")[0])
            cal1.setMinutes(timeslot.split(":")[1])
            closeAmDateAndTime = cal1
            ////console.log("closeAmDateAndTime..." + closeAmDateAndTime)
          }



          if (openPm != "" && openPm != null) {
            var time = openPm.split(" ")[0]
            var ampm = openPm.split(" ")[1]
            var timeslot
            var dateAndTime = currentTime
            // //console.log("time..." + time)
            //  //console.log("ampm..." + ampm)
            //  //console.log("dateAndTime.." + dateAndTime)
            if (ampm.trim() == "PM" && time.split(":")[0].trim() != 12) {

              timeslot = time.trim().split(":")[0] + 12 + ":" + time.trim().split(":")[1]
              //  //console.log("timeslot..if..." + timeslot)

            }
            else if (ampm.trim() == "AM" && time.trim().split(":")[0].trim() == 12) {

              timeslot = time.trim().split(":")[0] + 12 + ":" + time.trim().split(":")[1]
              //   //console.log("timeslot..else..." + timeslot)
            }
            else {

              timeslot = time.trim()
              //  //console.log("timeslot...else.." + timeslot)
            }

            var cal1 = moment().toDate();
            // //console.log("cal1....1....", cal1)
            cal1.setHours(timeslot.split(":")[0])
            cal1.setMinutes(timeslot.split(":")[1])
            openPmDateAndTime = cal1
            //  //console.log("openPmDateAndTime..." + openPmDateAndTime)
          }



          if (closePm != "" && closePm != null) {
            var time = closePm.split(" ")[0]
            var ampm = closePm.split(" ")[1]
            var timeslot
            var dateAndTime = currentTime
            //  //console.log("time..." + time)
            //  //console.log("ampm..." + ampm)
            console.log("dateAndTime.." + dateAndTime)
            if (ampm.trim() == "PM" && time.split(":")[0].trim() != 12) {

              timeslot = time.trim().split(":")[0].toInteger() + 12 + ":" + time.trim().split(":")[1]
              //   //console.log("timeslot..if..." + timeslot)

            }
            else if (ampm.trim() == "AM" && time.trim().split(":")[0].trim() == 12) {

              timeslot = time.trim().split(":")[0] + 12 + ":" + time.trim().split(":")[1]
              //    //console.log("timeslot..else..." + timeslot)
            }
            else {

              timeslot = time.trim()
              //    //console.log("timeslot...else.." + timeslot)
            }
            var cal1 = moment().toDate();
            //    //console.log("cal1....1....", cal1)

            cal1.setHours(timeslot.split(":")[0])
            cal1.setMinutes(timeslot.split(":")[1])
            closePmDateAndTime = cal1
            //   //console.log("closePmDateAndTime..." + closePmDateAndTime)

          }

          var isNow = false
          var isToday = false
          var deliverNow = ''
          ////console.log("openAm**************.." + openAm)
          if (openAm != null && openAm != '') {

            //console.log("currentTime..." + currentTime)
            //console.log("closeAmDateAndTime..." + closeAmDateAndTime)
            //console.log(" JSON.stringify(currentTime)..." + JSON.stringify(currentTime))
            //console.log(" JSON.stringify(closeAmDateAndTime)..." + JSON.stringify(closeAmDateAndTime))
            // var dat1 =Math.abs(currentTime.getTime() - closeAmDateAndTime.getTime())
            // var dat1 =Math.abs(currentTime - closeAmDateAndTime.getTime())
            //console.log("jsonnn..."+dat1)
            //console.log("222..."+moment(dat1).toDate())
            console.log("Buffer.from('currentTime'); ..." + Buffer.from('currentTime'))
            var closeAmDateAndTimeBuffer = Buffer.from('closeAmDateAndTime');
            var currentTimeBuffer = Buffer.from('currentTime');
            var openPmDateAndTimeBuffer = Buffer.from('openPmDateAndTime')
            var closePmDateAndTimeBuffer = Buffer.from('closePmDateAndTime')
            var openAmDateAndTimeBuffer = Buffer.from('openAmDateAndTime')
            console.log("currentTimeBuffer." + currentTimeBuffer)
            var firstCompare = Buffer.compare(openAmDateAndTimeBuffer, currentTimeBuffer);
            //console.log("firstCompare.."+firstCompare); 
            var secondCompare = Buffer.compare(currentTimeBuffer, closeAmDateAndTimeBuffer);
            //console.log("secondCompare.."+secondCompare)
            var thirdCompare = Buffer.compare(openPmDateAndTimeBuffer, currentTimeBuffer)
            //console.log("thirdCompare..."+thirdCompare)
            var fourthCompare = Buffer.compare(currentTimeBuffer, closePmDateAndTimeBuffer)
            //console.log("fourthCompare..."+fourthCompare)
            var fifthCompare = Buffer.compare(openAmDateAndTimeBuffer, currentTimeBuffer)
            //console.log("fifthCompare..."+fifthCompare)
            var sixthCompare = Buffer.compare(openPmDateAndTimeBuffer, currentTimeBuffer)
            //console.log("sixthCompare..."+sixthCompare)
            // if (openAmDateAndTime.compareTo(currentTime) * currentTime.compareTo(closeAmDateAndTime) > 0) {
            ////console.log("befor")
            // if (((currentTime.getTime() == closeAmDateAndTime.getTime()) * (currentTime.getTime() == closeAmDateAndTime.getTime())) > 0) {
            ////console.log("33333333333")
            if ((firstCompare * secondCompare) > 0) {
              isNow = true
              deliverNow = deliverNow + ',' + "Between " + openAm + " to " + closeAm + "(Today)"
              if (openPm != null && openPm != '') {
                deliverNow = deliverNow + ',' + "Between " + openPm + " to " + closePm + "(Today)"
              }
              //console.log("deliverNow...first..."+deliverNow)
            }
            else {
              //console.log("firsttttt")
              isNow = false
            }
          }

          else {
            ////console.log("1222")
          }

          if (isNow == false && openPm != null && openPm != '') {
            //if (openPmDateAndTime.compareTo(currentTime) * currentTime.compareTo(closePmDateAndTime) > 0) {
            //if (((openPmDateAndTime.getTime() == currentTime.getTime()) * (currentTime.getTime() == closePmDateAndTime.getTime())) > 0) {
            if ((thirdCompare * fourthCompare) > 0) {
              isNow = true
              deliverNow = deliverNow + ',' + "Between " + openPm + " to " + closePm + "(Today)"
              //console.log("deliverNow.333.."+deliverNow)
            }
            else {
              //console.log("5555")
              isNow = false
            }
          }

          else {
            //console.log("1333")
          }
          if (isNow == false && openAm != null && openAm != '' && isToday == false) {
            //  if (openAmDateAndTime.compareTo(currentTime) == 1) {
            // if ((openAmDateAndTime.getTime() == currentTime.getTime()) == 1) {
            if (fifthCompare == 1) {
              isToday = true
              deliverNow = deliverNow + ',' + "Between " + openAm + " to " + closeAm + "(Today)"
              if (openPm != null && openPm != '') {
                deliverNow = deliverNow + ',' + "Between " + openPm + " to " + closePm + "(Today)"
              }
              //console.log("deliverNow.fifthCompare....."+deliverNow)
            }
            else {
              //console.log("6666")
              isNow = false
            }

          }

          else {
            ////console.log("1444")
          }

          if (isNow == false && openPm != null && openPm != '' && isToday == false) {
            //if (openPmDateAndTime.compareTo(currentTime) == 1) {
            // if ((openPmDateAndTime.getTime() == currentTime.getTime()) == 1) {
            if (sixthCompare == 1) {
              isToday = true
              deliverNow = deliverNow + ',' + "Between " + openPm + " to " + closePm + "(Today)"
              // //console.log("deliverNow.."+deliverNow)
            }
            else {
              //console.log("7777")
              isNow = false
            }
          }
          else {
            //console.log("1555")
          }
          //console.log("isNow..."+isNow)
          //console.log("isToday..."+isToday)
          //console.log("openAm.."+openAm)
          //console.log("openPm..."+openPm)
          if (isNow == false && isToday == false) {
            if (openAm != null && openAm != '') {
              deliverNow = deliverNow + ',' + "Between " + openAm + " to " + closeAm + "(Tomorrow)"
              //console.log("deliverNow..23.."+deliverNow)
            }
            if (openPm != null && openPm != '') {
              deliverNow = deliverNow + ',' + "Between " + openPm + " to " + closePm + "(Tomorrow)"
              //console.log("deliverNow..24.."+deliverNow)
            }
          }
          else {
            //console.log("pppppp")
            if (openAm != null && openAm != '') {
              deliverNow = deliverNow + ',' + "Between " + openAm + " to " + closeAm + "(Tomorrow)"
              //console.log("deliverNow..25.."+deliverNow)
            }
            if (openPm != null && openPm != '') {
              deliverNow = deliverNow + ',' + "Between " + openPm + " to " + closePm + "(Tomorrow)"
              //console.log("deliverNow..26.."+deliverNow)
            }
          }
          storeDelivery.push(deliverNow)
          var deliver = storeDelivery[0].split(',')
          console.log("deliver." + deliver)


          var deliverySlots = []
          for (let x = 0; x < deliver.length; x++) {
            if (deliver[x] != '') {
              deliverySlots.push(deliver[x])
            }
          }
          rtDelivery = {
            rtminimumOrderValue: locationResults[0].rtMinimumOrderValue,
            rtdeliveryCharge: locationResults[0].rtDeliveryCharge,
            rtonlyFreeDelivery: locationResults[0].willNotDeliver,
            deliverySlot: deliverySlots
          }
          //console.log("rtDelivery.." + rtDelivery)

          return callback(rtDelivery);


        });

      }
      else {
        ////console.log("else...rt....")
        rtminimumOrderValue = sellerResults[0].mininmumOrderValue
        rtdeliveryCharge = sellerResults[0].deliveryCharge
        rtonlyFreeDelivery = false

        rtDelivery = {
          rtminimumOrderValue: sellerResults[0].mininmumOrderValue,
          rtdeliveryCharge: sellerResults[0].deliveryCharge,
          rtonlyFreeDelivery: rtonlyFreeDelivery,

        }
        //console.log("rtDelivery.." + rtDelivery)

        return callback(rtDelivery);
      }


    });

  });
}
module.exports = methods;