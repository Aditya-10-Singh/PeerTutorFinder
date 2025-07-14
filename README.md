# 📚 PeerTutorFinder — Peer Tutoring & Collaboration Web App Platform

Welcome to **PeerTutorFinder** — a web apllication that connects students with **peer tutors**, enables learners to share doubts, and empowers meaningful academic collaboration through an AI-powered matching system.

---

# 🚀 What is PeerTutorFinder?

**PeerTutorFinder** is a modern web app designed to:
- ✅ Let students register as **Student** or **Tutor**.
- ✅ Allow learners to **post doubts or collaboration requests**.
- ✅ Automatically **recommend the best matching tutors** for any doubt using **Google Gemini AI**.
- ✅ Facilitate **connections** via requests, profiles, and community discussions.
- ✅ Enable tutors and learners to **accept/reject collaboration offers**.
- ✅ Provides a community space for **sharing ideas, collaboration,** and **peer learning**.

---

# ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 13 (App Router) + React + Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Authentication** | Firebase Authentication |
| **Database** | Firebase Firestore |
| **Hosting** | Firebase Hosting |
| **AI Matching** | Google Gemini API |
| **IDX** | Integrated via Firebase user profiles |

---

# ✅ Features 

### 1️⃣ User Authentication
- Register / login with Firebase Auth.
- Users register as either `role: "Student"` or `role: "Tutor"`.
- Supports email / password.

### 2️⃣ User Profiles
- Stored in Firestore under `users` collection.
- Fields: `uid`, `name`, `email`, `role`, `subjects`, `bio`, and `createdAt`.

### 3️⃣ Doubt Posting & Gemini AI Matching
- Learners can post doubts with title, subject, and description.
- Gemini AI recommends best-matching tutors based on their subjects and bio.
- Tutors are saved in `recommendedTutors` on each doubt.
- Learners see matched tutors directly on the My Doubts or All Doubts pages.

### 4️⃣ Community Posts
- `communityPosts` collection.
- Learners & tutors can share project ideas, doubts, or collaboration goals.
- Supports comments and likes.

### 5️⃣ Peer Connections
- `connectionRequests` collection for sending/receiving connection requests.
- `connections` collection for accepted connections.
- Learners can view `Peers` page, search by subjects, send connection requests, and view profiles.

---

# 🗂️ Firestore Structure

```plaintext
users/
  [uid]: {
    uid, name, email, role, subjects[], bio, createdAt
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
  [userId]: true

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
    uid, name, subject, title, description, recommendedTutors[], createdAt
  }

matches/
  [matchId]: {
    doubtId, tutorUid, learnerUid, status (pending|accepted|rejected)
  }
```
---

# 📌 Project Structure

| Folder | Purpose |
|--------|----------|
| **/app** | Next.js app directory |
| **/app/(auth)** |	Login, Register pages |
| **/app/(peers)** | Peer listing & Connection requests |
| **/app/(community)** | Community posts, Likes & Comments |
| **/app/(doubts)** | Post Doubts, View Doubts & Gemini Matching |
| **/app/api** | Serverless API routes for Gemini & backend tasks | 
| **/firebase.ts** | Firebase config & initialization |

---

# 🔑 Environment Variables

Add a .env.local:

env
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
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

# 🔐 Security
✅ Firestore Rules are configured to:
- Allow read access for community posts and doubts.
- Allow write operations only for authenticated users.
- Match rules for connection requests and user profiles securely.

Always review Firestore rules before deploying to production!

---

# 🌟 Future Enhancements
- In-app or email notifications for matched tutors.
- Push notifications using Firebase Cloud Messaging.
- Verified badges for trusted tutors.
- Improved dashboard & user analytics.

---

# 🤝 Contributing
### 1️⃣ Fork the repo
### 2️⃣ Create a branch: git checkout -b feature/my-feature
### 3️⃣ Commit your changes: git commit -m 'Add my feature'
### 4️⃣ Push to the branch: git push origin feature/my-feature
### 5️⃣ Open a Pull Request

---

# 📬 Questions or Suggestions?
Open an issue or reach out — let’s build it better together!

---

Happy Peer Tutoring! 🚀📚

---
