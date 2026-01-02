import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import CreateAsset from "./CreateAsset";
import Library from "./Library";
import AssetDetail from "./AssetDetail";
import RequireAuth from "./RequireAuth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/assets/new"
          element={
            <RequireAuth>
              <CreateAsset />
            </RequireAuth>
          }
        />
        <Route
          path="/assets/:id"
          element={
            <RequireAuth>
              <AssetDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/library"
          element={
            <RequireAuth>
              <Library />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
