import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SellerProductService } from '../services/api';
import { InputSanitizer } from '../utils/inputSanitization';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  image?: string;
}

export function AddProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 10, // Default stock value
    image: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const createProductMutation = useMutation({
    mutationFn: SellerProductService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      navigate('/seller/products', { 
        state: { message: 'Product created successfully!', type: 'success' }
      });
    },
    onError: (error: Error) => {
      console.error('Failed to create product:', error);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    } else if (formData.stock > 999999) {
      newErrors.stock = 'Stock cannot exceed 999,999 units';
    }
    // Image URL is now optional, but if provided, it should be valid
    if (formData.image.trim() && formData.image.trim() !== '') {
      try {
        new URL(formData.image);
      } catch {
        newErrors.image = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createProductMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    let sanitizedValue = value;
    
    // Apply appropriate sanitization based on field type
    if (typeof value === 'string') {
      switch (field) {
        case 'name':
          sanitizedValue = InputSanitizer.productName(value);
          break;
        case 'description':
          sanitizedValue = InputSanitizer.productDescription(value);
          break;
        case 'image':
          sanitizedValue = InputSanitizer.url(value);
          break;
        default:
          sanitizedValue = InputSanitizer.general(value);
      }
    } else if (typeof value === 'number') {
      if (field === 'price') {
        sanitizedValue = InputSanitizer.price(value);
      } else if (field === 'stock') {
        sanitizedValue = InputSanitizer.quantity(value);
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 animate-fade-in">
          <div className="px-8 py-6 border-b border-slate-200">
            <h1 className="text-3xl font-bold text-slate-900">Add New Product</h1>
            <p className="mt-2 text-lg text-slate-600">
              Create a new product for your store
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>}
            </div>

            {/* Product Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'
                }`}
                placeholder="Enter product description"
              />
              {errors.description && <p className="mt-2 text-sm text-red-600 font-medium">{errors.description}</p>}
            </div>

            {/* Product Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors.price ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-2 text-sm text-red-600 font-medium">{errors.price}</p>}
            </div>

            {/* Product Stock */}
            <div>
              <label htmlFor="stock" className="block text-sm font-semibold text-slate-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                step="1"
                value={formData.stock || ''}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors.stock ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'
                }`}
                placeholder="Enter stock quantity"
              />
              {errors.stock && <p className="mt-2 text-sm text-red-600 font-medium">{errors.stock}</p>}
              <p className="mt-2 text-sm text-slate-500">
                Number of units available for sale
              </p>
            </div>

            {/* Product Image URL */}
            <div>
              <label htmlFor="image" className="block text-sm font-semibold text-slate-700 mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors.image ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'
                }`}
                placeholder="https://example.com/image.jpg (optional)"
              />
              {errors.image && <p className="mt-2 text-sm text-red-600 font-medium">{errors.image}</p>}
              
              {/* Help text for optional image */}
              <p className="mt-2 text-sm text-slate-500">
                Leave empty to use a default product image
              </p>
              
              {/* Image Preview */}
              {formData.image && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2 font-medium">Preview:</p>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg border border-slate-200 shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/seller/products')}
                className="px-6 py-3 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProductMutation.isPending}
                className="px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
