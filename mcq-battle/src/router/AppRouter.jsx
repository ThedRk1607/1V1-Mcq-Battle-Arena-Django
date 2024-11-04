// src/router/AppRouter.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import GamePage from '../pages/GamePage'; // Adjust the path as necessary
import HomePage from "../pages/home.page.jsx";
import LoginPage from "../pages/login.page.jsx";
import EditMcqPage from "../pages/mcq/EditMcqPage.jsx";
import McqPage from "../pages/mcq/McqPage.jsx";
import McqsPage from "../pages/mcq/McqsPage.jsx";
import NewMcqPage from "../pages/mcq/NewMcqPage.jsx";
import SignupPage from "../pages/signup.page.jsx";
import { Urls } from "../constant/Urls.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Lobby from "../components/mcq/Lobby"; // Import the Lobby component

const AppRouter = () => {
  return (
    <Routes>
      <Route path={Urls.Home()} element={<HomePage />} />
      <Route path={Urls.Signup()} element={<SignupPage />} />
      <Route path={Urls.Login()} element={<LoginPage />} />
      <Route path={Urls.Mcqs.Lobby()} element={<Lobby />} /> {/* Corrected this line */}
      <Route
        path={Urls.Mcqs.Mcqs()}
        element={
          <ProtectedRoute>
            <McqsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={Urls.Mcqs.Mcq(":id")}
        element={
          <ProtectedRoute>
            <McqPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={Urls.Mcqs.NewMcq()}
        element={
          <ProtectedRoute>
            <NewMcqPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={Urls.Mcqs.EditMcq(":id")}
        element={
          <ProtectedRoute>
            <EditMcqPage />
          </ProtectedRoute>
        }
      />
      <Route path={Urls.Game(":gameId")} element={<GamePage />} /> {/* New GamePage route */}
    </Routes>
  );
};

export default AppRouter;
