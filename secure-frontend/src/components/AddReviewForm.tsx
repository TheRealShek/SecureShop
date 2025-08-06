import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AddReviewFormProps {
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ReviewData {
  rating: number;
  comment: string;
}

// Mock review service - replace with actual API call
const ReviewService = {
  addReview: async (productId: string, data: ReviewData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id: Date.now().toString(), ...data, productId };
  }
};

export function AddReviewForm({ productId, onSuccess, onCancel }: AddReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const addReviewMutation = useMutation({
    mutationFn: (data: ReviewData) => ReviewService.addReview(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setRating(5);
      setComment('');
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addReviewMutation.mutate({ rating, comment: comment.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
          Rating
        </label>
        <div className="mt-1 flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Share your thoughts about this product..."
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={addReviewMutation.isPending || !comment.trim()}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}

export { AddReviewForm as default };
