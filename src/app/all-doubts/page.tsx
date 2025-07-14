"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import Link from "next/link";

interface Doubt {
  id: string;
  title: string;
  description: string;
  subject: string;
  createdAt: any;
  name: string; // who posted
  recommendedTutors: string[];
  acceptedTutors: string[];
}

export default function AllDoubtsPage() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [tutors, setTutors] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<{ uid: string; role: string; subjects: string[] }>({
    uid: "",
    role: "",
    subjects: [],
  });
  const [filterSubject, setFilterSubject] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login";
      } else {
        const docSnap = await getDocs(
          query(collection(db, "users"), where("__name__", "==", user.uid))
        );
        const userDoc = docSnap.docs[0];
        const data = userDoc.data();
        setProfile({
          uid: user.uid,
          role: data.role,
          subjects: data.subjects || [],
        });

        await loadTutors();
        await loadDoubts();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadTutors = async () => {
    const tutorsSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "Tutor"))
    );
    const tutorMap: Record<string, string> = {};
    tutorsSnap.forEach((doc) => {
      tutorMap[doc.id] = doc.data().name;
    });
    setTutors(tutorMap);
  };

  const loadDoubts = async () => {
    const q = query(collection(db, "doubts"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const fetchedDoubts: Doubt[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      fetchedDoubts.push({
        id: docSnap.id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        createdAt: data.createdAt,
        name: data.name,
        recommendedTutors: data.recommendedTutors || [],
        acceptedTutors: data.acceptedTutors || [],
      });
    });

    setDoubts(fetchedDoubts);
  };

  const handleAcceptDoubt = async (doubtId: string) => {
    if (!profile.uid) return;

    const doubtRef = doc(db, "doubts", doubtId);
    const doubtSnap = await getDocs(query(collection(db, "doubts"), where("__name__", "==", doubtId)));
    const data = doubtSnap.docs[0].data();
    const prevAccepted = data.acceptedTutors || [];

    if (!prevAccepted.includes(profile.uid)) {
      const updatedAccepted = [...prevAccepted, profile.uid];
      await updateDoc(doubtRef, {
        acceptedTutors: updatedAccepted,
      });
      alert("You accepted this doubt!");
      await loadDoubts();
    }
  };

  const uniqueSubjects = Array.from(new Set(doubts.map((d) => d.subject)));

  const filteredDoubts = filterSubject
    ? doubts.filter((d) => d.subject === filterSubject)
    : doubts;

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 w-full">
      <Link href="/dashboard" className="text-blue-500 underline mb-4">
        ← Back to Dashboard
      </Link>
      <h1 className="text-2xl mb-4"> All Learner Doubts</h1>

      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Subject:</label>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="border p-1"
        >
          <option value="">All</option>
          {uniqueSubjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {filteredDoubts.length === 0 && (
        <p className="text-gray-600">No doubts match your filter.</p>
      )}

      <div className="w-full max-w-2xl flex flex-col gap-4">
        {filteredDoubts.map((doubt) => (
          <div
            key={doubt.id}
            className="border p-4 rounded shadow-sm bg-white"
          >
            <h2 className="text-lg font-bold text-gray-600">{doubt.title}</h2>
            <p className="text-sm text-gray-600">Subject: {doubt.subject}</p>
            <p className="mt-2 font-bold text-gray-600">{doubt.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Posted by: {doubt.name} <br />
              {doubt.createdAt?.toDate
                ? doubt.createdAt.toDate().toLocaleString()
                : "Just now"}
            </p>

            <h3 className="mt-2 font-semibold text-sm text-gray-600">Matched Tutors:</h3>

            {doubt.recommendedTutors.length === 0 && doubt.acceptedTutors.length === 0 ? (
                <p className="text-xs text-red-500">⏳ Pending — No match yet</p>
            ) : (
                <>
                    {doubt.recommendedTutors.length > 0 && (
                        <ul className="list-disc ml-5 text-xs">
                            {doubt.recommendedTutors.map((tUid) => (
                                <li key={tUid}>{tutors[tUid] || `Tutor ID: ${tUid}`}</li>
                            ))}
                        </ul>
                    )}
                </>
            )}


            {profile.role === "Tutor" &&
              profile.subjects.includes(doubt.subject) && (
                <button
                  onClick={() => handleAcceptDoubt(doubt.id)}
                  className="mt-3 bg-blue-500 text-white text-xs px-2 py-1 rounded"
                >
                  ✅ Accept Doubt
                </button>
              )}

            {doubt.acceptedTutors.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                Accepted by:{" "}
                {doubt.acceptedTutors
                  .map((uid) => tutors[uid] || `Tutor ID: ${uid}`)
                  .join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
