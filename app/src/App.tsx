import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { DockBridge, Shell } from "./components/Shell";
import { useStore } from "./lib/store";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Rehat from "./pages/Rehat";
import Teman, { Chat } from "./pages/Teman";
import { Rujuk, Tinjauan } from "./pages/Review";
import { Bantuan, Batas, Persetujuan, Saya } from "./pages/Me";
import Dok from "./pages/Dok";
import { BKPanel, Dashboard, PeerGuide, PeerPanel } from "./pages/Panels";
import type { Role } from "./lib/data";

function Guard({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { s } = useStore();
  const loc = useLocation();
  if (!s.user) return <Navigate to="/masuk" replace state={{ from: loc.pathname }} />;
  if (s.user.role === "mahasiswa" && !s.onboarded && loc.pathname !== "/mulai") return <Navigate to="/mulai" replace />;
  if (roles && !roles.includes(s.user.role)) {
    const home: Record<Role, string> = { mahasiswa: "/", peer: "/panel/teman", bk: "/panel/bk", admin: "/dasbor" };
    return <Navigate to={home[s.user.role]} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const M: Role[] = ["mahasiswa"];
  return (
    <>
      <DockBridge />
      <Routes>
        <Route path="/masuk" element={<Login />} />
        <Route path="/mulai" element={<Guard roles={M}><Onboarding /></Guard>} />
        <Route path="/rehat" element={<Guard roles={M}><Rehat /></Guard>} />
        <Route element={<Guard><Shell /></Guard>}>
          <Route index element={<Guard roles={M}><Home /></Guard>} />
          <Route path="teman" element={<Guard roles={M}><Teman /></Guard>} />
          <Route path="teman/obrolan/:id" element={<Guard roles={M}><Chat /></Guard>} />
          <Route path="tinjauan" element={<Guard roles={M}><Tinjauan /></Guard>} />
          <Route path="rujuk" element={<Guard roles={M}><Rujuk /></Guard>} />
          <Route path="saya" element={<Saya />} />
          <Route path="saya/persetujuan" element={<Guard roles={M}><Persetujuan /></Guard>} />
          <Route path="saya/batas" element={<Guard roles={M}><Batas /></Guard>} />
          <Route path="saya/dok" element={<Guard roles={M}><Dok /></Guard>} />
          <Route path="bantuan" element={<Bantuan />} />
          <Route path="panel/teman" element={<Guard roles={["peer"]}><PeerPanel /></Guard>} />
          <Route path="panel/teman/panduan" element={<Guard roles={["peer"]}><PeerGuide /></Guard>} />
          <Route path="panel/bk" element={<Guard roles={["bk"]}><BKPanel /></Guard>} />
          <Route path="dasbor" element={<Guard roles={["admin"]}><Dashboard /></Guard>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
