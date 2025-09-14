import { Route, Routes } from 'react-router-dom';
import Landing from './pages/landing';
import Signin from './pages/signin';
import Home from './pages/home';
import Navbar from './components/Navbar';
import ShopkeeperDashboard from './pages/shopkeeper-dashboard';
import CatalogueGenerator from './pages/CatalogueGenerator';
import Shop from './pages/shop-3d';
import BusinessInfo from './pages/onboarding/businessInfo';
import Welcome from './pages/onboarding/welcoming';
import Explore from './pages/explore';
import Dashboard from './pages/dashboard';
import GeneralUsersInfo from './pages/onboarding/generalUsersInfo';
import PostDetails from './pages/PostDetails';
import Profile from './pages/profile';
import ShopDetails from './pages/shopDetails';
import Shop3D from './pages/shop-3d';
function App() {
  return (
    <div className="min-h-screen bg-bg-primary w-full overflow-x-hidden">
      <Navbar />
      <main className="w-full">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/businessInfo" element={<BusinessInfo />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/generalUsersInfo" element={<GeneralUsersInfo />} />
          <Route path="/catalogue" element={<CatalogueGenerator />} />
          <Route path="/shop-3d" element={<Shop3D />} />
          <Route path="/shopkeeper-dashboard" element={<ShopkeeperDashboard />} />
          <Route path="/post/:postId" element={<PostDetails />} />
          <Route path="/shop/:shopId" element={<ShopDetails />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;