import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, orderBy, limit, addDoc, deleteDoc, serverTimestamp, writeBatch, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { User, NewsItem, Category, Poll, AutoPilotConfig, AutoPilotLog, AutoPilotStats } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Error Handling
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Auth helpers
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists, if not create it
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const newUser: User = {
        id: user.uid,
        name: user.displayName || 'Anonymous User',
        email: user.email || '',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        role: user.email === 'rajendarrana732@gmail.com' ? 'admin' : 'user',
        earnings: 0
      };
      const path = `users/${user.uid}`;
      try {
        await setDoc(userDocRef, {
          ...newUser,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
      return newUser;
    }
    
    return userDoc.data() as User;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

// Firestore helpers
export const fetchNewsFeed = (callback: (news: NewsItem[]) => void) => {
  const path = 'news';
  const newsRef = collection(db, path);
  const q = query(newsRef, where('status', '==', 'published'), orderBy('publishedTime', 'desc'), limit(20));
  
  return onSnapshot(q, (snapshot) => {
    const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
    callback(news);
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const fetchPolls = (callback: (polls: Poll[]) => void) => {
  const path = 'polls';
  const pollsRef = collection(db, path);
  const q = query(pollsRef, orderBy('createdAt', 'desc'), limit(5));
  
  return onSnapshot(q, (snapshot) => {
    const polls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll));
    callback(polls);
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const saveNews = async (news: NewsItem, userId: string) => {
  const path = `news/${news.id}`;
  try {
    const newsRef = doc(db, 'news', news.id);
    await setDoc(newsRef, {
      ...news,
      authorId: userId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const toggleBookmark = async (userId: string, newsItem: NewsItem, isBookmarked: boolean) => {
  const path = `users/${userId}/bookmarks/${newsItem.id}`;
  const bookmarkRef = doc(db, 'users', userId, 'bookmarks', newsItem.id);
  try {
    if (isBookmarked) {
      await deleteDoc(bookmarkRef);
    } else {
      await setDoc(bookmarkRef, {
        userId,
        newsId: newsItem.id,
        title: newsItem.title,
        imageUrl: newsItem.imageUrl,
        category: newsItem.category,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, isBookmarked ? OperationType.DELETE : OperationType.WRITE, path);
  }
};

export const fetchBookmarks = (userId: string, callback: (news: NewsItem[]) => void) => {
  const path = `users/${userId}/bookmarks`;
  const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
  const q = query(bookmarksRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.newsId,
        title: data.title,
        imageUrl: data.imageUrl,
        category: data.category
      } as any;
    });
    callback(list);
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const castVote = async (pollId: string, userId: string, optionIndex: number, currentPoll: Poll) => {
  const path = `polls/${pollId}/votes/${userId}`;
  const voteRef = doc(db, 'polls', pollId, 'votes', userId);
  
  try {
    const voteDoc = await getDoc(voteRef);
    if (voteDoc.exists()) return; // Already voted
    
    const batch = writeBatch(db);
    const pollRef = doc(db, 'polls', pollId);
    const newOptions = [...currentPoll.options];
    newOptions[optionIndex].votes += 1;
    
    batch.update(pollRef, { options: newOptions });
    batch.set(voteRef, { optionIndex, votedAt: serverTimestamp() });
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// Auto Pilot functions
export const fetchAutoPilotConfig = (callback: (config: AutoPilotConfig) => void) => {
  const path = 'autoPilot/config';
  return onSnapshot(doc(db, path), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as AutoPilotConfig);
    }
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const saveAutoPilotConfig = async (config: AutoPilotConfig) => {
  const path = 'autoPilot/config';
  try {
    await setDoc(doc(db, path), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchAutoPilotLogs = (callback: (logs: AutoPilotLog[]) => void) => {
  const path = 'autoPilot/logs';
  const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AutoPilotLog));
    callback(logs);
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const fetchAutoPilotStats = (callback: (stats: AutoPilotStats) => void) => {
  const path = 'autoPilot/stats';
  return onSnapshot(doc(db, path), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as AutoPilotStats);
    }
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const addAutoPilotLog = async (action: AutoPilotLog['action'], message: string, details?: string) => {
  const path = 'autoPilot/logs';
  try {
    await addDoc(collection(db, path), {
      action,
      message,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateAutoPilotStats = async (update: Partial<AutoPilotStats>) => {
  const path = 'autoPilot/stats';
  try {
    const statsRef = doc(db, path);
    const statsDoc = await getDoc(statsRef);
    if (statsDoc.exists()) {
      await updateDoc(statsRef, update);
    } else {
      await setDoc(statsRef, {
        todayPosts: 0,
        successCount: 0,
        failedCount: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        ...update
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
