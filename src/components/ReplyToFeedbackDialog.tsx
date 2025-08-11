import React, { useState } from 'react';

interface ReplyToFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackData: {
    userInitials: string;
    userName: string;
    date: string;
    message: string;
  };
  onSendResponse: (response: string, attachments: File[]) => void;
}

const ReplyToFeedbackDialog: React.FC<ReplyToFeedbackDialogProps> = ({ 
  isOpen, 
  onClose, 
  feedbackData,
  onSendResponse
}) => {
  const [response, setResponse] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleSend = () => {
    if (response.trim()) {
      onSendResponse(response, attachments);
      setResponse('');
      setAttachments([]);
      onClose();
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Reply to Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original Feedback */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-medium">{feedbackData.userInitials}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-800">{feedbackData.userName}</span>
                  <span className="text-gray-500 text-sm">{feedbackData.date}</span>
                </div>
                <p className="text-gray-700">{feedbackData.message}</p>
              </div>
            </div>
          </div>

          {/* Your Response */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Response
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your response here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <i className="ri-attachment-line text-gray-500"></i>
                  <span className="text-gray-700">Add File</span>
                </div>
              </label>
              <span className="text-sm text-gray-500">Maximum file size: 10MB</span>
            </div>
            
            {/* File List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <i className="ri-file-line text-gray-500"></i>
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <div className="mr-4">
            <button
              onClick={handleSend}
              disabled={!response.trim()}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="ri-send-plane-fill mr-2"></i>
              <span>Send Response</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyToFeedbackDialog;
