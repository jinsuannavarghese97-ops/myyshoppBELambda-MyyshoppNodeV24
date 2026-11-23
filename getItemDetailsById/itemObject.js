let methods = {};
methods.itemObject = function (popularItemData, storeResults, selectedProduct, callback) {
    let finalDataSet = [];

    if (popularItemData[0].length > 0) {
        // console.log("selectedProduct...",selectedProduct[0])
        let finalDataSet = [];
        let finalData = [];

        for (let i = 0; i < popularItemData[0].length; i++) {
            let finalDataSetSub = [];
            finalDataSet[i] =
            {
                initialCount: 0,
                rowcount: popularItemData[0][i].rowcount,
                seo_title: popularItemData[0][i].seo_title,
                seo_description: popularItemData[0][i].seo_description,
                seo_keywords: popularItemData[0][i].seo_keywords,
                group_count: popularItemData[0][i].group_count,
                city_id: popularItemData[0][i].city_id,
                store_id: popularItemData[0][i].store_id,
                brand_name: popularItemData[0][i].brand_name,
                category_level1_id: popularItemData[0][i].category_level1_id,
                category_level2_id: popularItemData[0][i].category_level2_id,
                category_level3_id: popularItemData[0][i].category_level3_id,
                brand_id: popularItemData[0][i].brand_id,
                total_rank: popularItemData[0][i].item_ranking,
                is_loose_item: popularItemData[0][i].is_loose_item,
                denomination: popularItemData[0][i].denomination,
                variation: popularItemData[0][i].variation,
                hasContactUsWithoutPrice: storeResults[0].hasContactUsWithoutPrice,
                hasBuyOption: storeResults[0].hasBuyOption,
                storeButtonName: (storeResults[0].storeButtonName == null) ? '' : storeResults[0].storeButtonName,
                store_item_stock_ids_with_seperator: popularItemData[0][i].store_item_stock_ids,
                item_ids_with_seperator: popularItemData[0][i].item_ids,
                item_prices_with_seperator: popularItemData[0][i].item_prices,
                pack_ids_with_seperator: popularItemData[0][i].pack_ids,
                mrps_with_seperator: popularItemData[0][i].mrps,
                logoPath_with_seperator: popularItemData[0][i].logo_paths,
                stock_quantities_with_seperator: popularItemData[0][i].stock_quantities,
                is_swap_items_with_seperator: popularItemData[0][i].is_swap_items,
                logo_path_thumbs_with_seperator: popularItemData[0][i].logo_path_thumbs,
                unit_with_seperator: popularItemData[0][i].unit,
                is_offers_with_seperator: popularItemData[0][i].is_offers,
                offer_text_with_seperator: popularItemData[0][i].offer_text,
                description: popularItemData[0][i].description
            }
            if (popularItemData[0][i].group_count > 1) {

                finalDataSet[i].is_brand_item = '1'
                let itemIdsOld = popularItemData[0][i].item_ids.replace(/\|/g, ",").split(',')
                let group_count;
                for (let j = 0; j < popularItemData[0][i].group_count; j++) {
                    // console.log("b..."+finalDataSetSub.length)
                    let isItemAdded = false
                    let index = -1
                    for (let k = 0; k < finalDataSetSub.length; k++) {
                        if (itemIdsOld[j] == finalDataSetSub[k].item_ids) {
                            isItemAdded = true
                            index = k;
                            break;
                        }

                    }
                    if (isItemAdded == false) {
                        group_count++
                        finalDataSetSub[j] =
                        {
                            unit: popularItemData[0][i].unit.replace(/\|/g, ",").split(",")[j],
                            store_item_stock_ids: popularItemData[0][i].store_item_stock_ids.replace(/\|/g, ",").split(",")[j],
                            unit_type: popularItemData[0][i].unit_type.replace(/\|/g, ",").split(",")[j],
                            item_ids: popularItemData[0][i].item_ids.replace(/\|/g, ",").split(",")[j],
                            item_names: popularItemData[0][i].item_names.replace(/\|/g, ",").split(",")[j],
                            is_offers: popularItemData[0][i].is_offers.replace(/\|/g, ",").split(",")[j],
                            offer_text: popularItemData[0][i].offer_text.replace(/\|/g, ",").split(",")[j],
                            is_swap_items: popularItemData[0][i].is_swap_items.replace(/\|/g, ",").split(",")[j],
                            stock_quantities: popularItemData[0][i].stock_quantities.replace(/\|/g, ",").split(",")[j],
                            pack_ids: popularItemData[0][i].pack_ids.replace(/\|/g, ",").split(",")[j],
                            pack_names: popularItemData[0][i].pack_names.replace(/\|/g, ",").split(",")[j],
                            pack_names_without_unit: popularItemData[0][i].pack_names.replace(/\|/g, ",").split(",")[j],
                            logoPath: popularItemData[0][i].logo_paths.replace(/\|/g, ",").split(",")[j],
                            logo_path_thumbs: popularItemData[0][i].logo_path_thumbs.replace(/\|/g, ",").split(",")[j],
                            slug: popularItemData[0][i].slug.replace(/\|/g, ",").split(",")[j],
                            description: popularItemData[0][i].description.replace(/\|/g, ",").split(",")[j]

                        }
                        console.log('storeResults[0].displayItemPrice...', storeResults[0].displayItemPrice)
                        if (storeResults[0].displayItemPrice == true) {
                            console.log('item_prices...', popularItemData[0][i].item_prices)
                            console.log('popularItemData[0][i].mrps...', popularItemData[0][i].mrps)
                            if (popularItemData[0][i].item_prices.replace(/\|/g, ",").split(",")[j] == popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]) {
                                console.log('iffffffff...')
                                finalDataSetSub[j].is_display_item_price = false
                                finalDataSetSub[j].mrps = popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]
                                finalDataSetSub[j].item_prices = popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]
                            }
                            else {
                                console.log('elseeeeeee...')
                                finalDataSetSub[j].is_display_item_price = true
                                finalDataSetSub[j].mrps = popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]
                                finalDataSetSub[j].item_prices = popularItemData[0][i].item_prices.replace(/\|/g, ",").split(",")[j]
                            }
                        }
                        else {
                            finalDataSetSub[j].is_display_item_price = false
                            finalDataSetSub[j].mrps = popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[j].item_prices = popularItemData[0][i].item_prices.replace(/\|/g, ",").split(",")[j]
                        }
                    }
                    else {
                        if (finalDataSetSub[index].item_prices < popularItemData[0][i].item_prices.replace(/\|/g, ",").split(",")[j]) {
                            finalDataSetSub[index].unit = popularItemData[0][i].unit.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].store_item_stock_ids = popularItemData[0][i].store_item_stock_ids.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].unit_type = popularItemData[0][i].unit_type.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].item_ids = popularItemData[0][i].item_ids.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].item_names = popularItemData[0][i].item_names.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].is_offers = popularItemData[0][i].is_offers.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].offer_text = popularItemData[0][i].offer_text.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].is_swap_items = popularItemData[0][i].is_swap_items.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].stock_quantities = popularItemData[0][i].stock_quantities.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].pack_ids = popularItemData[0][i].pack_ids.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].pack_names = popularItemData[0][i].pack_names.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].pack_names_without_unit = popularItemData[0][i].pack_names.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].logoPath = popularItemData[0][i].logo_paths.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].logo_path_thumbs = popularItemData[0][i].logo_path_thumbs.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].slug = popularItemData[0][i].slug.replace(/\|/g, ",").split(",")[j]
                            finalDataSetSub[index].description = popularItemData[0][i].description.replace(/\|/g, ",").split(",")[j]
                            if (storeResults[0].displayItemPrice == true) {
                                if (popularItemData[0][i].item_prices.replace(/\|/g, ",").split(",")[j] == popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]) {
                                    finalDataSetSub[index].is_display_item_price = false
                                    finalDataSetSub[index].mrps = popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]
                                    finalDataSetSub[index].item_prices = popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]
                                }
                                else {
                                    finalDataSetSub[index].is_display_item_price = true
                                    finalDataSetSub[index].mrps = popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]
                                    finalDataSetSub[index].item_prices = popularItemData[0][i].item_prices.replace(/\|/g, ",").split(",")[j]
                                }
                            }
                            else {
                                finalDataSetSub[index].is_display_item_price = false
                                finalDataSetSub[index].mrps = popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]
                                finalDataSetSub[index].item_prices = popularItemData[0][i].mrps.replace(/\|/g, ",").split(",")[j]
                            }
                        }
                    }
                    finalDataSet[i].group_count = group_count
                }
            }
            else {
                finalDataSet[i].is_brand_item = '0';
                if (popularItemData[0][i].is_loose_item == true) {
                    let availIn = ""
                    let variation = popularItemData[0][i].variation
                    for (let v = 1; v <= variation; v++) {
                        if (availIn == "") {
                            availIn = (v * popularItemData[0][i].denomination).toString()
                        }
                        else {
                            availIn = availIn + "," + (v * popularItemData[0][i].denomination).toString()
                        }

                    }
                    let availInSplit = availIn.split(',')

                    for (let a = 0; a < availInSplit.length; a++) {
                        finalDataSetSub[a] = {};
                        let packPrice = (popularItemData[0][i].item_prices != null && popularItemData[0][i].item_prices != 0) ? (popularItemData[0][i].item_prices / popularItemData[0][i].unit) * availInSplit[a] : "-"
                        let looseMrp = (popularItemData[0][i].mrps != null && popularItemData[0][i].mrps != 0) ? ((popularItemData[0][i].mrps / popularItemData[0][i].unit) * availInSplit[a]) : "-"

                        if (availInSplit[a] == "1000" && popularItemData[0][i].unit_type.toLowerCase() == "gm") {
                            finalDataSetSub[a].pack_names = '1 Kg'
                            finalDataSetSub[a].pack_names_without_unit = '1000'
                        }
                        else if (availInSplit[a] == "1000" && popularItemData[0][i].unit_type.toLowerCase() == "ml") {
                            finalDataSetSub[a].pack_names = '1 Ltr'
                            finalDataSetSub[a].pack_names_without_unit = '1000'
                        }
                        else {

                            finalDataSetSub[a].pack_names = availInSplit[a] + ' ' + popularItemData[0][i].unit_type
                            finalDataSetSub[a].pack_names_without_unit = availInSplit[a]
                        }
                        finalDataSetSub[a].unit = popularItemData[0][i].unit
                        finalDataSetSub[a].store_item_stock_ids = popularItemData[0][i].store_item_stock_ids
                        finalDataSetSub[a].unit_type = popularItemData[0][i].unit_type
                        finalDataSetSub[a].item_ids = popularItemData[0][i].item_ids
                        finalDataSetSub[a].item_names = popularItemData[0][i].item_names
                        finalDataSetSub[a].is_offers = popularItemData[0][i].is_offers
                        finalDataSetSub[a].offer_text = popularItemData[0][i].offer_text
                        finalDataSetSub[a].is_swap_items = popularItemData[0][i].is_swap_items
                        finalDataSetSub[a].stock_quantities = popularItemData[0][i].stock_quantities
                        finalDataSetSub[a].pack_ids = popularItemData[0][i].pack_ids
                        finalDataSetSub[a].logoPath = popularItemData[0][i].logo_paths
                        finalDataSetSub[a].logo_path_thumbs = popularItemData[0][i].logo_path_thumbs
                        finalDataSetSub[a].slug = popularItemData[0][i].slug
                        finalDataSetSub[a].description = popularItemData[0][i].description
                        if (storeResults[0].displayItemPrice == true) {
                            if (packPrice.toString() == looseMrp.toString()) {
                                finalDataSetSub[a].is_display_item_price = false
                                finalDataSetSub[a].mrps = looseMrp
                                finalDataSetSub[a].item_prices = looseMrp
                            }
                            else {
                                finalDataSetSub[a].is_display_item_price = true
                                finalDataSetSub[a].mrps = looseMrp
                                finalDataSetSub[a].item_prices = packPrice
                            }
                        }
                        else {
                            finalDataSetSub[a].is_display_item_price = false
                            finalDataSetSub[a].mrps = looseMrp
                            finalDataSetSub[a].item_prices = looseMrp
                        }


                    }
                }
                else {
                    let j = 0;
                    finalDataSetSub[j] = {};
                    finalDataSetSub[j].unit = popularItemData[0][i].unit
                    finalDataSetSub[j].store_item_stock_ids = popularItemData[0][i].store_item_stock_ids
                    finalDataSetSub[j].unit_type = popularItemData[0][i].unit_type
                    finalDataSetSub[j].item_ids = popularItemData[0][i].item_ids
                    finalDataSetSub[j].item_names = popularItemData[0][i].item_names
                    finalDataSetSub[j].is_offers = popularItemData[0][i].is_offers
                    finalDataSetSub[j].offer_text = popularItemData[0][i].offer_text
                    finalDataSetSub[j].is_swap_items = popularItemData[0][i].is_swap_items
                    finalDataSetSub[j].stock_quantities = popularItemData[0][i].stock_quantities
                    finalDataSetSub[j].pack_ids = popularItemData[0][i].pack_ids
                    finalDataSetSub[j].pack_names = popularItemData[0][i].pack_names
                    finalDataSetSub[j].pack_names_without_unit = popularItemData[0][i].pack_names
                    finalDataSetSub[j].logoPath = popularItemData[0][i].logo_paths
                    finalDataSetSub[j].logo_path_thumbs = popularItemData[0][i].logo_path_thumbs
                    finalDataSetSub[j].slug = popularItemData[0][i].slug
                    finalDataSetSub[j].description = popularItemData[0][i].description
                    if (storeResults[0].displayItemPrice == true) {
                        if (popularItemData[0][i].item_prices.toString() == popularItemData[0][i].mrps.toString()) {
                            finalDataSetSub[j].is_display_item_price = false
                            finalDataSetSub[j].mrps = popularItemData[0][i].mrps
                            finalDataSetSub[j].item_prices = popularItemData[0][i].mrps
                        }
                        else {
                            finalDataSetSub[j].is_display_item_price = true
                            finalDataSetSub[j].mrps = popularItemData[0][i].mrps
                            finalDataSetSub[j].item_prices = popularItemData[0][i].item_prices
                        }
                    }
                    else {
                        finalDataSetSub[j].is_display_item_price = false
                        finalDataSetSub[j].mrps = popularItemData[0][i].mrps
                        finalDataSetSub[j].item_prices = popularItemData[0][i].item_prices
                    }

                }
            }

            finalDataSet[i].finalDataSetSub = finalDataSetSub
            let cartItems = []
            //  console.log("selectedProduct....",selectedProduct)
            if (selectedProduct != null && selectedProduct.length > 0) {
                for (let cartItem = 0; cartItem < selectedProduct.length; cartItem++) {
                    if (selectedProduct[cartItem].store_item_stock_ids == finalDataSet[i].finalDataSetSub[0].store_item_stock_ids) {
                        cartItems[0] = selectedProduct[cartItem]
                        finalDataSet[i].cartItems = cartItems
                    }
                    else {
                        finalDataSet[i].cartItems = cartItems
                    }

                }
            }
            else {
                finalDataSet[i].cartItems = cartItems
            }
        }

        callback(finalDataSet);

    }
    else {
        callback(finalDataSet);
    }

};
module.exports = methods;