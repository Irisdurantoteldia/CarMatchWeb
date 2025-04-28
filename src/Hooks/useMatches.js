import { useState, useEffect } from "react";
import { message } from "antd";
import { getUserMatches } from "../Services/matchService";

export const useMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const matchDetails = await getUserMatches();
      setMatches(matchDetails);
    } catch (error) {
      console.error("Error fetching matches:", error);
      message.error("No s'han pogut carregar els 'matches'. Si us plau, torna-ho a provar més tard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);  // Deixem la dependència buida per carregar només al muntar

  return { matches, loading, refreshMatches: fetchMatches };
};