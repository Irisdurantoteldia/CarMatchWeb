import React from "react";
import { Input, Button, message, Alert } from "antd";
import { CarOutlined, SendOutlined } from "@ant-design/icons";
import { collection, addDoc, serverTimestamp, getDoc, doc, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../FireBase/FirebaseConfig";
import "./ChatInput.css";

const ChatInput = ({ 
  newMessage, 
  setNewMessage, 
  sendMessage, 
  inputRef,
  matchId 
}) => {
  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage();
    }
  };

  const handleRequestTrip = async () => {
    try {
      // Get match information first
      const matchDoc = await getDoc(doc(db, "matches", matchId));
      if (!matchDoc.exists()) {
        Alert.alert("Error", "No s'ha trobat la informació del match");
        return;
      }

      const matchData = matchDoc.data();
      const otherUserId = matchData.users.find(id => id !== auth.currentUser?.uid);

      // Query users collection with userId field
      const usersRef = collection(db, "users");
      const [currentUserQuery, otherUserQuery] = await Promise.all([
        getDocs(query(usersRef, where("userId", "==", auth.currentUser.uid))),
        getDocs(query(usersRef, where("userId", "==", otherUserId)))
      ]);

      if (currentUserQuery.empty) {
        console.error("Current user doc not found");
        Alert.alert("Error", "No s'ha trobat la informació del usuari actual");
        return;
      }

      if (otherUserQuery.empty) {
        console.error("Other user doc not found");
        Alert.alert("Error", "No s'ha trobat la informació del altre usuari");
        return;
      }

      const currentUserData = currentUserQuery.docs[0].data();
      const otherUserData = otherUserQuery.docs[0].data();

      // Check if we have all required data
      if (!currentUserData.role || !currentUserData.location || !currentUserData.desti ||
          !otherUserData.role || !otherUserData.location || !otherUserData.desti) {
        Alert.alert("Error", "Falta informació necessària dels usuaris");
        return;
      }

      // Determine driver and passenger based on roles
      let driverId, from, to;
      const passengersId = [];

      if (currentUserData.role.toLowerCase() === "conductor") {
        driverId = auth.currentUser.uid;
        from = currentUserData.location;
        to = currentUserData.desti;
        passengersId.push(otherUserId);
      } else {
        driverId = otherUserId;
        from = otherUserData.location;
        to = otherUserData.desti;
        passengersId.push(auth.currentUser.uid);
      }

      // Create trip document
      const tripRef = await addDoc(collection(db, "trips"), {
        createdAt: serverTimestamp(),
        date: new Date().toISOString(),
        driverId,
        from,
        to,
        passengersId,
        status: "pending"  // Add status field
      });

      // Create trip request message
      const messagesRef = collection(db, "matches", matchId, "messages");
      await addDoc(messagesRef, {
        type: "trip_request",
        sender: auth.currentUser.uid,
        receiver: otherUserId,
        timestamp: serverTimestamp(),
        status: "pending",
        tripId: tripRef.id,
        text: "🚗 Viatge creat correctament.",
        systemMessage: true,
        tripInfo: {
          from,
          to,
          driverId,
          passengersId,
          date: new Date().toISOString(),
          driver: {
            id: driverId,
            displayName: driverId === auth.currentUser.uid ? 
              (currentUserData.displayName || currentUserData.email || 'Conductor') : 
              (otherUserData.displayName || otherUserData.email || 'Conductor'),
            role: "conductor"
          },
          passenger: {
            id: driverId === auth.currentUser.uid ? otherUserId : auth.currentUser.uid,
            displayName: driverId === auth.currentUser.uid ? 
              (otherUserData.displayName || otherUserData.email || 'Passatger') : 
              (currentUserData.displayName || currentUserData.email || 'Passatger'),
            role: "passatger"
          }
        },
        actions: {
          accept: {
            label: "Acceptar",
            action: "accept_trip"
          },
          reject: {
            label: "Rebutjar",
            action: "reject_trip"
          }
        },
        metadata: {
          needsResponse: true,
          responseFrom: otherUserId,
          requestedAt: serverTimestamp(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        }
      });

      // After successfully creating the trip and message
      const isDriver = currentUserData.role.toLowerCase() === "conductor";
      if (isDriver) {
        Alert.alert("Èxit", "Viatge creat correctament.");
      } else {
        Alert.alert("Èxit", "Sol·licitud de viatge enviada al conductor.");
      }
    } catch (error) {
      console.error("Error al enviar la sol·licitud:", error);
      message.error("No s'ha pogut crear el viatge");
    }
  };

  return (
    <div className="chat-input-container">
      <Button
        className="trip-button"
        icon={<CarOutlined />}
        onClick={handleRequestTrip}
      />
      <Input
        ref={inputRef}
        className="message-input"
        placeholder="Escriu un missatge..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onPressEnter={handleSend}
      />
      <Button
        className="send-button"
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSend}
        disabled={!newMessage.trim()}
      />
    </div>
  );
};

export default ChatInput;
