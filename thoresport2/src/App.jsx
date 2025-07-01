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


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/auth" element={<><Navbar/><Adminlogin /></> }/>
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><Navbar/><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/tournament" element={<AdminProtectedRoute><Navbar/><Admintournament /></AdminProtectedRoute>} />
        <Route path="/" element={<UserProtectedRoute><Navbar/><UserDashboard /></UserProtectedRoute>} />  
        <Route path="/profile" element={<UserProtectedRoute><Navbar/><UserProfile /></UserProtectedRoute>} />  
        <Route path="/rankings" element={<UserProtectedRoute><Navbar/><UserRanking /></UserProtectedRoute>} />  
        <Route path="/signin" element={<><Navbar/><UserSigning /></>} />
        <Route path="/signup" element={<UserProtectedRoute><Navbar/><UserSignup /></UserProtectedRoute>} />
        <Route path="/tournament" element={<UserProtectedRoute><Navbar/><UserTournament /></UserProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
