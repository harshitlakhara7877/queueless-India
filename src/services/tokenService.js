import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Collection reference
const TOKENS_COLLECTION = 'tokens';

/**
 * Creates a new token for a user in a specific queue.
 * @param {string} userId - The ID of the authenticated user
 * @param {string} queueId - The ID of the queue they are joining
 * @param {string} tokenNumber - The assigned token number (e.g. A-415)
 * @returns {Promise<string>} The document ID of the newly created token
 */
export const createToken = async (userId, queueId, tokenNumber) => {
  try {
    const tokensRef = collection(db, TOKENS_COLLECTION);
    const newToken = {
      userId,
      queueId,
      tokenNumber,
      status: 'waiting', // waiting, completed, missed
      timestamp: serverTimestamp()
    };
    
    const docRef = await addDoc(tokensRef, newToken);
    return docRef.id;
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
};

/**
 * Fetches all tokens for a specific user.
 * @param {string} userId - The ID of the authenticated user
 * @returns {Promise<Array>} Array of token objects
 */
export const getUserTokens = async (userId) => {
  try {
    const tokensRef = collection(db, TOKENS_COLLECTION);
    // Note: requires a composite index in Firestore for userId + timestamp
    const q = query(
      tokensRef, 
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const tokens = [];
    querySnapshot.forEach((doc) => {
      tokens.push({ id: doc.id, ...doc.data() });
    });
    
    return tokens;
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    throw error;
  }
};

/**
 * Updates the status of an existing token.
 * @param {string} tokenId - The Firestore document ID of the token
 * @param {string} status - The new status ('waiting', 'completed', 'missed')
 * @returns {Promise<void>}
 */
export const updateTokenStatus = async (tokenId, status) => {
  try {
    const tokenRef = doc(db, TOKENS_COLLECTION, tokenId);
    await updateDoc(tokenRef, {
      status: status
    });
  } catch (error) {
    console.error("Error updating token status:", error);
    throw error;
  }
};

/**
 * Deletes a token.
 * @param {string} tokenId - The Firestore document ID of the token
 * @returns {Promise<void>}
 */
export const deleteToken = async (tokenId) => {
  try {
    const tokenRef = doc(db, TOKENS_COLLECTION, tokenId);
    await deleteDoc(tokenRef);
  } catch (error) {
    console.error("Error deleting token:", error);
    throw error;
  }
};
