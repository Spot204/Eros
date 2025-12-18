import React, { useState } from "react";
import { Button } from "../components/button";
import { AuthDialog } from "../components/authDialog";



const Auth = () => {
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authMode, setAuthMode] = useState(""); // "login" hoặc "register"

  return (
    <div className="overflow-hidden">
      <div className="auth-page h">
        <div className="auth-header">
          <div className="auth-logo">Eros</div>
          <Button type="submit" variant="default" size="default" onClick={() => { setAuthMode("login"); setAuthOpen(true)}}> Đăng nhập</Button>
        </div>
        <main className="auth-hero">
          <div className="hero-inner">
            <h1 className="hero-title">Quẹt Phải</h1>
            <p className="hero-sub">Kết nối, trò chuyện và gặp gỡ người mới</p>
            <div className="hero-cta">
              <Button type="submit" variant="default" size="default" onClick={() => { setAuthMode("register"); setAuthOpen(true)}}>Tạo tài khoản</Button>
            </div>
          </div>
        </main>
        <AuthDialog
          open={authOpen}
          onOpenChange={setAuthOpen}
          defaultMode={authMode}
        />
      </div>
    </div>
  );
};

export default Auth;
