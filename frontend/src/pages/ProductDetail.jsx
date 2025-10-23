import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, addItemToList } from '../services/api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToList, setAddingToList] = useState(false);


  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await getProduct(id);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNutriscoreBadge = (score) => {
    const colors = {
      'A': 'bg-green-500',
      'B': 'bg-lime-500',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'E': 'bg-red-500'
    };
    return colors[score?.toUpperCase()] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-liquiverde-600"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Producto no encontrado'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-liquiverde-600 hover:bg-liquiverde-700 text-white px-6 py-2 rounded-lg"
          >
            Volver a búsqueda
          </button>
        </div>
      </div>
    );
  }
const handleAddToList = async () => {
  setAddingToList(true);
  try {
    let listId = localStorage.getItem('currentListId');
    
    if (!listId) {
      const response = await fetch('http://localhost:8000/shopping-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Mi Lista de Compras' })
      });
      const newList = await response.json();
      listId = newList.id;
      localStorage.setItem('currentListId', listId);
    }
    
    await addItemToList(listId, product.id, 1);
    setTimeout(() => setAddingToList(false), 1000);
    
  } catch (error) {
    console.error('Error al agregar:', error);
    alert('Error al agregar el producto');
    setAddingToList(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-liquiverde-600 text-white py-6">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="text-liquiverde-100 hover:text-white mb-2 flex items-center gap-2"
          >
             Volver a búsqueda
          </button>
          <h1 className="text-3xl font-bold">Detalle del Producto</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">

          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {product.nutriscore && (
                <span className={`${getNutriscoreBadge(product.nutriscore)} text-white text-sm font-bold px-3 py-1 rounded`}>
                  Nutri-Score: {product.nutriscore.toUpperCase()}
                </span>
              )}
              {product.ecoscore && (
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                  Eco-Score: {product.ecoscore.toUpperCase()}
                </span>
              )}
              {product.is_local && (
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
                 Producto Local
                </span>
              )}
              {product.is_organic && (
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                  Orgánico
                </span>
              )}
              {product.is_fair_trade && (
                <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded">
                  Comercio Justo
                </span>
              )}
              {product.recyclable_packaging && (
                <span className="bg-teal-100 text-teal-800 text-sm px-3 py-1 rounded">
                  Envase Reciclable
                </span>
              )}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h2>
            <p className="text-xl text-gray-600 mb-4">{product.brand}</p>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">
                ${product.price?.toLocaleString()}
              </span>
              <span className="text-lg text-gray-500">{product.unit}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Puntuación de Sostenibilidad
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Score Total</span>
                <span className={`text-3xl font-bold ${getScoreColor(product.sustainability_score)}`}>
                  {product.sustainability_score}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    product.sustainability_score >= 80 ? 'bg-green-500' :
                    product.sustainability_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${product.sustainability_score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {product.sustainability_score >= 80 && '🌟 Excelente elección sostenible'}
                {product.sustainability_score >= 60 && product.sustainability_score < 80 && '✅ Buena opción'}
                {product.sustainability_score < 60 && '⚠️ Considera alternativas más sostenibles'}
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Impacto Ambiental
              </h3>
              {product.carbon_footprint && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Huella de Carbono</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {product.carbon_footprint} kg CO₂
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {product.carbon_footprint < 1 && 'Bajo impacto'}
                    {product.carbon_footprint >= 1 && product.carbon_footprint < 3 && 'Impacto moderado'}
                    {product.carbon_footprint >= 3 && 'Alto impacto'}
                  </p>
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Envase Reciclable</span>
                  <span className="font-semibold">
                    {product.recyclable_packaging ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Producción Local</span>
                  <span className="font-semibold">
                    {product.is_local ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Información del Producto
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Categoría:</span>
                <span className="ml-2 font-semibold capitalize">{product.category}</span>
              </div>
              {product.subcategory && (
                <div>
                  <span className="text-gray-600">Subcategoría:</span>
                  <span className="ml-2 font-semibold capitalize">{product.subcategory}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Código de barras:</span>
                <span className="ml-2 font-semibold">{product.barcode}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button 
              onClick={handleAddToList}
              disabled={addingToList}
              className="flex-1 bg-liquiverde-600 hover:bg-liquiverde-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {addingToList ? 'Agregando...' : 'Agregar a Lista de Compras'}
            </button>
            <button 
              onClick={() => navigate('/shopping-list')}
              className="px-6 py-3 border-2 border-liquiverde-600 hover:bg-liquiverde-50 text-liquiverde-600 font-semibold rounded-lg transition-colors"
            >
              Ver Lista
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Buscar Más
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;