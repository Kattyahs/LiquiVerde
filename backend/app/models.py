from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from  sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, timezone

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String, unique=True, index=True)
    name = Column(String, index=True, nullable=False)
    brand = Column(String)
    category = Column(String, index=True)
    subcategory = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    unit = Column(String)
    nutriscore = Column(String)
    ecoscore = Column(String, nullable=True)
    sustainability_score = Column(Float)
    carbon_footprint = Column(Float, nullable=True)
    is_local = Column(Boolean, default=False)
    is_organic = Column(Boolean, default=False)
    is_fair_trade = Column(Boolean, default=False)
    recyclable_packaging = Column(Boolean, default=True)
    image_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, default= "Lista de Compras")
    budget = Column(Float, nullable=True)
    created_at = Column(DateTime, default= lambda: datetime.now(timezone.utc))
    is_optimized = Column(Boolean, default=False)
    items = relationship("ShoppingListItem", back_populates= "shopping_list", cascade = "all, delete-orphan")


class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"
    
    id = Column(Integer, primary_key=True, index=True)
    shopping_list_id = Column(Integer, ForeignKey("shopping_lists.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    shopping_list = relationship("ShoppingList", back_populates="items")
    product = relationship("Product")