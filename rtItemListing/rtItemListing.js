const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    let itemListingData = [];

    let itemCountData = [];
    let itemListingQuery
    let itemCountQuery
    let itemToppingQuery
    let storeId = event.storeId
    let itemId = event.itemId
    let userId = ((event.userId == null || event.userId == '') ? 0 : event.userId)
    //let imageListingQuery
    let cuisineId = event.cuisineId
    let courseId = event.courseId
    let courseTypeId = event.courseTypeId
    let sortBy = event.sortBy
    let whereQuery = '';
    let whereQueryParams = [];
    let sortQuery = ''
    let offset = event.offset
    let max = event.max
    let selectRestaurantCart = event.selectRestaurantCart

    if (itemId != "0" && itemId != null && itemId != "" && itemId != 'null') {
        whereQuery = whereQuery + ' and a.id = ? ';
        whereQueryParams.push(itemId);
    }

    if (cuisineId != "0" && cuisineId != null && cuisineId != "" && cuisineId != 'null') {
        whereQuery = whereQuery + ' and a.rt_cuisine_id = ? ';
        whereQueryParams.push(cuisineId);

    }
    if (courseId != "0" && courseId != null && courseId != "" && courseId != 'null') {
        whereQuery = whereQuery + ' and a.rt_course_id = ? ';
        whereQueryParams.push(courseId);

    }
    if (courseTypeId != "0" && courseTypeId != null && courseTypeId != "" && courseTypeId != 'null') {
        whereQuery = whereQuery + ' and a.rt_course_type_id = ? ';
        whereQueryParams.push(courseTypeId);

    }
    if (sortBy != "0" && sortBy != null && sortBy != "" && sortBy != 'null') {
        if (sortBy == 'new') {
            sortQuery = sortQuery + ' a.created_on desc,'
        } else {
            sortQuery = sortQuery + ' c.net_amount ' + sortBy + ','
        }
    }
    if (offset == null || offset == '') {
        offset = 0;
    }
    if (max == null || max == '') {
        max = 24;
    }
    itemCountQuery = " SELECT COUNT(*) AS totalCount " +
        " FROM rt_store_item a " +
        " inner JOIN rt_spice f on f.id=a.rt_spice_id  and f.is_active=true  " +
        " INNER JOIN rt_store_item_size c on c.rt_store_item_id=a.id and c.is_active=true " +
        " INNER JOIN  rt_item_size d on c.rt_item_size_id=d.id and d.is_active=true " +
        "  left join rt_user_wish_list g on  a.id=g.item_id and sec_user_id= ? " +
        "  inner join rt_course h on a.rt_course_id=h.id and h.is_active = true " +
        "  inner join rt_cuisine i on a.rt_cuisine_id = i.id and i.is_active = true " +
        "  inner join  rt_course_type j on a.rt_course_type_id=j.id and j.is_active =true " +
        "  left join   rt_store_item_image b ON a.id =b.rt_store_item_id " +
        "  where   a.is_active=1  " +
        " and a.store_id= ? " + whereQuery;
    const itemCountQueryParams = [userId, storeId, ...whereQueryParams];
    let itemCountDetails = [];
    //connection.query(itemCountQuery, function (error, itemCountResults, fields) {
    queryExecution.queryExecution(client, jsonObj, event, itemCountQuery, itemCountQueryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let itemCountResults = response.result;
        itemCountDetails = {
            itemCount: itemCountResults[0].totalCount
        }
        itemCountData.push(itemCountDetails)


        itemListingQuery = " SELECT a.id as itemId ,a.store_id as storeId,f.image as chillyimg,f.name as spicetype,a.name as itmname, a.description as itmdesc, a.rt_course_type_id as coursetypeid , " +
            " group_concat(if ((now() between c.offer_from and c.offer_to) and(c.is_offer=true), c. net_amount,c. price) order by c.net_amount desc " +
            " SEPARATOR '|') as netAmount,  group_concat(c.id order by c.net_amount desc SEPARATOR '|') as storeitemsize,group_concat(c.rt_item_size_id order by c.net_amount desc SEPARATOR '|') as rtItemSizeId," +
            " group_concat(c. price order by c.net_amount desc SEPARATOR '|') as price,  group_concat(d. name order by c.net_amount desc SEPARATOR '|') as itemsizname," +
            " group_concat(c.rt_item_size_id order by c.net_amount desc SEPARATOR '|') as itmsize, g.id as wishlistid, a.is_offer as offer ,   " +
            " group_concat(if(c. offer_text is null,'',c. offer_text) order by c.net_amount desc SEPARATOR '|') as offertext , " +
            " (SELECT GROUP_CONCAT( CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/'," +
            " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
            "  (select config_value from configuration where config_key = 's3PathRestaurant'),'/'," +
            " ifnull(b.image_name,'ResNoImage.jpg')) " +
            " ORDER BY b.is_default DESC  SEPARATOR '|') FROM rt_store_item_image b WHERE b.rt_store_item_id = a.id GROUP BY a.id ORDER BY b.is_default DESC )  AS imagename," +
            " (CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/', (select config_value from configuration where config_key = 'bucketSubFolder'),'/',   (select config_value from configuration where config_key = 's3PathRestaurant'),'/ResNoImage.jpg')) as defaultImage, " +
            "  group_concat(if ((now() between c.offer_from and c.offer_to) and(c.is_offer=true), '1' ,'0') order by c.net_amount desc SEPARATOR '|') as isoffer, " +
            " j.category ,c.offer_from as offerfrom , c.offer_to as offerto, a.is_photo_cake as photocake,cu.symbol AS currencySymbol " +
            " FROM rt_store_item a " +
            " inner JOIN rt_spice f on f.id=a.rt_spice_id  and f.is_active=true  " +
            " INNER JOIN rt_store_item_size c on c.rt_store_item_id=a.id and c.is_active=true " +
            " INNER JOIN  rt_item_size d on c.rt_item_size_id=d.id and d.is_active=true " +
            "  left join rt_user_wish_list g on  a.id=g.item_id and sec_user_id= ? " +
            "  inner join rt_course h on a.rt_course_id=h.id and h.is_active = true " +
            "  inner join rt_cuisine i on a.rt_cuisine_id = i.id and i.is_active = true " +
            "  inner join  rt_course_type j on a.rt_course_type_id=j.id and j.is_active =true " +
            // "  left join   rt_store_item_image b ON a.id =b.rt_store_item_id " +
            "  inner join store as st on st.id=a.store_id " +
            "   inner join currency as cu on cu.id=st.currency_id " +
            "  where a.is_active=1 and a.store_id= ? " + whereQuery + " group by a.id order by " + sortQuery + " a.ranking asc, " +
            "  a.item_buy_count desc, a.item_view_count desc  LIMIT ?,?;" +
            "   SELECT rsi.id as rt_store_item_id, level1.rt_item_size_id as rt_item_size_id,rsi.is_photo_cake as photocake, " +
            "     group_concat(level2.id SEPARATOR '||') as level2id,level1.id as level1id,   " +
            "   level1.is_multi_select as mulsel,level1.name as name, group_concat(level2.name SEPARATOR '||') as toppingname,   " +
            "   group_concat(level2.price SEPARATOR '||') as price,level1.has_cost as cost    " +
            "   FROM rt_item_sub_level1 as level1    " +
            "   inner join rt_store_item rsi on rsi.id=level1.rt_store_item_id  and rsi.store_id= ? " +
            "   INNER JOIN  rt_item_sub_level2 as level2  on level1.rt_store_item_id= rsi.id and level2.rt_item_sub_level1_id=level1.id  " +
            "   and  level1.is_active=1 and level2.is_active=1 and  level2.rt_store_item_id= rsi.id " +
            "   group by(level1.id); ";
        const itemListingQueryParams = [userId, storeId, ...whereQueryParams, parseInt(offset), parseInt(max), storeId];
        //connection.query(itemListingQuery, function (error, itemListingResults, fields) {
        queryExecution.queryExecution(client, jsonObj, event, itemListingQuery, itemListingQueryParams, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let itemListingResults = response.result;
            if (itemListingResults[0].length > 0) {
                for (let i = 0; i < itemListingResults[0].length; i++) {
                    let toppingData = [];
                    let itemsiznameSplt = itemListingResults[0][i].itemsizname.split('|')
                    let storeItemSizeIdSplt = itemListingResults[0][i].storeitemsize.split('|')
                    let priceSplt = itemListingResults[0][i].price.split('|')
                    let rtItemSizeIdSplt = itemListingResults[0][i].rtItemSizeId.split('|')
                    let sizeArray = []
                    let isTopping = false;

                    for (let s = 0; s < itemsiznameSplt.length; s++) {
                        let sizeObj = {
                            itemMrp: priceSplt[s],
                            itemPrice: priceSplt[s],
                            itemsizname: itemsiznameSplt[s],
                            storeItemSizeId: storeItemSizeIdSplt[s],
                            rtItemSizeId: rtItemSizeIdSplt[s],
                            toppingData: []
                        }
                        toppingData = [];
                        for (let j = 0; j < itemListingResults[1].length; j++) {
                            if (itemListingResults[0][i].itemId == itemListingResults[1][j].rt_store_item_id) {

                                isTopping = true;
                                if (rtItemSizeIdSplt[s] == itemListingResults[1][j].rt_item_size_id) {

                                    let toppingArray = [];

                                    let toppingNameSplit = itemListingResults[1][j].toppingname.toString()
                                        .split('||')
                                    let toppingPriceSplit = itemListingResults[1][j].price.toString()
                                        .split('||')
                                    let level2idSplit = itemListingResults[1][j].level2id.toString()
                                        .split('||')
                                    for (let t = 0; t < toppingNameSplit.length; t++) {
                                        let toppingObject = {
                                            name: toppingNameSplit[t],
                                            id: level2idSplit[t],
                                            price: toppingPriceSplit[t]
                                        }
                                        toppingArray.push(toppingObject)
                                    }
                                    let itemToppingDetails = {
                                        storeItemSizeId: storeItemSizeIdSplt[s],
                                        photoCake: itemListingResults[1][j].photocake,
                                        level1id: itemListingResults[1][j].level1id,
                                        multiSelect: itemListingResults[1][j].mulsel,
                                        name: itemListingResults[1][j].name,
                                        toppingCost: itemListingResults[1][j].cost,
                                        toppingArray: toppingArray
                                    }
                                    toppingData.push(itemToppingDetails)
                                    sizeObj.toppingData = toppingData
                                } else if (itemListingResults[1][j].rt_item_size_id == null || itemListingResults[1][j].rt_item_size_id == '') {

                                    let toppingArray = [];

                                    let toppingNameSplit = itemListingResults[1][j].toppingname.toString()
                                        .split('||')
                                    let toppingPriceSplit = itemListingResults[1][j].price.toString()
                                        .split('||')
                                    let level2idSplit = itemListingResults[1][j].level2id.toString()
                                        .split('||')
                                    for (let t = 0; t < toppingNameSplit.length; t++) {
                                        let toppingObject = {
                                            name: toppingNameSplit[t],
                                            id: level2idSplit[t],
                                            price: toppingPriceSplit[t]
                                        }
                                        toppingArray.push(toppingObject)
                                    }
                                    let itemToppingDetails = {
                                        storeItemSizeId: storeItemSizeIdSplt[s],
                                        photoCake: itemListingResults[1][j].photocake,
                                        level1id: itemListingResults[1][j].level1id,
                                        multiSelect: itemListingResults[1][j].mulsel,
                                        name: itemListingResults[1][j].name,
                                        toppingCost: itemListingResults[1][j].cost,
                                        toppingArray: toppingArray
                                    }
                                    toppingData.push(itemToppingDetails)
                                    sizeObj.toppingData = toppingData
                                }
                            }
                        }
                        sizeArray.push(sizeObj)
                    }
                    let itemImageSplit
                    if (itemListingResults[0][i].imagename != null && itemListingResults[0][i].imagename != '') {
                        itemImageSplit = itemListingResults[0][i].imagename.split('|')[0]
                    }
                    else {
                        itemImageSplit = itemListingResults[0][i].defaultImage
                    }
                    let isCart = false;
                    let cartQuantity = 0;
                    if (selectRestaurantCart != null && selectRestaurantCart != '' && selectRestaurantCart != 'null') {
                        for (let n = 0; n < selectRestaurantCart.length; n++) {
                            if (selectRestaurantCart[n].itemId == itemListingResults[0][i].itemId) {
                                isCart = true;
                                cartQuantity = selectRestaurantCart[n].quantity
                            }
                        }
                    }

                    let itemListingDetails = [];
                    itemListingDetails = {
                        storeId: itemListingResults[0][i].storeId,
                        itemId: itemListingResults[0][i].itemId,
                        itemName: itemListingResults[0][i].itmname,
                        itemCode: itemListingResults[0][i].itmdesc,
                        category: itemListingResults[0][i].category,
                        //imageName: itemListingResults[0][i].imagename,
                        imageName: itemImageSplit,
                        wishListId: itemListingResults[0][i].wishlistid,
                        itemDescription: itemListingResults[0][i].itmdesc,
                        currencySymbol: itemListingResults[0][i].currencySymbol,
                        itemMrp: priceSplt[0],
                        itemPrice: priceSplt[0],
                        itemsizname: itemsiznameSplt[0],
                        storeItemSizeId: storeItemSizeIdSplt[0],
                        rtItemSizeId: itemListingResults[0][i].rtItemSizeId,
                        isTopping: isTopping,
                        // toppings: toppingData,
                        sizeGroup: sizeArray,
                        isCart: isCart,
                        cartSize: cartQuantity
                    }
                    itemListingData.push(itemListingDetails)
                }
                const response = {
                    success: "1",
                    result: {
                        "itemListingDetails": itemListingData,
                        "itemCountDetails": itemCountData
                    },
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(response);
            }
            else {
                const response = {
                    success: "0",
                    result: {
                        "itemListingDetails": itemListingData,
                        "itemCountDetails": itemCountData

                    },
                    errorMessage: "No Data Found",
                    successMessage: ""
                };
                callback(response);

            }

        })

    })
}
module.exports = methods;
