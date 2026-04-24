import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard & Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Booklets from "./pages/booklet/Booklet";
import Notebooks from "./pages/notebook/Notebook";
import Artbooks from "./pages/artbook/Artbook";
import Brochures from "./pages/brochure/Brochure";
import BusinessCards from "./pages/businessCard/BusinessCard";
import Magazines from "./pages/magazine/Magazine";
import CustomCards from "./pages/customCard/CustomCard";
import CustomEnvelopes from "./pages/customEnvelope/CustomEnvelope";
import LedgerRegisters from "./pages/ledgerRegister/LedgerRegister";
import Letterheads from "./pages/letterhead/Letterhead";
import Pamphlets from "./pages/pamphlet/Pamphlet";
import ProductCatalogues from "./pages/productCatalogue/ProductCatalogue";
import ShoppingBags from "./pages/shoppingBags/ShoppingBags";
import Textbook from "./pages/textbook/Textbook";
import Postcard from "./pages/postcard/Postcard";
import Diary from "./pages/diary/Diary";
import Calendar from "./pages/calendar/Calendar";
import Filesfolders from "./pages/filesfolders/Filesfolders";
import OffsetPackaging from "./pages/offsetPackaging/OffsetPackaging";
import Blog from "./pages/blog/Blog";
import Enquiry from "./pages/enquiry/Enquiry";

import Profile from "./pages/profile/Profile";

import "./App.css";
import ScrollToTopOnNavigate from "./components/ScrollToTopOnNavigate";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (allow access to login/register pages)
const PublicRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return children;
};

function AppRoutes() {
  return (
    <Router>
      <ScrollToTopOnNavigate />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booklets"
          element={
            <ProtectedRoute>
              <Layout>
                <Booklets />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notebooks"
          element={
            <ProtectedRoute>
              <Layout>
                <Notebooks />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/artbooks"
          element={
            <ProtectedRoute>
              <Layout>
                <Artbooks />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/brochures"
          element={
            <ProtectedRoute>
              <Layout>
                <Brochures />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business-cards"
          element={
            <ProtectedRoute>
              <Layout>
                <BusinessCards />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/magazines"
          element={
            <ProtectedRoute>
              <Layout>
                <Magazines />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom-cards"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomCards />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom-envelopes"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomEnvelopes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ledger-registers"
          element={
            <ProtectedRoute>
              <Layout>
                <LedgerRegisters />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/letterheads"
          element={
            <ProtectedRoute>
              <Layout>
                <Letterheads />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pamphlets"
          element={
            <ProtectedRoute>
              <Layout>
                <Pamphlets />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/product-catalogues"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductCatalogues />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shopping-bags"
          element={
            <ProtectedRoute>
              <Layout>
                <ShoppingBags />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/postcards"
          element={
            <ProtectedRoute>
              <Layout>
                <Postcard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/diaries"
          element={
            <ProtectedRoute>
              <Layout>
                <Diary />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendars"
          element={
            <ProtectedRoute>
              <Layout>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/filesfolders"
          element={
            <ProtectedRoute>
              <Layout>
                <Filesfolders />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/textbooks"
          element={
            <ProtectedRoute>
              <Layout>
                <Textbook />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/offset-packaging"
          element={
            <ProtectedRoute>
              <Layout>
                <OffsetPackaging />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog"
          element={
            <ProtectedRoute>
              <Layout>
                <Blog />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enquiry"
          element={
            <ProtectedRoute>
              <Layout>
                <Enquiry />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default Route - Always redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
