import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

interface NotificationsProps {
  onLogout?: () => void;
  onPageChange?: (page: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onLogout, onPageChange }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const notifications = [
    {
      id: 1,
      type: 'verification',
      title: 'New Vendor Verification Request',
      description: 'Das Khaman House submitted new documents for approval.',
      time: '5 min ago',
      icon: 'ri-file-list-line',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      isUnread: true,
      action: 'Review Now',
      actionType: 'primary'
    },
    {
      id: 2,
      type: 'event',
      title: 'Event Approval Request',
      description: 'Spice Festival 2025 needs your approval to be published.',
      time: '15 min ago',
      icon: 'ri-calendar-event-line',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      isUnread: true,
      actions: [
        { text: 'Reject', type: 'secondary' },
        { text: 'Approve', type: 'primary' }
      ]
    },
    {
      id: 3,
      type: 'system',
      title: 'System Alert',
      description: 'Payment gateway experiencing intermittent issues. Some transactions may be delayed.',
      time: '32 min ago',
      icon: 'ri-error-warning-line',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      isUnread: true,
      action: 'View Details',
      actionType: 'primary'
    },
    {
      id: 4,
      type: 'feedback',
      title: 'New Customer Feedback',
      description: 'Emily Richardson left a 4-star review for Taste of Punjab restaurant.',
      time: '1 hour ago',
      icon: 'ri-message-3-line',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      isUnread: false,
      action: 'View Feedback',
      actionType: 'secondary'
    },
    {
      id: 5,
      type: 'verification',
      title: 'Guide Verification Request',
      description: 'Rajesh Patel submitted new documents for guide verification.',
      time: '3 hours ago',
      icon: 'ri-file-list-line',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      isUnread: false,
      action: 'Review',
      actionType: 'secondary'
    },
    {
      id: 6,
      type: 'verification',
      title: 'Verification Approved',
      description: 'Bombay Street Food vendor verification was approved by admin Sarah Johnson.',
      time: 'Yesterday',
      icon: 'ri-check-double-line',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500',
      isUnread: false,
      action: 'View Details',
      actionType: 'secondary'
    },
    {
      id: 7,
      type: 'event',
      title: 'Event Update',
      description: 'Traditional Cooking Workshop has been rescheduled to June 25, 2025.',
      time: 'Yesterday',
      icon: 'ri-calendar-event-line',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      isUnread: false,
      action: 'View Event',
      actionType: 'secondary'
    },
    {
      id: 8,
      type: 'feedback',
      title: 'Complaint Received',
      description: 'Customer Michael Thompson reported an issue with Golden Spice restaurant\'s delivery service.',
      time: '2 days ago',
      icon: 'ri-message-3-line',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      isUnread: false,
      action: 'Investigate',
      actionType: 'secondary'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All', count: 8 },
    { id: 'verification', label: 'Verification', count: 3 },
    { id: 'event', label: 'Event', count: 2 },
    { id: 'system', label: 'System', count: 1 },
    { id: 'feedback', label: 'Feedback', count: 2 }
  ];

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === activeTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSidebarTabChange = (tab: string) => {
    if (onPageChange) {
      onPageChange(tab);
    }
  };

  return (
    <div className="flex h-screen bg-[#FDF8F4]">
      {/* Sidebar */}
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        activeTab="notifications"
        onTabChange={handleSidebarTabChange}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary">Notifications</h1>
              <p className="text-gray-500 mt-2">
                Manage all your system notifications in one place
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Feed */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card rounded-xl shadow-sm p-4 flex transition-all duration-200 hover:transform hover:-translate-y-1 ${
                  notification.isUnread
                    ? 'bg-[#FDF8F4] border-l-4 border-primary'
                    : 'bg-white'
                }`}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full shrink-0 ${notification.iconBg}`}
                >
                  <i className={`${notification.icon} ri-lg ${notification.iconColor}`}></i>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-secondary">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {notification.description}
                      </p>
                      <span className="text-xs text-gray-400 mt-2 block">
                        {notification.time}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {notification.actions ? (
                        notification.actions.map((action, index) => (
                          <button
                            key={index}
                            className={`px-3 py-2 rounded-button whitespace-nowrap transition-colors duration-200 ${
                              action.type === 'primary'
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {action.text}
                          </button>
                        ))
                      ) : (
                        <button
                          className={`px-4 py-2 rounded-button whitespace-nowrap transition-colors duration-200 ${
                            notification.actionType === 'primary'
                              ? 'bg-primary text-white hover:bg-primary/90'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {notification.action}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;
