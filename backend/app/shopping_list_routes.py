from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from .database import get_db
from .models import ShoppingList, ShoppingListItem, Product
from .algorithms.optimizer import product_optimizer


class ShoppingListCreate(BaseModel):
    name: str = "Lista de Compras"
    budget: float = None


class AddItemRequest(BaseModel):
    product_id: int
    quantity: int = 1


class OptimizeRequest(BaseModel):
    budget: float


class ProductResponse(BaseModel):
    id: int
    name: str
    brand: str
    price: float
    sustainability_score: float
    
    class Config:
        from_attributes = True


class ShoppingListItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse
    
    class Config:
        from_attributes = True


class ShoppingListResponse(BaseModel):
    id: int
    name: str
    budget: float = None
    is_optimized: bool
    items: List[ShoppingListItemResponse]
    
    class Config:
        from_attributes = True


router = APIRouter(prefix="/shopping-lists", tags=["Shopping Lists"])



@router.post("", response_model=ShoppingListResponse)
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
    
    return shopping_list


@router.get("/{list_id}", response_model=ShoppingListResponse)
def get_shopping_list(list_id: int, db: Session = Depends(get_db)):

    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    
    return shopping_list


@router.post("/{list_id}/items")
def add_item_to_list(
    list_id: int,
    item_data: AddItemRequest,
    db: Session = Depends(get_db)
):

    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
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


@router.delete("/{list_id}/items/{item_id}")
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
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    db.delete(item)
    db.commit()
    
    return {"message": "Producto eliminado"}


@router.post("/{list_id}/optimize")
def optimize_list(
    list_id: int,
    optimize_data: OptimizeRequest,
    db: Session = Depends(get_db)
):

    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    
    items = db.query(ShoppingListItem).filter(
        ShoppingListItem.shopping_list_id == list_id
    ).all()
    
    if not items:
        raise HTTPException(status_code=400, detail="La lista está vacía")
    
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


@router.get("")
def get_all_lists(db: Session = Depends(get_db)):
    lists = db.query(ShoppingList).all()
    return lists