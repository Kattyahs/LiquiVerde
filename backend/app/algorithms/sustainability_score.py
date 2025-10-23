from sqlalchemy import func
from ..database import SessionLocal
from ..models import Product

def get_average_price(category, subcategory=None):
    db = SessionLocal()

    try:
        if subcategory:
            avg = db.query(func.avg(Product.price)).filter(
                Product.subcategory == subcategory
            ).scalar()
            
            if avg:
                return avg
        
        avg = db.query(func.avg(Product.price)).filter(
            Product.category == category
        ).scalar()
        
        return avg if avg else 1500
        
    finally:
        db.close()

def calculate_economic_score(product):
    
    price = product.get('price', 0)
    category = product.get('category', 'abarrotes')
    subcategory = product.get('subcategory')
    nutriscore = product.get('nutriscore', 'E')

    avg_price = get_average_price(category, subcategory)
    nutri_points = {'A': 100, 'B': 75, 'C': 50, 'D': 25, 'E': 0}

    if nutriscore:
        nutriscore_upper = nutriscore.upper()
    else:
        nutriscore_upper = 'E'

    nutriscore_num = nutri_points.get(nutriscore_upper,0)
  
    
    if avg_price > 0:
        if price < avg_price * 0.7:
            price_score = 100
        elif price < avg_price * 0.8:
            price_score = 90
        elif price < avg_price:
            price_score = 75
        elif price < avg_price * 1.2:
            price_score = 60
        else:
            price_score = 40
    else:
        price_score = 50
        
    
    return (price_score * 0.7) + (nutriscore_num * 0.3)


def calculate_environmental_score(product):
    ecoscore = product.get('ecoscore', 'C')
    carbon = product.get('carbon_footprint', 0)
    recyclable = product.get('recyclable_packaging', False)
    organic = product.get('is_organic', False)
    

    eco_points = {'A': 100, 'B': 75, 'C': 50, 'D': 25, 'E': 0}
    if ecoscore:
        eco_upper = ecoscore.upper()
    else:
        eco_upper = 'E'
    ecoscore_num = eco_points.get(eco_upper,0)

    if carbon < 1:
        carbon_score = 100
    elif carbon < 2:
        carbon_score = 85
    elif carbon < 3:
        carbon_score = 70
    elif carbon < 5:
        carbon_score = 50
    else:
        carbon_score = 30
    
    recyclable_score = 100 if recyclable else 0
    organic_score = 100 if organic else 0
    
    return ((0.5 * ecoscore_num) + (0.3 * carbon_score) + (0.1*recyclable_score) + (0.1 * organic_score))


def calculate_social_score(product):
    is_local = product.get('is_local', False)
    is_fair_trade = product.get('is_fair_trade', False)
    
    score = 0
    if is_local:
        score += 60
    if is_fair_trade:
        score += 40
    
    return score


def calculate_sustainability_score(product):
    economic = calculate_economic_score(product)
    environmental = calculate_environmental_score(product)
    social = calculate_social_score(product)
    
    final = (0.4 * economic) + (0.4 * environmental) + (0.2 * social)
    
    return round(final, 1)