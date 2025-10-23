import { Link } from 'react-router-dom';

function ProductCard({ product }) {
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

  return (
    <Link to={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4 cursor-pointer">

        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            {product.nutriscore && (
              <span className={`${getNutriscoreBadge(product.nutriscore)} text-white text-xs font-bold px-2 py-1 rounded`}>
                {product.nutriscore.toUpperCase()}
              </span>
            )}
            {product.is_local && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                 Local
              </span>
            )}
            {product.is_organic && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                 Orgánico
              </span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-lg text-gray-800 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{product.brand}</p>

        <div className="mb-3">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price?.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            {product.unit}
          </span>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sostenibilidad</span>
            <span className={`font-bold ${getScoreColor(product.sustainability_score)}`}>
              {product.sustainability_score}/100
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${
                product.sustainability_score >= 80 ? 'bg-green-500' :
                product.sustainability_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${product.sustainability_score}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;