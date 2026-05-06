'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminAuditLogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    checkAdminAndLoad();
  }, [filter]);

  async function checkAdminAndLoad() {
    const response = await fetch('/api/admin/check');

    if (!response.ok) {
      router.push('/dashboard');
      return;
    }

    await loadLogs();
  }

  async function loadLogs() {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/audit?filter=${filter}`);

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  }

  function getEventIcon(eventType: string): string {
    const icons: Record<string, string> = {
      user_banned: '🚫',
      user_unbanned: '✅',
      content_removed: '🗑️',
      report_dismissed: '👍',
      admin_login: '🔐',
      settings_changed: '⚙️',
    };

    return icons[eventType] || '📝';
  }

  function getEventColor(eventType: string): string {
    if (eventType.includes('banned') || eventType.includes('removed')) {
      return 'text-red-600 bg-red-50';
    }
    if (eventType.includes('unbanned') || eventType.includes('dismissed')) {
      return 'text-green-600 bg-green-50';
    }
    return 'text-blue-600 bg-blue-50';
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-pink-600 hover:text-pink-700 mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600 mt-1">Track admin actions and system events</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Events</option>
            <option value="user_banned">User Bans</option>
            <option value="user_unbanned">User Unbans</option>
            <option value="content_removed">Content Removals</option>
            <option value="report_dismissed">Report Dismissals</option>
          </select>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No audit logs found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="text-2xl mr-4">{getEventIcon(log.event_type)}</div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventColor(log.event_type)}`}>
                          {log.event_type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-sm text-gray-700">
                        <p>
                          <strong>Admin:</strong> {log.user_id || 'System'}
                        </p>
                        {log.metadata && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-pink-600 hover:text-pink-700">
                              View details
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {logs.length} log entries
        </div>
      </div>
    </div>
  );
}
