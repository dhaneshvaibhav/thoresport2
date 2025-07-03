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
import Navbar from './components/navbar';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
import TournamentDetails from './user/TournamentDetails';
import AdminTournamentDetails from './admin/AdminTournamentDetails';
import AdminNavbar from './components/adminnavbar';
import CreateTeam from './user/CreateTeam';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/auth" element={<><AdminNavbar/><Adminlogin /></> }/>
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminNavbar/><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/tournament" element={<AdminProtectedRoute><AdminNavbar/><Admintournament /></AdminProtectedRoute>} />
        <Route path="/" element={<UserProtectedRoute><Navbar/><UserDashboard /></UserProtectedRoute>} />  
        <Route path="/profile" element={<UserProtectedRoute><Navbar/><UserProfile /></UserProtectedRoute>} />  
        <Route path="/rankings" element={<UserProtectedRoute><Navbar/><UserRanking /></UserProtectedRoute>} />  
        <Route path="/signin" element={<><Navbar/><UserSigning /></>} />
        <Route path="/signup" element={<><Navbar/><UserSignup /></>} />
        <Route path="/tournament" element={<UserProtectedRoute><Navbar/><UserTournament /></UserProtectedRoute>} />
        <Route path="/tournament/:id" element={<UserProtectedRoute><Navbar/><TournamentDetails /></UserProtectedRoute>} />
        <Route path="/admin/tournament/:id" element={<AdminProtectedRoute><AdminNavbar/><AdminTournamentDetails /></AdminProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
