import React from 'react';
import { Button } from '../components/button';

const Auth = () => {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="auth-logo">Eros</div>
          <button className="btn primary login-btn"> Đăng nhập</button>
      </header>

      <main className="auth-hero">
        <div className="hero-inner">
          <h1 className="hero-title">Quẹt Phải</h1>
          <p className="hero-sub">Kết nối, trò chuyện và gặp gỡ người mới</p>
            <div className="hero-cta">
              <Button className="btn primary">Tạo tài khoản</Button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;