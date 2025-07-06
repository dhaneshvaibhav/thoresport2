import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './admin/admindashboard';
import Adminlogin from './admin/adminlogin';
import Admintournament from './admin/admintournament';
import UserDashboard from './user/userdashboard';
import UserProfile from './user/userprofile';
import UserRanking from './user/userranking';
import UserSigning from './user/usersigning';
import UserSignup from './user/usersignup';
import UserTournament from './user/usertournament';
import ResetPassword from './user/ResetPassword';
import Navbar from './components/navbar';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
import TournamentDetails from './user/TournamentDetails';
import AdminTournamentDetails from './admin/AdminTournamentDetails';
import AdminNavbar from './components/adminnavbar';
import Footer from './components/Footer';
import Leaderboard from './user/leaderboard';

// Layouts
const UserLayout = ({ children }) => (
  <>
    <Navbar />
    <div style={{ paddingTop: '70px', minHeight: '100vh' }}>
      {children}
    </div>
    <Footer />
  </>
);

const AdminLayout = ({ children }) => (
  <>
    <AdminNavbar />
    <div style={{ paddingTop: '70px', minHeight: '100vh' }}>
      {children}
    </div>
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <Routes>

        {/* Admin Routes */}
        <Route path="/admin/auth" element={<AdminLayout><Adminlogin /></AdminLayout>} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/tournament" element={<AdminProtectedRoute><AdminLayout><Admintournament /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/tournament/:id" element={<AdminProtectedRoute><AdminLayout><AdminTournamentDetails /></AdminLayout></AdminProtectedRoute>} />

        {/* Public User Routes */}
        <Route path="/signin" element={<UserLayout><UserSigning /></UserLayout>} />
        <Route path="/signup" element={<UserLayout><UserSignup /></UserLayout>} />
        <Route path="/reset-password" element={<UserLayout><ResetPassword /></UserLayout>} />

        {/* User Protected Routes */}
        <Route path="/" element={<UserProtectedRoute><UserLayout><UserDashboard /></UserLayout></UserProtectedRoute>} />
        <Route path="/profile" element={<UserProtectedRoute><UserLayout><UserProfile /></UserLayout></UserProtectedRoute>} />
        <Route path="/rankings" element={<UserProtectedRoute><UserLayout><UserRanking /></UserLayout></UserProtectedRoute>} />
        <Route path="/tournament" element={<UserProtectedRoute><UserLayout><UserTournament /></UserLayout></UserProtectedRoute>} />
        <Route path="/tournament/:id" element={<UserProtectedRoute><UserLayout><TournamentDetails /></UserLayout></UserProtectedRoute>} />
        <Route path="/leaderboard" element={<UserProtectedRoute><UserLayout><Leaderboard /></UserLayout></UserProtectedRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
