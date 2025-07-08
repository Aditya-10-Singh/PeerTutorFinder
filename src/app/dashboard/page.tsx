"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: string;
  createdAt: any;
}

interface Post {
  id: string;
  uid: string;
  name: string;
  content: string;
  createdAt: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [content, setContent] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);

  // Auth check & fetch user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data() as UserProfile;
          // fallback if displayName is not in Firestore
          if (!userData.name && user.displayName) {
            userData.name = user.displayName;
          }
          setProfile(userData);
        } else {
          // fallback if user doc is missing
          setProfile({
            uid: user.uid,
            email: user.email || "",
            name: user.displayName || "User",
            role: "N/A",
            createdAt: null,
          });
        }
        fetchPosts();
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch posts
  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const postsData: Post[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      postsData.push({
        id: docSnap.id,
        uid: data.uid,
        name: data.name,
        content: data.content,
        createdAt: data.createdAt,
      });
    });
    setPosts(postsData);
  };

  // Create new post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    await addDoc(collection(db, "posts"), {
      uid: profile.uid,
      name: profile.name,
      content,
      createdAt: serverTimestamp(),
    });

    setContent("");
    fetchPosts();
  };

  // Log out
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 w-full">
      {profile ? (
        <>
          <h1 className="text-3xl mb-2">Welcome, {profile.name}!</h1>
          <p className="mb-2">Role: {profile.role}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-2 rounded mb-4"
          >
            Log Out
          </button>

          <Link
            href="/community"
            className="text-blue-600 underline mb-8"
          >
            Go to Community Connect
          </Link>

          <Link 
            href="/peers" 
            className="bg-purple-500 text-white px-4 py-2 rounded mb-4"
          >
            🔍 Find Tutors & Learners
          </Link>

          <Link 
            href="/connections" 
            className="text-blue-500 underline mb-4"
          >
            View Connection Requests
          </Link>

          {/* Create Post */}
          <form onSubmit={handleCreatePost} className="w-full max-w-md mb-8">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what you’re working on…"
              className="border w-full p-2 mb-2"
              required
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded"
            >
              Post
            </button>
          </form>

          {/* Posts Feed */}
          <div className="w-full max-w-md">
            <h2 className="text-xl mb-2">Community Posts</h2>
            {posts.length === 0 && <p>No posts yet. Be the first!</p>}
            {posts.map((post) => (
              <div key={post.id} className="border p-4 mb-2 rounded">
                <p className="font-bold">{post.name}</p>
                <p>{post.content}</p>
                <p className="text-xs text-gray-500">
                  {post.createdAt?.toDate
                    ? post.createdAt.toDate().toLocaleString()
                    : "Just now"}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </main>
  );
}
