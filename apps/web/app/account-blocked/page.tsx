export default function AccountBlockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Account Blocked
        </h1>

        <p className="text-gray-700 mb-4">
          You must be 18 years or older to use this platform.
        </p>

        <p className="text-sm text-gray-600">
          Your account has been blocked because age verification indicates you do not meet
          the minimum age requirement. If you believe this is an error, please contact support.
        </p>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            This decision is final and cannot be appealed through the platform.
            For questions, email: support@feetfans.com
          </p>
        </div>
      </div>
    </div>
  );
}
