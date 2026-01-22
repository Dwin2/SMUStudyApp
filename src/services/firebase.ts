import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { User, SurveyResponse, AppEvent, StudyGroup, StudyPhase } from '../types';
import { APP_CONFIG } from '../constants';

// Firebase configuration - Replace with your own config
// const firebaseConfig = {
//   apiKey: 'YOUR_API_KEY',
//   authDomain: 'YOUR_PROJECT.firebaseapp.com',
//   projectId: 'YOUR_PROJECT_ID',
//   storageBucket: 'YOUR_PROJECT.appspot.com',
//   messagingSenderId: 'YOUR_SENDER_ID',
//   appId: 'YOUR_APP_ID',
// };

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATDMBErGvF6ba9PAsaE_n9JyAnxCz1b-Y",
  authDomain: "smustudyapp.firebaseapp.com",
  projectId: "smustudyapp",
  storageBucket: "smustudyapp.firebasestorage.app",
  messagingSenderId: "157318881338",
  appId: "1:157318881338:web:02882c03a4f731a1c71503",
  measurementId: "G-PMYC4LEN4X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Auth Functions
export const signInAnonymousUser = async (): Promise<FirebaseUser> => {
  const result = await signInAnonymously(auth);
  return result.user;
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User Functions
export const createUser = async (
  userId: string,
  participantId: string,
  group: StudyGroup,
  settings: User['settings']
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userData: Omit<User, 'id'> = {
    participantId,
    group,
    createdAt: new Date(),
    settings,
    studyPhase: 'onboarding',
    studyStartDate: null,
    baselineCompletedAt: null,
    endlineCompletedAt: null,
  };
  await setDoc(userRef, {
    ...userData,
    createdAt: Timestamp.fromDate(userData.createdAt),
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    id: userSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    studyStartDate: data.studyStartDate?.toDate() || null,
    baselineCompletedAt: data.baselineCompletedAt?.toDate() || null,
    endlineCompletedAt: data.endlineCompletedAt?.toDate() || null,
  } as User;
};

export const updateUser = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const updateData: Record<string, any> = { ...updates };

  // Convert dates to Timestamps
  if (updates.studyStartDate) {
    updateData.studyStartDate = Timestamp.fromDate(updates.studyStartDate);
  }
  if (updates.baselineCompletedAt) {
    updateData.baselineCompletedAt = Timestamp.fromDate(updates.baselineCompletedAt);
  }
  if (updates.endlineCompletedAt) {
    updateData.endlineCompletedAt = Timestamp.fromDate(updates.endlineCompletedAt);
  }

  await updateDoc(userRef, updateData);
};

export const updateUserPhase = async (
  userId: string,
  phase: StudyPhase
): Promise<void> => {
  await updateUser(userId, { studyPhase: phase });
};

export const updateUserSettings = async (
  userId: string,
  settings: Partial<User['settings']>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const currentSettings = userSnap.data().settings || {};
  await updateDoc(userRef, {
    settings: { ...currentSettings, ...settings },
  });
};

// Response Functions
export const saveResponse = async (
  userId: string,
  response: Omit<SurveyResponse, 'id' | 'userId'>
): Promise<string> => {
  const responsesRef = collection(db, 'users', userId, 'responses');
  const docRef = await addDoc(responsesRef, {
    ...response,
    timestamp: Timestamp.fromDate(response.timestamp),
  });
  return docRef.id;
};

export const getResponses = async (
  userId: string,
  type?: SurveyResponse['type']
): Promise<SurveyResponse[]> => {
  const responsesRef = collection(db, 'users', userId, 'responses');
  let q = query(responsesRef, orderBy('timestamp', 'desc'));

  if (type) {
    q = query(responsesRef, where('type', '==', type), orderBy('timestamp', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    userId,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate() || new Date(),
  })) as SurveyResponse[];
};

export const getTodayResponseCount = async (userId: string): Promise<number> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const responsesRef = collection(db, 'users', userId, 'responses');
  const q = query(
    responsesRef,
    where('timestamp', '>=', Timestamp.fromDate(today)),
    where('timestamp', '<', Timestamp.fromDate(tomorrow)),
    where('type', 'in', ['mrp', 'np'])
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
};

// App Event Functions
export const saveAppEvent = async (
  userId: string,
  event: Omit<AppEvent, 'id' | 'userId'>
): Promise<string> => {
  const eventsRef = collection(db, 'users', userId, 'appEvents');
  const docRef = await addDoc(eventsRef, {
    ...event,
    timestamp: Timestamp.fromDate(event.timestamp),
  });
  return docRef.id;
};

export const getAppEvents = async (
  userId: string,
  platform?: string
): Promise<AppEvent[]> => {
  const eventsRef = collection(db, 'users', userId, 'appEvents');
  let q = query(eventsRef, orderBy('timestamp', 'desc'));

  if (platform) {
    q = query(
      eventsRef,
      where('platform', '==', platform),
      orderBy('timestamp', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    userId,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate() || new Date(),
  })) as AppEvent[];
};

// Utility Functions
export const generateParticipantId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const randomlyAssignGroup = (): StudyGroup => {
  return Math.random() < 0.5 ? 'treatment' : 'control';
};

export { db, auth };
