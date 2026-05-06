'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminModerationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const response = await fetch('/api/admin/check');

    if (!response.ok) {
      router.push('/dashboard');
      return;
    }

    await loadReports();
  }

  async function loadReports() {
    setLoading(true);

    try {
      const response = await fetch('/api/admin/moderation/reports');

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(reportId: string, action: 'approve' | 'reject') {
    try {
      const response = await fetch('/api/admin/moderation/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      });

      if (response.ok) {
        await loadReports();
      } else {
        alert('Failed to resolve report');
      }
    } catch (error) {
      console.error('Resolve error:', error);
      alert('Failed to resolve report');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-pink-600 hover:text-pink-700 mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Moderation Queue</h1>
          <p className="text-gray-600 mt-1">Review and moderate reported content</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-600">No pending reports</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          {report.reason}
                        </span>
                        <span className="text-xs text-gray-500">
                          Reported {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Content ID:</strong> {report.content_id}
                        </p>
                        {report.reporter_id && (
                          <p className="text-sm text-gray-700">
                            <strong>Reporter:</strong> {report.reporter_id}
                          </p>
                        )}
                      </div>

                      {report.content && (
                        <div className="mb-4">
                          <img
                            src={report.content.file_url}
                            alt="Reported content"
                            className="max-w-xs rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        onClick={() => handleResolve(report.id, 'reject')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        Remove Content
                      </button>
                      <button
                        onClick={() => handleResolve(report.id, 'approve')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        Dismiss Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
