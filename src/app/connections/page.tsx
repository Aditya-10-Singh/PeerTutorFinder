"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

interface Connection {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  message: string;
  createdAt: any;
}

interface ConnectionRequest {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  message: string;
  createdAt: any;
}

export default function ConnectionsPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [profileUid, setProfileUid] = useState<string | null>(null);

  // Load both connections AND requests for this user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setProfileUid(user.uid);
        fetchConnections(user.uid);
        fetchRequests(user.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchConnections = async (uid: string) => {
    const q = query(collection(db, "connections"), where("fromUid", "==", uid));
    const q2 = query(collection(db, "connections"), where("toUid", "==", uid));

    const snap1 = await getDocs(q);
    const snap2 = await getDocs(q2);

    const conns: Connection[] = [];

    snap1.forEach((docSnap) => {
      const data = docSnap.data();
      conns.push({
        id: docSnap.id,
        fromUid: data.fromUid,
        fromName: data.fromName,
        toUid: data.toUid,
        toName: data.toName,
        message: data.message,
        createdAt: data.createdAt,
      });
    });

    snap2.forEach((docSnap) => {
      const data = docSnap.data();
      conns.push({
        id: docSnap.id,
        fromUid: data.fromUid,
        fromName: data.fromName,
        toUid: data.toUid,
        toName: data.toName,
        message: data.message,
        createdAt: data.createdAt,
      });
    });

    setConnections(conns);
  };

  const fetchRequests = async (uid: string) => {
    const q = query(collection(db, "connectionRequests"), where("toUid", "==", uid));
    const snap = await getDocs(q);

    const reqs: ConnectionRequest[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      reqs.push({
        id: docSnap.id,
        fromUid: data.fromUid,
        fromName: data.fromName,
        toUid: data.toUid,
        toName: data.toName,
        message: data.message,
        createdAt: data.createdAt,
      });
    });
    setRequests(reqs);
  };

  // Accept a request → create connection + delete request
  const handleAccept = async (req: ConnectionRequest) => {
    await addDoc(collection(db, "connections"), {
      fromUid: req.fromUid,
      fromName: req.fromName,
      toUid: req.toUid,
      toName: req.toName,
      message: req.message,
      createdAt: serverTimestamp(),
    });
    await deleteDoc(doc(db, "connectionRequests", req.id));
    alert(`Accepted connection with ${req.fromName}`);
    fetchConnections(profileUid!);
    fetchRequests(profileUid!);
  };

  // Reject a request → just delete request
  const handleReject = async (req: ConnectionRequest) => {
    await deleteDoc(doc(db, "connectionRequests", req.id));
    alert(`Rejected request from ${req.fromName}`);
    fetchRequests(profileUid!);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 w-full">
      <h1 className="text-3xl mb-4">Your Connections</h1>

      {connections.length === 0 && <p>No active connections yet.</p>}

      <div className="w-full max-w-md mb-8">
        {connections.map((conn) => {
          const peerName =
            conn.fromUid === profileUid ? conn.toName : conn.fromName;
          return (
            <div key={conn.id} className="border p-4 mb-2 rounded shadow">
              <p>
                Connected with <strong>{peerName}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Message: {conn.message}
              </p>
              <p className="text-xs text-gray-400">
                {conn.createdAt?.toDate
                  ? conn.createdAt.toDate().toLocaleString()
                  : ""}
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl mb-4">Incoming Requests</h2>
      {requests.length === 0 && (
        <p className="text-gray-500">No incoming requests.</p>
      )}
      <div className="w-full max-w-md">
        {requests.map((req) => (
          <div key={req.id} className="border p-4 mb-4 rounded shadow">
            <p>
              <strong>{req.fromName}</strong> wants to connect.
            </p>
            <p className="text-sm text-gray-600">Message: {req.message}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleAccept(req)}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(req)}
                className="bg-red-500 text-white px-4 py-1 rounded"
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
