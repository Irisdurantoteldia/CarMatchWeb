import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
                  <Route path="/" element={<Swipes />} />
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
