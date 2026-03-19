interface ApiFieldError {
  field: string;
  message: string;
}

/**
 * Returns an array of human-readable error messages.
 * When the backend returns a validation `errors` array
 * (e.g. { errors: [{ field, message }] }) each message is a separate entry.
 * Otherwise falls back to the top-level `message` or the provided fallback.
 */
export const extractErrors = (
  err: unknown,
  fallback = 'Something went wrong.',
): string[] => {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as {
      response?: { data?: { message?: string; errors?: ApiFieldError[] } };
    };
    const data = axiosErr.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.map((e) => e.message);
    }
    return [data?.message ?? fallback];
  }
  if (err instanceof Error) return [err.message];
  return [fallback];
};

/** Convenience wrapper that returns a single joined string (for non-list uses). */
export const extractErrorMessage = (
  err: unknown,
  fallback = 'Something went wrong.',
): string => extractErrors(err, fallback).join('\n');
