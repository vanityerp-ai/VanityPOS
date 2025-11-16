# Online Store Receptionist Setup

## Overview

This document describes the setup and permissions for the **Online Store Receptionist** role, which has been configured with restricted access to only POS and Inventory functionality.

## Changes Made

### 1. New Permission Added

**File:** `lib/permissions.ts`

Added new permission:
- `TRANSFER_INVENTORY` - Permission to transfer inventory between locations

### 2. New Role Created

**File:** `lib/permissions.ts`

Created `ONLINE_STORE_RECEPTIONIST` role with the following permissions:

#### ✅ Allowed Permissions:
- `VIEW_INVENTORY` - View inventory products
- `CREATE_INVENTORY` - Add new products to inventory
- `TRANSFER_INVENTORY` - Transfer products between locations
- `VIEW_POS` - View POS interface
- `CREATE_SALE` - Process sales through POS
- `VIEW_CHAT` - Access chat system
- `SEND_MESSAGES` - Send chat messages
- `SEND_PRODUCT_REQUESTS` - Request products via chat
- `SEND_HELP_REQUESTS` - Request help via chat

#### ❌ Restricted Permissions:
- NO `EDIT_INVENTORY` - Cannot edit existing product details
- NO `DELETE_INVENTORY` - Cannot delete products
- NO `VIEW_APPOINTMENTS` - Cannot access appointments
- NO `VIEW_CLIENTS` - Cannot access client management
- NO `VIEW_DASHBOARD` - Cannot access analytics dashboard
- NO `VIEW_STAFF` - Cannot access staff management
- NO `VIEW_ACCOUNTING` - Cannot access accounting
- NO `VIEW_HR` - Cannot access HR management

### 3. Database Update

**Script:** `scripts/update-online-store-receptionist.js`

Updated the online store receptionist (`store@habeshasalon.com`) in the database:
- Changed `jobRole` from `receptionist` to `online_store_receptionist`
- This allows the permission system to recognize the special role

### 4. Authentication System Updates

**File:** `auth.ts`

Updated authentication to include `jobRole` in the session:
- Added `jobRole` to JWT token
- Added `jobRole` to session user object
- This allows permission checks based on job role, not just user role

**File:** `lib/auth-provider.tsx`

Updated permission checking logic:
- Now checks `jobRole` first before falling back to `role`
- Allows different permissions for different job types within the same user role (STAFF)

### 5. Inventory Page Restrictions

**File:** `app/dashboard/inventory/page.tsx`

Added permission checks:
- `canEditInventory` - Only true if user has `edit_inventory` permission AND is NOT online store receptionist
- `canTransferInventory` - True if user has `transfer_inventory` or `create_inventory` permission

Restricted UI elements:
- **Edit Product** button - Hidden for online store receptionist
- **Edit Stock** button - Hidden for online store receptionist
- **Adjust Stock** button - Hidden for online store receptionist
- **Manage Categories** button - Hidden for online store receptionist
- **Add Stock** button - Hidden for online store receptionist
- **Transfer** button - Visible for online store receptionist ✅
- **Add Product** button - Visible for online store receptionist ✅

### 6. Notification System Updates

#### Appointment Notifications

**File:** `components/notifications/appointment-notification-handler.tsx`

Updated notification filtering:
- **Admin & Super Admin** - Receive ALL appointment notifications
- **Managers** - Receive ALL appointment notifications
- **Staff** - Only receive notifications for appointments they are involved in (their own appointments)
- **Receptionists** - Do NOT receive appointment notifications (unless they are the assigned staff)

#### Product Sale Notifications

**File:** `components/notifications/product-sale-notification-handler.tsx` (NEW)

Created new notification handler for product sales:
- **Admin & Super Admin** - Receive ALL product sale notifications
- **Managers** - Receive ALL product sale notifications
- **Online Store Receptionist** - Receives ALL product sale notifications ✅
- **Regular Staff** - Do NOT receive product sale notifications
- **Regular Receptionists** - Do NOT receive product sale notifications

**File:** `app/dashboard/layout.tsx`

Added `ProductSaleNotificationHandler` to dashboard layout to enable product sale notifications.

## Online Store Receptionist Capabilities

### What They CAN Do:

1. **Inventory Management (Limited)**
   - ✅ View all products in inventory
   - ✅ Add new products to inventory
   - ✅ Transfer products between locations
   - ✅ View stock levels across all locations

2. **Point of Sale**
   - ✅ Access POS interface
   - ✅ Process product sales
   - ✅ Create transactions
   - ✅ View sales history

3. **Notifications**
   - ✅ Receive product sale notifications (POS and online orders)
   - ✅ Receive chat messages

4. **Communication**
   - ✅ Access chat system
   - ✅ Send messages
   - ✅ Request products
   - ✅ Request help

### What They CANNOT Do:

1. **Inventory Management (Restricted)**
   - ❌ Edit existing product details (name, price, description, etc.)
   - ❌ Delete products
   - ❌ Adjust stock levels
   - ❌ Manage categories
   - ❌ Bulk add stock to all locations

2. **Other Modules**
   - ❌ Access appointments
   - ❌ Manage clients
   - ❌ View analytics dashboard
   - ❌ Manage staff
   - ❌ Access accounting
   - ❌ Access HR management
   - ❌ View reports

## Login Credentials

**Email:** store@habeshasalon.com  
**Password:** be5MLbcN  
**Location:** Online Store  
**Job Role:** online_store_receptionist

## Testing

To test the online store receptionist functionality:

1. Log in with the credentials above
2. Verify you can only see:
   - Inventory page (with limited actions)
   - POS page
   - Chat
3. Verify you CANNOT see:
   - Dashboard
   - Appointments
   - Clients
   - Staff
   - Accounting
   - HR
   - Reports
4. In Inventory page, verify:
   - ✅ Can click "Add Product"
   - ✅ Can click "Transfer" on products
   - ❌ Cannot see "Edit" button
   - ❌ Cannot see "Adjust Stock" button
   - ❌ Cannot see "Manage Categories" button
5. Process a test sale in POS and verify notification is received

## Notes

- The online store receptionist is designed for managing online product inventory and processing online orders
- They do not need access to appointment booking or client management since online orders are automated
- They can add new products and transfer inventory to fulfill online orders
- They receive notifications for all product sales to stay informed of online order activity

