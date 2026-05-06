/**
 * Standardized error messages for better UX
 */

export type ErrorCode =
  | 'AUTH_REQUIRED'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'UPLOAD_FAILED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'RATE_LIMIT'
  | 'UPGRADE_REQUIRED';

interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
}

export const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  AUTH_REQUIRED: {
    title: 'Authentication Required',
    message: 'You need to be logged in to access this feature.',
    action: 'Please log in to continue',
  },
  PERMISSION_DENIED: {
    title: 'Permission Denied',
    message: 'You don\'t have permission to perform this action.',
    action: 'Contact support if you believe this is an error',
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The content you\'re looking for doesn\'t exist or has been removed.',
    action: 'Go back to home page',
  },
  VALIDATION_ERROR: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    action: 'Review the form fields highlighted in red',
  },
  UPLOAD_FAILED: {
    title: 'Upload Failed',
    message: 'There was a problem uploading your file.',
    action: 'Please try again with a different file or check your connection',
  },
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Check your internet connection.',
    action: 'Try again in a few moments',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Our team has been notified.',
    action: 'Please try again later',
  },
  RATE_LIMIT: {
    title: 'Too Many Requests',
    message: 'You\'re doing that too quickly. Please slow down.',
    action: 'Wait a few moments before trying again',
  },
  UPGRADE_REQUIRED: {
    title: 'Upgrade Required',
    message: 'This feature is only available for paid subscribers.',
    action: 'Upgrade to FeetFans Pro for $9/month',
  },
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: ErrorCode): ErrorMessage {
  return ERROR_MESSAGES[code];
}

/**
 * Parse Supabase error into friendly message
 */
export function parseSupabaseError(error: any): ErrorMessage {
  // Auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return {
      title: 'Login Failed',
      message: 'Invalid email or password.',
      action: 'Double-check your credentials and try again',
    };
  }

  if (error.message?.includes('Email not confirmed')) {
    return {
      title: 'Email Not Verified',
      message: 'Please verify your email address before logging in.',
      action: 'Check your inbox for the verification link',
    };
  }

  if (error.message?.includes('User already registered')) {
    return {
      title: 'Email Already Exists',
      message: 'This email is already registered.',
      action: 'Try logging in instead or use a different email',
    };
  }

  // Database errors
  if (error.code === 'PGRST116') {
    return ERROR_MESSAGES.NOT_FOUND;
  }

  if (error.code === '23505') {
    return {
      title: 'Duplicate Entry',
      message: 'This item already exists.',
      action: 'Try a different value',
    };
  }

  if (error.code === '23503') {
    return {
      title: 'Invalid Reference',
      message: 'The referenced item doesn\'t exist.',
      action: 'Please refresh and try again',
    };
  }

  // Storage errors
  if (error.message?.includes('storage')) {
    return ERROR_MESSAGES.UPLOAD_FAILED;
  }

  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Generic fallback
  return {
    title: 'Error',
    message: error.message || 'An unexpected error occurred.',
    action: 'Please try again or contact support if the problem persists',
  };
}

/**
 * Format error for display
 */
export function formatError(errorCode: ErrorCode | any): string {
  let errorMsg: ErrorMessage;

  if (typeof errorCode === 'string' && errorCode in ERROR_MESSAGES) {
    errorMsg = ERROR_MESSAGES[errorCode as ErrorCode];
  } else {
    errorMsg = parseSupabaseError(errorCode);
  }

  return `${errorMsg.title}: ${errorMsg.message}${errorMsg.action ? ` — ${errorMsg.action}` : ''}`;
}
