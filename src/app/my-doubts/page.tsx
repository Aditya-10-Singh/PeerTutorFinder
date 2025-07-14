"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";

interface Doubt {
  id: string;
  title: string;
  description: string;
  subject: string;
  createdAt: any;
  recommendedTutors: string[];
}

export default function MyDoubtsPage() {
  const [profileUid, setProfileUid] = useState<string | null>(null);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [tutorsMap, setTutorsMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProfileUid(user.uid);
      } else {
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (profileUid) {
      loadDoubts();
    }
  }, [profileUid]);

  const loadDoubts = async () => {
    const q = query(
      collection(db, "doubts"),
      where("uid", "==", profileUid)
    );
    const snap = await getDocs(q);

    const fetchedDoubts: Doubt[] = [];
    const tutorUids: Set<string> = new Set();

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const recommended = data.recommendedTutors || [];
      recommended.forEach((uid: string) => tutorUids.add(uid));

      fetchedDoubts.push({
        id: docSnap.id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        createdAt: data.createdAt,
        recommendedTutors: recommended,
      });
    });

    setDoubts(fetchedDoubts);

    // Load tutor names for all unique tutor UIDs
    const tutorsMapTemp: { [key: string]: string } = {};
    for (const uid of tutorUids) {
      const tutorDoc = await getDoc(doc(db, "users", uid));
      if (tutorDoc.exists()) {
        tutorsMapTemp[uid] = tutorDoc.data().name;
      }
    }
    setTutorsMap(tutorsMapTemp);
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 w-full">
      <Link href="/dashboard" className="text-blue-500 underline mb-4">
        ← Back to Dashboard
      </Link>
      <h1 className="text-2xl mb-6">My Posted Doubts</h1>

      {doubts.length === 0 && (
        <p className="text-gray-600">No doubts posted yet.</p>
      )}

      <div className="w-full max-w-2xl flex flex-col gap-4">
        {doubts.map((doubt) => (
          <div
            key={doubt.id}
            className="border p-4 rounded shadow-sm bg-white"
          >
            <h2 className="text-lg font-bold text-gray-600">{doubt.title}</h2>
            <p className="text-sm text-gray-600">{doubt.subject}</p>
            <p className="mt-2 font-bold text-gray-600">{doubt.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              {doubt.createdAt?.toDate
                ? doubt.createdAt.toDate().toLocaleString()
                : "Just now"}
            </p>

            {doubt.recommendedTutors?.length > 0 ? (
              <div className="mt-3">
                <p className="font-semibold">Recommended Tutors:</p>
                <ul className="list-disc ml-6">
                  {doubt.recommendedTutors.map((uid) => (
                    <li key={uid}>{tutorsMap[uid] || uid}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-yellow-700">
                No recommendations yet. Please wait...
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
