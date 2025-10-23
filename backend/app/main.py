from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .database import get_db, Base, engine
from .models import Product, ShoppingList, ShoppingListItem
from .algorithms.optimizer import product_optimizer

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LiquiVerde API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ShoppingListCreate(BaseModel):
    name: str = "Lista de Compras"
    budget: float = None


class AddItemRequest(BaseModel):
    product_id: int
    quantity: int = 1


class OptimizeRequest(BaseModel):
    budget: float


@app.get("/")
def read_root():
    return {"message": "funciona"}


@app.get("/products/search")
def search_products(q: str = "", db: Session = Depends(get_db)):
    products = db.query(Product).filter(
        (Product.name.ilike(f"%{q}%")) | 
        (Product.brand.ilike(f"%{q}%")) |
        (Product.category.ilike(f"%{q}%"))
    ).limit(20).all()
    
    return {
        "results": [
            {
                "id": p.id,
                "barcode": p.barcode,
                "name": p.name,
                "brand": p.brand,
                "category": p.category,
                "price": p.price,
                "unit": p.unit,
                "sustainability_score": p.sustainability_score,
                "nutriscore": p.nutriscore,
                "ecoscore": p.ecoscore,
                "is_local": p.is_local
            }
            for p in products
        ],
        "count": len(products)
    }


@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"error": "Producto no encontrado"}
    
    return {
        "id": product.id,
        "barcode": product.barcode,
        "name": product.name,
        "brand": product.brand,
        "category": product.category,
        "subcategory": product.subcategory,
        "price": product.price,
        "unit": product.unit,
        "sustainability_score": product.sustainability_score,
        "nutriscore": product.nutriscore,
        "ecoscore": product.ecoscore,
        "carbon_footprint": product.carbon_footprint,
        "is_local": product.is_local,
        "is_organic": product.is_organic,
        "is_fair_trade": product.is_fair_trade,
        "recyclable_packaging": product.recyclable_packaging
    }


@app.get("/products")
def get_all_products(
    category: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    
    if category:
        query = query.filter(Product.category == category)
    
    products = query.limit(limit).all()
    
    return {
        "results": [
            {
                "id": p.id,
                "name": p.name,
                "brand": p.brand,
                "category": p.category,
                "price": p.price,
                "sustainability_score": p.sustainability_score
            }
            for p in products
        ],
        "count": len(products)
    }


@app.post("/shopping-lists")
def create_shopping_list(
    shopping_list_data: ShoppingListCreate,
    db: Session = Depends(get_db)
):
    shopping_list = ShoppingList(
        name=shopping_list_data.name,
        budget=shopping_list_data.budget
    )
    
    db.add(shopping_list)
    db.commit()
    db.refresh(shopping_list)
    
    return {
        "id": shopping_list.id,
        "name": shopping_list.name,
        "budget": shopping_list.budget,
        "is_optimized": shopping_list.is_optimized,
        "items": []
    }


@app.get("/shopping-lists/{list_id}")
def get_shopping_list(list_id: int, db: Session = Depends(get_db)):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    
    if not shopping_list:
        return {"error": "Lista no encontrada"}
    
    items = []
    for item in shopping_list.items:
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "product": {
                "id": item.product.id,
                "name": item.product.name,
                "brand": item.product.brand,
                "price": item.product.price,
                "sustainability_score": item.product.sustainability_score,
                "unit": item.product.unit
            }
        })
    
    return {
        "id": shopping_list.id,
        "name": shopping_list.name,
        "budget": shopping_list.budget,
        "is_optimized": shopping_list.is_optimized,
        "items": items
    }


@app.post("/shopping-lists/{list_id}/items")
def add_item_to_list(
    list_id: int,
    item_data: AddItemRequest,
    db: Session = Depends(get_db)
):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        return {"error": "Lista no encontrada"}
    
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        return {"error": "Producto no encontrado"}
    
    existing_item = db.query(ShoppingListItem).filter(
        ShoppingListItem.shopping_list_id == list_id,
        ShoppingListItem.product_id == item_data.product_id
    ).first()
    
    if existing_item:
        existing_item.quantity += item_data.quantity
        db.commit()
        return {"message": "Cantidad actualizada", "item_id": existing_item.id}
    else:
        new_item = ShoppingListItem(
            shopping_list_id=list_id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return {"message": "Producto agregado", "item_id": new_item.id}


@app.delete("/shopping-lists/{list_id}/items/{item_id}")
def remove_item_from_list(
    list_id: int,
    item_id: int,
    db: Session = Depends(get_db)
):
    item = db.query(ShoppingListItem).filter(
        ShoppingListItem.id == item_id,
        ShoppingListItem.shopping_list_id == list_id
    ).first()
    
    if not item:
        return {"error": "Item no encontrado"}
    
    db.delete(item)
    db.commit()
    
    return {"message": "Producto eliminado"}


@app.post("/shopping-lists/{list_id}/optimize")
def optimize_list(
    list_id: int,
    optimize_data: OptimizeRequest,
    db: Session = Depends(get_db)
):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        return {"error": "Lista no encontrada"}
    
    items = db.query(ShoppingListItem).filter(
        ShoppingListItem.shopping_list_id == list_id
    ).all()
    
    if not items:
        return {"error": "La lista está vacía"}
    
    products = []
    for item in items:
        product = item.product
        products.append({
            'id': product.id,
            'name': product.name,
            'brand': product.brand,
            'price': product.price,
            'sustainability_score': product.sustainability_score,
            'category': product.category,
            'unit': product.unit
        })
    
    result = product_optimizer(products, optimize_data.budget)
    
    shopping_list.is_optimized = True
    shopping_list.budget = optimize_data.budget
    db.commit()
    
    return {
        "message": "Lista optimizada exitosamente",
        "optimization_result": result
    }

@app.get("/products/barcode/{barcode}")
def get_product_by_barcode(barcode: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.barcode == barcode).first()
    
    if not product:
        return {"error": "Producto no encontrado"}
    
    return {
        "id": product.id,
        "barcode": product.barcode,
        "name": product.name,
        "brand": product.brand,
        "category": product.category,
        "subcategory": product.subcategory,
        "price": product.price,
        "unit": product.unit,
        "sustainability_score": product.sustainability_score,
        "nutriscore": product.nutriscore,
        "ecoscore": product.ecoscore,
        "carbon_footprint": product.carbon_footprint,
        "is_local": product.is_local,
        "is_organic": product.is_organic,
        "is_fair_trade": product.is_fair_trade,
        "recyclable_packaging": product.recyclable_packaging
    }

@app.delete("/shopping-lists/{list_id}/clear")
def clear_shopping_list(list_id: int, db: Session = Depends(get_db)):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    
    if not shopping_list:
        return {"error": "Lista no encontrada"}
    
    # Eliminar todos los items de la lista
    db.query(ShoppingListItem).filter(
        ShoppingListItem.shopping_list_id == list_id
    ).delete()
    
    db.commit()
    
    return {"message": "Lista vaciada exitosamente"}