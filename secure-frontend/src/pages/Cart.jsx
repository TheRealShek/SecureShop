import React from 'react';

// pages/Cart.js
const Cart = ({ user, cart, onNavigate, onLogout, onUpdateCart }) => {
  const { ShoppingCart } = require('lucide-react');
 
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      onUpdateCart(cart.filter(item => item.id !== id));
    } else {
      onUpdateCart(cart.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => onNavigate('home')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Products
            </button>
            <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
            <button
              onClick={onLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">Add some products to get started</p>
            <button
              onClick={() => onNavigate('home')}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-gray-600">${item.price}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
           
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total: ${total.toFixed(2)}</span>
                <button className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700">
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;