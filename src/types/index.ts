import { Timestamp, GeoPoint } from "firebase/firestore";

// ============================================
// USER TYPES
// ============================================
export type UserRole = "student" | "provider" | "admin";

export interface BaseUser {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isActive: boolean;
}

export interface Student extends BaseUser {
  role: "student";
  fullName: string;
  phone: string;
  university?: string;
  favoriteBusinessIds: string[];
}

export interface Provider extends BaseUser {
  role: "provider";
  firstName: string;
  lastName: string;
  nic: string;
  phone: string;
  businessIds: string[];
  isVerified: boolean;
}

export interface Admin extends BaseUser {
  role: "admin";
  fullName: string;
  permissions: AdminPermission[];
}

export type AdminPermission = 
  | "manage_users"
  | "approve_businesses"
  | "remove_reviews"
  | "manage_categories"
  | "view_analytics";

export type User = Student | Provider | Admin;

// ============================================
// BUSINESS TYPES
// ============================================
export type BusinessCategory = 
  | "hostel"
  | "restaurant"
  | "supermarket"
  | "pharmacy"
  | "laundry"
  | "stationary"
  | "gym"
  | "cafe"
  | "other";

export type BusinessStatus = "pending" | "approved" | "rejected";

export interface BusinessHours {
  monday: { open: string; close: string; isClosed: boolean };
  tuesday: { open: string; close: string; isClosed: boolean };
  wednesday: { open: string; close: string; isClosed: boolean };
  thursday: { open: string; close: string; isClosed: boolean };
  friday: { open: string; close: string; isClosed: boolean };
  saturday: { open: string; close: string; isClosed: boolean };
  sunday: { open: string; close: string; isClosed: boolean };
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: BusinessCategory;
  providerId: string;
  providerName: string;
  
  // Location
  address: string;
  city: string;
  location: GeoPoint;
  
  // Contact
  phone: string;
  email?: string;
  website?: string;
  
  // Media
  images: string[];
  coverImage: string;
  
  // Business Details
  priceRange: 1 | 2 | 3 | 4; // $ to $$$$
  amenities: string[];
  hours: BusinessHours;
  
  // Approval Status
  status: BusinessStatus;
  rejectionReason?: string;
  approvedAt?: Timestamp;
  approvedBy?: string;
  
  // Reviews & Ratings
  averageRating: number;
  totalReviews: number;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Search optimization
  searchKeywords: string[];
}

// ============================================
// REVIEW TYPES
// ============================================
export interface Review {
  id: string;
  businessId: string;
  businessName: string;
  userId: string;
  userName: string;
  userRole: "student";
  
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  images?: string[];
  
  // Provider response
  providerResponse?: {
    comment: string;
    respondedAt: Timestamp;
  };
  
  // Moderation
  isVisible: boolean;
  isReported: boolean;
  reportReason?: string;
  
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ============================================
// CATEGORY TYPES
// ============================================
export interface Category {
  id: string;
  name: string;
  slug: BusinessCategory;
  description: string;
  icon: string;
  imageUrl: string;
  businessCount: number;
  isActive: boolean;
  sortOrder: number;
}

// ============================================
// FAVORITES TYPES
// ============================================
export interface Favorite {
  id: string;
  userId: string;
  businessId: string;
  businessName: string;
  businessCategory: BusinessCategory;
  businessImage: string;
  addedAt: Timestamp;
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================
export interface SearchFilters {
  query?: string;
  category?: BusinessCategory;
  priceRange?: number[];
  minRating?: number;
  maxDistance?: number; // in kilometers
  amenities?: string[];
  sortBy?: "rating" | "distance" | "price" | "newest";
  sortOrder?: "asc" | "desc";
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface NearbySearchParams {
  center: GeoLocation;
  radiusKm: number;
  category?: BusinessCategory;
}

// ============================================
// ADMIN DASHBOARD TYPES
// ============================================
export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalProviders: number;
  totalBusinesses: number;
  pendingApprovals: number;
  totalReviews: number;
  reportedReviews: number;
}

export interface ApprovalAction {
  businessId: string;
  action: "approve" | "reject";
  reason?: string;
  adminId: string;
  timestamp: Timestamp;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// FORM TYPES
// ============================================
export interface BusinessFormData {
  name: string;
  description: string;
  category: BusinessCategory;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  website?: string;
  priceRange: 1 | 2 | 3 | 4;
  amenities: string[];
  hours: BusinessHours;
}

export interface ReviewFormData {
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  images?: File[];
}
