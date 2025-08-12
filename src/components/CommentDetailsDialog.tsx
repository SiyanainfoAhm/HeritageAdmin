import React from 'react';

interface CommentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  comment: {
    name: string;
    userInitials: string;
    type: string;
    entityName: string;
    comment: string;
    rating: number;
    date: string;
    photos?: string[];
  };
  onReply: () => void;
}

const CommentDetailsDialog: React.FC<CommentDetailsDialogProps> = ({
  isOpen,
  onClose,
  comment,
  onReply
}) => {
  if (!isOpen) {
    return null;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Heritage Site':
        return 'bg-blue-100 text-blue-800';
      case 'Vendor':
        return 'bg-yellow-100 text-yellow-800';
      case 'Event':
        return 'bg-purple-100 text-purple-800';
      case 'Local Guide':
        return 'bg-green-100 text-green-800';
      case 'Food':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`ri-star-fill ${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          ></i>
        ))}
        <span className="ml-2 text-sm text-gray-900">{rating}</span>
      </div>
    );
  };

  return (
    <div
      id="view-comment-modal"
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            Comment Details
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
          >
            <i className="ri-close-line ri-lg"></i>
          </button>
        </div>
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: 'calc(90vh - 200px)' }}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  id="comment-user-avatar"
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3"
                >
                  {comment.userInitials}
                </div>
                <div>
                  <div
                    id="comment-user-name"
                    className="font-medium"
                  >
                    {comment.name}
                  </div>
                  <div
                    className="text-sm text-gray-500"
                    id="comment-date"
                  >
                    {comment.date}
                  </div>
                </div>
              </div>
              <div
                id="comment-rating"
                className="flex items-center"
              >
                {renderStars(comment.rating)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">
                Comment for
              </div>
              <div className="flex items-center">
                <span
                  id="comment-type"
                  className={`px-2 py-1 rounded-full text-xs mr-2 ${getTypeColor(comment.type)}`}
                >
                  {comment.type}
                </span>
                <span id="comment-entity" className="font-medium">
                  {comment.entityName}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Comment</div>
              <p
                id="comment-text"
                className="text-gray-700 bg-gray-50 rounded-lg p-4"
              >
                {comment.comment}
              </p>
            </div>
            {comment.photos && comment.photos.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Photos</div>
                <div
                  className="grid grid-cols-2 gap-4"
                  id="comment-photos"
                >
                  {comment.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Comment photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onReply}
            className="reply-comment-btn px-4 py-2 text-white bg-primary rounded-button hover:bg-primary/90 !rounded-button whitespace-nowrap"
          >
            <i className="ri-reply-line mr-2"></i>Reply to Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentDetailsDialog;
