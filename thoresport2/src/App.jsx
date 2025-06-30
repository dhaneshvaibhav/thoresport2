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


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin-login" element={<><Navbar/><Adminlogin /></>} />
        <Route path="/admin-dashboard" element={<><Navbar/><AdminDashboard /></>} />
        <Route path="/admin-tournament" element={<><Navbar/><Admintournament /></>} />
        <Route path="/" element={<><Navbar/><UserDashboard /></>} />  
        <Route path="/profile" element={<><Navbar/><UserProfile /></>} />  
        <Route path="/rankings" element={<><Navbar/><UserRanking /></>} />  
        <Route path="/signin" element={<><Navbar/><UserSigning /></>} />
        <Route path="/signup" element={<><Navbar/><UserSignup /></>} />
        <Route path="/tournament" element={<><Navbar/><UserTournament /></>} />
      </Routes>
    </Router>
  );
}

export default App;
