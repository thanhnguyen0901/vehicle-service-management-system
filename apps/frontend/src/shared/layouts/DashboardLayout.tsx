import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, logoutRequest } from '../../features/auth/authSlice';
import { Button } from 'primereact/button';

const navItems = [
  { to: '/dashboard', icon: 'pi-home', label: 'Tổng quan', end: true },
];

export function DashboardLayout() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutRequest());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white flex flex-col">
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <i className="pi pi-car text-2xl" />
            <div>
              <h2 className="font-bold text-sm">VSMS</h2>
              <p className="text-xs text-primary-200">Quản Lý Dịch Vụ Xe</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white font-medium'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <i className={`pi ${item.icon}`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-primary-700">
          <div className="text-xs text-primary-300 mb-2">
            <div className="font-medium text-white truncate">{user?.fullName}</div>
            <div>{user?.role}</div>
          </div>
          <Button
            label="Đăng xuất"
            icon="pi pi-sign-out"
            severity="secondary"
            size="small"
            className="w-full text-xs"
            onClick={handleLogout}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
