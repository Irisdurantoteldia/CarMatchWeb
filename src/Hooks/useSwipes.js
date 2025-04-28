import { useState, useEffect } from "react";
import { message } from "antd";
import { getSwipeUsers } from "../Services/userService";
import { recordSwipe } from "../Services/matchService";
import { db, auth } from "../FireBase/FirebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export const useSwipes = (selectedUserId, userData) => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailedView, setDetailedView] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUsers = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        setLoading(true);
        const userList = await getSwipeUsers(user.uid);
        setUsers(userList);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Error fetching users:", error);
        message.error("No s'han pogut carregar els usuaris. Si us plau, torna-ho a provar més tard.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          setLoading(true);
          const userList = await getSwipeUsers(user.uid);
          setUsers(userList);
        } catch (error) {
          console.error("Error fetching users:", error);
          message.error("No s'han pogut carregar els usuaris. Si us plau, torna-ho a provar més tard.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        message.error("No s'ha pogut carregar els usuaris. Si us plau, torna-ho a provar més tard.");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSwipe = async (type) => {
    if (users.length === 0 || currentIndex >= users.length) {
      return;
    }

    const swipedUser = users[currentIndex];
    const currentUser = auth.currentUser;

    try {
      // Crear referencia a la colección de swipes
      const swipesRef = collection(db, "swipes");
      
      // Guardar el swipe en Firebase
      await addDoc(swipesRef, {
        swiperId: currentUser.uid,
        swipedId: swipedUser.userId,
        type: type,
        timestamp: new Date().toISOString()
      });

      // Verificar si hay match
      if (type === "like") {
        const q = query(
          swipesRef,
          where("swiperId", "==", swipedUser.userId),
          where("swipedId", "==", currentUser.uid),
          where("type", "==", "like")
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Es un match! Crear documento en la colección de matches
          const matchesRef = collection(db, "matches");
          await addDoc(matchesRef, {
            users: [currentUser.uid, swipedUser.userId],
            timestamp: new Date().toISOString()
          });
          
          message.success("¡Has hecho match!");
        }
      }

      nextUser();
    } catch (error) {
      console.error("Error al procesar el swipe:", error);
      message.error("No se ha podido procesar la acción. Por favor, inténtalo de nuevo.");
    }
  };

  const nextUser = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= users.length - 1) {
        message.info("No hi ha més usuaris per mostrar.");
        return users.length;
      }
      return prevIndex + 1;
    });
    setDetailedView(false);
  };

  const handleLike = () => handleSwipe("like");
  const handleDislike = () => handleSwipe("dislike");

  const toggleDetailedView = () => {
    setDetailedView(!detailedView);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");
      const unavailabilityRef = collection(db, "unavailability");

      const now = new Date();
      const unavailabilityQuery = await getDocs(query(unavailabilityRef, 
        where("endDate", ">", now.toISOString())
      ));

      const unavailableUserIds = unavailabilityQuery.docs.map(doc => doc.data().userId);

      const usersQuery = query(usersRef, 
        where("userId", "not-in", unavailableUserIds)
      );

      const querySnapshot = await getDocs(usersQuery);
      const fetchedUsers = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => user.userId !== auth.currentUser?.uid);

      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    currentIndex,
    detailedView,
    loading,
    handleLike,
    handleDislike,
    toggleDetailedView,
    refreshUsers,
  };
};