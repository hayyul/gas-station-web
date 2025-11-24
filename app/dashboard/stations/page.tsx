'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard-layout';
import { ApiService } from '@/lib/api-service';
import { GasStation } from '@/lib/types';
import {
  Building2,
  MapPin,
  Clock,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function StationsPage() {
  const router = useRouter();
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    setLoading(true);
    const response = await ApiService.getAllStations();
    if (response.success && response.data) {
      setStations(response.data);
    }
    setLoading(false);
  };

  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || station.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'INACTIVE':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      case 'MAINTENANCE':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || styles.INACTIVE;
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gas Stations</h1>
            <p className="mt-2 text-gray-600">
              Manage all gas stations and view their status
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            Add Station
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stations by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredStations.map((station) => (
            <div
              key={station.id}
              onClick={() => router.push(`/dashboard/stations/${station.id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {station.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(station.status)}`}
                      >
                        {station.status}
                      </span>
                    </div>
                  </div>
                  {getStatusIcon(station.status)}
                </div>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{station.location}</span>
                </div>

                {/* Metadata */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Station ID:</span>
                    <span className="font-mono font-medium text-gray-900">
                      #{station.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Created:
                    </span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(station.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Updated:
                    </span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(station.updatedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {station.lastVerificationAt && (
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Last Verification:</span>
                      <span className="font-medium text-gray-900">
                        {format(new Date(station.lastVerificationAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement edit functionality
                    }}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement delete functionality
                    }}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredStations.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No stations found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first gas station'}
            </p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Stations</p>
              <p className="text-2xl font-bold text-gray-900">{stations.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {stations.filter((s) => s.status === 'ACTIVE').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-400">
                {stations.filter((s) => s.status === 'INACTIVE').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stations.filter((s) => s.status === 'MAINTENANCE').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
