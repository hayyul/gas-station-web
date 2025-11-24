# Backend Extensions for Super Admin Dashboard

This document outlines the backend API endpoints and database changes needed to support the Super Admin web platform.

## Overview

The mobile app and web platform share the same backend API. The web platform requires additional administrative endpoints to provide super admin functionality.

## Database Schema Changes

### 1. Add Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,  -- 'CREATE', 'UPDATE', 'DELETE'
  entity_type VARCHAR(50) NOT NULL,  -- 'STATION', 'PUMP', 'USER', 'VERIFICATION'
  entity_id INTEGER NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### 2. Extend Existing Tables

```sql
-- Add tracking fields to gas_stations table
ALTER TABLE gas_stations
ADD COLUMN last_modified_by INTEGER REFERENCES users(id),
ADD COLUMN last_verification_at TIMESTAMP;

-- Add tracking fields to pumps table
ALTER TABLE pumps
ADD COLUMN last_modified_by INTEGER REFERENCES users(id),
ADD COLUMN last_verification_at TIMESTAMP;

-- Add SUPER_ADMIN role if not exists
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
```

### 3. Create View for Dashboard Stats (Optional but Recommended)

```sql
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM gas_stations) as total_stations,
  (SELECT COUNT(*) FROM pumps) as total_pumps,
  (SELECT COUNT(*) FROM gas_stations WHERE status = 'ACTIVE') as active_stations,
  (SELECT COUNT(*) FROM verifications WHERE DATE(timestamp) = CURRENT_DATE) as verifications_today_count,
  (SELECT COUNT(*) FROM verifications WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as verifications_week_count,
  (SELECT COUNT(*) FROM verifications WHERE result = 'failed' AND timestamp >= CURRENT_DATE - INTERVAL '7 days') as failed_verifications_week,
  (SELECT
    CASE
      WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE result = 'success')::FLOAT / COUNT(*)::FLOAT * 100)
      ELSE 0
    END
    FROM verifications
    WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
  ) as success_rate;
```

## Required API Endpoints

### 1. Dashboard Analytics

**Endpoint**: `GET /api/v1/admin/analytics`

**Description**: Returns dashboard statistics and metrics

**Authorization**: Requires ADMIN or SUPER_ADMIN role

**Response**:
```json
{
  "success": true,
  "data": {
    "totalStations": 5,
    "totalPumps": 25,
    "activeStations": 4,
    "verificationsTodayCount": 45,
    "verificationsWeekCount": 312,
    "failedVerificationsWeek": 12,
    "successRate": 96.15
  }
}
```

**Implementation Example (Node.js/Express)**:
```javascript
router.get('/admin/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT * FROM dashboard_stats
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});
```

### 2. Audit Logs

**Endpoint**: `GET /api/v1/admin/audit-logs`

**Description**: Returns audit log entries with filtering

**Authorization**: Requires ADMIN or SUPER_ADMIN role

**Query Parameters**:
- `page` (number, optional): Page number for pagination
- `limit` (number, optional): Results per page (default: 50)
- `action` (string, optional): Filter by action type (CREATE, UPDATE, DELETE)
- `entityType` (string, optional): Filter by entity type (STATION, PUMP, USER, VERIFICATION)
- `userId` (number, optional): Filter by user ID
- `startDate` (ISO date, optional): Filter from date
- `endDate` (ISO date, optional): Filter to date

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "userName": "John Admin",
      "action": "UPDATE",
      "entityType": "PUMP",
      "entityId": 5,
      "oldValues": { "status": "LOCKED" },
      "newValues": { "status": "UNLOCKED" },
      "ipAddress": "192.168.1.1",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Implementation Example**:
```javascript
router.get('/admin/audit-logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entityType, userId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        al.*,
        u.full_name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (action) {
      params.push(action);
      query += ` AND al.action = $${params.length}`;
    }

    if (entityType) {
      params.push(entityType);
      query += ` AND al.entity_type = $${params.length}`;
    }

    if (userId) {
      params.push(userId);
      query += ` AND al.user_id = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      query += ` AND al.created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND al.created_at <= $${params.length}`;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const logs = await db.query(query, params);

    res.json({
      success: true,
      data: logs.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});
```

### 3. All Verifications

**Endpoint**: `GET /api/v1/admin/verifications/all`

**Description**: Returns all verifications across all stations

**Authorization**: Requires ADMIN or SUPER_ADMIN role

**Query Parameters**:
- `page` (number, optional): Page number
- `limit` (number, optional): Results per page
- `result` (string, optional): Filter by result ('success' or 'failed')
- `stationId` (number, optional): Filter by station ID
- `startDate` (ISO date, optional): Filter from date
- `endDate` (ISO date, optional): Filter to date

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "sessionId": 1,
      "pumpId": 5,
      "userId": 2,
      "result": "success",
      "message": "All seals verified",
      "details": {
        "expectedCount": 8,
        "scannedCount": 8,
        "missingTags": [],
        "unexpectedTags": []
      },
      "pumpStatus": "UNLOCKED",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### 4. Station Activity Logs

**Endpoint**: `GET /api/v1/admin/stations/:id/logs`

**Description**: Returns modification history for a specific station

**Authorization**: Requires ADMIN or SUPER_ADMIN role

**Response**:
```json
{
  "success": true,
  "data": {
    "stationId": 1,
    "stationName": "Main Station",
    "lastModifiedAt": "2025-01-15T10:30:00Z",
    "lastModifiedBy": "John Admin",
    "lastVerificationAt": "2025-01-15T11:00:00Z",
    "logs": [
      {
        "id": 10,
        "action": "UPDATE",
        "field": "status",
        "oldValue": "ACTIVE",
        "newValue": "MAINTENANCE",
        "modifiedBy": "John Admin",
        "modifiedAt": "2025-01-15T10:30:00Z"
      }
    ]
  }
}
```

## Audit Logging Middleware

Create a middleware to automatically log all modifications:

```javascript
// middleware/auditLogger.js
const auditLogger = (entityType) => {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json.bind(res);

    res.json = async function(data) {
      // Only log successful modifications
      if (data.success && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        try {
          const action = req.method === 'POST' ? 'CREATE' :
                        req.method === 'PUT' ? 'UPDATE' : 'DELETE';

          const entityId = data.data?.id || req.params.id;

          await db.query(`
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            req.user.id,
            action,
            entityType,
            entityId,
            req.body.oldValues || null,
            req.body.newValues || data.data,
            req.ip
          ]);
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      }

      return originalJson(data);
    };

    next();
  };
};

// Usage
router.put('/stations/:id', requireAuth, auditLogger('STATION'), async (req, res) => {
  // Your update logic
});
```

## Update Last Verification Timestamps

Add triggers or update logic to track last verification times:

```sql
-- Trigger to update last verification timestamp
CREATE OR REPLACE FUNCTION update_last_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update pump
  UPDATE pumps
  SET last_verification_at = NEW.timestamp
  WHERE id = NEW.pump_id;

  -- Update station
  UPDATE gas_stations gs
  SET last_verification_at = NEW.timestamp
  FROM pumps p
  WHERE p.id = NEW.pump_id AND gs.id = p.gas_station_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verification_timestamp_trigger
AFTER INSERT ON verifications
FOR EACH ROW
EXECUTE FUNCTION update_last_verification();
```

## Authorization Middleware

Add super admin check middleware:

```javascript
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Super admin access required'
      }
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    });
  }
  next();
};
```

## Testing the Endpoints

Use curl or Postman to test:

```bash
# Get dashboard analytics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/admin/analytics

# Get audit logs with filters
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:4000/api/v1/admin/audit-logs?action=UPDATE&limit=10"

# Get all verifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:4000/api/v1/admin/verifications/all?result=failed"

# Get station activity logs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/admin/stations/1/logs
```

## Security Considerations

1. **Rate Limiting**: Add rate limiting to admin endpoints
2. **IP Whitelisting**: Consider IP whitelisting for super admin access
3. **Audit Log Retention**: Set up log rotation/archiving policy
4. **HTTPS Only**: Ensure all admin endpoints are HTTPS only
5. **Session Management**: Implement session timeout for admin users

## Migration Script

Create a migration file to apply all changes:

```javascript
// migrations/add_super_admin_features.js
exports.up = async (knex) => {
  // Create audit_logs table
  await knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users');
    table.string('action', 50).notNullable();
    table.string('entity_type', 50).notNullable();
    table.integer('entity_id').notNullable();
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.string('ip_address', 45);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index(['entity_type', 'entity_id']);
    table.index('created_at');
  });

  // Add tracking fields
  await knex.schema.table('gas_stations', (table) => {
    table.integer('last_modified_by').references('id').inTable('users');
    table.timestamp('last_verification_at');
  });

  await knex.schema.table('pumps', (table) => {
    table.integer('last_modified_by').references('id').inTable('users');
    table.timestamp('last_verification_at');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('audit_logs');

  await knex.schema.table('gas_stations', (table) => {
    table.dropColumn('last_modified_by');
    table.dropColumn('last_verification_at');
  });

  await knex.schema.table('pumps', (table) => {
    table.dropColumn('last_modified_by');
    table.dropColumn('last_verification_at');
  });
};
```

## Summary

After implementing these changes:

1. **Database** will track all modifications and provide analytics
2. **API** will serve super admin dashboard with new endpoints
3. **Web Platform** will have full visibility into system operations
4. **Mobile App** continues to work with existing endpoints

The changes are backwards compatible - existing endpoints remain unchanged, and new endpoints are additive.
