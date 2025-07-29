import React from 'react';

// components/ProductCard.js
const ProductCard = ({ product, userRole, onAddToCart }) => {
  const { Plus } = require('lucide-react');
 
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-xl font-bold text-blue-600 mb-3">
          ${product.price}
        </p>
       
        {userRole === 'buyer' && (
          <button
            onClick={() => onAddToCart(product)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        )}
       
        {userRole === 'seller' && (
          <div className="text-center text-gray-500 py-2">
            Seller view - no purchase option
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;