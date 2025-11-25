'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard-layout';
import { ApiService } from '@/lib/api-service';
import { DashboardStats } from '@/lib/types';
import {
  Building2,
  Fuel,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const response = await ApiService.getDashboardStats();
    if (response.success && response.data) {
      setStats(response.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      name: 'Total Stations',
      value: stats?.totalStations || 0,
      icon: Building2,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total Pumps',
      value: stats?.totalPumps || 0,
      icon: Fuel,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Active Stations',
      value: stats?.activeStations || 0,
      icon: Activity,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Verifications Today',
      value: stats?.verificationsTodayCount || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'This Week',
      value: stats?.verificationsWeekCount || 0,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      name: 'Failed This Week',
      value: stats?.failedVerificationsWeek || 0,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of your gas station management system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Success Rate Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Verification Success Rate (This Week)
          </h3>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">
                  {stats?.successRate?.toFixed(1) || '0.0'}%
                </span>
                <span className="ml-2 text-sm text-gray-600">success rate</span>
              </div>
              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-200">
                    <div
                      style={{ width: `${stats?.successRate || 0}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>
                  {stats?.verificationsWeekCount || 0} total verifications
                </span>
                <span>{stats?.failedVerificationsWeek || 0} failed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/stations"
              prefetch={false}
              className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Manage Stations
            </Link>
            <Link
              href="/dashboard/pumps"
              prefetch={false}
              className="flex items-center justify-center px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
            >
              <Fuel className="h-5 w-5 mr-2" />
              Manage Pumps
            </Link>
            <Link
              href="/dashboard/audit-logs"
              prefetch={false}
              className="flex items-center justify-center px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
            >
              <Activity className="h-5 w-5 mr-2" />
              View Audit Logs
            </Link>
            <button
              onClick={loadStats}
              className="flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Refresh Stats
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
