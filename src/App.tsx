import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Videos from "./pages/Videos";
import Upload from "./pages/Upload";
import Inbox from "./pages/Inbox";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import EditProfile from "./pages/EditProfile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import WalletPage from "./pages/settings/WalletPage";
import PrivacyPage from "./pages/settings/PrivacyPage";
import AnalyticsPage from "./pages/settings/AnalyticsPage";
import QRCodePage from "./pages/settings/QRCodePage";
import SecurityPage from "./pages/settings/SecurityPage";
import AccountPage from "./pages/settings/AccountPage";
import HelpPage from "./pages/settings/HelpPage";
import BottomNav from "./components/BottomNav";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/wallet" element={<WalletPage />} />
        <Route path="/settings/privacy" element={<PrivacyPage />} />
        <Route path="/settings/analytics" element={<AnalyticsPage />} />
        <Route path="/settings/qr-code" element={<QRCodePage />} />
        <Route path="/settings/security" element={<SecurityPage />} />
        <Route path="/settings/account" element={<AccountPage />} />
        <Route path="/settings/help" element={<HelpPage />} />
      </Routes>
      <BottomNav />
    </AuthProvider>
  );
}

export default App;
