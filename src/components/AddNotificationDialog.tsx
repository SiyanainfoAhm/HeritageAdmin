import React, { useState } from 'react';
import Dialog from './Dialog';

interface AddNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NotificationFormData) => void;
  type: 'notification' | 'whatsapp' | 'mail';
}

interface NotificationFormData {
  title: string;
  message: string;
  audience: string;
  scheduledDate?: string;
}

const AddNotificationDialog: React.FC<AddNotificationDialogProps> = ({ isOpen, onClose, onSubmit, type }) => {
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    audience: 'all',
    scheduledDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (field: keyof NotificationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getDialogTitle = () => {
    switch (type) {
      case 'whatsapp':
        return 'Add WhatsApp Notification';
      case 'mail':
        return 'Add Email Notification';
      default:
        return 'Add Notification';
    }
  };

  const getMessagePlaceholder = () => {
    switch (type) {
      case 'whatsapp':
        return 'Enter your WhatsApp message...';
      case 'mail':
        return 'Enter your email content...';
      default:
        return 'Enter your notification message...';
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={getDialogTitle()} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter notification title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            required
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={getMessagePlaceholder()}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audience *
            </label>
            <select
              required
              value={formData.audience}
              onChange={(e) => handleInputChange('audience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="tourists">Only Tourists</option>
              <option value="vendors">Only Vendors</option>
              <option value="guides">Only Guides</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Send Notification
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddNotificationDialog;
