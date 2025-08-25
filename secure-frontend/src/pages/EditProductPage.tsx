import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SellerProductService } from '../services/api';
import { supabase } from '../services/supabase';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  image?: string;
}

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    image: '', // Empty string is fine for optional image
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Fetch product data directly from Supabase for editing
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['seller-product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      
      console.log('🔍 [DEBUG] Fetching product for edit via Supabase:', id);
      
      // Get current authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch product from Supabase, ensuring it belongs to the current seller
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('seller_id', userData.user.id) // Security: only fetch if seller owns the product
        .single();
      
      if (productError) {
        console.error('❌ [DEBUG] Error fetching product for edit:', productError);
        throw new Error(`Failed to fetch product: ${productError.message}`);
      }
      
      if (!productData) {
        throw new Error('Product not found or you do not have permission to edit it');
      }
      
      console.log('✅ [DEBUG] Product fetched successfully for edit:', productData);
      
      // Transform Supabase data to match frontend Product interface
      return {
        id: productData.id,
        name: productData.name,
        description: productData.description || '',
        price: Number(productData.price),
        image: productData.image_url || '',
        sellerId: productData.seller_id,
        createdAt: productData.created_at,
      };
    },
    enabled: !!id,
  });

  // Set form data when product loads
  useEffect(() => {
    if (product) {
      console.log('📝 [DEBUG] Populating form with product data:', product);
      const newFormData = {
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        image: product.image || '',
      };
      console.log('📝 [DEBUG] Setting form data to:', newFormData);
      setFormData(newFormData);
      // Clear any existing errors when loading new product
      setErrors({});
      setSubmitError('');
    } else {
      console.log('⚠️ [DEBUG] No product data available yet');
    }
  }, [product]);

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      SellerProductService.updateProduct(id, data),
    onSuccess: () => {
      // Clear any previous errors
      setSubmitError('');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Also invalidate general products for buyers
      navigate('/seller/products', { 
        state: { message: 'Product updated successfully!', type: 'success' }
      });
    },
    onError: (error: Error) => {
      console.error('Failed to update product:', error);
      setSubmitError(error.message || 'Failed to update product. Please try again.');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Product description must be at least 10 characters';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    } else if (formData.price > 999999) {
      newErrors.price = 'Price cannot exceed $999,999';
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
    setSubmitError(''); // Clear any previous errors
    
    if (validateForm() && id) {
      console.log('🚀 [DEBUG] Submitting product update via Supabase:', {
        productId: id,
        formData,
        sellerAction: 'update'
      });
      updateProductMutation.mutate({ id, data: formData });
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product data from Supabase...</p>
          <p className="mt-2 text-sm text-gray-500">Product ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">Failed to load product</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Edit Product</h1>
              <p className="mt-1 text-sm text-gray-600">
                Update your product information via Supabase
              </p>
            </div>
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                <span className="text-gray-500">ID: {id}</span>
                {product && (
                  <span className="ml-2 text-green-600">✓ Loaded from Supabase</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Error Message */}
          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error updating product</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{submitError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success indicator when updating */}
          {updateProductMutation.isPending && (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Updating product via Supabase...</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Please wait while we save your changes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name || product?.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Product Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description || product?.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter product description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Product Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($) *
            </label>
            <input
              type="number"
              id="price"
              min="0"
              step="0.01"
              value={formData.price || product?.price || ''}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>

          {/* Product Image URL */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Image URL (Optional)
            </label>
            <input
              type="url"
              id="image"
              value={formData.image || product?.image || ''}
              onChange={(e) => handleInputChange('image', e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.image ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://example.com/image.jpg (optional)"
            />
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            
            {/* Help text for optional image */}
            <p className="mt-1 text-sm text-gray-500">
              Leave empty to use a default product image
            </p>
            
            {/* Image Preview */}
            {(formData.image || product?.image) ? (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={formData.image || product?.image || ''}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-md border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">No image provided - default placeholder will be used</p>
                <div className="h-32 w-32 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProductMutation.isPending || !id}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {updateProductMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating via Supabase...
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
