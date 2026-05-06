'use client';

import { useEffect, useState } from 'react';

interface UploadProgressProps {
  file: File;
  onComplete: (url: string) => void;
  onError: (error: string) => void;
  bucket: string;
  path?: string;
}

export default function UploadProgress({
  file,
  onComplete,
  onError,
  bucket,
  path = '',
}: UploadProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'uploading' | 'success' | 'error'>('uploading');

  useEffect(() => {
    uploadFile();
  }, [file]);

  async function uploadFile() {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      formData.append('path', path);

      // Create XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setStatus('success');
          setProgress(100);
          onComplete(response.url);
        } else {
          const error = JSON.parse(xhr.responseText);
          setStatus('error');
          onError(error.message || 'Upload failed');
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setStatus('error');
        onError('Network error during upload');
      });

      xhr.addEventListener('abort', () => {
        setStatus('error');
        onError('Upload cancelled');
      });

      // Send request
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (err: any) {
      setStatus('error');
      onError(err.message || 'Upload failed');
    }
  }

  return (
    <div className="space-y-2">
      {/* File info */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 truncate flex-1">
          {file.name}
        </span>
        <span className="text-gray-500 ml-2">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            status === 'success'
              ? 'bg-green-500'
              : status === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-xs">
        <span
          className={
            status === 'success'
              ? 'text-green-600'
              : status === 'error'
              ? 'text-red-600'
              : 'text-blue-600'
          }
        >
          {status === 'uploading' && `Uploading... ${progress}%`}
          {status === 'success' && '✓ Upload complete'}
          {status === 'error' && '✗ Upload failed'}
        </span>

        {status === 'uploading' && (
          <span className="text-gray-500">
            {Math.round((file.size * progress) / 100 / 1024)} KB / {Math.round(file.size / 1024)} KB
          </span>
        )}
      </div>
    </div>
  );
}
