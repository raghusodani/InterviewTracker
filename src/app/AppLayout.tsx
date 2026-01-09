import { Link, Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-6 py-4 flex gap-6">
        <Link to="/" className="font-semibold text-gray-800">
          Home
        </Link>
        <Link to="/dashboard" className="font-semibold text-blue-600">
          Dashboard
        </Link>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
