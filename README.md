# Gas Station Super Admin Dashboard

A modern, responsive web platform for super administrators to monitor and manage gas stations, pumps, and RFID verification systems.

## Features

- **Dashboard Analytics**: Real-time statistics and success rates
- **Station Management**: View, search, and filter all gas stations with modification tracking
- **Pump Overview**: Monitor all pumps across all stations with detailed status information
- **Audit Logs**: Complete audit trail of all system modifications
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Data Fetching**: Native Fetch API with SWR
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at `https://nfcreaderwriterapi.onrender.com` (or your configured endpoint)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env.local` file is already configured with:

```env
NEXT_PUBLIC_API_URL=https://nfcreaderwriterapi.onrender.com/api/v1
NEXT_PUBLIC_ENV=production
```

Update these if you want to use a different backend.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Login

Use your admin credentials:
- Username: `admin`
- Password: `admin123`

## Project Structure

```
gas-station-webplatform/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── page.tsx        # Main dashboard with analytics
│   │   ├── stations/       # Stations management
│   │   ├── pumps/          # Pumps overview
│   │   └── audit-logs/     # Audit logs viewer
│   ├── login/              # Authentication
│   ├── layout.tsx          # Root layout with AuthProvider
│   └── page.tsx            # Root page (redirects to login)
├── components/
│   └── dashboard-layout.tsx # Main dashboard layout with sidebar
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   ├── api-service.ts      # API client service
│   └── auth-context.tsx    # Authentication context
├── public/                 # Static assets
└── middleware.ts           # Route protection middleware
```

## Key Features Explained

### Dashboard
- Real-time statistics for stations, pumps, and verifications
- Success rate visualization
- Quick action buttons for common tasks

### Stations Management
- Grid view of all gas stations
- Search by name or location
- Filter by status (Active, Inactive, Maintenance)
- View last modification and verification timestamps

### Pumps Overview
- Table view of all pumps across all stations
- Multiple filters (station, status, search)
- Real-time status indicators
- Last verification tracking

### Audit Logs
- Complete audit trail of all modifications
- Expandable log entries showing old/new values
- Filter by action type and entity type
- User and IP tracking

## API Integration

The platform connects to your existing backend API. The API service (`lib/api-service.ts`) provides methods for:

- Authentication (login, logout, get current user)
- Station management (CRUD operations)
- Pump management (CRUD operations)
- Verification history
- Admin analytics
- Audit logs

## Backend Extensions Required

For full functionality, your backend needs these additional endpoints. See `BACKEND_EXTENSIONS.md` for detailed implementation.

**Required Endpoints:**
- `GET /api/v1/admin/analytics` - Dashboard statistics
- `GET /api/v1/admin/audit-logs` - Audit log entries
- `GET /api/v1/admin/verifications/all` - All verifications
- `GET /api/v1/admin/stations/:id/logs` - Station activity logs

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
Build the production bundle:
```bash
npm run build
```

Deploy the `.next` directory to your hosting provider.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://nfcreaderwriterapi.onrender.com/api/v1` |
| `NEXT_PUBLIC_ENV` | Environment name | `production` |

## Security

- JWT token-based authentication
- Tokens stored in localStorage
- Protected routes with middleware
- Role-based access control (ADMIN, SUPER_ADMIN)
- Secure API communication over HTTPS

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Learn More

To learn more about Next.js:
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## License

Proprietary - All rights reserved
