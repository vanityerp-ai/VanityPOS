# 🚀 Quick Reference - Habesha Beauty Salon

## 🔐 **LOGIN CREDENTIALS**

### **Admin Access**
```
Email:    Tsedey@habeshasalon.com
Password: Staff123#
```
OR
```
Email:    admin@vanityhub.com
Password: Admin33#
```

---

### **Receptionist Accounts**

**Medinat Khalifa:**
```
Email:    medinat@habeshasalon.com
Password: CLgpXjd6
```

**D-Ring Road:**
```
Email:    dring@habeshasalon.com
Password: EVc3aecL
```

**Muaither:**
```
Email:    muaither@habeshasalon.com
Password: BkrcQzLU
```

**Online Store (Restricted):**
```
Email:    store@habeshasalon.com
Password: be5MLbcN
Access:   POS and Inventory ONLY
```

---

### **All Staff Members**
```
Email:    [their email]@habeshasalon.com
Password: Staff123#
```

**Examples:**
- mekdes@habeshasalon.com / Staff123#
- aster@habeshasalon.com / Staff123#
- woyni@habeshasalon.com / Staff123#
- ruth@habeshasalon.com / Staff123#

---

## 📊 **SYSTEM OVERVIEW**

| Category | Count |
|----------|-------|
| Total Accounts | 28 |
| Admin | 3 |
| Staff | 22 |
| Receptionists | 4 |

---

## 📍 **STAFF BY LOCATION**

| Location | Staff | Receptionist |
|----------|-------|--------------|
| D-Ring Road | 6 | dring@habeshasalon.com |
| Medinat Khalifa | 4 | medinat@habeshasalon.com |
| Muaither | 11 | muaither@habeshasalon.com |
| Online Store | 1 | store@habeshasalon.com |

---

## 🔧 **USEFUL COMMANDS**

**Verify Staff Data:**
```bash
node scripts/verify-staff-data.js
```

**Start Development Server:**
```bash
npm run dev
```

**Access Application:**
```
http://localhost:3000
```

---

## 📋 **PERMISSIONS SUMMARY**

### **Admin**
- ✅ Full access to everything
- ✅ All locations
- ✅ All notifications

### **Location Receptionist**
- ✅ View/manage appointments for ALL staff at their location
- ✅ View/create clients
- ✅ View calendar
- ❌ No dashboard access
- ❌ No POS access
- ❌ No inventory access

### **Online Store Receptionist**
- ✅ POS access
- ✅ View inventory
- ✅ Add products
- ✅ Transfer inventory
- ❌ No edit inventory
- ❌ No appointments
- ❌ No dashboard

### **Staff**
- ✅ View own appointments
- ✅ View own schedule
- ✅ Notifications for own appointments only
- ❌ Limited to assigned location(s)

---

## 🔔 **NOTIFICATION RULES**

| Notification Type | Who Receives It |
|-------------------|-----------------|
| Appointment Created/Updated | Admin, Manager, Involved Staff |
| Product Sale | Admin, Manager, Online Store Receptionist |
| Order Placed | Admin, Manager |
| Document Expiry | Admin, Manager, Affected Staff |

---

## ⚠️ **IMPORTANT REMINDERS**

1. **Staff Password:** All staff use `Staff123#` - ask them to change it!
2. **Receptionist Passwords:** Each has unique password (see above)
3. **Online Store:** `store@habeshasalon.com` has RESTRICTED access
4. **Location Filter:** Receptionists only see their location's data
5. **Calendar:** Receptionists see ALL staff at their location

---

## 📁 **DOCUMENTATION**

- **`LOGIN_CREDENTIALS.md`** - Full credentials list
- **`FINAL_SETUP_SUMMARY.md`** - Complete setup overview
- **`STAFF_DATA_REPLACEMENT_SUMMARY.md`** - Technical details
- **`ONLINE_STORE_RECEPTIONIST_SETUP.md`** - Online store permissions

---

## 🆘 **TROUBLESHOOTING**

**Can't log in?**
- Check email is correct (case-insensitive)
- Verify password (case-sensitive)
- Try admin account: admin@vanityhub.com / Admin33#

**Receptionist can't see staff?**
- Verify they're logged in with correct location account
- Check staff are assigned to that location
- Refresh browser

**Online store receptionist sees too much?**
- They should ONLY see POS and Inventory in sidebar
- If they see more, check their jobRole is `online_store_receptionist`

**Staff not receiving notifications?**
- They only receive notifications for appointments they're involved in
- Check notification settings in browser
- Verify appointment has their staffId

---

## ✅ **QUICK TEST CHECKLIST**

- [ ] Log in as admin - verify full access
- [ ] Log in as receptionist - verify can see all location staff
- [ ] Log in as online store receptionist - verify restricted to POS/Inventory
- [ ] Log in as staff - verify can see own appointments
- [ ] Create appointment - verify notifications work
- [ ] Process sale - verify online store receptionist gets notification

---

**System Status:** ✅ READY FOR USE  
**Last Updated:** 2025-11-16

