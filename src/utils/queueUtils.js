/**
 * Reusable utility to calculate wait time and tokens ahead in a queue system.
 * 
 * @param {Array} tokenList - The full list of tokens
 * @param {Object|string} currentUserToken - The user's token (object or ID)
 * @param {number} avgServiceTime - Average service time in minutes (default: 5)
 * @returns {Object} { tokensAhead: number, estimatedWaitTime: number }
 */
export const calculateWaitTime = (tokenList, currentUserToken, avgServiceTime = 5) => {
  if (!tokenList || !currentUserToken) {
    return { tokensAhead: 0, estimatedWaitTime: 0 };
  }

  const tokenId = typeof currentUserToken === 'object' ? currentUserToken.id : currentUserToken;
  const userIndex = tokenList.findIndex(t => (t.id || t.tokenNumber) === tokenId);

  if (userIndex === -1) {
    return { tokensAhead: 0, estimatedWaitTime: 0 };
  }

  // Tokens ahead are those that are NOT 'completed' or 'missed' and appear BEFORE the user's token
  const tokensAhead = tokenList
    .slice(0, userIndex)
    .filter(t => t.status === 'waiting' || t.status === 'serving').length;

  const estimatedWaitTime = tokensAhead * avgServiceTime;

  return {
    tokensAhead,
    estimatedWaitTime
  };
};

/**
 * Formats minutes into a readable string.
 */
export const formatWaitTimeLabel = (minutes) => {
  if (minutes === 0) return 'Your turn is next!';
  if (minutes < 60) return `${minutes} mins`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
