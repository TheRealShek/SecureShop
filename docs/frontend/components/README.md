# Components Directory

This directory contains reusable UI components that follow the Single Responsibility Principle.

## Components

### QuantitySelector
A reusable quantity selection component with increase/decrease buttons and input validation.

**Props:**
- `initialQuantity?: number` - Starting quantity (default: 1)
- `onChange?: (quantity: number) => void` - Callback when quantity changes
- `max?: number` - Maximum allowed quantity (default: 99)
- `min?: number` - Minimum allowed quantity (default: 1)

**Usage:**
```tsx
<QuantitySelector
  initialQuantity={1}
  onChange={(qty) => setQuantity(qty)}
  max={10}
/>
```

### ReviewModal
A modal component for writing product reviews with built-in state management.

**Props:**
- `productId: string` - The product to review
- `productName?: string` - Product name for display
- `trigger?: React.ReactNode` - Custom trigger element

**Usage:**
```tsx
<ReviewModal 
  productId="123" 
  productName="Sample Product"
  trigger={<button>Write Review</button>}
/>
```

### AddReviewForm
A form component for submitting product reviews.

**Props:**
- `productId: string` - The product being reviewed
- `onSuccess?: () => void` - Callback on successful submission
- `onCancel?: () => void` - Callback when cancelled

**Usage:**
```tsx
<AddReviewForm
  productId="123"
  onSuccess={() => closeModal()}
  onCancel={() => closeModal()}
/>
```

## Design Principles

1. **Single Responsibility** - Each component has one clear purpose
2. **Reusability** - Components can be used in different contexts
3. **Composition** - Components can be combined to create complex UIs
4. **Testability** - Each component can be tested in isolation
5. **Accessibility** - Components follow WCAG guidelines

## Testing

Each component is designed to be easily testable:

```tsx
// Example test pattern
import { render, fireEvent } from '@testing-library/react';
import { QuantitySelector } from './QuantitySelector';

test('should call onChange when quantity increases', () => {
  const handleChange = jest.fn();
  const { getByText } = render(
    <QuantitySelector onChange={handleChange} />
  );
  
  fireEvent.click(getByText('+'));
  expect(handleChange).toHaveBeenCalledWith(2);
});
```
