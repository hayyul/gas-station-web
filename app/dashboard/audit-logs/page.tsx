'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { ApiService } from '@/lib/api-service';
import { AuditLog } from '@/lib/types';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const response = await ApiService.getAuditLogs();
    if (response.success && response.data) {
      setLogs(response.data);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toString().includes(searchQuery) ||
      log.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="h-5 w-5 text-green-600" />;
      case 'UPDATE':
        return <Edit2 className="h-5 w-5 text-blue-600" />;
      case 'DELETE':
        return <Trash2 className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    const styles = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
    };
    return styles[action as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getEntityBadge = (entityType: string) => {
    const styles = {
      STATION: 'bg-purple-100 text-purple-800',
      PUMP: 'bg-indigo-100 text-indigo-800',
      USER: 'bg-orange-100 text-orange-800',
      VERIFICATION: 'bg-cyan-100 text-cyan-800',
    };
    return styles[entityType as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const toggleLogExpansion = (logId: number) => {
    setExpandedLog(expandedLog === logId ? null : logId);
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
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-gray-600">
            Track all system modifications and user activities
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
                placeholder="Search by user, entity ID, or IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>

            {/* Entity Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="STATION">Station</option>
                <option value="PUMP">Pump</option>
                <option value="USER">User</option>
                <option value="VERIFICATION">Verification</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => toggleLogExpansion(log.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Action Icon */}
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {getActionIcon(log.action)}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}
                        >
                          {log.action}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEntityBadge(log.entityType)}`}
                        >
                          {log.entityType}
                        </span>
                        <span className="text-sm text-gray-600">
                          Entity ID: <span className="font-mono">#{log.entityId}</span>
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium text-gray-900">
                          {log.userName || `User #${log.userId}`}
                        </span>
                        {log.ipAddress && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="font-mono">{log.ipAddress}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      {expandedLog === log.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedLog === log.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {log.oldValues && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Old Values:
                        </h4>
                        <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
                          {JSON.stringify(log.oldValues, null, 2)}
                        </pre>
                      </div>
                    )}

                    {log.newValues && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          New Values:
                        </h4>
                        <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
                          {JSON.stringify(log.newValues, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Audit Log ID: {log.id}</span>
                      <span>User ID: {log.userId}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No audit logs found
            </h3>
            <p className="text-gray-600">
              {searchQuery || actionFilter !== 'all' || entityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Audit logs will appear here as users make changes'}
            </p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Creates</p>
              <p className="text-2xl font-bold text-green-600">
                {logs.filter((l) => l.action === 'CREATE').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updates</p>
              <p className="text-2xl font-bold text-blue-600">
                {logs.filter((l) => l.action === 'UPDATE').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deletes</p>
              <p className="text-2xl font-bold text-red-600">
                {logs.filter((l) => l.action === 'DELETE').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
