import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './Components/Layout/MainLayout';
import Swipes from './Pagines/Swipes/Swipes';
import Search from './Pagines/Cerca/Search';
import Edit from './Pagines/Editar/Edit';
import Matches from './Pagines/Messages/Matches';
import Account from './Pagines/Perfil/Account';

const App = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/swipes" element={<Swipes />} />
          <Route path="/search" element={<Search />} />
          <Route path="/edit" element={<Edit />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/account" element={<Account />} />
          <Route path="/" element={<Swipes />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
