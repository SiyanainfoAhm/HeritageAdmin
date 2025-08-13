import React from 'react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  onToggle,
  activeTab,
  onTabChange,
  onLogout
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { id: 'reports', label: 'Reports', icon: 'ri-file-list-line' },
    { id: 'manage', label: 'Manage', icon: 'ri-settings-line' },
    { id: 'verification', label: 'Verification', icon: 'ri-check-line' },
    { id: 'marketing', label: 'Marketing', icon: 'ri-megaphone-line' },
    { id: 'access-control', label: 'Access Control', icon: 'ri-shield-line' }
    ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-gray-900 shadow-lg transform transition-all duration-300 ease-in-out ${
      isExpanded ? 'w-64' : 'w-16'
    } lg:relative lg:translate-x-0`}>
      
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          {isExpanded && (
            <h1 className="font-pacifico text-xl text-white">Heritage Admin</h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                activeTab === item.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r"></div>
              )}
              <i className={`${item.icon} text-lg ${isExpanded ? 'mr-3' : ''}`}></i>
              {isExpanded && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
        {/* Notifications */}
        <div className="mb-3">
          <button 
            onClick={() => onTabChange('notifications')}
            className="relative w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <i className="ri-notification-line text-lg mr-3"></i>
            {isExpanded && <span>Notifications</span>}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              8
            </span>
          </button>
        </div>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <i className="ri-logout-box-r-line text-lg mr-3"></i>
            {isExpanded && <span>Logout</span>}
          </button>
        )}

        {/* Collapse Button */}
        <div className="mt-3">
          <button
            onClick={onToggle}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-white/10 transition-colors text-gray-300"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {isExpanded ? <i className="ri-menu-fold-line text-lg"></i> : <i className="ri-menu-unfold-line text-lg"></i>}
            </div>
            {isExpanded && <span className="nav-text">Collapse</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
