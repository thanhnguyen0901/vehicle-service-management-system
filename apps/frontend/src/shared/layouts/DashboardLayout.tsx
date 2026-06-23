import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, logoutRequest } from '../../features/auth/authSlice';
import { Button } from 'primereact/button';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: 'pi-home', label: 'Tổng quan', end: true },
  { to: '/dashboard/customers', icon: 'pi-id-card', label: 'Khách hàng' },
  { to: '/dashboard/vehicles', icon: 'pi-car', label: 'Phương tiện' },
  { to: '/dashboard/appointments', icon: 'pi-calendar', label: 'Lịch hẹn' },
  { to: '/dashboard/services', icon: 'pi-wrench', label: 'Dịch vụ' },
  { to: '/dashboard/parts', icon: 'pi-box', label: 'Phụ tùng' },
  { to: '/dashboard/users', icon: 'pi-users', label: 'Người dùng', roles: ['Admin', 'Manager'] },
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
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full flex-col bg-primary-900 text-white md:w-64">
        <div className="border-b border-primary-700 p-4 md:p-6">
          <div className="flex items-center gap-3">
            <i className="pi pi-car text-2xl" />
            <div>
              <h2 className="font-bold text-sm">VSMS</h2>
              <p className="text-xs text-primary-200">Quản Lý Dịch Vụ Xe</p>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-2 py-2 md:flex-1 md:flex-col md:gap-0 md:px-0 md:py-4">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(user?.role ?? ''))
            .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-md px-4 py-3 text-sm transition-colors md:rounded-none md:px-6 ${
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
        <div className="flex items-center justify-between gap-3 border-t border-primary-700 p-3 md:block md:p-4">
          <div className="mb-0 min-w-0 text-xs text-primary-300 md:mb-2">
            <div className="font-medium text-white truncate">{user?.fullName}</div>
            <div>{user?.role}</div>
          </div>
          <Button
            label="Đăng xuất"
            icon="pi pi-sign-out"
            severity="secondary"
            size="small"
            className="shrink-0 text-xs md:w-full"
            onClick={handleLogout}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
