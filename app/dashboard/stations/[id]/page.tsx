'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard-layout';
import { ApiService } from '@/lib/api-service';
import { GasStation, Pump, VerificationResponse } from '@/lib/types';
import {
  Building2,
  MapPin,
  Clock,
  ArrowLeft,
  Fuel,
  Hash,
  Lock,
  Unlock,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  XCircle,
  Calendar,
  Tag,
} from 'lucide-react';
import { format } from 'date-fns';

export default function StationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const stationId = parseInt(params.id as string);

  const [station, setStation] = useState<GasStation | null>(null);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [verifications, setVerifications] = useState<VerificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'pumps' | 'history'>('overview');

  useEffect(() => {
    loadStationData();
  }, [stationId]);

  const loadStationData = async () => {
    setLoading(true);

    // Load station details
    const stationResponse = await ApiService.getStation(stationId);
    if (stationResponse.success && stationResponse.data) {
      setStation(stationResponse.data);
    }

    // Load pumps for this station
    const pumpsResponse = await ApiService.getPumpsByStation(stationId);
    if (pumpsResponse.success && pumpsResponse.data) {
      setPumps(pumpsResponse.data);
    }

    // Load verification history for this station
    const verificationsResponse = await ApiService.getAllVerifications({
      stationId,
      limit: 50,
    });
    if (verificationsResponse.success && verificationsResponse.data) {
      setVerifications(verificationsResponse.data);
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || styles.INACTIVE;
  };

  const getPumpStatusIcon = (status: string) => {
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

  const getPumpStatusBadge = (status: string) => {
    const styles = {
      LOCKED: 'bg-red-100 text-red-800',
      UNLOCKED: 'bg-green-100 text-green-800',
      BROKEN: 'bg-orange-100 text-orange-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || styles.LOCKED;
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

  if (!station) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Station not found</h2>
          <button
            onClick={() => router.push('/dashboard/stations')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Stations
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/stations')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{station.name}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{station.location}</span>
              </div>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(station.status)}`}
          >
            {station.status}
          </span>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('pumps')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pumps'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pumps ({pumps.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Verification History ({verifications.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Station Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Station Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Station ID:</span>
                  <span className="font-mono font-medium text-gray-900">#{station.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(station.status)}`}
                  >
                    {station.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pumps:</span>
                  <span className="font-medium text-gray-900">{pumps.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(station.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(station.updatedAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                {station.lastVerificationAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Verification:</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(station.lastVerificationAt), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Unlocked</span>
                    <Unlock className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {pumps.filter((p) => p.status === 'UNLOCKED').length}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Locked</span>
                    <Lock className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {pumps.filter((p) => p.status === 'LOCKED').length}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Broken</span>
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {pumps.filter((p) => p.status === 'BROKEN').length}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Maintenance</span>
                    <Wrench className="h-5 w-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pumps.filter((p) => p.status === 'MAINTENANCE').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pumps' && (
          <div className="space-y-4">
            {pumps.map((pump) => (
              <div
                key={pump.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-50 rounded-lg mr-4">
                      <Fuel className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Pump #{pump.pumpNumber}
                      </h4>
                      <p className="text-sm text-gray-500">ID: {pump.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getPumpStatusIcon(pump.status)}
                    <span
                      className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPumpStatusBadge(pump.status)}`}
                    >
                      {pump.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Main RFID Tag:</span>
                    <span className="ml-2 text-sm font-mono font-medium text-gray-900">
                      {pump.mainRfidTag}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Updated:</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {format(new Date(pump.updatedAt), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                </div>

                {pump.expectedChildTags && pump.expectedChildTags.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      Expected Child Tags ({pump.expectedChildTags.length})
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {pump.expectedChildTags.map((tag, idx) => (
                        <div
                          key={`pump-${pump.id}-tag-${tag.id || tag.tagId}-${idx}`}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-mono font-medium text-gray-900">
                              {tag.tagId}
                            </p>
                            <p className="text-xs text-gray-600">{tag.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pump.lastVerificationAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Last verified:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {format(new Date(pump.lastVerificationAt), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {pumps.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pumps found</h3>
                <p className="text-gray-600">This station doesn't have any pumps yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {verifications.map((verification) => (
              <div
                key={verification.sessionId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {verification.result === 'success' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 mr-3" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 mr-3" />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {verification.message}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Session #{verification.sessionId}
                        {verification.pumpId && ` • Pump #${verification.pumpId}`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      verification.result === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {verification.result.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Expected Tags</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {verification.details?.expectedCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Scanned Tags</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {verification.details?.scannedCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Missing Tags</p>
                    <p className="text-lg font-semibold text-red-600">
                      {verification.details?.missingTags?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Unexpected Tags</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {verification.details?.unexpectedTags?.length || 0}
                    </p>
                  </div>
                </div>

                {((verification.details?.missingTags?.length || 0) > 0 ||
                  (verification.details?.unexpectedTags?.length || 0) > 0) && (
                  <div className="space-y-3 mb-4">
                    {(verification.details?.missingTags?.length || 0) > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Missing Tags:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {verification.details?.missingTags?.map((tag, idx) => (
                            <span
                              key={`missing-${verification.sessionId}-${tag}-${idx}`}
                              className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(verification.details?.unexpectedTags?.length || 0) > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Unexpected Tags:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {verification.details?.unexpectedTags?.map((tag, idx) => (
                            <span
                              key={`unexpected-${verification.sessionId}-${tag}-${idx}`}
                              className="inline-flex items-center px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {format(new Date(verification.timestamp), 'MMM d, yyyy HH:mm:ss')}
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Pump Status:</span>
                    <span
                      className={`font-medium ${
                        verification.pumpStatus === 'LOCKED'
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {verification.pumpStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {verifications.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No verification history
                </h3>
                <p className="text-gray-600">
                  No verifications have been performed at this station yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
