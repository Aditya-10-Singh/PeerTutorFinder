"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  deleteDoc as firestoreDeleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import Link from "next/link";

interface UserProfile {
  uid: string;
  name: string;
}

interface CommunityPost {
  id: string;
  uid: string;
  name: string;
  content: string;
  createdAt: any;
}

interface Comment {
  id: string;
  uid: string;
  name: string;
  content: string;
  createdAt: any;
}

export default function CommunityPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [content, setContent] = useState<string>("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({});

  // ✅ Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const name = userDoc.exists() ? userDoc.data().name : "User";
        setProfile({ uid: user.uid, name });
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ Load posts after profile is ready
  useEffect(() => {
    if (profile) {
      fetchPosts();
    }
  }, [profile]);

  // ✅ Fetch posts, likes, comments in one pass
  const fetchPosts = async () => {
    const q = query(collection(db, "communityPosts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const postsData: CommunityPost[] = [];
    const likesData: { [key: string]: number } = {};
    const userLikesData: { [key: string]: boolean } = {};
    const allComments: { [key: string]: Comment[] } = {};

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const postId = docSnap.id;

      postsData.push({
        id: postId,
        uid: data.uid,
        name: data.name,
        content: data.content,
        createdAt: data.createdAt,
      });

      // Likes
      const likesSnapshot = await getDocs(collection(db, "communityPosts", postId, "likes"));
      likesData[postId] = likesSnapshot.size;

      if (profile) {
        const userLikeDoc = await getDoc(
          doc(db, "communityPosts", postId, "likes", profile.uid)
        );
        userLikesData[postId] = userLikeDoc.exists();
      }

      // Comments
      const commentsQuery = query(
        collection(db, "communityPosts", postId, "comments"),
        orderBy("createdAt", "asc")
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData: Comment[] = [];
      commentsSnapshot.forEach((commentSnap) => {
        const commentData = commentSnap.data();
        commentsData.push({
          id: commentSnap.id,
          uid: commentData.uid,
          name: commentData.name,
          content: commentData.content,
          createdAt: commentData.createdAt,
        });
      });
      allComments[postId] = commentsData;
    }

    setPosts(postsData);
    setLikes(likesData);
    setUserLikes(userLikesData);
    setComments(allComments);
  };

  // ✅ Create post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    await addDoc(collection(db, "communityPosts"), {
      uid: profile.uid,
      name: profile.name,
      content,
      createdAt: serverTimestamp(),
    });

    setContent("");
    fetchPosts();
  };

  // ✅ Add comment
  const handleAddComment = async (postId: string) => {
    if (!profile) return;
    const commentContent = newComments[postId]?.trim();
    if (!commentContent) return;

    await addDoc(collection(db, "communityPosts", postId, "comments"), {
      uid: profile.uid,
      name: profile.name,
      content: commentContent,
      createdAt: serverTimestamp(),
    });

    setNewComments((prev) => ({ ...prev, [postId]: "" }));
    fetchPosts();
  };

  // ✅ Like/unlike post
  const handleToggleLike = async (postId: string) => {
    if (!profile) return;

    const likeRef = doc(db, "communityPosts", postId, "likes", profile.uid);
    const likeDoc = await getDoc(likeRef);

    if (likeDoc.exists()) {
      await firestoreDeleteDoc(likeRef);
    } else {
      await setDoc(likeRef, {
        uid: profile.uid,
        createdAt: serverTimestamp(),
      });
    }

    fetchPosts();
  };

  // ✅ Delete post
  const handleDeletePost = async (postId: string) => {
    await firestoreDeleteDoc(doc(db, "communityPosts", postId));
    fetchPosts();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 w-full">
      <Link href="/dashboard" className="text-blue-500 underline mb-4">
        ← Back to Dashboard
      </Link>
      <h1 className="text-3xl mb-4">🌐 Community Connect</h1>

      <form onSubmit={handleCreatePost} className="w-full max-w-md mb-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe your project, idea, or collab goal..."
          className="border w-full p-2 mb-2"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Post
        </button>
      </form>

      <div className="w-full max-w-md">
        <h2 className="text-xl mb-2">Latest Collaboration Posts</h2>
        {posts.length === 0 && <p>No community posts yet. Be the first!</p>}
        {posts.map((post) => (
          <div key={post.id} className="border p-4 mb-4 rounded">
            <p className="font-bold">{post.name}</p>
            <p>{post.content}</p>
            <p className="text-xs text-gray-500">
              {post.createdAt?.toDate
                ? post.createdAt.toDate().toLocaleString()
                : "Just now"}
            </p>

            <button
              onClick={() => handleToggleLike(post.id)}
              className={`text-sm mt-2 ${userLikes[post.id] ? "text-blue-500" : "text-gray-600"}`}
            >
              {userLikes[post.id] ? "❤️ Liked" : "🤍 Like"} ({likes[post.id] || 0})
            </button>

            {profile && post.uid === profile.uid && (
              <button
                onClick={() => handleDeletePost(post.id)}
                className="text-red-500 text-xs ml-4"
              >
                Delete Post
              </button>
            )}

            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Comments</h4>
              {comments[post.id]?.map((comment) => (
                <div key={comment.id} className="border-t py-1 text-sm">
                  <span className="font-bold">{comment.name}: </span>
                  <span>{comment.content}</span>
                </div>
              ))}
              <textarea
                value={newComments[post.id] || ""}
                onChange={(e) =>
                  setNewComments((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
                placeholder="Add a comment..."
                className="border w-full p-1 mt-2 text-sm"
              />
              <button
                onClick={() => handleAddComment(post.id)}
                className="text-blue-500 text-xs mt-1"
              >
                Add Comment
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
