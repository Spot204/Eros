import { useState, useEffect } from "react";
import { Button } from "../components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";

export function AuthDialog({ open, onOpenChange, defaultMode = "login" }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(defaultMode);
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [user_id, setuser_id] = useState("");

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
    }
  }, [open, defaultMode]);

  const toggleMode = () => {
    setMode(isLogin ? "register" : "login");
  };

  const hanleCheckAccount = async (e, userId) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8007/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        return null;
      }
      return res.json();
    } catch (err) {
      alert("Lỗi mạng, vui lòng thử lại sau.");
    }
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
      ? { email: email, password: password }
      : { username: username, email: email, password: password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && isLogin) {
        const freshUserID = data.userID; // Đây là biến tạm chắc chắn có dữ liệu
        localStorage.setItem("userID", freshUserID); // Lưu vào bộ nhớ trình duyệt
        setuser_id(freshUserID); // Lưu vào state (để dùng cho các component khác sau này)
        const checkRes = await hanleCheckAccount(e, freshUserID);
        // BƯỚC 4: Đợi check profile xong mới điều hướng
        if (checkRes && checkRes.message === "have profile") {
          navigate("/home");
        } else {
          navigate("/create-profile");
        }
      } else {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        // Tự động chuyển sang chế độ đăng nhập để người dùng nhập pass
        setIsLogin(true);
        // Hoặc nếu backend của bạn tự động log in sau khi regis thì làm giống logic isLogin
      }
    } catch (err) {
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
