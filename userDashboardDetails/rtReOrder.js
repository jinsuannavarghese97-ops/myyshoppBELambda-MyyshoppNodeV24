let methods = {};
let queryExecution = require('../queryExecution');
methods.rtReOrder = function (client, jsonObj, event, callback) {
    let orderId = jsonObj.orderId
    let reOrderData = [];

    let toppingData = [];
    let reOrderQuery = " SELECT fsoi.rt_store_item_size_id  as storeItemSizeId,so.dine_in_no_of_people as guestCount,if(is_store_pick_up is true ,'1','0') as isPickUp,if(is_dine_in is true,'1','0') as isDineIn,s.id as saleId,so.id as saleOrderId,st.id as storeId,s.net_amount as saleNetAmount,s.gross_amount as salegrossAmount,  '' as sisId, " +
        " fsoi.item_name as itemName,fsoi.total_item_amount as totalItemAmount,fsoi.discount_amount as discountAmount, c.rt_item_size_id as rtItemSizeId , " +
        "  fsoi.quantity as quantity,fsoi.item_price as itemPrice,fsoi.net_amount as netAmount,so.delivery_charge as deliveryCharge  , " +
        " so.consumer_number as conNumber,so.delivery_slot as slot, rtItem.name as rtName,rtItem.description as rtDescription, " +
        "  fsoi.net_amount as netAmount,fsoi.rt_store_item_size_id as rtItemSizeIdsale,d.name as itemsizname," +
        "  c.rt_item_size_id  as itmsize,    c. offer_text as offertext ,c.rt_store_item_id  , rtItem.id as rtId," +
        " (SELECT GROUP_CONCAT( CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/', " +
        " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
        " (select config_value from configuration where config_key = 's3PathRestaurant'),'/', " +
        " ifnull(b.image_name,'ResNoImage.jpg'))" +
        " ORDER BY b.is_default DESC  SEPARATOR '|') FROM rt_store_item_image b WHERE b.rt_store_item_id = rtItem.id" +
        " GROUP BY rtItem.id ORDER BY b.is_default DESC )  AS imagename,rtItem.id as itemId " +
        " FROM rt_sale_order_items as fsoi  " +
        " INNER JOIN sale_order as so ON fsoi.sale_order_id = so.id " +
        " inner join sale as s on s.id = so.sale_id " +
        " INNER JOIN store as st ON st.id = so.store_id " +
        " inner join rt_store_item as rtItem on fsoi.rt_store_item_id=rtItem.id" +
        " inner JOIN rt_spice f on f.id=rtItem.rt_spice_id  and f.is_active=true" +
        " INNER JOIN rt_store_item_size c ON c.id = fsoi.rt_store_item_size_id and c.is_active = true " +
        " INNER JOIN  rt_item_size d on c.rt_item_size_id=d.id and d.is_active=true " +
        " inner join rt_course h on rtItem.rt_course_id=h.id and h.is_active = true " +
        " inner join rt_cuisine i on rtItem.rt_cuisine_id = i.id and i.is_active = true " +
        " inner join  rt_course_type j on rtItem.rt_course_type_id=j.id and j.is_active =true" +

        " WHERE rtItem.is_active=1 and so.id =?;" +
        " select subLevel.net_amount as subNetamount,subLevel.price as subPrice, level2.id  as level2id,level1.id as level1id," +
        "  level1.is_multi_select as mulsel,level1.name as name,level2.name  as toppingname, rtStoreItem.id as rt_store_item_id,level1.rt_item_size_id as rt_item_size_id,  " +
        "  level2.price  as price,level1.has_cost as cost ,subLevel.rt_sale_order_items_id as  rtSaleOrderItem ,rtStoreItem.is_photo_cake as photocake, items.rt_store_item_size_id  as storeItemSizeId   " +
        " from rt_sale_order_item_sublevel as subLevel" +
        " inner join rt_item_sub_level1 as level1 on level1.id = subLevel.rt_item_sub_level1_id " +
        " inner join rt_item_sub_level2 as level2 on level2.id = subLevel.rt_item_sub_level2_id " +
        " inner join rt_sale_order_items as items on items.id = subLevel .rt_sale_order_items_id " +
        " INNER JOIN sale_order as so ON items.sale_order_id = so.id " +
        "  inner join rt_store_item as rtStoreItem on items.rt_store_item_id=rtStoreItem.id " +
        " where so.id = ? ";

    console.log('reOrderQuery......', reOrderQuery)
    //connection.query(reOrderQuery, function (error, reOrderResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, reOrderQuery, [orderId, orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let reOrderResults = response.result;
        let isTopping = false;
        let toppingIndex = 0;

        for (let i = 0; i < reOrderResults[0].length; i++) {
            let sizeArray = [];
            let reOrderDetails = [];

            let sizeObj = {
                itemMrp: reOrderResults[0][i].price,
                itemPrice: reOrderResults[0][i].price,
                itemsizname: reOrderResults[0][i].itemsizname,
                storeItemSizeId: reOrderResults[0][i].storeitemsize,
                rtItemSizeId: reOrderResults[0][i].rtItemSizeId,
                toppingData: []
            }


            toppingData = [];

            if (reOrderResults[1].length > 0) {
                let t_index = 2 + toppingIndex;
                toppingIndex++
                for (let j = 0; j < reOrderResults[1].length; j++) {
                    if (reOrderResults[0][i].rt_store_item_id == reOrderResults[1][j].rt_store_item_id) {


                        let toppingArray = [];


                        isTopping = true;
                        let toppingNameSplit = reOrderResults[1][j].toppingname.toString().split('||')
                        let toppingPriceSplit = reOrderResults[1][j].price.toString().split('||')
                        let level2idSplit = reOrderResults[1][j].level2id.toString().split('||')

                        for (let t = 0; t < toppingNameSplit.length; t++) {
                            let toppingObject = {
                                name: toppingNameSplit[t],
                                id: level2idSplit[t],
                                price: toppingPriceSplit[t]
                            }
                            toppingArray.push(toppingObject)
                        }
                        let itemToppingDetails = {
                            name: reOrderResults[1][j].name,
                            photoCake: reOrderResults[1][j].photocake,
                            level1id: reOrderResults[1][j].level1id,
                            multiSelect: reOrderResults[1][j].mulsel,

                            toppingCost: reOrderResults[1][j].cost,
                            toppingArray: toppingArray
                        }
                        toppingData.push(itemToppingDetails)
                        sizeObj.toppingData = toppingData
                    }
                }
            }


            sizeArray.push(sizeObj)


            reOrderDetails = {
                itemName: reOrderResults[0][i].itemName,
                imageName: reOrderResults[0][i].imagename,
                MRP: reOrderResults[0][i].itemPrice,
                unitPrice: parseFloat(reOrderResults[0][i].netAmount).toFixed(2),
                itemId: reOrderResults[0][i].itemId,
                sisId: reOrderResults[0][i].sisId,
                purchasedQty: reOrderResults[0][i].quantity,
                storeId: reOrderResults[0][i].storeId,
                rtItemSizeId: reOrderResults[0][i].rtItemSizeId,
                storeItemSizeId: reOrderResults[0][i].storeItemSizeId ? reOrderResults[0][i].storeItemSizeId : "",
                itemMrp: reOrderResults[0][i].price,
                isTopping: isTopping,
                sizeGroup: sizeArray,
                itemNo: '0',
                guestCount: reOrderResults[0][i].guestCount,
                isDineIn: reOrderResults[0][i].isDineIn,
                isPickUp: reOrderResults[0][i].isPickUp
                //toppingData:toppingData

            }
            reOrderData.push(reOrderDetails)
        }
        const data = {
            success: "1",
            result: {
                "rtReOrder": reOrderData,
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(data);


    })
}
module.exports = methods;



