import { useState, useEffect } from "react";
import { Button } from "../components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

export function AuthDialog({ open, onOpenChange, defaultMode = "login" }) {
  const [mode, setMode] = useState(defaultMode);
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
    }
  }, [open, defaultMode]);

  const toggleMode = () => {
    setMode(isLogin ? "register" : "login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    const url = isLogin
      ? "http://localhost:8007/api/auth/login"
      : "http://localhost:8007/api/auth/register";

    const payload = isLogin
      ? { email, password }
      : { username, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Có lỗi xảy ra");
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        onOpenChange(false);
      } else {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setMode("login");
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
      alert("Lỗi mạng, vui lòng thử lại sau.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>{isLogin ? "Đăng nhập" : "Tạo tài khoản"}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Chào mừng bạn trở lại! Đăng nhập để tiếp tục."
              : "Tạo tài khoản để bắt đầu kết nối!"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              className="w-full border p-2 rounded"
              placeholder="Tên hiển thị"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!isLogin && (
            <input
              type="password"
              className="w-full border p-2 rounded"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          <Button type="submit" className="w-full">
            {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
          </Button>
        </form>

        <div className="text-center text-sm mt-2">
          {isLogin ? (
            <>
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:underline"
              >
                Tạo tài khoản
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:underline"
              >
                Đăng nhập
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
