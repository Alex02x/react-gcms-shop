# Localization Audit - Missing Pages

## Overview
This document identifies all pages and components in the GameCMS Shop application that **still need localization**.

## Status Summary

### ✅ Already Localized (Phase 1 & 2)
- `resources/js/components/auth-modal.tsx` - ✅ Complete
- `resources/js/components/shop-header.tsx` - ✅ Complete  
- `resources/js/components/product-card.tsx` - ✅ Complete
- `resources/js/components/product-sidebar.tsx` - ✅ Complete
- `resources/js/components/product-reviews.tsx` - ✅ Complete
- `resources/js/components/language-switcher.tsx` - ✅ Complete
- `resources/js/pages/admin/users/index.tsx` - ✅ Complete (example)
- `resources/js/layouts/admin-layout.tsx` - ✅ Complete
- `resources/js/layouts/shop-layout.tsx` - ✅ Complete

### ❌ NOT Localized - Need Translation

## User-Facing Pages (Priority: HIGH)

### 1. **buys.tsx** - My Purchases Page
**Location**: `resources/js/pages/buys.tsx`  
**Hardcoded Strings Count**: 6

**Hardcoded Text**:
```typescript
Line 35: 'Failed to load your purchases. Please try again.'
Line 52: 'Мои покупки'
Line 54: 'Все ваши приобретенные товары'
Line 69: {error}
Line 74: 'У вас пока нет покупок'
```

**Translation Keys Needed**:
```json
{
  "buys": {
    "page_title": "My Purchases",
    "page_description": "All your purchased products",
    "error_loading": "Failed to load your purchases. Please try again.",
    "no_purchases": "You don't have any purchases yet",
    "loading": "Loading..."
  }
}
```

---

### 2. **index.tsx** - Main Shop/Catalog Page
**Location**: `resources/js/pages/index.tsx`  
**Hardcoded Strings Count**: 6

**Hardcoded Text**:
```typescript
Line 122: 'Каталог товаров'
Line 124: 'Найдите идеальное решение для вашего проекта'
Line 136: 'Загрузка...'
Line 137: `Найдено товаров: ${products.total}`
Line 170: 'Товары не найдены'
```

**Translation Keys Needed**:
```json
{
  "shop": {
    "catalog_title": "Product Catalog",
    "catalog_description": "Find the perfect solution for your project",
    "loading": "Loading...",
    "products_found": "Products found: {{count}}",
    "no_products": "No products found"
  }
}
```

---

### 3. **product.tsx** - Product Detail Page
**Location**: `resources/js/pages/product.tsx`  
**Hardcoded Strings Count**: 0 (uses child components)

**Status**: ✅ **No direct text** - All text comes from already-localized child components:
- `ProductHero` 
- `ProductImageGallery`
- `ProductDescription`
- `ProductReviews` (✅ localized)
- `ProductSidebar` (✅ localized)

**Action**: No action needed - child components handle all text

---

### 4. **settings.tsx** - User Settings Page
**Location**: `resources/js/pages/settings.tsx`  
**Hardcoded Strings Count**: 16

**Hardcoded Text**:
```typescript
Line 39: 'Настройки профиля'
Line 41: 'Управление вашим аккаунтом и предпочтениями'
Line 50: 'Информация профиля'
Line 56: 'Email'
Line 78: 'Ваш email используется для входа и получения уведомлений'
Line 89: 'Безопасность'
Line 95: 'Изменить пароль'
Line 97: 'Обновите пароль для вашей учетной записи'
Line 104: 'Изменить'
Line 110: 'Двухфакторная аутентификация'
Line 114: 'Дополнительная защита вашего аккаунта'
Line 121: 'Включить'
Line 131: 'Уведомления'
Line 137: 'Email уведомления'
Line 139: 'Получать уведомления о новых товарах и акциях'
Line 175: isSaving ? 'Сохранение...' : 'Сохранить изменения'
```

**Translation Keys Needed**:
```json
{
  "settings": {
    "page_title": "Profile Settings",
    "page_description": "Manage your account and preferences",
    "profile_info_title": "Profile Information",
    "email_label": "Email",
    "email_description": "Your email is used for login and notifications",
    "security_title": "Security",
    "change_password": "Change Password",
    "change_password_description": "Update your account password",
    "change_button": "Change",
    "two_factor_auth": "Two-Factor Authentication",
    "two_factor_description": "Additional protection for your account",
    "enable_button": "Enable",
    "notifications_title": "Notifications",
    "email_notifications": "Email Notifications",
    "email_notifications_description": "Receive notifications about new products and promotions",
    "saving": "Saving...",
    "save_changes": "Save Changes"
  }
}
```

---

### 5. **wallet.tsx** - Wallet/Payment Page
**Location**: `resources/js/pages/wallet.tsx`  
**Hardcoded Strings Count**: 24

**Hardcoded Text**:
```typescript
Line 30: { name: 'СБП', description: 'Быстрое пополнение' }
Line 34: { name: 'ЮКасса', description: 'Российские карты' }
Line 63: method: 'Банковская карта'
Line 71: method: 'ЮMoney'
Line 108: `Пополнение на ${amount} ₽ через ${...}`
Line 132: 'Выполнено'
Line 134: 'В обработке'
Line 136: 'Отклонено'
Line 154: 'Мой кошелек'
Line 156: 'Пополните баланс и управляйте финансами'
Line 161: 'Текущий баланс'
Line 175: 'Сумма пополнения'
Line 179: 'Минимум 100 ₽'
Line 188: 'Минимальная сумма пополнения 100 ₽'
Line 195: 'Способ оплаты'
Line 198: '(введите сумму)'
Line 244: 'Обработка...' : 'Пополнить баланс'
Line 252: 'История пополнений'
Line 267: 'История пополнений пуста'
```

**Translation Keys Needed**:
```json
{
  "wallet": {
    "page_title": "My Wallet",
    "page_description": "Top up your balance and manage finances",
    "current_balance": "Current Balance",
    "top_up_amount": "Top-up Amount",
    "amount_placeholder": "Minimum 100 ₽",
    "minimum_amount_error": "Minimum top-up amount is 100 ₽",
    "payment_method": "Payment Method",
    "enter_amount_first": "(enter amount)",
    "processing": "Processing...",
    "top_up_button": "Top Up Balance",
    "payment_history": "Payment History",
    "no_payments": "Payment history is empty",
    "status": {
      "completed": "Completed",
      "pending": "Processing",
      "failed": "Declined"
    },
    "methods": {
      "sbp_name": "SBP",
      "sbp_description": "Fast top-up",
      "yookassa_name": "YooKassa",
      "yookassa_description": "Russian cards",
      "card": "Bank Card",
      "yoomoney": "YooMoney"
    }
  }
}
```

---

## Shared Components (Priority: HIGH)

### 6. **user-sidebar.tsx** - User Navigation Sidebar
**Location**: `resources/js/components/user-sidebar.tsx`  
**Hardcoded Strings Count**: 4

**Hardcoded Text**:
```typescript
Line 5: 'Мои покупки'
Line 10: 'Мой кошелек'
Line 15: 'Настройки профиля'
Line 28: 'Личный кабинет'
```

**Translation Keys Needed**:
```json
{
  "user_menu": {
    "title": "Personal Account",
    "my_purchases": "My Purchases",
    "my_wallet": "My Wallet",
    "profile_settings": "Profile Settings"
  }
}
```

---

### 7. **category-sidebar.tsx** - Category Sidebar
**Location**: `resources/js/components/category-sidebar.tsx`  
**Hardcoded Strings Count**: 3

**Hardcoded Text**:
```typescript
Line 98: 'Поиск товаров...'
Line 109: 'Категории'
Line 113: 'Категории не найдены'
```

**Translation Keys Needed**:
```json
{
  "categories": {
    "search_placeholder": "Search products...",
    "title": "Categories",
    "no_categories": "No categories found"
  }
}
```

---

## Admin Pages (Priority: MEDIUM)

### 8. **admin/products/index.tsx**
**Location**: `resources/js/pages/admin/products/index.tsx`  
**Status**: ❌ Not localized  
**Estimated Strings**: ~30

### 9. **admin/products/create.tsx**
**Location**: `resources/js/pages/admin/products/create.tsx`  
**Status**: ❌ Not localized  
**Estimated Strings**: ~50

### 10. **admin/products/edit.tsx**
**Location**: `resources/js/pages/admin/products/edit.tsx`  
**Status**: ❌ Not localized  
**Estimated Strings**: ~50

### 11. **admin/products/versions/create.tsx**
**Location**: `resources/js/pages/admin/products/versions/create.tsx`  
**Status**: ❌ Not localized  
**Estimated Strings**: ~20

### 12. **admin/products/versions/edit.tsx**
**Location**: `resources/js/pages/admin/products/versions/edit.tsx`  
**Status**: ❌ Not localized  
**Estimated Strings**: ~20

### 13. **admin/products/versions/index.tsx**
**Location**: `resources/js/pages/admin/products/versions/index.tsx`  
**Status**: ❌ Not localized  
**Estimated Strings**: ~15

### 14. **admin/categories/index.tsx**
**Location**: `resources/js/pages/admin/categories/index.tsx`  
**Status**: ❌ Not localized  
**Estimated Strings**: ~40

### 15. **admin/roles/index.tsx**
**Location**: `resources/js/pages/admin/roles/index.tsx`  
**Status**: ❌ Not localized  
**Estimated Strings**: ~15

### 16. **admin/roles/form.tsx**
**Location**: `resources/js/pages/admin/roles/form.tsx`  
**Status**: ❌ Not localized  
**Estimated Strings**: ~20

### 17. **admin/users/create.tsx** (if exists)
**Location**: `resources/js/pages/admin/users/create.tsx`  
**Status**: Need to check if exists

### 18. **admin/users/edit.tsx**
**Location**: `resources/js/pages/admin/users/edit.tsx`  
**Status**: ❌ Not localized  
**Estimated Strings**: ~35

---

## Summary by Priority

### CRITICAL PRIORITY (User-facing pages - must complete)
Total: 5 pages + 2 components

1. ✅ **buys.tsx** - 6 strings
2. ✅ **index.tsx** - 6 strings
3. ✅ **product.tsx** - No action needed (uses localized components)
4. ✅ **settings.tsx** - 16 strings
5. ✅ **wallet.tsx** - 24 strings
6. ✅ **user-sidebar.tsx** - 4 strings
7. ✅ **category-sidebar.tsx** - 3 strings

**Total Estimated Strings**: ~59 translation keys

---

### MEDIUM PRIORITY (Admin pages)
Total: 11 admin pages

1. admin/users/edit.tsx - ~35 strings
2. admin/products/index.tsx - ~30 strings
3. admin/products/create.tsx - ~50 strings
4. admin/products/edit.tsx - ~50 strings
5. admin/products/versions/create.tsx - ~20 strings
6. admin/products/versions/edit.tsx - ~20 strings
7. admin/products/versions/index.tsx - ~15 strings
8. admin/categories/index.tsx - ~40 strings
9. admin/roles/index.tsx - ~15 strings
10. admin/roles/form.tsx - ~20 strings

**Total Estimated Strings**: ~295 translation keys

---

## Recommended Approach

### Phase 3: User-Facing Pages (1-2 days)
Localize all critical priority pages:
1. Create translation keys in `resources/js/locales/{en,ru}/common.json`
2. Add wallet-specific keys to new `wallet.json` namespace
3. Update each page to use `useTranslation` hook
4. Test language switching on all user pages

### Phase 4: Admin Panel (2-3 days)
Localize admin pages using existing `admin.json` namespace:
1. All translation keys already defined in `admin.json` (247 keys)
2. Apply pattern from `admin/users/index.tsx` to remaining pages
3. Ensure form validation messages are localized
4. Test admin panel in both languages

---

## Next Steps

1. ✅ Review this audit
2. ⏳ Localize **user-facing pages** (Phase 3)
3. ⏳ Localize **admin panel** (Phase 4)
4. ⏳ Final testing and validation
5. ⏳ Update documentation

---

## Translation File Organization

### Recommended Structure:
```
resources/js/locales/
├── en/
│   ├── common.json      (shared UI: categories, user_menu)
│   ├── auth.json        (✅ already created)
│   ├── products.json    (✅ already created)
│   ├── admin.json       (✅ already created - 247 keys)
│   ├── wallet.json      (NEW - wallet page specific)
│   └── settings.json    (NEW - settings page specific)
└── ru/
    ├── common.json
    ├── auth.json        (✅ already created)
    ├── products.json    (✅ already created)
    ├── admin.json       (✅ already created - 247 keys)
    ├── wallet.json      (NEW)
    └── settings.json    (NEW)
```

### Alternative: Keep Everything in common.json
```json
{
  "categories": { ... },
  "user_menu": { ... },
  "buys": { ... },
  "shop": { ... },
  "settings": { ... },
  "wallet": { ... }
}
```

**Recommendation**: Use **separate namespace files** (wallet.json, settings.json) to keep files manageable and organized.

---

## Completion Checklist

### User-Facing Pages
- [ ] buys.tsx
- [ ] index.tsx (shop catalog)
- [x] product.tsx (no action needed)
- [ ] settings.tsx
- [ ] wallet.tsx
- [ ] user-sidebar.tsx
- [ ] category-sidebar.tsx

### Admin Pages
- [x] admin/users/index.tsx (✅ done as example)
- [ ] admin/users/edit.tsx
- [ ] admin/products/index.tsx
- [ ] admin/products/create.tsx
- [ ] admin/products/edit.tsx
- [ ] admin/products/versions/create.tsx
- [ ] admin/products/versions/edit.tsx
- [ ] admin/products/versions/index.tsx
- [ ] admin/categories/index.tsx
- [ ] admin/roles/index.tsx
- [ ] admin/roles/form.tsx

---

**Total Progress**: 9/29 pages localized (31%)  
**Remaining Work**: 20 pages  
**Estimated Time**: 3-5 days
