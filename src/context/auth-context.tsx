"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase.config";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    // Check users collection first (unified collection)
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return { uid: firebaseUser.uid, ...data } as User;
    }

    // Fallback to legacy collections for existing users
    const studentDoc = await getDoc(doc(db, "students", firebaseUser.uid));
    if (studentDoc.exists()) {
      const data = studentDoc.data();
      return { 
        uid: firebaseUser.uid, 
        ...data,
        role: "student",
        isActive: data.isActive ?? true,
        favoriteBusinessIds: data.favoriteBusinessIds ?? [],
      } as unknown as User;
    }

    const providerDoc = await getDoc(doc(db, "providers", firebaseUser.uid));
    if (providerDoc.exists()) {
      const data = providerDoc.data();
      return { 
        uid: firebaseUser.uid, 
        ...data,
        role: "provider",
        isActive: data.isActive ?? true,
        businessIds: data.businessIds ?? [],
        isVerified: data.isVerified ?? false,
      } as unknown as User;
    }

    return null;
  };

  const refreshUserData = async () => {
    if (user) {
      const data = await fetchUserData(user);
      setUserData(data);
      setRole(data?.role || null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const data = await fetchUserData(firebaseUser);
          setUserData(data);
          setRole(data?.role || null);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
          setRole(null);
        }
      } else {
        setUserData(null);
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      setRole(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userData, 
        role, 
        loading, 
        signOut,
        refreshUserData 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Role-based access hooks
export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, role, loading } = useAuth();
  
  const isAuthorized = !loading && user && (
    !allowedRoles || (role && allowedRoles.includes(role))
  );
  
  return { isAuthorized, loading, user, role };
}

export function useIsAdmin() {
  const { role } = useAuth();
  return role === "admin";
}

export function useIsProvider() {
  const { role } = useAuth();
  return role === "provider";
}

export function useIsStudent() {
  const { role } = useAuth();
  return role === "student";
}
