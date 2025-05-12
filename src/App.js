import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './FireBase/FirebaseConfig';
import { signOut } from 'firebase/auth';
import MainLayout from './Components/Layout/MainLayout';
import Swipes from './Pagines/Swipes/Swipes';
import Search from './Pagines/Cerca/Search';
import Edit from './Pagines/Editar/Edit';
import Account from './Pagines/Perfil/Account';
import DriverUnavailability from './Pagines/Editar/DriverUnavailability';
import UnavailabilityList from './Pagines/Editar/UnavailabilityList';
import ManageRoutes from './Pagines/Editar/ManageRoutes';
import ManageVehicle from './Pagines/Perfil/ManageVehicle';
import EditSchedule from './Pagines/Editar/EditSchedule';
import SavedRoutes from './Pagines/Editar/SavedRoutes';
import TravelPreferences from './Pagines/Editar/TravelPreferences';
import Login from './Pagines/Inici/Login';
import ProtectedRoute from './Components/ProtectedRoute';
import ChatHome from './Pagines/Messages/ChatHome';
import Help from './Pagines/Perfil/Help';
import Settings from './Pagines/Perfil/Settings';

const App = () => {
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // Tancar sessió després de 30 minuts d'inactivitat
      inactivityTimer = setTimeout(() => {
        if (auth.currentUser) {
          signOut(auth);
        }
      }, 30 * 60 * 1000); // 30 minuts en mil·lisegons
    };

    // Events per reiniciar el temporitzador
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Iniciar el temporitzador
    resetTimer();

    // Netejar els event listeners
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/swipes" element={<Swipes />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/edit" element={<Edit />} />
                  <Route path="/edit/driver-unavailability" element={<DriverUnavailability />} />
                  <Route path="/edit/unavailability-list" element={<UnavailabilityList />} />
                  <Route path="/edit/manage-routes" element={<ManageRoutes />} />
                  <Route path="/edit/manage-vehicle" element={<ManageVehicle />} />
                  <Route path="/edit/saved-routes" element={<SavedRoutes />} />
                  <Route path="/edit/travel-preferences" element={<TravelPreferences />} />
                  <Route path="/edit/edit-schedule" element={<EditSchedule />} />
                  <Route path="/matches" element={<ChatHome />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
