// URL detection regex (matches http:// and https:// URLs)
const URL_REGEX = /https?:\/\/[^\s]+/gi;

/**
 * Strip links from message if user is on trial
 *
 * @param message - Original message content
 * @param userStatus - User's subscription status (trial, active, cancelled)
 * @returns Message with links removed if trial, otherwise original message
 */
export function stripLinksForTrial(
  message: string,
  userStatus: string
): string {
  if (userStatus === 'trial') {
    return message.replace(URL_REGEX, '[link removed]');
  }
  return message;
}

/**
 * Check if message contains any URLs
 *
 * @param message - Message content to check
 * @returns true if message contains URLs, false otherwise
 */
export function hasLinks(message: string): boolean {
  return URL_REGEX.test(message);
}

/**
 * Count number of URLs in message
 *
 * @param message - Message content to check
 * @returns Number of URLs found
 */
export function countLinks(message: string): number {
  const matches = message.match(URL_REGEX);
  return matches ? matches.length : 0;
}
