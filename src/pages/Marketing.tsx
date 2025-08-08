import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CampaignTab from '../components/CampaignTab';
import NotificationTab from '../components/NotificationTab';
import WhatsAppTab from '../components/WhatsAppTab';
import MailTab from '../components/MailTab';
import AddCampaignDialog from '../components/AddCampaignDialog';
import AddNotificationDialog from '../components/AddNotificationDialog';
import ViewDetailsDialog from '../components/ViewDetailsDialog';

interface MarketingProps {
  onPageChange?: (page: string) => void;
  onLogout?: () => void;
}

interface CampaignFormData {
  name: string;
  description: string;
  audience: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface NotificationFormData {
  title: string;
  message: string;
  audience: string;
  scheduledDate?: string;
}

const Marketing: React.FC<MarketingProps> = ({ onPageChange, onLogout }) => {
  const [activeTab, setActiveTab] = useState('campaign-tab');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  // Dialog states
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [isAddNotificationOpen, setIsAddNotificationOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [viewDetailsData, setViewDetailsData] = useState<any>(null);
  const [viewDetailsType, setViewDetailsType] = useState<'campaign' | 'notification' | 'whatsapp' | 'mail'>('campaign');
  const [notificationType, setNotificationType] = useState<'notification' | 'whatsapp' | 'mail'>('notification');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSidebarTabChange = (tab: string) => {
    if (onPageChange) {
      onPageChange(tab);
    }
  };

  // Campaign handlers
  const handleAddCampaign = () => {
    setIsAddCampaignOpen(true);
  };

  const handleCampaignSubmit = (data: CampaignFormData) => {
    console.log('Campaign submitted:', data);
    // Here you would typically send the data to your backend
    alert('Campaign created successfully!');
  };

  const handleViewCampaignDetails = (id: string) => {
    // Mock data - in real app, you'd fetch this from your backend
    const campaignData = {
      name: 'Summer Heritage Walk',
      description: 'Special guided tours of Ahmedabad heritage sites',
      audience: 'All Users',
      status: 'Active',
      startDate: 'June 20, 2025',
      endDate: 'August 31, 2025'
    };
    setViewDetailsData(campaignData);
    setViewDetailsType('campaign');
    setIsViewDetailsOpen(true);
  };

  const handleEditCampaignStatus = (id: string) => {
    console.log('Edit campaign status:', id);
    // Here you would typically open an edit dialog or navigate to edit page
    alert(`Edit status for campaign ${id}`);
  };

  // Notification handlers
  const handleAddNotification = (type: 'notification' | 'whatsapp' | 'mail') => {
    setNotificationType(type);
    setIsAddNotificationOpen(true);
  };

  const handleNotificationSubmit = (data: NotificationFormData) => {
    console.log('Notification submitted:', data);
    // Here you would typically send the data to your backend
    alert('Notification sent successfully!');
  };

  const handleViewNotificationDetails = (id: string) => {
    // Mock data - in real app, you'd fetch this from your backend
    const notificationData = {
      title: 'Summer Heritage Walk Launch',
      message: 'Join us for special guided tours of Ahmedabad heritage sites. Experience the rich history and culture of our beautiful city.',
      audience: 'All Users',
      sentDate: 'June 16, 2025',
      status: 'Sent'
    };
    setViewDetailsData(notificationData);
    setViewDetailsType('notification');
    setIsViewDetailsOpen(true);
  };

  const handleViewWhatsAppDetails = (id: string) => {
    // Mock data - in real app, you'd fetch this from your backend
    const whatsappData = {
      title: 'Heritage Walk Weekend',
      message: 'Join us for the Heritage Walk this weekend! 🏛️ Experience the rich history of our city with our expert guides.',
      audience: 'All Users',
      sentDate: 'Aug 07, 2025',
      status: 'Sent'
    };
    setViewDetailsData(whatsappData);
    setViewDetailsType('whatsapp');
    setIsViewDetailsOpen(true);
  };

  const handleViewMailDetails = (id: string) => {
    // Mock data - in real app, you'd fetch this from your backend
    const mailData = {
      title: 'Monthly Heritage Newsletter',
      message: 'Monthly Heritage Newsletter: Discover the latest updates, upcoming events, and featured stories from our heritage community.',
      audience: 'All Users',
      sentDate: 'Aug 07, 2025',
      status: 'Sent'
    };
    setViewDetailsData(mailData);
    setViewDetailsType('mail');
    setIsViewDetailsOpen(true);
  };

  useEffect(() => {
    // Initialize tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        if (tabId) {
          handleTabChange(tabId);
        }
      });
    });

    // Update active states
    tabButtons.forEach(button => {
      const tabId = button.getAttribute('data-tab');
      if (tabId === activeTab) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      const contentId = content.id;
      if (contentId === activeTab) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab="marketing" 
        onTabChange={handleSidebarTabChange}
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#FDF8F4] shadow-sm py-4 px-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-secondary">Marketing</h1>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6">
            <div className="flex space-x-4">
              <button 
                className="tab-button active" 
                data-tab="campaign-tab"
              >
                Campaign
              </button>
              <button 
                className="tab-button" 
                data-tab="notification-tab"
              >
                Notification
              </button>
              <button 
                className="tab-button" 
                data-tab="whatsapp-tab"
              >
                WhatsApp Notification
              </button>
              <button 
                className="tab-button" 
                data-tab="mail-tab"
              >
                Mail Notification
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Campaign Tab */}
          <CampaignTab 
            onAddCampaign={handleAddCampaign}
            onViewDetails={handleViewCampaignDetails}
            onEditStatus={handleEditCampaignStatus}
          />

          {/* Notification Tab */}
          <NotificationTab 
            onAddNotification={() => handleAddNotification('notification')}
            onViewDetails={handleViewNotificationDetails}
          />

          {/* WhatsApp Tab */}
          <WhatsAppTab 
            onAddNotification={() => handleAddNotification('whatsapp')}
            onViewDetails={handleViewWhatsAppDetails}
          />

          {/* Mail Tab */}
          <MailTab 
            onAddNotification={() => handleAddNotification('mail')}
            onViewDetails={handleViewMailDetails}
          />
        </div>
      </div>

      {/* Dialogs */}
      <AddCampaignDialog 
        isOpen={isAddCampaignOpen}
        onClose={() => setIsAddCampaignOpen(false)}
        onSubmit={handleCampaignSubmit}
      />

      <AddNotificationDialog 
        isOpen={isAddNotificationOpen}
        onClose={() => setIsAddNotificationOpen(false)}
        onSubmit={handleNotificationSubmit}
        type={notificationType}
      />

      <ViewDetailsDialog 
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        data={viewDetailsData}
        type={viewDetailsType}
      />
    </div>
  );
};

export default Marketing;
