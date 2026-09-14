# Routes Audit Report

Generated: 2026-09-14

## Executive Summary

This document compares the actual Next.js file system routes against the permissions defined in `/dashboard/admin/master/roles/page.tsx`.

---

## 📊 Statistics

- **Total Actual Routes**: 63 page files
- **Total Defined Permissions**: 50 permissions
- **Missing from Permissions**: 13+ routes
- **Status**: ⚠️ **INCOMPLETE** - Many routes are not in the permissions list

---

## ✅ Routes PRESENT in Permissions List

### Core Routes (3)
- ✅ `/` - Home
- ✅ `/dashboard` - Dashboard
- ✅ `/dashboard/profile` - Profile

### Admin Master (7)
- ✅ `/dashboard/admin/master/academicyear` - Academic Year Management
- ✅ `/dashboard/admin/master/roles` - Roles Management
- ✅ `/dashboard/admin/master/betterauth` - BetterAuth Management
- ✅ `/dashboard/admin/master/users` - Users Management
- ✅ `/dashboard/admin/master/majors` - Major Management
- ✅ `/dashboard/admin/master/classes` - Class Management
- ✅ `/dashboard/admin/master/subjects` - Subject Management
- ✅ `/dashboard/admin/master/classes/tahfidz` - Tahfidz Group Management

### Admin Academic (4)
- ✅ `/dashboard/admin/academic/schedules` - Schedule Management
- ✅ `/dashboard/admin/academic/tahfidzrecord` - Tahfidz Record Management
- ✅ `/dashboard/admin/academic/specialschedule` - Special Schedule

### Admin Discipline (2)
- ✅ `/dashboard/admin/discipline/typeviolations` - Type Violation Management
- ✅ `/dashboard/violations` - Violation Management

### Admin Finance (6)
- ✅ `/dashboard/admin/finance/paymenttypes` - Payment Types Management
- ✅ `/dashboard/admin/finance/payments` - Payment Management
- ✅ `/dashboard/admin/finance/billing` - Data Tagihan (Admin)
- ✅ `/dashboard/admin/finance/studentinformation` - Student Information
- ✅ `/dashboard/admin/finance/accountbank` - Akun Bank Management
- ✅ `/dashboard/admin/finance/payments/chart` - Dashboard Transaksi
- ✅ `/dashboard/admin/finance/billing/chart` - Dashboard Tagihan
- ✅ `/dashboard/admin/finance/accountbank/chart` - Dashboard Saldo

### Admin Utility (3)
- ✅ `/dashboard/admin/utility/upload/users` - Upload Users
- ✅ `/dashboard/admin/utility/upload/schedules` - Upload Schedules
- ✅ `/dashboard/admin/utility/botwa` - Botwa Management

### Admin Attendance (1)
- ✅ `/dashboard/admin/attendance` - Attendance for Admin Backup

### Teacher Routes (4)
- ✅ `/dashboard/teacher/schedule` - Schedule for Teacher
- ✅ `/dashboard/attendance/teacher` - Attendance for Principal
- ✅ `/dashboard/violations/teacher` - Violation for Teacher

### Student Routes (4)
- ✅ `/dashboard/student/payment` - Payment for Student
- ✅ `/dashboard/student/attendance` - Attendance for Student
- ✅ `/dashboard/student/schedule` - Schedule for Student
- ✅ `/dashboard/student/tahfidzrecord` - Tahfidz Record For Student

### Parent Routes (1)
- ✅ `/dashboard/parent` - Dashboard Parent

### Calendar Routes (6)
- ✅ `/dashboard/calender` - Calendar for User
- ✅ `/dashboard/calender/teacher` - Calendar for Teacher
- ✅ `/dashboard/calender/student` - Calendar for Student
- ✅ `/dashboard/calender/list/teacher` - Calendar List for Teacher
- ✅ `/dashboard/calender/list/student` - Calendar List for Student

### Attendance & Recap (3)
- ✅ `/dashboard/attendance` - Attendance Management
- ✅ `/dashboard/recapattendance` - Recap Attendance Student
- ✅ `/dashboard/recapattendance/class` - Recap Attendance Class

### Treasurer Routes (8)
- ✅ `/dashboard/treasurer/users` - Data Siswa (Bendahara)
- ✅ `/dashboard/treasurer/class` - Data kelas (Bendahara)
- ✅ `/dashboard/treasurer/paymenttype` - Jenis Tagihan (Bendahara)
- ✅ `/dashboard/treasurer/payment` - Pembayaran (Bendahara)
- ✅ `/dashboard/treasurer/billing` - Data Billing (Bendahara)
- ✅ `/dashboard/treasurer/billing/upload` - Upload Billing (Bendahara)
- ✅ `/dashboard/treasurer/users/upload` - Upload Data Users (Bendahara)
- ✅ `/dashboard/treasurer/studentinformation` - Student Information (Bendahara)

### Violations (2)
- ✅ `/dashboard/violations/student` - Violation for Student

**Total Present: 50 routes**

---

## ❌ Routes MISSING from Permissions List

### Critical Missing Routes

#### 1. `/dashboard/foundation`
- **File**: `dashboard/foundation/page.tsx`
- **Importance**: HIGH
- **Reason**: Foundation management is critical for multi-tenant system
- **Recommended Label**: "Foundation Management"
- **Should be visible to**: Admin, Yayasan

#### 2. `/dashboard/majors`
- **File**: `dashboard/majors/page.tsx`
- **Importance**: MEDIUM
- **Reason**: Top-level majors route (duplicate of `/dashboard/admin/master/majors`?)
- **Recommended Label**: "Majors (Top-level)"
- **Note**: ⚠️ May be duplicate - verify purpose

#### 3. `/dashboard/payments`
- **File**: `dashboard/payments/page.tsx`
- **Importance**: MEDIUM
- **Reason**: Top-level payments route (different from `/dashboard/student/payment`?)
- **Recommended Label**: "Payments (Top-level)"
- **Note**: ⚠️ May be duplicate - verify purpose

#### 4. `/dashboard/reports`
- **File**: `dashboard/reports/page.tsx`
- **Importance**: HIGH
- **Reason**: Reporting functionality is critical for admins
- **Recommended Label**: "Reports Management"
- **Should be visible to**: Admin, Yayasan, Bendahara

#### 5. `/dashboard/middleware`
- **File**: `dashboard/middleware/page.tsx`
- **Importance**: LOW (likely test/debug)
- **Reason**: Unusual route name - may be test page
- **Recommended Label**: "Middleware Debug Page"
- **Note**: ⚠️ Consider removing from production

#### 6. `/dashboard/test/date`
- **File**: `dashboard/test/date/page.tsx`
- **Importance**: LOW (test page)
- **Reason**: Test/sandbox page
- **Recommended Label**: "Date Test Page"
- **Note**: ⚠️ Should NOT be in production - remove or restrict

### Teacher Dynamic Routes (4)

#### 7. `/dashboard/teacher/attendance/[id]`
- **File**: `dashboard/teacher/attendance/[id]/page.tsx`
- **Importance**: HIGH
- **Reason**: Teacher attendance detail page
- **Recommended Label**: "Teacher Attendance Detail"
- **Should be visible to**: Teacher, Admin

#### 8. `/dashboard/teacher/attendance/tahfidz/[id]`
- **File**: `dashboard/teacher/attendance/tahfidz/[id]/page.tsx`
- **Importance**: HIGH
- **Reason**: Tahfidz attendance detail
- **Recommended Label**: "Tahfidz Attendance Detail"
- **Should be visible to**: Teacher, Admin

#### 9. `/dashboard/teacher/schedule/[id]`
- **File**: `dashboard/teacher/schedule/[id]/page.tsx`
- **Importance**: HIGH
- **Reason**: Teacher schedule detail page
- **Recommended Label**: "Teacher Schedule Detail"
- **Should be visible to**: Teacher, Admin

#### 10. `/dashboard/teacher/tahfidzrecord/[idTahfidzGroup]`
- **File**: `dashboard/teacher/tahfidzrecord/[idTahfidzGroup]/page.tsx`
- **Importance**: HIGH
- **Reason**: Tahfidz record by group
- **Recommended Label**: "Tahfidz Record by Group"
- **Should be visible to**: Teacher, Admin

### Attendance Teacher Input Route

#### 11. `/dashboard/attendance/teacher/input`
- **File**: `dashboard/attendance/teacher/input/page.tsx`
- **Importance**: HIGH
- **Reason**: Teacher attendance input form (separate from view page)
- **Recommended Label**: "Teacher Attendance Input"
- **Should be visible to**: Teacher, Admin

**Total Missing: 11+ routes**

---

## 🔍 Detailed Analysis

### Issue Categories

#### 1. **Duplicate Routes (3 potential conflicts)**
```
/dashboard/majors          vs  /dashboard/admin/master/majors
/dashboard/payments        vs  /dashboard/student/payment
/dashboard/attendance      vs  multiple attendance routes
```
**Action Required**: Investigate purpose and consolidate or differentiate

#### 2. **Test/Debug Pages (2 routes)**
```
/dashboard/test/date
/dashboard/middleware
```
**Action Required**: Remove from production or add developer-only permission

#### 3. **Dynamic Route Permissions Missing (4 routes)**
```
/dashboard/teacher/attendance/[id]
/dashboard/teacher/attendance/tahfidz/[id]
/dashboard/teacher/schedule/[id]
/dashboard/teacher/tahfidzrecord/[idTahfidzGroup]
```
**Action Required**: Add base route permissions (can control access at parent level)

#### 4. **Critical Production Routes Missing (4 routes)**
```
/dashboard/foundation
/dashboard/reports
/dashboard/attendance/teacher/input
```
**Action Required**: **MUST ADD** to permissions list

---

## 📋 Recommended Actions

### Priority 1: Add Missing Critical Routes
Add these to `availablePermissions` in `/dashboard/admin/master/roles/page.tsx`:

```typescript
// Add to availablePermissions array
{ id: "/dashboard/foundation", label: "Foundation Management" },
{ id: "/dashboard/reports", label: "Reports Management" },
{ id: "/dashboard/attendance/teacher/input", label: "Teacher Attendance Input" },
{ id: "/dashboard/teacher/attendance/[id]", label: "Teacher Attendance Detail" },
{ id: "/dashboard/teacher/schedule/[id]", label: "Teacher Schedule Detail" },
{ id: "/dashboard/teacher/tahfidzrecord/[idTahfidzGroup]", label: "Tahfidz Record by Group" },
{ id: "/dashboard/teacher/attendance/tahfidz/[id]", label: "Tahfidz Attendance Detail" },
```

### Priority 2: Investigate Duplicate Routes
- Compare `/dashboard/majors` with `/dashboard/admin/master/majors`
- Compare `/dashboard/payments` with `/dashboard/student/payment`
- Consolidate or differentiate clearly

### Priority 3: Handle Test Pages
- Remove `/dashboard/test/date` from production build
- Remove `/dashboard/middleware` or add developer-only permission
- Add to `.gitignore` or move to separate dev environment

### Priority 4: Update menuGroupsSidebar.ts
Ensure `app/repository/menuGroupsSidebar.ts` includes all routes that should appear in navigation.

---

## 🎯 Discrepancies Summary

| Category | Count | Action Required |
|----------|-------|----------------|
| Routes in file system | 63 | - |
| Routes in permissions | 50 | - |
| Missing from permissions | 11+ | **ADD** |
| Duplicate routes | 3 | **INVESTIGATE** |
| Test/Debug pages | 2 | **REMOVE or RESTRICT** |
| Dynamic routes | 4 | **ADD parent permissions** |

---

## 🔐 Security Implications

### Current State
- ❌ 11+ routes are **NOT** in permission system
- ❌ Test pages are accessible in production
- ❌ Dynamic routes have no permission controls
- ❌ `/dashboard/foundation` (critical) has no permission

### Risk Level: **HIGH** ⚠️

**Consequences:**
1. Users might access routes without proper authorization
2. Test/debug pages expose internal functionality
3. Foundation management is unprotected
4. Reports are accessible without permission

**Recommended Fix:**
1. Add ALL missing routes to permissions list
2. Update all existing roles to include appropriate permissions
3. Remove or restrict test pages
4. Audit middleware/route protection logic

---

## 📝 Implementation Checklist

- [ ] Add 11 missing routes to `availablePermissions` in roles page
- [ ] Update sidebar menu groups to include new routes
- [ ] Remove or restrict test pages (`/dashboard/test/date`, `/dashboard/middleware`)
- [ ] Investigate duplicate routes and consolidate
- [ ] Update existing roles to grant appropriate permissions
- [ ] Test permission filtering for each role
- [ ] Verify admin bypass still works correctly
- [ ] Document dynamic route permission strategy

---

## 🚀 Next Steps

1. **Immediate**: Update the roles page with missing permissions (see Priority 1)
2. **Short-term**: Remove test pages from production
3. **Medium-term**: Investigate and resolve duplicate routes
4. **Long-term**: Implement automated route-to-permission audit tool

---

*Report generated by analyzing file system tree and comparing with permission definitions.*
