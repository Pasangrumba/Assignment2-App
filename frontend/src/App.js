import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import CreateAsset from "./CreateAsset";
import Library from "./Library";
import AssetDetail from "./AssetDetail";
import RequireAuth from "./RequireAuth";
import EditAsset from "./EditAsset";
import Profile from "./Profile";
import PendingReviews from "./PendingReviews";
import MetricsDashboard from "./MetricsDashboard";
import GovernanceAdmin from "./GovernanceAdmin";
import Champions from "./Champions";
import ChampionInbox from "./ChampionInbox";
import AdminChampions from "./AdminChampions";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
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
          path="/assets/:id/edit"
          element={
            <RequireAuth>
              <EditAsset />
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
        <Route
          path="/reviews/pending"
          element={
            <RequireAuth>
              <PendingReviews />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/metrics"
          element={
            <RequireAuth>
              <MetricsDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/governance"
          element={
            <RequireAuth>
              <GovernanceAdmin />
            </RequireAuth>
          }
        />
        <Route
          path="/champions"
          element={
            <RequireAuth>
              <Champions />
            </RequireAuth>
          }
        />
        <Route
          path="/champions/inbox"
          element={
            <RequireAuth>
              <ChampionInbox />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/champions"
          element={
            <RequireAuth>
              <AdminChampions />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
