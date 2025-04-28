import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../FireBase/FirebaseConfig";
import { message } from 'antd';

// Get all users for swipe screen
export const getSwipeUsers = async (currentUserId) => {
  try {
    // Obtener el rol del usuario actual
    const usersQuery = query(
      collection(db, "users"),
      where("userId", "==", currentUserId)
    );
    const userSnapshot = await getDocs(usersQuery);
    
    if (userSnapshot.empty) {
      throw new Error("No s'ha trobat l'usuari actual");
    }

    const currentUserDoc = userSnapshot.docs[0];
    const currentUserRole = currentUserDoc.data().role;

    // Obtener los swipes del usuario actual
    const swipesSnapshot = await getDocs(
      query(collection(db, "swipes"), 
        where("from", "==", currentUserId),
        where("type", "==", "like")
      )
    );
    const likedUserIds = swipesSnapshot.docs.map((doc) => doc.data().to) || [];

    // Obtener los swipes recibidos
    const receivedSwipesSnapshot = await getDocs(
      query(collection(db, "swipes"), 
        where("to", "==", currentUserId),
        where("type", "==", "like")
      )
    );
    const receivedLikes = receivedSwipesSnapshot.docs.map((doc) => doc.data().from) || [];

    // Obtener todos los usuarios
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((user) => {
        // Normalizar los roles para la comparación
        const normalizedCurrentRole = currentUserRole?.toLowerCase().trim() || "";
        const normalizedUserRole = user.role?.toLowerCase().trim() || "";

        // Excluir usuarios con el mismo rol y el usuario actual
        return (
          user.userId !== currentUserId &&
          normalizedUserRole !== normalizedCurrentRole &&
          !likedUserIds.includes(user.userId) // Excluir usuarios a los que ya se ha dado like
        );
      });

    // Ordenar usuarios: primero los que han dado like al usuario actual
    users.sort((a, b) => {
      const aHasLiked = receivedLikes.includes(a.userId);
      const bHasLiked = receivedLikes.includes(b.userId);
      if (aHasLiked && !bHasLiked) return -1;
      if (!aHasLiked && bHasLiked) return 1;
      return 0;
    });

    // Cargar horarios detallados para cada usuario
    for (const user of users) {
      if (user.weeklyScheduleId) {
        const scheduleDoc = await getDoc(
          doc(db, "weeklySchedule", user.weeklyScheduleId)
        );
        user.detailedSchedule = scheduleDoc.data();
      }
    }

    return users;
  } catch (error) {
    message.error("Error al obtener usuarios para swipe");
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  const usersQuery = query(
    collection(db, "users"),
    where("userId", "==", userId)
  );
  const userSnapshot = await getDocs(usersQuery);

  if (userSnapshot.empty) {
    return null;
  }

  const userData = userSnapshot.docs[0].data();

  // Get schedule if exists
  if (userData.weeklyScheduleId) {
    const scheduleDoc = await getDoc(
      doc(db, "weeklySchedule", userData.weeklyScheduleId)
    );
    userData.detailedSchedule = scheduleDoc.data();
  }

  return {
    id: userSnapshot.docs[0].id,
    ...userData,
  };
};