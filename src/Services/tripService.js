export const createTrip = async (tripData) => {
  try {
    const tripsRef = collection(db, "trips");
    
    // Afegim el camp de places disponibles
    const tripWithSeats = {
      ...tripData,
      availableSeats: tripData.totalSeats, // Places inicials
      totalSeats: tripData.totalSeats, // Total de places del vehicle
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(tripsRef, tripWithSeats);
    return docRef.id;
  } catch (error) {
    console.error("Error creating trip:", error);
    throw error;
  }
};

export const bookTrip = async (tripId, userId) => {
  try {
    const tripRef = doc(db, "trips", tripId);
    const tripDoc = await getDoc(tripRef);

    if (!tripDoc.exists()) {
      throw new Error("El viatge no existeix");
    }

    const tripData = tripDoc.data();
    if (tripData.availableSeats <= 0) {
      throw new Error("No hi ha places disponibles");
    }

    // Actualitzem les places disponibles
    await updateDoc(tripRef, {
      availableSeats: tripData.availableSeats - 1,
      passengers: arrayUnion(userId)
    });

    return true;
  } catch (error) {
    console.error("Error reservant el viatge:", error);
    throw error;
  }
};