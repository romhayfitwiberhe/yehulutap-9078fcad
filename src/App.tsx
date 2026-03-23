import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Videos from "./pages/Videos";
import Upload from "./pages/Upload";
import Inbox from "./pages/Inbox";
import Profile from "./pages/Profile";
import BottomNav from "./components/BottomNav";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default App;
