const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.sellerAppOrderDetails = function (client, jsonObj, event, callback) {

    let restaurantData = [];
    let taxData = [];
    let orderId = event.orderId
    let itemQuery = "";
    let commonItemData = [];
    let groceryItemData = [];
    let storeAddressQuery = " select cr.symbol AS currencySymbol,st.email_footer_text as email_footer_text, st.name as storeName,st.address1 as storeAddress1," +
        " st.address2 as storeAddress2,so.sale_id as saleId,st.consumer_card_name as consumerCardName,c.name as cityName,s.name as stateName,st.id,st.locality as locality," +
        " su.email_id as email,st.telephone_number as telephone,su.mobile_number as mobile,so.id as orderId " +
        " from store as st " +
        " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
        " inner join sale_order as so on so.store_id = st.id " +
        " inner join sec_user as su on su.id = st.sec_user_id " +
        " inner join city as c on c.id = st.city_id " +
        " inner join state as s on s.id = c.state_id " +
        " where so.id = ? ";
    queryExecution.queryExecution(client, jsonObj, event, storeAddressQuery, [orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let storeAddressQueryResult = response.result;
        let orderQueryData = []

        let orderQuery = " select if(so.promo_code_id is null,'',pc.code) as promoCode,if(so.promo_code_amount is null,0,so.promo_code_amount) as promoCodeAmount,so.consumer_number as consumerNumber, so.message as comments,cr.symbol AS currencySymbol,so.id as orderId,os.name as orderStatus,so.consumer_number as consumerNumber,mc.name as mainCategoryName," +
            " p.name as paymentType,date_format(s.sale_date,'%d-%b-%Y %I:%i %p') as orderDate,so.delivery_slot as deliverySlot,bsa.name as buyerName,bsa.address1 as buyerAddress1,bsa.address2 as buyerAddress2, " +
            " so.delivery_charge as deliverCharge,so.promocode_item_name as promoCodeItemName," +
            " so.promo_code_id as promoCodeId,so.gross_amount as orderNetAmount,so.main_category_id as mainCatId, " +
            " l.name as locationName,c.name as cityName,sta.name as stateName,st.id as storeId, " +
            " bsa.telephone_number as buyerTelephone,bsa.zip as zipcode,su.email_id as buyerEmail,bsa.id as buyerAddressId," +
            " s.site_id as siteId,s.created_by as created,so.dine_in_no_of_people as dineIn,if(so.`is_dine_in` is true,'1','0') as isDineIn," +
            " if(so.`is_store_pick_up` is true,'1','0') as isStorePickUp,if(so.alcohol_receiver_name is not null,so.alcohol_receiver_name,'') as receiverName,if(so.alcohol_receiver_name is not null,aao.name,'') as receiverOptionsName,if(so.alcohol_receiver_name is not null,aro.name,'') as orderOptionsName, st.consumer_card_name as consumerCardName " +
            " from sale as s " +
            " inner join sale_order as so on s.id = so.sale_id " +
            " inner join main_category as mc on mc.main_group_category_id=so.main_category_id " +
            " inner join sale_order_status as sos on so.id = sos.sale_order_id " +
            " left join alcohol_receive_options as aro on aro.id = so.alcohol_receive_options_id " +
            " left join alcohol_order_options as aao on aao.id = so.alcohol_order_options_id " +
            " inner join order_status as os on os.id = sos.order_status_id " +
            " inner join buyer_delivery_address as bsa on bsa.id = s.buyer_delivery_address_id " +
            " inner join location as l on l.id= bsa.location_id " +
            " inner join city as c on c.id = l.city_id " +
            " inner join state as sta on sta.id = c.state_id " +
            " inner join store as st on st.id = so.store_id " +
            " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
            " inner join sec_user as su on su.id = s.buyer_id " +
            " inner join payment_type as p on p.id = s.payment_type_id " +
            " left join promo_code as pc on pc.id = so.promo_code_id " +
            "  where s.is_active = true " +
            " and sos.is_current_status = true " +
            " and so.id= ? group by so.id;" +

            " SELECT cr.symbol AS currencySymbol,st.store_id as store_id,st.`tax_name` AS taxName,0 as itemNetAmount,st.`tax_percentage` AS taxPercentage,st.`apply_tax_on_id` AS applyTax, IF(st.`apply_tax_on_id`,  (SELECT sd.tax_percentage FROM store_tax_details AS sd WHERE st.`apply_tax_on_id` = sd.id)  ,NULL) AS applyTaxPercentage  " +
            " FROM `store_tax_details` AS st   " +
            " INNER JOIN store as s ON s.id = st.store_id  " +
            " INNER JOIN currency AS cr ON cr.id = s.`currency_id` " +
            " WHERE st.is_active = true and st.`store_id` in (select store_id from sale_order where sale_id = ?);"
        queryExecution.queryExecution(client, jsonObj, event, orderQuery, [orderId, storeAddressQueryResult[0].saleId], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let orderQueryResults = response.result;
            if (orderQueryResults[0][0].mainCatId == 1) {
                itemQuery = " SELECT cr.symbol AS currencySymbol,st.name as storeName,so.main_category_id,st.id as storeId,s.id as saleId,so.id as orderId,soi.net_amount as totalItemAmount," +
                    " s.net_amount as saleNetAmount,concat(soi.unit,'',soi.unit_type)as sizeItem,s.gross_amount as salegrossAmount,(soi.quantity* soi.item_price) as totalPrice,  soi.item_name as itemName," +
                    " b.name as brandName,so.delivery_charge as deliletyCharge,p.name as packName,soi.review_status as reviewStatus, soi.quantity as quantity,soi.mrp as mrpprice,soi.net_amount as netAmount," +
                    " so.delivery_charge as deliveryCharge ,soi.item_code as itemCode,soi.mrp as itemMrp,soi.item_price as itemPrice,so.consumer_number as conNumber,so.delivery_slot as slot,it.is_loose_item as looseItem,  (select sum(soi.net_amount) " +
                    " from sale_order_item as soi where soi.sale_order_id = so.id) as itemNetAmount,CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',  (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/',  st.logo_path) AS logopath, sos.unit as stockUnit,sos.net_amount as stockNetAmount,sos.unit_type as stockUnitType," +
                    " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder'),'/',it.logo_path_thumb) as itemImg, " +
                    " '' as attachmentId,'' as attachment,'' as attachmentName  " +
                    " FROM sale as s" +
                    " INNER JOIN sale_order as so ON s.id = so.sale_id " +
                    " INNER JOIN store as st ON st.id = so.store_id " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    " INNER JOIN sale_order_item as soi ON soi.sale_order_id = so.id" +
                    " INNER JOIN store_item_stock as sos ON sos.id = soi.store_item_stock_id " +
                    " INNER JOIN item it ON it.id = soi.item_id " +
                    " INNER JOIN pack p ON p.id = it.pack_id " +
                    " LEFT OUTER JOIN brand as b ON it.brand_id=b.id " +
                    " where so.id= ?" +
                    " UNION " +
                    " SELECT cr.symbol AS currencySymbol,st.name as storeName,so.main_category_id,st.id as storeId, " +
                    " s.id as saleId,so.id as orderId,0 as totalItemAmount, s.net_amount as saleNetAmount,'' as sizeItem, " +
                    " s.gross_amount as salegrossAmount,0 as totalPrice,  '' as itemName, '' as brandName, " +
                    " so.delivery_charge as deliletyCharge,'' as packName,'' as reviewStatus, 0 as quantity,0 as mrpprice, " +
                    " 0 as netAmount, so.delivery_charge as deliveryCharge ,'' as itemCode,0 as itemMrp,0 as itemPrice, " +
                    " so.consumer_number as conNumber,so.delivery_slot as slot,'0' as looseItem, 0 as itemNetAmount, " +
                    "CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',  " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/',  " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/',  st.logo_path) " +
                    " AS logopath, 0 as stockUnit,0 as stockNetAmount,'' as stockUnitType, '' as itemImg, " +
                    " phba.id as attachmentId,concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                    " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                    " (select config_value from configuration where config_key = 's3pharmacyItemFolder') " +
                    " ,'/attachments/',phba.attachment_name) as attachment,phba.attachment_name as attachmentName  " +
                    " FROM sale as s " +
                    " INNER JOIN sale_order as so ON s.id = so.sale_id  and so.id = ? " +
                    " INNER JOIN store as st ON st.id = so.store_id  " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    " INNER JOIN ph_buyer_attachments_sale_order as phbaso on phbaso.sale_order_id = so.id " +
                    " INNER JOIN ph_buyer_attachments as phba on phba.id = phbaso.ph_buyer_attachments_id ";
                itemQueryParams = [orderId, orderId];
            } else if (orderQueryResults[0][0].mainCatId == 5) {
                itemQuery = " select (soi.quantity* soi.item_price) as totalPrice,group_concat(rtItemSl1.name,'|',rtItemSl2.name,'|',sosl.net_amount) as subitem ," +
                    " soi.sale_order_id as orderId,'' as reviewStatus,cr.symbol AS currencySymbol, " +
                    " soi.id,soi.quantity as quantity,i.name as itemName,soi.item_price as itemPrice, soi.net_amount as netAmount, " +
                    " soi.total_item_amount as totalItemAmount,i.name,rtImage.image_name as imageName,so.message as comments,so.delivery_charge,isz.name as itemsize, '' as size_name, " +
                    " '' as attachmentId,'' as attachment,'' as attachmentName  " +
                    " from rt_sale_order_items as soi " +
                    " inner join sale_order as so on so.id = soi.sale_order_id " +
                    " INNER JOIN store as st ON st.id = so.store_id " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    "  inner join sale as s on s.id = so.sale_id " +
                    " inner join rt_store_item as i on i.id= soi.rt_store_item_id " +
                    "  left JOIN rt_sale_order_item_sublevel sosl on sosl.rt_sale_order_items_id =soi.id " +
                    "  left join rt_item_sub_level1 as rtItemSl1 on rtItemSl1.id = sosl.rt_item_sub_level1_id " +
                    " left join rt_item_sub_level2 as rtItemSl2 on rtItemSl2.id = sosl.rt_item_sub_level2_id " +
                    " left join rt_store_item_image as rtImage on rtImage.rt_store_item_id =i.id and rtImage.is_default=1 " +
                    " inner join rt_store_item_size sis on sis.rt_store_item_id=soi.rt_store_item_id " +
                    " inner join rt_item_size isz on isz.id= sis.rt_item_size_id and sis.id= soi.rt_store_item_size_id " +
                    " where so.id = ? " +
                    " group by soi.id ";
                itemQueryParams = [orderId];

            } else if (orderQueryResults[0][0].mainCatId == 8) {
                itemQuery = "SELECT '' as itemCode,cr.symbol AS currencySymbol,s.id as saleId,so.id as orderId,st.id as storeId,csoi.item_price as itemPrice,csoi.net_amount as netAmount," +
                    "s.net_amount as saleNetAmount,s.gross_amount as salegrossAmount,csoi.review_status as reviewStatus,csoi.item_name as itemName, " +
                    " cb.name as brandName, csoi.quantity as quantity,csoi.net_amount as totalItemAmount,csoi.mrp as itemMrp, (csoi.quantity* csoi.net_amount) as totalPrice," +
                    " csoi.net_amount as itemPrice,so.delivery_charge as deliveryCharge,so.consumer_number as conNumber,so.message as comments," +
                    " so.delivery_slot as slot,CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/'," +
                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                    " (select config_value from configuration where config_key = 's3PathCommonItem'),'/','clothing/',cii.image)as itemImg," +
                    " ci.stock_quantity as stockUnit,ci.net_amount as stockNetAmount,ci.title as packName," +
                    " cs.name as size_name, " +
                    " '' as attachmentId,'' as attachment,'' as attachmentName  " +
                    " FROM sale as s " +
                    " INNER JOIN sale_order as so ON s.id = so.sale_id " +

                    " INNER JOIN store as st ON st.id = so.store_id " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    " INNER JOIN cm_sale_order_item as csoi ON csoi.sale_order_id = so.id " +
                    " inner join cm_item as ci on ci.id=csoi.cm_item_id " +
                    " inner join cm_item_master as cim on cim.id=ci.cm_item_master_id" +
                    " left join cm_item_images as cii on cii.cm_item_id=ci.id and cii.is_default=1 " +
                    " LEFT OUTER JOIN cm_brand as cb ON cb.id=cim.cm_brand_id" +
                    " left join cm_item_size as cis on cis.id = csoi.cm_item_size_id " +
                    " left join cm_size as cs on cs.id = cis.cm_size_id " +
                    " WHERE so.id = ? ";
                itemQueryParams = [orderId];
            }
            queryExecution.queryExecution(client, jsonObj, event, itemQuery, itemQueryParams, function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let itemQueryResult = response.result;
                let subtotal = 0
                let savedAmount = 0

                let taxsubTotal = 0;
                if (orderQueryResults[0][0].mainCatId == 1) {
                    if (itemQueryResult.length > 0) {
                        for (let i = 0; i < itemQueryResult.length; i++) {
                            taxsubTotal = taxsubTotal + itemQueryResult[i].netAmount;
                            /*taxData = []
                            for (let k = 0; k < orderQueryResults[1].length; k++) {
                                if (orderQueryResults[1][k].store_id == orderQueryResults[0][0].storeId) {
                                    const taxDetails = {
                                        taxName: orderQueryResults[1][k].taxName,
                                        taxPercentage: orderQueryResults[1][k].taxPercentage,
                                        taxAmount: orderQueryResults[1][k].currencySymbol + " " + parseFloat(orderQueryResults[1][k].taxAmount).toFixed(2)
                                    }
                                    taxData.push(taxDetails)
                                }
                            }*/

                            let groceryItemListing = [];
                            groceryItemListing = {
                                totalPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalPrice).toFixed(2),
                                orderId: itemQueryResult[i].orderId,
                                reviewStatus: itemQueryResult[i].reviewStatus,
                                quantity: itemQueryResult[i].quantity,
                                itemCode: itemQueryResult[i].itemCode,
                                sizeItem: itemQueryResult[i].sizeItem,
                                taxData: taxData,
                                itemImage: itemQueryResult[i].itemImg,
                                comments: itemQueryResult[i].comments,
                                deliveryCharge: itemQueryResult[i].deliveryCharge != 0 ? itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].deliveryCharge).toFixed(2) : "Free",
                                itemName: itemQueryResult[i].itemName,
                                itemPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemPrice).toFixed(2),
                                netAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].netAmount).toFixed(2),
                                totalItemAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalItemAmount).toFixed(2),
                                brandName: itemQueryResult[i].brandName,
                                packName: itemQueryResult[i].packName,
                                itemMrp: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemMrp).toFixed(2),
                                itemMrp: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemMrp).toFixed(2),
                                itemMrp: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemMrp).toFixed(2),
                                phIds: itemQueryResult[i].attachmentId,
                                phAttachment: itemQueryResult[i].attachment,
                                phAttachmentName: itemQueryResult[i].attachmentName
                            }
                            groceryItemData.push(groceryItemListing)
                            subtotal = subtotal + (itemQueryResult[i].itemPrice * itemQueryResult[i].quantity)
                            savedAmount = savedAmount + (itemQueryResult[i].itemMrp * itemQueryResult[i].quantity - itemQueryResult[i].itemPrice * itemQueryResult[i].quantity)
                        }
                    }

                }
                else if (orderQueryResults[0][0].mainCatId == 5) {
                    if (itemQueryResult.length > 0) {
                        for (let i = 0; i < itemQueryResult.length; i++) {
                            taxsubTotal = taxsubTotal + itemQueryResult[i].netAmount;
                            //console.log("3...sss..taxsubTotal"+taxsubTotal)

                            /*taxData = []
                            for (let k = 0; k < orderQueryResults[1].length; k++) {
                                if (orderQueryResults[1][k].store_id == orderQueryResults[0][0].storeId) {
                                    let tax = 0
                                    if (orderQueryResults[1][k].applyTax == null) {
                                        tax = taxsubTotal * orderQueryResults[1][k].taxPercentage / 100
                                    } 
                                    else {
                                        let applyTax = taxsubTotal * orderQueryResults[1][k].applyTaxPercentage / 100
                                        tax = applyTax * orderQueryResults[1][k].taxPercentage / 100
                                    }
                                    const taxDetails = {
                                        taxName: orderQueryResults[1][k].taxName,
                                        taxPercentage: orderQueryResults[1][k].taxPercentage,
                                        taxAmount: orderQueryResults[1][k].currencySymbol + " " + parseFloat(tax).toFixed(2)
                                    }
                                    taxData.push(taxDetails)
                                }
                            }*/
                            let toppings = []

                            if (itemQueryResult[i].subitem != null && itemQueryResult[i].subitem != '') {
                                let subItemName = itemQueryResult[i].subitem.split(',')
                                let toppingsMains = []
                                for (let j = 0; j < subItemName.length; j++) {

                                    let subItemNameSplit = subItemName[j].split('|')
                                    let val = 'Free'
                                    if (subItemNameSplit[2] != '0' && subItemNameSplit[2] != '' && subItemNameSplit[2] != null) {
                                        val = itemQueryResult[i].currencySymbol + " " + parseFloat(subItemNameSplit[2]).toFixed(2)
                                    }
                                    let restsubItemNameSplit = [];
                                    if (toppingsMains.indexOf(subItemNameSplit[0]) === -1) {
                                        toppingsMains.push(subItemNameSplit[0])
                                    }
                                    else {

                                    }
                                    restsubItemNameSplit = {
                                        toppings1: subItemNameSplit[0],
                                        toppings2: subItemNameSplit[1],
                                        toppings3: val
                                    }
                                    toppings.push(restsubItemNameSplit)
                                }
                            }
                            let mainTopping = []
                            let toppingsList = toppings.reduce(function (toppings, element) {
                                toppings[element.toppings1] = toppings[element.toppings1] || [];
                                if (mainTopping.indexOf(element.toppings1) === -1) {
                                    mainTopping.push(element.toppings1);
                                }
                                toppings[element.toppings1].push(element);
                                return toppings;

                            }, Object.create(null));
                            let restauarantListing = [];
                            restauarantListing = {
                                totalPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalPrice).toFixed(2),
                                subitem: itemQueryResult[i].subitem,
                                orderId: itemQueryResult[i].orderId,
                                reviewStatus: itemQueryResult[i].reviewStatus,
                                quantity: itemQueryResult[i].quantity,
                                itemName: itemQueryResult[i].itemName,
                                itemImage: itemQueryResult[i].itemImg,
                                itemPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemPrice).toFixed(2),
                                netAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].netAmount).toFixed(2),
                                totalItemAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalItemAmount).toFixed(2),
                                itemsize: itemQueryResult[i].itemsize,
                                size_name: itemQueryResult[i].size_name,
                                toppingsData: toppings,
                                toppingsList: toppingsList,
                                mainTopping: mainTopping,
                                taxData: taxData,
                                brandName: "null",
                                comments: itemQueryResult[i].comments


                            }
                            restaurantData.push(restauarantListing)
                            subtotal = subtotal + (itemQueryResult[i].totalItemAmount * itemQueryResult[i].quantity)
                            savedAmount = savedAmount + (itemQueryResult[i].itemPrice * itemQueryResult[i].quantity - itemQueryResult[i].netAmount * itemQueryResult[i].quantity)
                        }

                    }

                } else if (orderQueryResults[0][0].mainCatId == 8) {
                    console.log("2............." + itemQueryResult.length)
                    if (itemQueryResult.length > 0) {
                        for (let i = 0; i < itemQueryResult.length; i++) {
                            /*taxData = []
                            for (let k = 0; k < orderQueryResults[1].length; k++) {
                                if (orderQueryResults[1][k].store_id == orderQueryResults[0][0].storeId) {
                                    let tax = 0
                                    if (orderQueryResults[1][k].applyTax == null) {
                                        tax = taxsubTotal * orderQueryResults[1][k].taxPercentage / 100
                                    } 
                                    else {
                                        let applyTax = taxsubTotal * orderQueryResults[1][k].applyTaxPercentage / 100
                                        tax = applyTax * orderQueryResults[1][k].taxPercentage / 100
                                    }
                                    const taxDetails = {
                                        taxName: orderQueryResults[1][k].taxName,
                                        taxPercentage: orderQueryResults[1][k].taxPercentage,
                                        taxAmount: orderQueryResults[1][k].currencySymbol + " " + parseFloat(tax).toFixed(2)
                                    }
                                    taxData.push(taxDetails)
                                }
                            }*/


                            let commonItemListing = [];
                            commonItemListing = {
                                totalPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalPrice).toFixed(2),
                                orderId: itemQueryResult[i].orderId,
                                reviewStatus: itemQueryResult[i].reviewStatus,
                                quantity: itemQueryResult[i].quantity,
                                itemName: itemQueryResult[i].itemName,
                                itemImage: itemQueryResult[i].itemImg,
                                itemPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemPrice).toFixed(2),
                                netAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].netAmount).toFixed(2),
                                totalItemAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalItemAmount).toFixed(2),
                                size_name: itemQueryResult[i].size_name,
                                packName: itemQueryResult[i].packName,
                                itemMrp: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemMrp).toFixed(2),
                                brandName: itemQueryResult[i].brandName,
                                comments: itemQueryResult[i].comments
                            }
                            commonItemData.push(commonItemListing)
                            subtotal = subtotal + (itemQueryResult[i].totalItemAmount * itemQueryResult[i].quantity)
                            savedAmount = savedAmount + (itemQueryResult[i].itemPrice * itemQueryResult[i].quantity - itemQueryResult[i].netAmount * itemQueryResult[i].quantity)
                        }

                    }

                }
                taxData = []
                let taxTotal = 0
                for (let k = 0; k < orderQueryResults[1].length; k++) {
                    if (orderQueryResults[1][k].store_id == orderQueryResults[0][0].storeId) {
                        let tax = 0
                        if (orderQueryResults[1][k].applyTax == null) {
                            tax = subtotal * orderQueryResults[1][k].taxPercentage / 100
                            taxTotal = taxTotal + tax
                        }
                        else {
                            let applyTax = taxsubTotal * orderQueryResults[1][k].applyTaxPercentage / 100
                            tax = applyTax * orderQueryResults[1][k].taxPercentage / 100
                            taxTotal = taxTotal + tax
                        }
                        const taxDetails = {
                            taxName: orderQueryResults[1][k].taxName,
                            taxPercentage: orderQueryResults[1][k].taxPercentage,
                            taxAmount: orderQueryResults[1][k].currencySymbol + " " + parseFloat(tax).toFixed(2)
                        }
                        taxData.push(taxDetails)
                    }
                }

                //subtotal = subtotal+taxTotal

                let resrdataNew = []
                let deliletyCharge
                let grandTotal = orderQueryResults[0][0].orderNetAmount.toFixed(2) + orderQueryResults[0][0].deliverCharge
                resrdataNew = [{
                    promoCode: orderQueryResults[0][0].promoCode,
                    promoCodeAmount: orderQueryResults[0][0].promoCodeAmount,
                    comments: orderQueryResults[0][0].comments,
                    consumerNumber: orderQueryResults[0][0].consumerNumber,
                    consumerCardName: orderQueryResults[0][0].consumerCardName,
                    subtotal: orderQueryResults[0][0].currencySymbol + " " + parseFloat(subtotal).toFixed(2),
                    savedAmount: orderQueryResults[0][0].currencySymbol + " " + parseFloat(savedAmount).toFixed(2),
                    deliletyCharge: orderQueryResults[0][0].currencySymbol + " " + parseFloat(orderQueryResults[0][0].deliverCharge).toFixed(2),
                    grandtotal: orderQueryResults[0][0].currencySymbol + " " + parseFloat(grandTotal).toFixed(2),
                    taxData: taxData
                }]
                const responseData = {
                    success: "1",
                    result: {
                        "storeAddressQueryResult": storeAddressQueryResult,
                        "orderQueryResults": orderQueryResults,
                        "groceryItemListing": groceryItemData,
                        "restauarantListing": restaurantData,
                        "resrdataNew": resrdataNew,
                        "commonItemListing": commonItemData,
                        //"taxData":taxData

                    },
                    errorMessage: "",
                    successMessage: "Success"
                };

                callback(responseData);
            })
        })
    });
}
module.exports = methods;