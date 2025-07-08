"use client";

import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();

  // ✅ If not logged in, redirect to login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl mb-4">Welcome to your Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-pink-500 text-white p-2 rounded"
      >
        Log Out
      </button>
    </main>
  );
}
