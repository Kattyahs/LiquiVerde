# LiquiVerde – Plataforma de Retail Inteligente y Sostenible

LiquiVerde es una aplicación **full-stack** desarrollada para el desafío técnico de **Grupo Lagos**.  
Su objetivo es ayudar a los consumidores a **ahorrar dinero** mientras toman decisiones de compra **sostenibles**, optimizando presupuesto e impacto ambiental/social.

---

## Tecnologías Utilizadas

**Frontend:**  
- React + Vite  

**Backend:**  
- Python
- FastAPI  
- SQLAlchemy (ORM)

**Base de Datos:**  
- SQLite  

**Infraestructura:**  
- Docker 

---

## Funcionalidades Principales

- **Búsqueda de productos**: Por nombre, marca, categoría o código de barras
- **Visualización detallada**: Información completa de cada producto incluyendo puntajes de sostenibilidad
- **Sistema de análisis de sostenibilidad**: Evaluación económica, ambiental y social
- **Lista de compras inteligente**: Agrega productos y gestiona tu lista de manera eficiente
- **Optimizador de lista**: Algoritmo de mochila multi-objetivo que selecciona los mejores productos según tu presupuesto
- **Dashboard con métricas**: Puntajes de sostenibilidad, ahorro potencial e impacto general
- **Despliegue simplificado**: Contenedores Docker para ejecución rápida

---

## Instalación y Ejecución

### Opción 1: Ejecutar con Docker (recomendada)

Asegúrate de tener **Docker** y **Docker Compose** instalados, luego ejecuta:

```bash
docker-compose up --build
```

El backend estará disponible en `http://localhost:8000`  
El frontend estará disponible en `http://localhost:5173`

---

### Opción 2: Ejecutar manualmente

#### 1. Clonar el repositorio
```bash
git clone https://github.com/Kattyahs/LiquiVerde.git
cd LiquiVerde
```

#### 2. Backend (FastAPI)
```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Cargar datos de ejemplo
python load_data.py

# Iniciar servidor
uvicorn app.main:app --reload
```
Backend disponible en `http://localhost:8000`

#### 3. Frontend (React + Vite)
```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```
Frontend disponible en `http://localhost:5173`

---

## Datos Utilizados

LiquiVerde **no utiliza APIs externas**.  
Toda la información de productos proviene de un **dataset local**, el cual contiene datos simulados para pruebas y demostraciones.

**Ubicación del dataset:**
- `backend/data/products_sample.json` - 50 productos de ejemplo
- `backend/liquiverde.db` - Base de datos SQLite generada automáticamente

**Campos incluidos:**
- Información básica: nombre, marca, categoría, precio, código de barras
- Puntajes de sostenibilidad: económico, ambiental y social
- Indicadores: Nutri-Score, Eco-Score, huella de carbono
- Atributos especiales: producto local, orgánico, comercio justo, envase reciclable

El dataset fue **generado con apoyo de IA** para crear ejemplos realistas y consistentes basados en productos chilenos.

---

## Algoritmos Implementados

### 1. Algoritmo de Mochila Multi-Objetivo (Knapsack Problem)

Este algoritmo optimiza la lista de compras seleccionando productos que:
- **Minimicen el costo total**
- **Maximicen el puntaje de sostenibilidad**
- **Se mantengan dentro del presupuesto del usuario**

**Implementación:**
- Ubicación: `backend/app/algorithms/optimizer.py`
- Estrategia: Enfoque greedy basado en la relación valor/precio
- Criterio de valor: `sostenibilidad / precio`
- Los productos se ordenan por este ratio y se seleccionan hasta alcanzar el presupuesto

**Métricas calculadas:**
- Total de productos seleccionados
- Precio total
- Promedio de sostenibilidad
- Porcentaje de presupuesto utilizado

---

### 2. Sistema de Scoring de Sostenibilidad

Cada producto obtiene un **puntaje ponderado (0–100)** calculado a partir de tres dimensiones:

#### Dimensión Económica-nutricional (40% del score total)
- Relación precio vs. promedio de categoría (70%)
- Nutri-Score nutricional (30%)

#### Dimensión Ambiental (40% del score total)
- Eco-Score (50%)
- Huella de carbono (30%)
- Envase reciclable (10%)
- Certificación orgánica (10%)

#### Dimensión Social (20% del score total)
- Producción local (60 puntos)
- Comercio justo (40 puntos)

**Implementación:**
- Ubicación: `backend/app/algorithms/sustainability_score.py`
- Cálculo dinámico basado en promedios de categoría
- Actualización automática al cargar productos

**Fórmula final:**
```
Score Total = (0.4 × Score Económico) + (0.4 × Score Ambiental) + (0.2 × Score Social)
```

---

## Arquitectura del Proyecto

```
LiquiVerde/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # Servidor FastAPI principal
│   │   ├── models.py                  # Modelos SQLAlchemy
│   │   ├── database.py                # Configuración de base de datos
│   │   └── algorithms/
│   │       ├── optimizer.py           # Algoritmo de optimización
│   │       └── sustainability_score.py # Sistema de scoring
│   ├── data/
│   │   └── products_sample.json       # Dataset de productos
│   ├── load_data.py                   # Script para cargar datos
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProductCard.jsx        # Tarjeta de producto
│   │   ├── pages/
│   │   │   ├── ProductSearch.jsx      # Búsqueda de productos
│   │   │   ├── ProductDetail.jsx      # Detalle del producto
│   │   │   └── ShoppingListPage.jsx   # Gestión de lista
│   │   ├── services/
│   │   │   └── api.js                 # Cliente API
│   │   ├── App.jsx                    # Componente raíz
│   │   └── main.jsx                   # Punto de entrada
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Uso de Inteligencia Artificial

Durante el desarrollo se utilizó **IA como herramienta de apoyo** en las siguientes tareas:

1. **Estructura del proyecto**: Definición de arquitectura frontend/backend
2. **Resolución de errores**: Debugging de configuraciones y dependencias
3. **Comprensión conceptual**: Explicación de algoritmos (Knapsack, scoring)
4. **Generación de dataset**: Creación de productos de ejemplo realistas
5. **Documentación**: Redacción de este README

---


## Troubleshooting

### El frontend no se conecta al backend
Verifica que la variable de entorno esté configurada:
```bash
# En frontend/.env
VITE_API_URL=http://localhost:8000
```

### Error al cargar datos
Asegúrate de ejecutar el script de carga:
```bash
cd backend
python load_data.py
```

### Puertos ocupados
Cambia los puertos en `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Backend
  - "5174:5173"  # Frontend
```
