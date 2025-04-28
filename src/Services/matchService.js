import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../FireBase/FirebaseConfig";
import { message } from 'antd';

// Get all matches for the current user
export const getUserMatches = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    message.error("No se ha encontrado sesión de usuario");
    throw new Error("No user session found");
  }

  // Step 1: Find users who liked the current user
  const likesReceived = query(
    collection(db, "swipes"),
    where("to", "==", currentUser.uid),
    where("type", "==", "like")
  );
  const likesReceivedSnapshot = await getDocs(likesReceived);
  const usersThatLikedMe = likesReceivedSnapshot.docs.map(
    (doc) => doc.data().from
  );

  // Step 2: Find users that the current user liked
  const likesSent = query(
    collection(db, "swipes"),
    where("from", "==", currentUser.uid),
    where("type", "==", "like")
  );
  const likesSentSnapshot = await getDocs(likesSent);
  const usersThatILiked = likesSentSnapshot.docs.map((doc) => doc.data().to);

  // Step 3: Find the intersection (matches)
  const matchedUserIds = usersThatLikedMe.filter((userId) =>
    usersThatILiked.includes(userId)
  );

  // Step 4: Check if matches exist in the matches collection, create if not
  await checkAndCreateMatches(currentUser.uid, matchedUserIds);

  // Step 5: Get matches from matches collection
  const matchesQuery = query(
    collection(db, "matches"),
    where("users", "array-contains", currentUser.uid)
  );
  const matchesSnapshot = await getDocs(matchesQuery);

  // Get user details for all matches
  const matchDetails = [];

  for (const matchDoc of matchesSnapshot.docs) {
    const matchData = matchDoc.data();
    // Get the other user's ID (not the current user)
    const otherUserId = matchData.users.find((id) => id !== currentUser.uid);

    // Get the other user's details
    const usersQuery = query(
      collection(db, "users"),
      where("userId", "==", otherUserId)
    );
    const userSnapshot = await getDocs(usersQuery);

    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();

      // Get last message if exists
      let lastMessage = null;
      const messagesCollection = collection(
        db,
        "matches",
        matchDoc.id,
        "messages"
      );
      const messagesQuery = query(messagesCollection);
      const messagesSnapshot = await getDocs(messagesQuery);

      if (!messagesSnapshot.empty) {
        // Sort messages by date
        const messages = messagesSnapshot.docs.map((msgDoc) => {
          const msgData = msgDoc.data();
          return {
            id: msgDoc.id,
            ...msgData,
            date: msgData.date ? msgData.date.toDate() : new Date(),
          };
        });

        messages.sort((a, b) => b.date - a.date);
        lastMessage = messages[0];
      }

      matchDetails.push({
        matchId: matchDoc.id,
        id: userSnapshot.docs[0].id,
        userId: userData.userId,
        nom: userData.nom || "Usuari",
        photo: userData.photo || "https://via.placeholder.com/150",
        role: userData.role || "",
        location: userData.location || "",
        desti: userData.desti || "",
        lastMessage: lastMessage,
        currentUserId: currentUser.uid,
      });
    }
  }

  return matchDetails;
};

// Check if match exists and create if not
export const checkAndCreateMatches = async (currentUserId, matchedUserIds) => {
  for (const matchedUserId of matchedUserIds) {
    // Check if match document already exists
    const matchesQuery = query(
      collection(db, "matches"),
      where("users", "array-contains", currentUserId)
    );
    const matchesSnapshot = await getDocs(matchesQuery);

    let matchExists = false;

    // Check each match document to see if it contains both users
    matchesSnapshot.forEach((matchDoc) => {
      const matchData = matchDoc.data();
      if (matchData.users.includes(matchedUserId)) {
        matchExists = true;
      }
    });

    // If match doesn't exist, create it
    if (!matchExists) {
      await addDoc(collection(db, "matches"), {
        users: [currentUserId, matchedUserId],
        createdAt: new Date(),
      });
    }
  }
};

// Record a swipe (like or dislike)
export const recordSwipe = async (toUserId, type) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    message.error("No se ha encontrado sesión de usuario");
    throw new Error("No user session found");
  }

  try {
    await addDoc(collection(db, "swipes"), {
      from: currentUser.uid,
      to: toUserId,
      type: type,
    });
  } catch (error) {
    message.error("Error al registrar el swipe");
    throw error;
  }
};
