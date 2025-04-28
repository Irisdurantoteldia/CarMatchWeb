import {
  collection,
  query,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../FireBase/FirebaseConfig";
import { message } from 'antd';

// Send a message in a match
export const sendMessage = async (matchId, text) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    message.error("No se ha encontrado sesión de usuario");
    throw new Error("No user session found");
  }

  if (text.trim() === "") {
    return null;
  }

  try {
    return await addDoc(collection(db, "matches", matchId, "messages"), {
      text: text.trim(),
      sender: currentUser.uid,
      date: serverTimestamp(),
    });
  } catch (error) {
    message.error("Error al enviar el mensaje");
    throw error;
  }
};

// Subscribe to messages for a match
export const subscribeToMessages = (matchId, callback) => {
  const messagesRef = collection(db, "matches", matchId, "messages");
  const q = query(messagesRef, orderBy("date", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messagesList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
    }));

    callback(messagesList);
  });
};