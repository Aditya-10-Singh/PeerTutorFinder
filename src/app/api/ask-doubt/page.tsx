"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AskDoubtPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    uid: string;
    name: string;
    subjects: string[];
  } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");

  // Auth & Load learner’s profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Role fetched:", data.role);
          if (data.role?.trim() !== "Student" && data.role?.trim() !== "Learner") {
            alert("Only learners can post doubts!");
            router.push("/dashboard");
          }
          setProfile({
            uid: user.uid,
            name: data.name,
            subjects: data.subjects || [],
          });
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Save doubt to Firestore and call Gemini
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !description || !subject) {
      setError("All fields are required!");
      return;
    }

    if (!profile) {
      setError("User not loaded!");
      return;
    }

    try {
      // Add doubt to Firestore
      const docRef = await addDoc(collection(db, "doubts"), {
        uid: profile.uid,
        name: profile.name,
        subject: subject.trim(),
        title: title.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
      });

      // Call Gemini matchTutor API route
      await fetch("/api/matchTutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doubtId: docRef.id,
          subject: subject.trim(),
          description: description.trim(),
        }),
      });

      alert("Doubt posted and tutors matched!");
      setTitle("");
      setDescription("");
      setSubject("");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to post doubt!");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 w-full">
      <h1 className="text-3xl mb-6">Post Your Doubt</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title of your doubt"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2"
          required
        />
        <textarea
          placeholder="Describe your doubt in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2"
          rows={5}
          required
        />
        {profile && profile.subjects?.length > 0 ? (
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border p-2"
            required
          >
            <option value="">Select a subject</option>
            {profile.subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border p-2"
            required
          />
        )}

        {error && <p className="text-red-500">{error}</p>}

        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Post Doubt
        </button>
      </form>
    </main>
  );
}
