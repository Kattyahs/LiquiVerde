

def product_value(product):
    sustainability = product.get('sustainability_score', 50)
    price = product.get('price',1)

    if price > 0:
        value = sustainability / price
    else:
        value = 0

    return value

def product_optimizer(products, budget):
    selected = []
    total_price = 0
    
    if not products or len(products) == 0 or budget == 0:
        return {
            'selected_products': [],
            'total_price': 0,
            'total_items': 0,
            'avg_sustainability': 0,
            'budget_used_percentage': 0
        }
    for product in products:
        product['value'] = product_value(product)

    sorted_products = sorted(products, key= lambda p: p['value'], reverse= True)

    for product in sorted_products:
        price = product.get('price',0)

        if total_price + price <= budget:
            selected.append(product)
            total_price += price

        if total_price == budget:
            break
    
    number_items = len(selected)

    if number_items > 0:
        aux_sum = 0
        for p in selected:
            aux_sum += p.get('sustainability_score',0)
        avg_sust = aux_sum/number_items
    else:
        avg_sust = 0
    budget_used = (total_price/budget)*100

    return {
        'selected_products': selected,
        'total_price': round(total_price,2),
        'total_items': number_items,
        'avg_sustainability': round(avg_sust,1),
        'budget_used_percentage': round(budget_used,1)
    }