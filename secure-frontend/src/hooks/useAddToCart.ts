import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CartService } from '../services/api';

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId }: { productId: string; quantity?: number }) => 
      CartService.addToCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
