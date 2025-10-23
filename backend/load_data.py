import json
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Product

Base.metadata.create_all(bind=engine)

def load_products():
    db = SessionLocal()
    
    db.query(Product).delete()
    
    with open('../data/products_sample.json', 'r', encoding='utf-8') as f:
        products_data = json.load(f)
    
    for product_data in products_data:
        product = Product(**product_data)
        db.add(product)
    
    db.commit()
    db.close()
if __name__ == "__main__":
    load_products()