# 🔧 DEBUG: Ticket Types Not Populating

## 🐛 Problem

When editing a heritage site, the **Ticket Types table is empty** even though ticket data exists in the `heritage_sitetickettype` database table.

## 🔍 Debugging Steps Added

I've added **console logging** at critical points to trace where the data is being lost:

### **1. Check Raw Database Response**
```typescript
console.log('🎫 Raw ticketTypes from database:', details.ticketTypes);
```
**Location:** Line ~390 in `hydrateStateFromDetails()`

**What to check:**
- Open Browser DevTools → Console
- Edit any heritage site
- Look for this log entry
- **Expected:** Should show an array of ticket objects with fields: `ticket_name`, `price`, `description`, `currency`, `age_group`, etc.
- **If empty/undefined:** The problem is in the **service layer** not fetching/returning ticket types

### **2. Check Individual Ticket Mapping**
```typescript
console.log('🎫 Mapping ticket:', ticket);
```
**Location:** Line ~393 in `hydrateStateFromDetails()`

**What to check:**
- Should log each individual ticket as it's being mapped
- **Expected:** Each ticket object should have `ticket_name`, `price`, `description` fields
- **If missing fields:** Database might have NULL values or field name mismatch

### **3. Check Mapped Ticket Fees**
```typescript
console.log('🎫 Mapped ticketFees:', ticketFees);
```
**Location:** Line ~399 in `hydrateStateFromDetails()`

**What to check:**
- Should show the final mapped array with `visitor_type`, `amount`, `notes` fields
- **Expected:** Array of objects like: `[{ visitor_type: "Adult Entry", amount: 50, notes: "..." }]`
- **If empty:** Mapping logic has an issue

### **4. Check Entry Type**
```typescript
console.log('🎫 Entry Type:', entryType);
console.log('🎫 TicketFees length:', ticketFees.length);
```
**Location:** Line ~505-506 in `hydrateStateFromDetails()`

**What to check:**
- `entryType` should be `'paid'` for sites with ticket types
- `ticketFees.length` should be > 0
- **If entryType is 'free':** Database `entry_type` column is NULL or 'free'
- **If ticketFees.length is 0:** No tickets in database OR mapping failed

### **5. Check Final Form State**
```typescript
console.log('🎫 Final hydratedState.ticketing.fees:', hydratedState.ticketing.fees);
```
**Location:** Line ~557 in `hydrateStateFromDetails()`

**What to check:**
- Should show the final fees array that will be used to populate the form
- **Expected:** Array of fee objects
- **If empty:** The conditional logic at lines 534-542 is not working correctly

---

## 🧪 How to Test

1. **Open the browser** and go to your heritage site edit page
2. **Open DevTools** → Console tab (F12)
3. **Edit any heritage site** that should have ticket types
4. **Look for 🎫 emoji logs** in the console
5. **Follow the data flow** to see where it stops

---

## 🔬 Possible Issues & Solutions

### **Issue 1: Service Not Returning Ticket Types**

**Symptom:** First log shows `undefined` or `[]`

**Solution:** Check `heritageSite.service.ts`:
```typescript
// In getHeritageSiteDetails(), ensure this line exists:
supabase.from('heritage_sitetickettype').select('*').eq('site_id', siteId)
```

**Also check the response structure:**
```typescript
ticketTypes: ticketResult.data ?? []
```

### **Issue 2: Wrong Site ID**

**Symptom:** First log shows `[]` (empty array)

**Solution:** 
- Check the `site_id` in the URL when editing
- Run this SQL query in Supabase:
```sql
SELECT * FROM heritage_sitetickettype WHERE site_id = YOUR_SITE_ID;
```
- If empty, that site truly has no ticket types in the database

### **Issue 3: Field Name Mismatch**

**Symptom:** Second log shows ticket objects but with different field names

**Solution:** Update the mapping to use the correct database field names:
```typescript
visitor_type: ticket.ticket_name || 'General Entry',
amount: ticket.price ?? 0,
notes: ticket.description || '',
```

### **Issue 4: Entry Type is 'free'**

**Symptom:** Fourth log shows `entryType: 'free'` but you expect 'paid'

**Solution:** Update the `entry_type` column in the database:
```sql
UPDATE heritage_site 
SET entry_type = 'paid' 
WHERE site_id = YOUR_SITE_ID;
```

### **Issue 5: Conditional Logic Failure**

**Symptom:** All logs look good but final state has empty fees

**Solution:** Check the logic at lines 534-542:
```typescript
fees:
  entryType === 'paid'
    ? ticketFees.length > 0
      ? ticketFees
      : initialFormState.ticketing.fees
    : []
```

This should work correctly if:
- `entryType === 'paid'` ✅
- `ticketFees.length > 0` ✅

---

## 📊 Expected Console Output (Working Scenario)

```
🎫 Raw ticketTypes from database: [
  {
    ticket_type_id: 1,
    site_id: 1,
    ticket_name: "Adult Entry",
    price: 50.00,
    currency: "INR",
    description: "Standard entry ticket for adults",
    age_group: "adult",
    includes_guide: false,
    includes_audio_guide: false,
    includes_vr_experience: false,
    is_active: true
  },
  {
    ticket_type_id: 2,
    site_id: 1,
    ticket_name: "Child Entry",
    price: 25.00,
    currency: "INR",
    description: "Entry ticket for children under 12",
    age_group: "child",
    includes_guide: false,
    includes_audio_guide: false,
    includes_vr_experience: false,
    is_active: true
  }
]

🎫 Mapping ticket: {ticket_type_id: 1, site_id: 1, ticket_name: "Adult Entry", price: 50, ...}
🎫 Mapping ticket: {ticket_type_id: 2, site_id: 1, ticket_name: "Child Entry", price: 25, ...}

🎫 Mapped ticketFees: [
  { visitor_type: "Adult Entry", amount: 50, notes: "Standard entry ticket for adults" },
  { visitor_type: "Child Entry", amount: 25, notes: "Entry ticket for children under 12" }
]

🎫 Entry Type: paid
🎫 TicketFees length: 2

🎫 Final hydratedState.ticketing.fees: [
  { visitor_type: "Adult Entry", amount: 50, notes: "Standard entry ticket for adults" },
  { visitor_type: "Child Entry", amount: 25, notes: "Entry ticket for children under 12" }
]
```

After this, the table in the UI should show 2 rows with "Adult Entry" and "Child Entry".

---

## 🎯 Next Steps

1. **Run the edit page** with DevTools open
2. **Copy the console logs** and share them
3. Based on the logs, I can identify exactly where the issue is
4. We'll apply the specific fix needed

---

## 🚨 Quick Check: Verify Database Has Data

Run this query in Supabase SQL Editor:

```sql
-- Check if ANY ticket types exist in the database
SELECT COUNT(*) as total_tickets FROM heritage_sitetickettype;

-- Check ticket types for a specific site (replace 1 with your site_id)
SELECT * FROM heritage_sitetickettype WHERE site_id = 1;

-- Check the entry_type for your site
SELECT site_id, name_default, entry_type 
FROM heritage_site 
WHERE site_id = 1;
```

If these queries return empty results, then you need to **create ticket types first** before they can be edited.

---

**Status:** ✅ Debugging logs added - Ready for testing!

Please open the browser console and share the logs you see! 🔍

