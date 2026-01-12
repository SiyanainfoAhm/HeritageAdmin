import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Badge,
  CircularProgress,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ChatService, ChatConversation, ChatMessage } from '@/services/chat.service';
import { useAuth } from '@/context/AuthContext';
import { formatDisplayDate, formatDisplayTime } from '@/utils/dateTime.utils';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    const unsubscribe = ChatService.subscribeToConversations((updatedConversation) => {
      setConversations((prev) => {
        const index = prev.findIndex(
          (c) => c.conversation_id === updatedConversation.conversation_id
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedConversation;
          // Re-sort by last_message_at
          return updated.sort((a, b) => {
            const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return bTime - aTime;
          });
        } else {
          // New conversation
          return [updatedConversation, ...prev].sort((a, b) => {
            const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return bTime - aTime;
          });
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversation_id);
      // Mark messages as read
      if (user?.user_id) {
        ChatService.markMessagesAsRead(selectedConversation.conversation_id, user.user_id)
          .then(() => {
            // Refresh conversations to update unread count
            fetchConversations();
          })
          .catch((err) => console.error('Failed to mark messages as read:', err));
      }
    }
  }, [selectedConversation, user]);

  // Subscribe to new messages in selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = ChatService.subscribeToMessages(
      selectedConversation.conversation_id,
      (newMessage) => {
        setMessages((prev) => {
          // Check if message already exists
          if (prev.some((m) => m.message_id === newMessage.message_id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
        // Mark as read if admin is viewing
        if (user?.user_id && newMessage.sender_type === 'user') {
          ChatService.markMessagesAsRead(selectedConversation.conversation_id, user.user_id).catch(
            (err) => console.error('Failed to mark messages as read:', err)
          );
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedConversation, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ChatService.getAllConversations();
      console.log('Fetched conversations:', data);
      setConversations(data);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const data = await ChatService.getConversationMessages(conversationId, 100, 0);
      console.log('Fetched messages:', data);
      setMessages(data);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to fetch messages');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user?.user_id) return;

    setSending(true);
    try {
      await ChatService.sendMessage(
        selectedConversation.conversation_id,
        user.user_id,
        messageText.trim()
      );
      setMessageText('');
      // Refresh conversations to update last_message_at
      fetchConversations();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return formatDisplayDate(timestamp);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', minHeight: '600px', backgroundColor: '#f5f5f5' }}>
      {/* Conversations List */}
      <Paper
        sx={{
          width: 350,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e0e0e0',
          borderRadius: 0,
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight="bold">
            Messages
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No conversations yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {conversations.map((conversation) => {
                const isSelected = selectedConversation?.conversation_id === conversation.conversation_id;
                const unreadCount = conversation.unread_count_executive || 0;

                return (
                  <ListItem key={conversation.conversation_id} disablePadding>
                    <ListItemButton
                      onClick={() => setSelectedConversation(conversation)}
                      selected={isSelected}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&.Mui-selected': {
                          backgroundColor: '#e3f2fd',
                          '&:hover': {
                            backgroundColor: '#e3f2fd',
                          },
                        },
                      }}
                    >
                      <Badge
                        badgeContent={unreadCount}
                        color="error"
                        invisible={unreadCount === 0}
                        sx={{ mr: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: '#f08060',
                            width: 48,
                            height: 48,
                            fontSize: '0.875rem',
                          }}
                        >
                          {getInitials(conversation.user_name || 'U')}
                        </Avatar>
                      </Badge>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={unreadCount > 0 ? 600 : 400}>
                              {conversation.user_name || 'Unknown User'}
                            </Typography>
                            {conversation.last_message_at && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                {formatMessageTime(conversation.last_message_at)}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: unreadCount > 0 ? 500 : 400,
                            }}
                          >
                            {conversation.last_message_text || 'No messages yet'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Paper>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <Paper
              sx={{
                p: 2,
                borderBottom: '1px solid #e0e0e0',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar sx={{ bgcolor: '#f08060', width: 40, height: 40 }}>
                {getInitials(selectedConversation.user_name || 'U')}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedConversation.user_name || 'Unknown User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedConversation.user_email}
                </Typography>
              </Box>
            </Paper>

            {/* Messages Area */}
            <Box
              ref={messagesContainerRef}
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {messages.map((message) => {
                const isAdmin = message.sender_type === 'executive';
                const isSystem = message.sender_type === 'system';

                if (isSystem) {
                  return (
                    <Box key={message.message_id} sx={{ textAlign: 'center', py: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {message.message_text}
                      </Typography>
                    </Box>
                  );
                }

                return (
                  <Box
                    key={message.message_id}
                    sx={{
                      display: 'flex',
                      justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: isAdmin ? '#f08060' : '#e0e0e0',
                        color: isAdmin ? '#ffffff' : '#000000',
                      }}
                    >
                      {!isAdmin && (
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.8 }}>
                          {message.sender_name || 'User'}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {message.message_text}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          fontSize: '0.7rem',
                        }}
                      >
                        {formatDisplayTime(message.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Paper
              sx={{
                p: 2,
                borderTop: '1px solid #e0e0e0',
                borderRadius: 0,
                display: 'flex',
                gap: 1,
                alignItems: 'flex-end',
              }}
            >
              <IconButton size="small" color="primary">
                <AttachFileIcon />
              </IconButton>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                variant="outlined"
                size="small"
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sending}
                sx={{ bgcolor: '#f08060', color: '#ffffff', '&:hover': { bgcolor: '#d96b4a' } }}
              >
                {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Paper>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a conversation to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Chat;

