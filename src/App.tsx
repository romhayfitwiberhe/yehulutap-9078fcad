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
      </Routes>
      <BottomNav />
    </AuthProvider>
  );
}

export default App;
