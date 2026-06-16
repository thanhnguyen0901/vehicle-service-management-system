export function DashboardHome() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Tổng quan</h1>
      <p className="text-gray-500">Chào mừng đến với Hệ Thống Quản Lý Dịch Vụ Xe.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[
          { label: 'Lịch hẹn hôm nay', value: '—', icon: 'pi-calendar', color: 'bg-blue-500' },
          { label: 'Xe đang sửa chữa', value: '—', icon: 'pi-car', color: 'bg-orange-500' },
          { label: 'Hoàn thành hôm nay', value: '—', icon: 'pi-check-circle', color: 'bg-green-500' },
          { label: 'Doanh thu tháng', value: '—', icon: 'pi-dollar', color: 'bg-purple-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center`}>
              <i className={`pi ${card.icon} text-white text-xl`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
