let queryExecution = require('../queryExecution');
let methods = {};

methods.restaurantItemListing = function (client, jsonObj, event, callback) {
    let resultArray = []
    let offset = event.offset;
    let max = event.max;

    let queryString = "";
    var whereQuery = "";
    let whereQueryParams = [];

    if (event.sellerId) {
        if (whereQuery == "") {
            whereQuery = " WHERE st.seller_id = ? ";
            whereQueryParams.push(event.sellerId);
        }
        else {
            whereQuery = whereQuery + " and st.seller_id = ? ";
            whereQueryParams.push(event.sellerId);
        }
    }
    if (event.storeId) {
        if (whereQuery == "") {
            whereQuery = " WHERE rsi.store_id = ? ";
            whereQueryParams.push(event.storeId);
        }
        else {
            whereQuery = whereQuery + " and rsi.store_id = ? ";
            whereQueryParams.push(event.storeId);
        }
    }

    if (event.itemName != null && event.itemName != '') {
        whereQuery = whereQuery + " and rsi.name like ? "
        whereQueryParams.push("%" + event.itemName + "%");
    }
    if (event.cuisines != null && event.cuisines != '' && event.cuisines != '00') {
        whereQuery = whereQuery + " and c.id = ?";
        whereQueryParams.push(event.cuisines);
    }
    if (event.course != null && event.course != '' && event.course != '00') {
        whereQuery = whereQuery + " and co.id = ? ";
        whereQueryParams.push(event.course);
    }
    if (event.courseType != null && event.courseType != '' && event.courseType != '00') {
        whereQuery = whereQuery + " and ct.id = ? ";
        whereQueryParams.push(event.courseType);
    }
    if (event.spiceType != null && event.spiceType != '' && event.spiceType != '00') {
        whereQuery = whereQuery + " and s.id = ? ";
        whereQueryParams.push(event.spiceType);
    }

    //status 1=Active,2=Inactive,3=Mapped,4=Added,5=Offer
    if (event.status != null && event.status != '' && event.status != '0') {
        switch (event.status) {
            case '1':
                whereQuery = whereQuery + " and rsi.is_active=true "
                break;
            case '2':
                whereQuery = whereQuery + " and rsi.is_active=false "
                break;
            case '3':
                whereQuery = whereQuery + " and rsi.is_master=true "
                break;
            case '4':
                whereQuery = whereQuery + " and rsi.is_master=false "
                break;
            case '5':
                whereQuery = whereQuery + " and rsi.is_offer=true "
                break;
        }
    }

    queryString = " SELECT rsi.id AS itemId,rsi.name AS itemName,rsi.description AS itemDescription,rsi.store_id AS storeId,CONCAT(rsi.id, c.id, co.id, ct.id) AS uniqueId, " +
        " GROUP_CONCAT((SELECT GROUP_CONCAT(IFNULL(level1.rt_item_size_id,'NA') SEPARATOR '|') FROM rt_item_sub_level1 AS level1  " +
        " WHERE rsi.id=level1.rt_store_item_id  AND level1.is_active=1)) AS level1RtItemSizeId,GROUP_CONCAT((SELECT GROUP_CONCAT(level1.id " +
        " SEPARATOR '|') FROM rt_item_sub_level1 AS level1 WHERE rsi.id=level1.rt_store_item_id  AND level1.is_active=1)) AS level1id, " +
        " GROUP_CONCAT((SELECT GROUP_CONCAT(IF(level1.is_multi_select=TRUE,1,0)  SEPARATOR '|')  FROM rt_item_sub_level1 AS level1 " +
        " WHERE rsi.id=level1.rt_store_item_id  AND level1.is_active=1)) AS level1multiselect,GROUP_CONCAT((SELECT GROUP_CONCAT( " +
        " IF(level1.has_cost=TRUE,1,0)  SEPARATOR '|')  FROM rt_item_sub_level1 AS level1 WHERE rsi.id=level1.rt_store_item_id  AND level1.is_active=1)) AS cost,GROUP_CONCAT((SELECT GROUP_CONCAT(level1.name SEPARATOR '|') FROM rt_item_sub_level1 AS level1 WHERE rsi.id=level1.rt_store_item_id  AND level1.is_active=1)) AS level1name,GROUP_CONCAT(( SELECT GROUP_CONCAT(t.level2Id SEPARATOR '-' ) FROM (SELECT GROUP_CONCAT(level2.id SEPARATOR '|') AS level2Id,level1.rt_store_item_id AS l1rsid,level2.rt_store_item_id AS l2rsid " +
        " FROM  rt_item_sub_level2 AS level2  INNER JOIN rt_item_sub_level1 AS level1 ON level2.rt_item_sub_level1_id=level1.id AND level2.is_active=1 GROUP BY level1.id)AS t WHERE t.l1rsid=rsi.id AND t.l2rsid=rsi.id  GROUP BY t.l1rsid))AS toppingid,GROUP_CONCAT(( SELECT GROUP_CONCAT(t.level2Name SEPARATOR '-' ) FROM (SELECT GROUP_CONCAT(level2.name SEPARATOR '|') AS level2Name,level1.rt_store_item_id AS l1rsid,level2.rt_store_item_id AS l2rsid  FROM  rt_item_sub_level2 AS level2 " +
        " INNER JOIN rt_item_sub_level1 AS level1 ON level2.rt_item_sub_level1_id=level1.id AND level2.is_active=1 GROUP BY level1.id)AS t WHERE t.l1rsid=rsi.id AND t.l2rsid=rsi.id  GROUP BY t.l1rsid))AS toppingname,GROUP_CONCAT(( SELECT GROUP_CONCAT(t.level2Price SEPARATOR '-' ) FROM (SELECT GROUP_CONCAT(level2.price SEPARATOR '|') AS level2Price,level1.rt_store_item_id AS l1rsid,level2.rt_store_item_id AS l2rsid  FROM  rt_item_sub_level2 AS level2  " +
        " INNER JOIN rt_item_sub_level1 AS level1 ON level2.rt_item_sub_level1_id=level1.id AND level2.is_active=1 GROUP BY level1.id)AS t WHERE t.l1rsid=rsi.id AND t.l2rsid=rsi.id  GROUP BY t.l1rsid))AS toppingprice,IF(ct.category IS NULL OR ct.category = '',CONCAT(rsi.name,' ',c.name,' ',co.name,' ',ct.name),CONCAT(rsi.name,' ',c.name, " +
        " ' ',co.name,' ',ct.name,' ',ct.category,' ',IF(ct.category = 'Non Veg','Non Vegetarian',IF(ct.category = 'Veg','Vegetarian','')))) AS searchString,s.image AS spiceImg,s.name AS spiceType,rsi.description AS itemDesc,c.id AS cuisineId,c.name AS cuisineName,co.id AS courseId, " +
        " co.name AS courseName,rsi.rt_course_type_id AS courseTypeId,ct.name AS courseTypeName,GROUP_CONCAT(IF((NOW() BETWEEN rsis.offer_from AND rsis.offer_to)AND (rsis.is_offer = TRUE),rsis.net_amount,rsis.price)ORDER BY rsis.net_amount DESC SEPARATOR '|') AS netAmount,IF((NOW() BETWEEN rsis.offer_from AND rsis.offer_to) AND (rsis.is_offer = TRUE),rsis.net_amount,rsis.price)AS amount,GROUP_CONCAT(rsis.id ORDER BY rsis.net_amount DESC SEPARATOR '|') AS storeItemSize,GROUP_CONCAT(rsis.rt_item_size_id ORDER BY rsis.net_amount DESC SEPARATOR '|') AS rtItemSizeId, " +
        " GROUP_CONCAT(rsis.price ORDER BY rsis.net_amount DESC SEPARATOR '|') AS price,GROUP_CONCAT(ris.name ORDER BY rsis.net_amount DESC " +
        " SEPARATOR '|') AS itemSizeName,ris.name AS sizeName,rsis.rt_item_size_id AS sizeId,GROUP_CONCAT(rsis.rt_item_size_id ORDER BY rsis.net_amount DESC SEPARATOR '|') AS itemSize,rwl.id AS wishListId,if(rsi.is_offer is true,true,false) AS offer,GROUP_CONCAT(IF(rsis.offer_text IS NULL,'',rsis.offer_text) " +
        " ORDER BY rsis.net_amount DESC SEPARATOR '|') AS offerText,CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'), " +
        " '/',(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'), '/', (SELECT config_value FROM configuration WHERE " +
        " config_key = 's3PathRestaurant'), '/',IFNULL(rsii.image_name, 'ResNoImage.jpg')) AS itemImage,GROUP_CONCAT(IF((NOW() BETWEEN rsis.offer_from AND rsis.offer_to) AND (rsis.is_offer = TRUE),'1','0') ORDER BY rsis.net_amount DESC SEPARATOR '|') AS isOffer, ct.category AS courseTypeCategory,rsis.offer_from AS offerFrom, rsis.offer_to AS offerTo, if(rsi.is_photo_cake is true,true,false) AS photoCake,cu.symbol AS currencySymbol, " +
        " IFNULL((SELECT cso.sort_order  FROM rt_menu_sort_order cso WHERE cso.type_id = c.id AND cso.is_active = TRUE AND cso.rt_menu_type_id = 1 " +
        " AND cso.store_id = rsi.store_id),999) AS cusineSortOrder, IFNULL((SELECT  coso.sort_order FROM rt_menu_sort_order AS coso WHERE " +
        " coso.type_id = co.id AND coso.is_active = TRUE  AND coso.rt_menu_type_id = 2 AND coso.store_id = rsi.store_id), 999) AS courseSortOrder, " +
        " IFNULL((SELECT ctso.sort_order FROM rt_menu_sort_order AS ctso WHERE ctso.type_id = ct.id AND ctso.is_active = TRUE AND ctso.rt_menu_type_id = 3 AND ctso.store_id = rsi.store_id), 999) AS courseTypeSortOrder,if(st.has_contact_us_without_price is true,true,false) AS hasContactUsWithoutPrice, " +
        " if(st.has_buy_option is true,true,false) AS hasBuyOption,st.store_button_name AS storeButtonName,rsi.alcohol_content AS alcoholContent FROM rt_store_item rsi " +
        " INNER JOIN rt_spice s ON s.id = rsi.rt_spice_id AND s.is_active = TRUE INNER JOIN rt_store_item_size rsis ON rsis.rt_store_item_id = rsi.id " +
        " AND rsis.is_active = TRUE INNER JOIN rt_item_size ris ON rsis.rt_item_size_id = ris.id AND ris.is_active = TRUE LEFT JOIN rt_user_wish_list rwl ON rsi.id = rwl.item_id AND sec_user_id = 0 " +
        " INNER JOIN rt_course co ON rsi.rt_course_id = co.id AND co.is_active = TRUE INNER JOIN rt_cuisine c ON rsi.rt_cuisine_id = c.id " +
        " AND c.is_active = TRUE INNER JOIN rt_course_type ct ON rsi.rt_course_type_id = ct.id AND ct.is_active = TRUE INNER JOIN store AS st ON st.id = rsi.store_id  INNER JOIN currency AS cu ON cu.id = st.currency_id LEFT JOIN rt_store_item_image AS rsii ON rsi.id = rsii.rt_store_item_id " +
        //" AND rsii.is_default = TRUE WHERE  rsi.store_id = " + event.storeId + whereQuery + " " +
        " AND rsii.is_default = TRUE " + whereQuery + " " +
        " GROUP BY rsi.id ORDER BY rsi.ranking ASC , rsi.item_buy_count DESC , rsi.item_view_count DESC limit ?,?; " +
        " SELECT COUNT(*) as totalCount FROM (SELECT rsi.id FROM rt_store_item rsi INNER JOIN rt_spice s ON s.id = rsi.rt_spice_id AND s.is_active = TRUE INNER JOIN rt_store_item_size rsis ON rsis.rt_store_item_id = rsi.id AND rsis.is_active = TRUE INNER JOIN rt_item_size ris ON rsis.rt_item_size_id = ris.id AND ris.is_active = TRUE LEFT JOIN rt_user_wish_list rwl ON rsi.id = rwl.item_id AND sec_user_id = 0 " +
        " INNER JOIN rt_course co ON rsi.rt_course_id = co.id AND co.is_active = TRUE INNER JOIN rt_cuisine c ON rsi.rt_cuisine_id = c.id " +
        " AND c.is_active = TRUE INNER JOIN rt_course_type ct ON rsi.rt_course_type_id = ct.id AND ct.is_active = TRUE INNER JOIN store AS st ON st.id = rsi.store_id INNER JOIN currency AS cu ON cu.id = st.currency_id LEFT JOIN rt_store_item_image AS rsii ON rsi.id = rsii.rt_store_item_id " +
        //" AND rsii.is_default = TRUE WHERE  rsi.store_id = " + event.storeId + whereQuery + " GROUP BY rsi.id) AS totalCount ;"
        " AND rsii.is_default = TRUE  " + whereQuery + " GROUP BY rsi.id) AS totalCount ;";
    const queryParams = [...whereQueryParams, parseInt(offset), parseInt(max), ...whereQueryParams];
    console.log(queryString, "sssssssssssssssssssssssssssssssss")
    queryExecution.queryExecution(client, jsonObj, event, queryString,[], function (response) {

        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        if (results.length > 0) {
            resultArray = results[0]

            for (let i = 0; i < resultArray.length; i++) {
                let itemSize = resultArray[i].itemSize
                let splitItemSize = itemSize ? itemSize.split('|') : []

                let itemSizeName = resultArray[i].itemSizeName
                let splitItemSizeName = itemSizeName ? itemSizeName.split('|') : []

                let price = resultArray[i].price
                let splitPrice = price ? price.split('|') : []

                let rtItemSizeId = resultArray[i].rtItemSizeId
                let splitRtItemSizeId = rtItemSizeId ? rtItemSizeId.split('|') : []

                let storeItemSize = resultArray[i].storeItemSize
                let splitStoreItemSize = storeItemSize ? storeItemSize.split('|') : []

                let netAmount = resultArray[i].netAmount
                let splitNetAmount = netAmount ? netAmount.split('|') : []

                let offerText = resultArray[i].offerText
                let splitOfferText = offerText ? offerText.split('|') : []

                let isOffer = resultArray[i].isOffer
                let splitIsOffer = isOffer ? isOffer.split('|') : []


                let sizeDetails = []
                for (let k = 0; k < splitItemSize.length; k++) {
                    sizeDetails[k] = {
                        itemSize: splitItemSize[k],
                        itemSizeName: splitItemSizeName[k],
                        price: splitPrice[k],
                        rtItemSizeId: splitRtItemSizeId[k],
                        storeItemSize: splitStoreItemSize[k],
                        netAmount: splitNetAmount[k],
                        offerText: splitOfferText[k],
                        isOffer: splitIsOffer[k],
                    }
                }
                resultArray[i].sizeDetails = sizeDetails
            }

            const response = {
                "success": "1",
                "successMessage": "Success",
                "result": JSON.parse(JSON.stringify(results[0]).replace(/\:null/gi, "\:\"\"")),
                "count": results[1][0].totalCount,

                "errorMessage": ""
            }
            callback(response)
        }
        else {
            const response = {
                "success": "1",
                "successMessage": "No data found matching the criteria.",
                "errorMessage": ""
            }
            callback(response)
        }
    });
}
module.exports = methods;
