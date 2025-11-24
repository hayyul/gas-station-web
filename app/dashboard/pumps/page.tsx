'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { ApiService } from '@/lib/api-service';
import { Pump, GasStation } from '@/lib/types';
import {
  Fuel,
  Search,
  Filter,
  Lock,
  Unlock,
  AlertTriangle,
  Wrench,
  Hash,
  Building2,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export default function PumpsPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load all stations first
    const stationsResponse = await ApiService.getAllStations();
    if (stationsResponse.success && stationsResponse.data) {
      setStations(stationsResponse.data);

      // Load pumps for all stations
      const allPumps: Pump[] = [];
      for (const station of stationsResponse.data) {
        const pumpsResponse = await ApiService.getPumpsByStation(station.id);
        if (pumpsResponse.success && pumpsResponse.data) {
          allPumps.push(...pumpsResponse.data);
        }
      }
      setPumps(allPumps);
    }

    setLoading(false);
  };

  const filteredPumps = pumps.filter((pump) => {
    const matchesSearch =
      pump.pumpNumber.toString().includes(searchQuery) ||
      pump.mainRfidTag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || pump.status === statusFilter;

    const matchesStation =
      stationFilter === 'all' || pump.gasStationId.toString() === stationFilter;

    return matchesSearch && matchesStatus && matchesStation;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LOCKED':
        return <Lock className="h-5 w-5 text-red-600" />;
      case 'UNLOCKED':
        return <Unlock className="h-5 w-5 text-green-600" />;
      case 'BROKEN':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'MAINTENANCE':
        return <Wrench className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      LOCKED: 'bg-red-100 text-red-800',
      UNLOCKED: 'bg-green-100 text-green-800',
      BROKEN: 'bg-orange-100 text-orange-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || styles.LOCKED;
  };

  const getStationName = (stationId: number | undefined) => {
    if (!stationId) return 'Unknown Station';
    const station = stations.find((s) => s.id === stationId);
    return station?.name || `Station #${stationId}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pumps</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage all pumps across all stations
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by pump number or RFID tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Station Filter */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Stations</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id.toString()}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="LOCKED">Locked</option>
                <option value="UNLOCKED">Unlocked</option>
                <option value="BROKEN">Broken</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pumps Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pump
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Station
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFID Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child Tags
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPumps.map((pump) => (
                  <tr key={pump.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-50 rounded-lg mr-3">
                          <Fuel className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Pump #{pump.pumpNumber}
                          </div>
                          <div className="text-xs text-gray-500">ID: {pump.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getStationName(pump.gasStationId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-mono text-gray-900">
                          {pump.mainRfidTag}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(pump.status)}
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(pump.status)}`}
                        >
                          {pump.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(pump.updatedAt), 'MMM d, yyyy HH:mm')}
                      </div>
                      {pump.lastVerificationAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Last verified:{' '}
                          {format(new Date(pump.lastVerificationAt), 'MMM d, yyyy')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {pump.expectedChildTags?.length || 0} tags
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredPumps.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pumps found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' || stationFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No pumps available in the system'}
            </p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Pumps</p>
              <p className="text-2xl font-bold text-gray-900">{pumps.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Locked</p>
              <p className="text-2xl font-bold text-red-600">
                {pumps.filter((p) => p.status === 'LOCKED').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unlocked</p>
              <p className="text-2xl font-bold text-green-600">
                {pumps.filter((p) => p.status === 'UNLOCKED').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Broken</p>
              <p className="text-2xl font-bold text-orange-600">
                {pumps.filter((p) => p.status === 'BROKEN').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pumps.filter((p) => p.status === 'MAINTENANCE').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
