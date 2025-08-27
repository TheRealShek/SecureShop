import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SellerProductService } from '../services/api';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

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

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '', // Empty string is fine for optional image
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Fetch product data directly from Supabase for editing
  const { data: product, isLoading, error } = useQuery({
    queryKey: role === 'admin' ? ['admin-product', id] : ['seller-product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      
      console.log('🔍 [DEBUG] Fetching product for edit via Supabase:', id, 'Role:', role);
      
      // Get current authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }
      
      // Admin can edit any product, seller can only edit their own products
      let query = supabase
        .from('products')
        .select('*')
        .eq('id', id);
        
      // If not admin, restrict to seller's own products
      if (role !== 'admin') {
        query = query.eq('seller_id', userData.user.id);
      }
      
      const { data: productData, error: productError } = await query.single();
      
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
        stock: Number(productData.stock) || 0,
        image: productData.image_url || '',
        sellerId: productData.seller_id,
        createdAt: productData.created_at,
      };
    },
    enabled: !!id && !!role, // Also wait for role to be loaded
  });

  // Set form data when product loads
  useEffect(() => {
    if (product) {
      console.log('📝 [DEBUG] Populating form with product data:', product);
      const newFormData = {
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      // Admin can update any product, seller can only update their own
      if (role === 'admin') {
        // Admin update - directly update via Supabase without seller restrictions
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw new Error('User not authenticated');
        }

        // First, check if the product exists
        const { data: existingProduct, error: checkError } = await supabase
          .from('products')
          .select('id')
          .eq('id', id)
          .single();

        if (checkError || !existingProduct) {
          throw new Error('Product not found');
        }

        // Prepare update data - map frontend fields to database fields
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.stock !== undefined) updateData.stock = data.stock;
        if (data.image !== undefined) updateData.image_url = data.image;

        console.log('🔄 [DEBUG] Admin updating product:', { id, updateData });

        const { data: updatedData, error: updateError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select();

        if (updateError) {
          console.error('❌ [DEBUG] Update error:', updateError);
          throw new Error(`Failed to update product: ${updateError.message}`);
        }

        if (!updatedData || updatedData.length === 0) {
          throw new Error('No product was updated');
        }

        console.log('✅ [DEBUG] Product updated successfully:', updatedData[0]);
        return updatedData[0];
      } else {
        // Use normal seller service for sellers
        return SellerProductService.updateProduct(id, data);
      }
    },
    onSuccess: () => {
      // Clear any previous errors
      setSubmitError('');
      // Invalidate queries to refresh data
      if (role === 'admin') {
        queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
        queryClient.invalidateQueries({ queryKey: ['products'] }); // Admin dashboard shows all products
      } else {
        queryClient.invalidateQueries({ queryKey: ['seller-products'] });
        queryClient.invalidateQueries({ queryKey: ['seller-product', id] });
      }
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Also invalidate general products for buyers
      
      // Navigate based on role
      if (role === 'admin') {
        navigate('/dashboard', { 
          state: { message: 'Product updated successfully!', type: 'success' }
        });
      } else {
        navigate('/seller/products', { 
          state: { message: 'Product updated successfully!', type: 'success' }
        });
      }
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
      newErrors.price = 'Price cannot exceed ₹999,999';
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
    setSubmitError(''); // Clear any previous errors
    
    if (validateForm() && id) {
      console.log('🚀 [DEBUG] Submitting product update via Supabase:', {
        productId: id,
        formData,
        sellerAction: 'update',
        hasProductLoaded: !!product
      });
      updateProductMutation.mutate({ id, data: formData });
    } else {
      console.log('❌ [DEBUG] Form validation failed or no product ID:', {
        hasId: !!id,
        formData,
        errors
      });
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4 py-16 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 max-w-md mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-6"></div>
            <p className="text-slate-700 text-lg font-semibold mb-2">Loading product data...</p>
            <p className="text-slate-500 text-sm">Product ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4 py-16 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 max-w-md mx-auto">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Failed to load product</h2>
            <p className="text-slate-600 mb-6">Please try again or contact support if the problem persists.</p>
            <button
              onClick={() => navigate('/seller/products')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4 py-16 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 max-w-md mx-auto">
            <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Product not found</h2>
            <p className="text-slate-600 mb-6">The product you're trying to edit doesn't exist.</p>
            <button
              onClick={() => navigate('/seller/products')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 animate-fade-in">
          <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Edit Product</h1>
                <p className="mt-2 text-lg text-slate-600">
                  Update your product information
                </p>
              </div>
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs bg-white/60 px-3 py-2 rounded-lg border border-slate-200">
                <span className="text-gray-500">ID: {id}</span>
                {product && (
                  <span className="ml-2 text-green-600">✓ Loaded from Supabase</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
          {/* Error Message */}
          {submitError && (
            <div className="rounded-xl bg-red-50 p-6 border border-red-200 animate-shake">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-red-800">Error updating product</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{submitError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success indicator when updating */}
          {updateProductMutation.isPending && (
            <div className="rounded-xl bg-indigo-50 p-6 border border-indigo-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-indigo-800">Updating product...</h3>
                  <div className="mt-2 text-sm text-indigo-700">
                    <p>Please wait while we save your changes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Product Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-900">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name || product?.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-slate-900">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description || product?.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
              placeholder="Describe your product in detail..."
            />
            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Product Price */}
          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-semibold text-slate-900">
              Price (₹) *
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

          {/* Product Stock */}
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
              Stock Quantity *
            </label>
            <input
              type="number"
              id="stock"
              min="0"
              step="1"
              value={formData.stock || product?.stock || ''}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.stock ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter stock quantity"
            />
            {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Number of units available for sale
            </p>
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
          <div className="flex justify-end space-x-4 pt-8 border-t border-slate-200">
            <button
              type="button"
              onClick={() => role === 'admin' ? navigate('/dashboard') : navigate('/seller/products')}
              className="px-6 py-3 border border-slate-300 rounded-xl shadow-sm text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProductMutation.isPending || !id}
              className="px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              {updateProductMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Product...
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}
