"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

interface ConnectionRequest {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  message: string;
  createdAt: any;
}

export default function RequestsPage() {
  const router = useRouter();
  const [profileUid, setProfileUid] = useState<string | null>(null);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setProfileUid(user.uid);
        fetchRequests(user.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchRequests = async (uid: string) => {
    const q = query(
      collection(db, "connectionRequests"),
      where("toUid", "==", uid)
    );
    const snap = await getDocs(q);
    const reqs: ConnectionRequest[] = [];
    snap.forEach((docSnap) => {
        reqs.push({
            id: docSnap.id,
            fromUid: docSnap.data().fromUid,
            fromName: docSnap.data().fromName,
            toUid: docSnap.data().toUid,
            toName: docSnap.data().toName,
            message: docSnap.data().message,
            createdAt: docSnap.data().createdAt,
          });
    });
    setRequests(reqs);
  };

  const handleAccept = async (req: ConnectionRequest) => {
    if (!profileUid) return;

    // Add to `connections` for both users
    await addDoc(collection(db, "connections"), {
      userA: profileUid,
      userB: req.fromUid,
      createdAt: serverTimestamp(),
    });

    // Remove request
    await deleteDoc(doc(db, "connectionRequests", req.id));
    alert(`Connection accepted with ${req.fromName}`);
    fetchRequests(profileUid);
  };

  const handleReject = async (req: ConnectionRequest) => {
    if (!profileUid) return;

    await deleteDoc(doc(db, "connectionRequests", req.id));
    alert(`Connection request from ${req.fromName} rejected`);
    fetchRequests(profileUid);
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 w-full">
      <h1 className="text-3xl mb-4">Connection Requests</h1>

      {requests.length === 0 && (
        <p className="text-gray-500">You have no pending requests.</p>
      )}

      <div className="w-full max-w-md">
        {requests.map((req) => (
          <div key={req.id} className="border p-4 mb-4 rounded shadow">
            <p className="font-bold">{req.fromName}</p>
            <p className="text-sm mb-2">{req.message}</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleAccept(req)}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(req)}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
