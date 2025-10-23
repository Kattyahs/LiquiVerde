import { useState, useEffect } from 'react';
import { searchProducts, getAllProducts, getProductByBarcode } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { ShoppingCart } from "lucide-react";
import { useNavigate } from 'react-router-dom';


function ProductSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState('text');

  useEffect(() => {
    loadInitialProducts();
  }, []);

  const loadInitialProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data.results || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const handleSearch = async (e) => {
  e.preventDefault();
  
  if (!query.trim()) {
    loadInitialProducts();
    return;
  }

  setLoading(true);
  setError(null);
  
  try {
    if (searchMode === 'barcode') {
      // Búsqueda por código de barras
      const data = await getProductByBarcode(query.trim());
      
      if (data.error) {
        setProducts([]);
        setError('No se encontró producto con ese código de barras');
      } else {
        setProducts([data]);
      }
    } else {
      const data = await searchProducts(query);
      setProducts(data.results || []);
      
      if (data.results.length === 0) {
        setError('No se encontraron productos');
      }
    }
  } catch (err) {
    setError('Error al buscar productos');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-liquiverde-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">LiquiVerde</h1>
              <p className="text-liquiverde-100">Compra inteligente y sostenible</p>
            </div>
            <button
              onClick={() => navigate('/shopping-list')}
              className="bg-white text-liquiverde-600 hover:bg-liquiverde-50 font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 self-start md:self-auto"
            >
              <ShoppingCart size={20} />
              Mi Lista
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-6 justify-center mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="text"
                  checked={searchMode === 'text'}
                  onChange={(e) => setSearchMode(e.target.value)}
                  className="w-4 h-4 text-liquiverde-600"
                />
                <span className="text-gray-700">Buscar por nombre/marca</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="barcode"
                  checked={searchMode === 'barcode'}
                  onChange={(e) => setSearchMode(e.target.value)}
                  className="w-4 h-4 text-liquiverde-600"
                />
                <span className="text-gray-700">Buscar por código de barras</span>
              </label>
            </div>
          <div className="flex gap-3 max-w-2xl mx-auto">
              <input
                type={searchMode === 'barcode' ? 'number' : 'text'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchMode === 'barcode' 
                    ? 'Ingresa el código de barras (ej: 7804567890123)' 
                    : 'Buscar productos por nombre, marca o categoria...'
                }
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-liquiverde-500"
            />
            <button
              type="submit"
              className="bg-liquiverde-600 hover:bg-liquiverde-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Buscar
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-liquiverde-600"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto mb-8">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {query ? `Resultados para "${query}"` : 'Todos los productos'}
              </h2>
              <p className="text-gray-600 mt-1">
                {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
                <button
                  onClick={loadInitialProducts}
                  className="mt-4 text-liquiverde-600 hover:text-liquiverde-700 font-semibold"
                >
                  Ver todos los productos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductSearch;