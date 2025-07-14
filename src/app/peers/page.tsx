"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  subjects?: string[];
  bio?: string;
}

interface Connection {
  id: string;
  userA: string;
  userB: string;
}

export default function PeersPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [peers, setPeers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState("");

  // Load profile, users, and connections
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        (async () => {
          const allUsersSnap = await getDocs(collection(db, "users"));
          const allUsers: UserProfile[] = [];
          let myProfile: UserProfile | null = null;
  
          allUsersSnap.forEach((docSnap) => {
            const data = docSnap.data() as Partial<UserProfile>;
            if (data.uid && data.uid === user.uid) {
              myProfile = data as UserProfile;
            } else if (data.uid) {
              allUsers.push(data as UserProfile);
            }
          });
  
          setProfile(myProfile);
          setUsers(allUsers);
  
        })();
      }
    });
    return () => unsubscribe();
  }, [router]);
  

  // Fetch connections & connected peers
  const fetchConnections = async (uid: string) => {
    const qA = query(collection(db, "connections"), where("userA", "==", uid));
    const qB = query(collection(db, "connections"), where("userB", "==", uid));

    const [snapA, snapB] = await Promise.all([getDocs(qA), getDocs(qB)]);
    const peerIds = new Set<string>();

    snapA.forEach((doc) => peerIds.add(doc.data().userB));
    snapB.forEach((doc) => peerIds.add(doc.data().userA));

    const allUsersSnap = await getDocs(collection(db, "users"));
    const connectedPeers: UserProfile[] = [];

    allUsersSnap.forEach((doc) => {
      const data = doc.data() as UserProfile;
      if (peerIds.has(data.uid)) {
        connectedPeers.push(data);
      }
    });

    setPeers(connectedPeers);
  };

  // Send request
  const sendRequest = async (toUser: UserProfile) => {
    if (!profile) return;

    await addDoc(collection(db, "connectionRequests"), {
      fromUid: profile.uid,
      fromName: profile.name,
      toUid: toUser.uid,
      toName: toUser.name,
      message: message || "Hi! I'd like to connect and collaborate!",
      createdAt: serverTimestamp(),
    });

    alert(`Connection request sent to ${toUser.name}`);
    setSelectedUser(null);
    setMessage("");
  };

  // Filter users by subject search
  const filteredUsers = users.filter(
    (u) =>
      u.subjects?.join(" ").toLowerCase().includes(search.toLowerCase()) &&
      !peers.find((peer) => peer.uid === u.uid) // exclude already connected peers
  );

  return (
    <main className="flex flex-col items-center min-h-screen p-4 w-full">
      <h1 className="text-3xl mb-4">Find & Connect with Peers</h1>

      <input
        type="text"
        placeholder="Search by subject..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-6 w-full max-w-md"
      />

      {filteredUsers.length === 0 ? (
        <p className="text-gray-500 mb-6">No new peers found for this subject.</p>
      ) : (
        <div className="w-full max-w-md mb-10">
          {filteredUsers.map((u) => (
            <div key={u.uid} className="border p-4 mb-2 rounded shadow">
              <p className="font-bold">{u.name}</p>
              <p className="text-sm">{u.role}</p>
              <p className="text-sm text-gray-600">
                Subjects: {u.subjects?.join(", ") || "N/A"}
              </p>
              <button
                onClick={() => setSelectedUser(u)}
                className="text-blue-500 text-sm mt-2 underline"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-md">
        {peers.map((peer) => (
          <div key={peer.uid} className="border p-4 mb-4 rounded shadow">
            <p className="font-bold text-lg">{peer.name}</p>
            <p className="text-sm">Role: {peer.role}</p>
            <p className="text-sm">
              Subjects: {peer.subjects?.join(", ") || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              {peer.bio || "No bio provided."}
            </p>
          </div>
        ))}
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h2 className="text-xl mb-2 text-sm text-gray-700">{selectedUser.name}</h2>
            <p className="mb-1 text-sm text-gray-700">Role: {selectedUser.role}</p>
            <p className="mb-1 text-sm text-gray-700">
              Subjects: {selectedUser.subjects?.join(", ") || "N/A"}
            </p>
            <p className="mb-4 text-sm text-gray-700">
              {selectedUser.bio || "No bio available."}
            </p>

            <textarea
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border w-full p-2 mb-2 text-sm text-gray-700"
            />

            <button
              onClick={() => sendRequest(selectedUser)}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
              Send Request
            </button>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-gray-500 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
