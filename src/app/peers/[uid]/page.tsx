"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "../../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  subjects?: string[];
  bio?: string;
}

export default function PeerProfilePage() {
  const router = useRouter();
  const { uid } = useParams() as { uid: string };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        await fetchProfile();
      }
    });
    return () => unsubscribe();
  }, [uid]);

  const fetchProfile = async () => {
    if (!uid) return;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfile(docSnap.data() as UserProfile);
    }
    setLoading(false);
  };

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>User not found.</p>;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 w-full">
      <h1 className="text-3xl mb-4">👤 {profile.name}</h1>
      <p className="mb-1">Role: {profile.role}</p>
      <p className="mb-1">Email: {profile.email}</p>
      <p className="mb-1">Subjects: {profile.subjects?.join(", ") || "N/A"}</p>
      <p className="max-w-md text-center text-sm">{profile.bio || "No bio yet."}</p>
    </main>
  );
}
