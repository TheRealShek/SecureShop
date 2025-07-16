// Mock data for products and users

export type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  pastOrders: Array<{
    orderId: string;
    date: string;
    items: Array<{ productId: string; quantity: number }>;
    total: number;
  }>;
};

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation.',
    image: 'https://via.placeholder.com/200x150?text=Headphones',
    price: 99.99,
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Track your fitness and notifications on the go.',
    image: 'https://via.placeholder.com/200x150?text=Smart+Watch',
    price: 149.99,
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Brew the perfect cup every time.',
    image: 'https://via.placeholder.com/200x150?text=Coffee+Maker',
    price: 59.99,
    category: 'Home Appliances',
  },
  {
    id: '4',
    name: 'Yoga Mat',
    description: 'Comfortable and durable yoga mat for all exercises.',
    image: 'https://via.placeholder.com/200x150?text=Yoga+Mat',
    price: 29.99,
    category: 'Fitness',
  },
];

export const mockUser: User = {
  id: 'u1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  pastOrders: [
    {
      orderId: 'o1001',
      date: '2024-06-01',
      items: [
        { productId: '1', quantity: 1 },
        { productId: '3', quantity: 2 },
      ],
      total: 219.97,
    },
    {
      orderId: 'o1002',
      date: '2024-05-15',
      items: [
        { productId: '2', quantity: 1 },
      ],
      total: 149.99,
    },
  ],
}; 