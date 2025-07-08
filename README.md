# 📚 PeerTutorFinder — Verified Peer Tutoring & Collaboration Web App

Welcome to **PeerTutorFinder** — an open platform that connects students with **verified peer tutors**, enables learners to share doubts, and empowers meaningful academic collaboration.

---

## 🚀 What is PeerTutorFinder?

**PeerTutorFinder** is a modern web app designed to:
- ✅ Let students sign up as **Learners** or **Tutors**.
- ✅ Allow learners to **post doubts or collaboration requests**.
- ✅ Automatically **recommend the best matching verified tutors** for any doubt using **Google Gemini AI**.
- ✅ Facilitate **connections** via requests, profiles, and community discussions.
- ✅ Enable tutors and learners to **accept/reject collaboration offers**.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 13 (App Router) + React + Tailwind CSS |
| **Auth** | Firebase Authentication |
| **Database** | Firebase Firestore |
| **Hosting** | Vercel (planned) |
| **AI Matching** | Google Gemini API (planned) |
| **Notification** | In-app alerts (optional: PushBullet or FCM) |
| **IDX** | Integrated via Firebase user profiles |

---

## ✅ Features Built So Far

### 1️⃣ User Authentication
- Sign up / login with Firebase Auth.
- Users register as either `role: "learner"` or `role: "tutor"`.

### 2️⃣ User Profiles
- Stored in Firestore under `users` collection.
- Fields: `uid`, `name`, `email`, `role`, `subjects`, `bio`, and **`verified`** flag for tutors.

### 3️⃣ Community Posts
- `communityPosts` collection.
- Learners & tutors can share project ideas, doubts, or collaboration goals.
- Supports comments and likes.

### 4️⃣ Peer Connections
- `connectionRequests` collection for sending/receiving connection requests.
- `connections` collection for accepted connections.
- Learners can view `Peers` page, search by subjects, send connection requests, and view profiles.

---

## 🏗️ Planned Additions

### ✅ Verified Tutors
- Tutors must be **verified** by an admin to appear in recommendations.
- `verified: true` flag stored in each tutor’s user profile.

### ✅ Doubts Posting & Matching
- Learners post doubts with subject + details → saved in `doubts` collection.
- Gemini API analyzes doubt → suggests best matching verified tutors.
- Learner chooses whom to connect with.

### ✅ Offer & Accept Flow
- Tutors see open doubts.
- Tutors can **offer help** → creates a match request.
- Learners can **accept/reject** the tutor’s offer.

---

## 🗂️ Firestore Structure

```plaintext
users/
  [uid]: {
    uid, name, email, role, subjects[], bio, verified
  }

communityPosts/
  [postId]: {
    uid, name, content, createdAt
  }

communityPosts/[postId]/comments/
  [commentId]: {
    uid, name, content, createdAt
  }

communityPosts/[postId]/likes/
  [userId]: {}

connectionRequests/
  [requestId]: {
    fromUid, fromName, toUid, toName, message, createdAt
  }

connections/
  [connectionId]: {
    userA, userB, createdAt
  }

doubts/
  [doubtId]: {
    uid, name, subject, content, status, createdAt
  }

matches/
  [matchId]: {
    doubtId, tutorUid, learnerUid, status (pending|accepted|rejected)
  }

```
---

# 📌 Project Structure

Folder	Purpose
/app	Next.js app directory
/app/(auth)	Login, signup pages
/app/(peers)	Peer list, connection requests
/app/(community)	Community posts
/app/(doubts)	Doubts posting, matching (planned)
/app/api	Serverless API routes for Gemini & backend tasks
/firebase.ts	Firebase config & initialization

---

# 🔑 Environment Variables

Add a .env.local:

env

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxxxx
GEMINI_API_KEY=your_google_gemini_api_key

```
---

# 📌 How to Run

```bash

# Install dependencies
npm install

# Run development server
npm run dev

```
Open http://localhost:3000.

---

# 🧩 Next Steps
✔️ Add verified flag to tutors
✔️ Build /ask page for learners to post doubts
✔️ Integrate Gemini in /api/recommend-tutor
✔️ Add matches flow with accept/reject

---

# 🤝 Contributors
Built by You!

---

# 📬 Questions?
Open an issue or ping the dev.

---

Happy building! 🚀

---