import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  let token = localStorage.getItem("token"); // ✅ Проверяем токен

try {
  token = localStorage.getItem("token");
  console.log("Token from localStorage:", token);
} catch (e) {
  console.error("Ошибка чтения токена:", e);
}


  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
