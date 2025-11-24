# Backend Requirements for Gas Station Detail Page

## ✅ React Key Warning Fixed
The "unique key prop" warning has been fixed. Tags now use unique keys combining sessionId, tag value, and index.

---

## 🔴 Required Backend Endpoints

### 1. **Get Single Station** ✅ (Already exists)
```
GET /api/v1/stations/:id
```

**Status**: Assuming this exists in your backend

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Gas Station",
    "location": "123 Main Street, City",
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z",
    "lastModifiedBy": 5,
    "lastVerificationAt": "2025-01-15T14:30:00Z"
  }
}
```

---

### 2. **Get Pumps by Station** ✅ (Already exists)
```
GET /api/v1/stations/:id/pumps
```

**Status**: Assuming this exists in your backend

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "gasStationId": 1,  // ⚠️ IMPORTANT: This must be included!
      "pumpNumber": 1,
      "mainRfidTag": "ABC123",
      "status": "LOCKED",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z",
      "lastModifiedBy": 5,
      "lastVerificationAt": "2025-01-15T14:30:00Z",
      "expectedChildTags": [
        {
          "id": 1,
          "tagId": "TAG001",
          "description": "Seal 1"
        },
        {
          "id": 2,
          "tagId": "TAG002",
          "description": "Seal 2"
        }
      ]
    }
  ]
}
```

**⚠️ CRITICAL FIX NEEDED**:
- The `gasStationId` field is currently **missing or undefined** in the pump response
- This causes "Unknown Station" to display in the pumps page
- Make sure your backend includes this field in all pump responses

---

### 3. **Get All Verifications (with station filter)** ⚠️ (Needs to support stationId filter)
```
GET /api/v1/admin/verifications/all?stationId=1&limit=50
```

**Status**: Check if your backend supports `stationId` query parameter

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "sessionId": 123,
      "pumpId": 5,
      "userId": 2,
      "result": "success",
      "message": "All seals verified successfully",
      "details": {
        "expectedCount": 8,
        "scannedCount": 8,
        "missingTags": [],
        "unexpectedTags": []
      },
      "pumpStatus": "UNLOCKED",
      "timestamp": "2025-01-15T14:30:00Z"
    },
    {
      "sessionId": 122,
      "pumpId": 3,
      "userId": 2,
      "result": "failed",
      "message": "Missing seals detected",
      "details": {
        "expectedCount": 8,
        "scannedCount": 6,
        "missingTags": ["TAG005", "TAG006"],
        "unexpectedTags": ["TAG999"]
      },
      "pumpStatus": "LOCKED",
      "timestamp": "2025-01-15T13:15:00Z"
    }
  ]
}
```

**Required Query Parameters**:
- `stationId` (number) - Filter verifications by station
- `limit` (number) - Limit number of results (default: 50)
- `page` (number, optional) - For pagination
- `result` (string, optional) - Filter by 'success' or 'failed'

---

## 🔧 Backend Implementation Checklist

### High Priority (Affects Current Features):

- [ ] **Fix `gasStationId` in Pump Response**
  - Database column: `gas_station_id` (snake_case)
  - JSON response: `gasStationId` (camelCase)
  - Make sure all endpoints returning pumps include this field

### Medium Priority (For Detail Page to Work):

- [ ] **Verification History Filtering**
  - Add `stationId` query parameter support to `/api/v1/admin/verifications/all`
  - Should return verifications for all pumps at that station
  - Join verifications with pumps table to filter by station

### Example SQL for Verification by Station:
```sql
SELECT v.*
FROM verifications v
JOIN pumps p ON v.pump_id = p.id
WHERE p.gas_station_id = $1
ORDER BY v.timestamp DESC
LIMIT $2;
```

---

## 📊 Database Column Name Mapping

Make sure your backend converts snake_case database columns to camelCase JSON:

| Database Column | JSON Field |
|----------------|------------|
| `gas_station_id` | `gasStationId` |
| `pump_number` | `pumpNumber` |
| `main_rfid_tag` | `mainRfidTag` |
| `expected_child_tags` | `expectedChildTags` |
| `last_modified_by` | `lastModifiedBy` |
| `last_verification_at` | `lastVerificationAt` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `session_id` | `sessionId` |
| `pump_id` | `pumpId` |
| `user_id` | `userId` |
| `pump_status` | `pumpStatus` |

---

## 🧪 Testing the Integration

1. **Test Station Detail Page**:
   - Navigate to: `http://localhost:3000/dashboard/stations`
   - Click on any station card
   - Should navigate to: `http://localhost:3000/dashboard/stations/{id}`

2. **Verify Overview Tab Works**:
   - Should show station info and pump statistics

3. **Verify Pumps Tab Works**:
   - Should show all pumps with their RFID tags
   - Check that child tags are displayed

4. **Verify History Tab Works**:
   - Should show verification history
   - Check that missing/unexpected tags are highlighted

---

## 🐛 Current Issues to Fix in Backend

### Issue #1: Missing `gasStationId` in Pumps Response
**Impact**: Pumps page shows "Unknown Station" instead of station name

**Fix**: Update your pump serialization to include `gasStationId`:
```javascript
// Example (Node.js)
const pump = {
  id: row.id,
  gasStationId: row.gas_station_id,  // ← Add this line
  pumpNumber: row.pump_number,
  mainRfidTag: row.main_rfid_tag,
  // ... rest of fields
};
```

### Issue #2: Verification History Filtering
**Impact**: Detail page may show all verifications instead of station-specific ones

**Fix**: Add stationId filter to your verifications endpoint:
```javascript
// Example query
const stationId = req.query.stationId;
if (stationId) {
  query += ` AND p.gas_station_id = $${params.length + 1}`;
  params.push(stationId);
}
```

---

## ✅ Summary

The frontend is complete and ready. You need to:

1. **Fix `gasStationId` in pump responses** (HIGH PRIORITY)
2. **Add station filtering to verification endpoint** (MEDIUM PRIORITY)
3. Test all endpoints with the frontend

Once these are done, the detail page will work perfectly! 🚀
