// ============ Core Types ============

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string | null;
  role: 'USER' | 'ADMIN';
  bio?: string | null;
  phone?: string | null;
  university?: string | null;
  faculty?: string | null;
  city?: string | null;
  isVerified: boolean;
  rating: number;
  totalSales: number;
  totalReviews: number;
  walletBalance: number;
  frozenBalance: number;
  bankName?: string | null;
  bankAccount?: string | null;
  bankAccountName?: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  type: 'DOCUMENT' | 'PHYSICAL' | 'ALL';
  order: number;
  _count?: { products: number };
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  type: 'DOCUMENT' | 'PHYSICAL';
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'BROKEN';
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'HIDDEN';
  views: number;
  downloads: number;
  soldCount: number;
  rating: number;
  totalReviews: number;
  university?: string | null;
  faculty?: string | null;
  courseCode?: string | null;
  semester?: string | null;
  city?: string | null;
  address?: string | null;
  thumbnail: string;
  images: string;
  documentUrl?: string | null;
  fileFormat?: string | null;
  fileSize?: number | null;
  pageCount?: number | null;
  previewPages?: string | null;
  isFeatured: boolean;
  tags: string;
  sellerId: string;
  seller: User;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyer: User;
  sellerId?: string | null;
  seller?: User | null;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: string;
  paymentStatus: string;
  shippingName?: string | null;
  shippingPhone?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  trackingCode?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  title: string;
  price: number;
  quantity: number;
  type: string;
  thumbnail?: string | null;
  documentUrl?: string | null;
  downloadCount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user: User;
  productId: string;
  product?: Product;
  orderId?: string | null;
  rating: number;
  comment: string;
  images: string;
  reply?: string | null;
  replyAt?: string | null;
  createdAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'PAYMENT' | 'RECEIVE_MONEY' | 'REFUND';
  amount: number;
  fee: number;
  balanceAfter: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  paymentMethod: string;
  referenceId?: string | null;
  description: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant1: User;
  participant2Id: string;
  participant2: User;
  productId?: string | null;
  product?: Product | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  createdAt: string;
  messages?: Message[];
  _count?: { messages: number };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'PRODUCT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'WALLET' | 'SYSTEM' | 'CHAT' | 'PRODUCT' | 'REVIEW';
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporter: User;
  productId?: string | null;
  product?: Product | null;
  reason: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  resolution?: string | null;
  createdAt: string;
}

// ============ API Response Types ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  type?: 'DOCUMENT' | 'PHYSICAL';
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  university?: string;
  city?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'bestselling' | 'rating';
  page?: number;
  limit?: number;
}
