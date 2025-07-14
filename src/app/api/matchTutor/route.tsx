import { NextResponse } from "next/server";
import { db } from "../../../../firebase";
import {
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

export async function POST(req: Request) {
  const { doubtId, subject, description } = await req.json();

  console.log("Incoming doubtId:", doubtId);

  // Get tutors
  const tutorsQuery = query(
    collection(db, "users"),
    where("role", "==", "Tutor")
  );
  const tutorsSnap = await getDocs(tutorsQuery);

  interface Tutor {
    uid: string;
    name: string;
    subjects: string[];
    bio: string;
  }

  const tutors: Tutor[] = tutorsSnap.docs.map((doc) => ({
    uid: doc.id,
    name: doc.data().name || "",
    subjects: doc.data().subjects || [],
    bio: doc.data().bio || "",
  }));

  console.log("Fetched tutors:", tutors);

  // Gemini prompt
  const prompt = `
    A learner posted a doubt:
    Subject: ${subject}
    Description: ${description}

    Here are available tutors:
    ${tutors
      .map(
        (t) =>
          `Name: ${t.name}, Subjects: ${t.subjects.join(
            ", "
          )}, Bio: ${t.bio}`
      )
      .join("\n")}

    Which tutors match best? Return ONLY a comma-separated list of tutor names, nothing else.
  `;

  console.log("Prompt for Gemini:", prompt);

  // Call Gemini API
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const geminiData = await geminiResponse.json();
  console.log("Gemini raw response:", JSON.stringify(geminiData, null, 2));

  const rawText: string =
    geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

  console.log("Gemini text:", rawText);

  const names: string[] = typeof rawText === "string"
    ? rawText.split(",").map((n) => n.trim()).filter((n) => n.length > 0)
    : [];

  console.log("Parsed names:", names);

  // Safe match
  const matchedTutors: string[] = tutors
    .filter((tutor) =>
      names.some(
        (name) =>
          typeof name === "string" &&
          typeof tutor.name === "string" &&
          tutor.name.toLowerCase() === name.toLowerCase()
      )
    )
    .map((t) => t.uid);

  console.log("Matched tutor UIDs:", matchedTutors);

  // Save matches to Firestore
  await updateDoc(doc(db, "doubts", doubtId), {
    recommendedTutors: matchedTutors,
  });

  return NextResponse.json({ matchedTutors });
}
