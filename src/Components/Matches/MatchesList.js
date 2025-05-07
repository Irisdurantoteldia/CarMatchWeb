import React, { useState } from 'react';
import MatchCard from './MatchCard';
import { Search } from 'lucide-react';

const MatchesList = ({ matches, isLoading, selectedMatchId, onSelectMatch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar matches basado en el término de búsqueda
  const filteredMatches = matches.filter(match => 
    match.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="matches-list-container">
      <div className="matches-list-header">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar o empezar nuevo chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="matches-list">
        {isLoading ? (
          <div className="loading-matches">Cargando matches...</div>
        ) : filteredMatches.length === 0 ? (
          <div className="no-matches">No se encontraron matches</div>
        ) : (
          filteredMatches.map(match => (
            <div 
              key={match.id}
              className={`match-item ${selectedMatchId === match.id ? 'selected' : ''}`}
              onClick={() => onSelectMatch(match.id)}
            >
              <MatchCard 
                match={match} 
                isListItem={true}
                isSelected={selectedMatchId === match.id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchesList;