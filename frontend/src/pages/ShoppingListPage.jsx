import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {createShoppingList, getShoppingList, removeItemFromList, optimizeList, clearShoppingList} from '@/services/api';

function ShoppingListPage() {
  const navigate = useNavigate();
  const [listId, setListId] = useState(null);
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState('');
  const [optimizationResult, setOptimizationResult] = useState(null);

  useEffect(() => {
    initializeList();
  }, []);

const initializeList = async () => {
  setLoading(true);
  try {
    // Verificar si ya existe una lista guardada
    let savedListId = localStorage.getItem('currentListId');
    
    if (savedListId) {
      // Cargar lista existente
      const data = await getShoppingList(savedListId);
      
      if (data.error) {
        // Si la lista no existe, crear una nueva
        const newList = await createShoppingList();
        savedListId = newList.id;
        localStorage.setItem('currentListId', savedListId);
        setListId(newList.id);
        setShoppingList(newList);
      } else {
        setListId(parseInt(savedListId));
        setShoppingList(data);
      }
    } else {
      // Crear nueva lista
      const newList = await createShoppingList();
      localStorage.setItem('currentListId', newList.id);
      setListId(newList.id);
      setShoppingList(newList);
    }
  } catch (error) {
    console.error('Error al inicializar lista:', error);
  } finally {
    setLoading(false);
  }
};

  const reloadList = async () => {
    if (!listId) return;
    
    setLoading(true);
    try {
      const data = await getShoppingList(listId);
      setShoppingList(data);
    } catch (error) {
      console.error('Error al cargar lista:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItemFromList(listId, itemId);
      await reloadList();
      // Limpiar optimización al modificar lista
      setOptimizationResult(null);
    } catch (error) {
      console.error('Error al quitar producto:', error);
    }
  };


  const handleOptimize = async () => {
    if (!budget || budget <= 0) {
      alert('Por favor ingresa un presupuesto válido');
      return;
    }

    if (!shoppingList?.items || shoppingList.items.length === 0) {
      alert('La lista está vacía. Agrega productos primero.');
      return;
    }

    setLoading(true);
    try {
      const result = await optimizeList(listId, parseFloat(budget));
      setOptimizationResult(result.optimization_result);
    } catch (error) {
      console.error('Error al optimizar:', error);
      alert('Error al optimizar la lista');
    } finally {
      setLoading(false);
    }
  };


  const calculateTotal = () => {
    if (!shoppingList?.items) return 0;
    return shoppingList.items.reduce((sum, item) => sum + item.product.price, 0);
  };

const handleClearList = async () => {
  if (!window.confirm('¿Estás seguro de que quieres vaciar toda la lista?')) {
    return;
  }

  try {
    await clearShoppingList(listId);
    await reloadList();
    setOptimizationResult(null);
    alert('Lista vaciada');
  } catch (error) {
    console.error('Error al vaciar lista:', error);
    alert('Error al vaciar la lista');
  }
};

  if (loading && !shoppingList) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-liquiverde-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    
      <div className="bg-liquiverde-600 text-white py-6">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="text-liquiverde-100 hover:text-white mb-2 flex items-center gap-2"
          >
            ← Volver a búsqueda
          </button>
          <h1 className="text-3xl font-bold">Mi Lista de Compras</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
              Productos en la Lista
              </h2>
            
              {shoppingList?.items && shoppingList.items.length > 0 && (
                <button
                  onClick={handleClearList}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm flex items-center gap-2"
                >
                  Vaciar Lista
                </button>
              )}
            </div>

              {shoppingList?.items && shoppingList.items.length > 0 ? (
                <div className="space-y-4">
                  {shoppingList.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">{item.product.brand}</p>
                        <p className="text-lg font-bold text-liquiverde-600 mt-1">
                          ${item.product.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Score: {item.product.sustainability_score}/100
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-4 text-red-600 hover:text-red-800 font-semibold"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-liquiverde-600">
                        ${calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    Tu lista está vacía. Busca productos para agregar.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-liquiverde-600 hover:bg-liquiverde-700 text-white px-6 py-2 rounded-lg"
                  >
                    Buscar Productos
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Optimizar Lista
              </h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Presupuesto Máximo
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Ej: 5000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-liquiverde-500"
                />
              </div>

              <button
                onClick={handleOptimize}
                disabled={loading || !shoppingList?.items || shoppingList.items.length === 0}
                className="w-full bg-liquiverde-600 hover:bg-liquiverde-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Optimizando...' : 'Optimizar Lista'}
              </button>


              {optimizationResult && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-bold text-green-900 mb-3">
                    Lista Optimizada
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Productos seleccionados:</span>
                      <span className="font-semibold">{optimizationResult.total_items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total:</span>
                      <span className="font-semibold text-green-700">
                        ${optimizationResult.total_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Presupuesto usado:</span>
                      <span className="font-semibold">
                        {optimizationResult.budget_used_percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Score promedio:</span>
                      <span className="font-semibold text-liquiverde-600">
                        {optimizationResult.avg_sustainability}/100
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="font-semibold text-green-900 mb-2">
                      Productos recomendados:
                    </p>
                    <div className="space-y-2">
                      {optimizationResult.selected_products.map((product) => (
                        <div key={product.id} className="text-sm">
                          ✓ {product.name} - ${product.price.toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingListPage;