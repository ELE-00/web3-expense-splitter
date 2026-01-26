import React from "react";
import ReactDOM from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import "./index.css";

import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { WalletProvider } from "./context/WalletContext";


const router = createBrowserRouter([

  //Public path
  {path: "login", element: <Login/>},

  //Protected App
  { path: "/", 
    element: <ProtectedRoute/>,
    children: [
      { element: <App />, children: [
        { index: true, element: <Dashboard/> },
      ]},

    ]
  }
]); 






ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WalletProvider>
      <RouterProvider router = {router} />
    </WalletProvider>
  </React.StrictMode>
);
