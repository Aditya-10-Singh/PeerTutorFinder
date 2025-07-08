"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Post {
  id: string;
  uid: string;
  name: string;
  content: string;
  createdAt: string;
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
          setProfile(docSnap.data() as UserProfile);
          fetchPosts(); // Fetch posts when profile loads
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch all posts
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
      content: content,
      createdAt: new Date().toISOString(),
    });

    setContent("");
    fetchPosts(); // Refresh posts
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
          <p className="mb-4">Role: {profile.role}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-2 rounded mb-8"
          >
            Log Out
          </button>

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
                <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
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
