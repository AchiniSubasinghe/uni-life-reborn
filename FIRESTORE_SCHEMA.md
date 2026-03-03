# Firestore Database Schema Documentation

## UniLife Platform - Database Structure

This document describes the Firestore database schema for the Essential Infrastructure Information Hub platform.

---

## Collections Overview

| Collection | Description | Primary Keys |
|------------|-------------|--------------|
| `users` | Unified user collection with roles | userId (Firebase Auth UID) |
| `students` | Legacy student collection | userId |
| `providers` | Legacy provider collection | userId |
| `businesses` | Business listings | auto-generated |
| `reviews` | User reviews for businesses | auto-generated |
| `favorites` | User saved businesses | auto-generated |
| `categories` | Business categories | auto-generated |
| `settings` | Platform settings | document ID |

---

## Collection Schemas

### 1. Users Collection (`users`)

```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'student' | 'provider' | 'admin';
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
  
  // Role-specific fields
  // For students:
  university?: string;
  studentId?: string;
  
  // For providers:
  businessName?: string;
  businessDescription?: string;
  isVerified?: boolean;
  
  // For admins:
  permissions?: {
    canManageUsers: boolean;
    canApproveBusinesses: boolean;
    canModerateReviews: boolean;
    canManageCategories: boolean;
    canViewAnalytics: boolean;
  };
  
  // Notification preferences
  notifications?: {
    emailNotifications: boolean;
    // ... other preferences
  };
}
```

### 2. Businesses Collection (`businesses`)

```typescript
interface Business {
  id: string;
  name: string;
  description: string;
  categoryId: string;           // Reference to categories collection
  providerId: string;           // Reference to users/providers collection
  providerName: string;         // Denormalized for display
  
  // Contact Information
  address: string;
  phone: string;
  email: string;
  website?: string;
  
  // Location (GeoPoint for proximity searches)
  location: {
    latitude: number;
    longitude: number;
  };
  
  // Media
  images: string[];             // Storage URLs
  
  // Business Details
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  amenities: string[];          // e.g., ['wifi', 'parking', 'ac']
  
  // Operating Hours
  businessHours: {
    monday: { open: string; close: string; isClosed: boolean };
    tuesday: { open: string; close: string; isClosed: boolean };
    wednesday: { open: string; close: string; isClosed: boolean };
    thursday: { open: string; close: string; isClosed: boolean };
    friday: { open: string; close: string; isClosed: boolean };
    saturday: { open: string; close: string; isClosed: boolean };
    sunday: { open: string; close: string; isClosed: boolean };
  };
  
  // Ratings (denormalized for performance)
  rating: number;               // Average rating (1-5)
  reviewCount: number;          // Total number of reviews
  
  // Approval Workflow
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedAt?: Timestamp;
  approvedBy?: string;          // Admin userId
  rejectedAt?: Timestamp;
  rejectedBy?: string;          // Admin userId
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}
```

### 3. Reviews Collection (`reviews`)

```typescript
interface Review {
  id: string;
  businessId: string;           // Reference to businesses
  userId: string;               // Reference to users (reviewer)
  userName: string;             // Denormalized for display
  userAvatar?: string;
  
  // Review Content
  rating: number;               // 1-5 stars
  comment: string;
  
  // Provider Response
  providerResponse?: string;
  providerResponseAt?: Timestamp;
  
  // Moderation
  isReported: boolean;
  reportReason?: string;
  reportedBy?: string;          // userId who reported
  reportedAt?: Timestamp;
  isVisible: boolean;           // Hidden by admin if false
  
  // Metadata
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### 4. Favorites Collection (`favorites`)

```typescript
interface Favorite {
  id: string;
  userId: string;               // Reference to users
  businessId: string;           // Reference to businesses
  createdAt: Timestamp;
}
```

### 5. Categories Collection (`categories`)

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;                 // URL-friendly name
  description: string;
  icon: string;                 // Icon name or URL
  image?: string;               // Cover image URL
  businessCount: number;        // Denormalized count
  isActive: boolean;
  sortOrder: number;            // Display order
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 6. Settings Collection (`settings`)

```typescript
// Document ID: "platform"
interface PlatformSettings {
  requireApproval: boolean;     // Require business approval
  allowGuestBrowsing: boolean;  // Allow non-auth browsing
  maxImagesPerBusiness: number;
  reviewModeration: boolean;    // Pre-approve reviews
  updatedAt: Timestamp;
  updatedBy: string;            // Admin userId
}
```

---

## Indexes Required

Create these composite indexes in Firebase Console:

### Businesses Collection

1. **Get approved businesses by category**
   - Collection: `businesses`
   - Fields: `status` (Ascending), `categoryId` (Ascending), `createdAt` (Descending)

2. **Get businesses by provider**
   - Collection: `businesses`
   - Fields: `providerId` (Ascending), `createdAt` (Descending)

3. **Get pending businesses for admin**
   - Collection: `businesses`
   - Fields: `status` (Ascending), `createdAt` (Ascending)

4. **Search with filters**
   - Collection: `businesses`
   - Fields: `status` (Ascending), `categoryId` (Ascending), `rating` (Descending)

### Reviews Collection

1. **Get reviews for business**
   - Collection: `reviews`
   - Fields: `businessId` (Ascending), `isVisible` (Ascending), `createdAt` (Descending)

2. **Get user reviews**
   - Collection: `reviews`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

3. **Get reported reviews**
   - Collection: `reviews`
   - Fields: `isReported` (Ascending), `reportedAt` (Descending)

### Favorites Collection

1. **Get user favorites**
   - Collection: `favorites`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

2. **Check if favorited**
   - Collection: `favorites`
   - Fields: `userId` (Ascending), `businessId` (Ascending)

---

## Data Relationships

```
users (1) ─────────── (N) businesses
  │                        │
  │                        │
  └── (N) reviews ────────┘
  │                        │
  └── (N) favorites ──────┘

categories (1) ─────── (N) businesses
```

---

## Best Practices

1. **Denormalization**: User names and counts are denormalized for read performance
2. **GeoPoint**: Use Firebase GeoPoint for location-based queries
3. **Timestamps**: Always use `serverTimestamp()` for consistency
4. **Soft Deletes**: Use `isActive` flags instead of hard deletes
5. **Rating Aggregation**: Recalculate business ratings when reviews change

---

## Initial Data Seeding

### Default Categories

```javascript
const defaultCategories = [
  { name: 'Hostels', slug: 'hostels', icon: 'Home', sortOrder: 1 },
  { name: 'Restaurants', slug: 'restaurants', icon: 'Utensils', sortOrder: 2 },
  { name: 'Supermarkets', slug: 'supermarkets', icon: 'ShoppingCart', sortOrder: 3 },
  { name: 'Pharmacies', slug: 'pharmacies', icon: 'Pill', sortOrder: 4 },
  { name: 'Stationery', slug: 'stationery', icon: 'PenTool', sortOrder: 5 },
  { name: 'Transport', slug: 'transport', icon: 'Bus', sortOrder: 6 },
  { name: 'Laundry', slug: 'laundry', icon: 'Shirt', sortOrder: 7 },
  { name: 'Cafes', slug: 'cafes', icon: 'Coffee', sortOrder: 8 },
];
```

### Default Admin User

```javascript
const defaultAdmin = {
  email: 'admin@gmail.com',
  password: 'admiN123A',
  role: 'admin',
  firstName: 'System',
  lastName: 'Admin',
  permissions: {
    canManageUsers: true,
    canApproveBusinesses: true,
    canModerateReviews: true,
    canManageCategories: true,
    canViewAnalytics: true,
  }
};
```
