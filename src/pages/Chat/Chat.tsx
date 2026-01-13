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
  Dialog,
  DialogTitle,
  DialogContent,
  InputAdornment,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { ChatService, ChatConversation, ChatMessage } from '@/services/chat.service';
import { UserService } from '@/services/user.service';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { formatDisplayDate, formatDisplayTime } from '@/utils/dateTime.utils';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Track message IDs to prevent duplicates
  const messageIdsRef = useRef<Set<number>>(new Set());
  // Track subscription cleanup functions
  const messageSubscriptionRef = useRef<(() => void) | null>(null);
  const conversationSubscriptionRef = useRef<(() => void) | null>(null);

  // Fetch conversations ONCE on mount
  useEffect(() => {
    const fetchInitialConversations = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await ChatService.getAllConversations();
        console.log('Fetched conversations on mount:', data);
        setConversations(data);
        // Initialize message IDs set from existing conversations
        data.forEach(conv => {
          if (conv.last_message_at) {
            // We'll populate this when messages are loaded
          }
        });
      } catch (err: any) {
        console.error('Error fetching conversations:', err);
        setError(err.message || 'Failed to fetch conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialConversations();
  }, []);

  // Subscribe to conversation updates (UPDATE events on conversations table)
  useEffect(() => {
    console.log('Setting up conversation subscription');
    
    const unsubscribe = ChatService.subscribeToConversations((updatedConversation) => {
      console.log('Conversation updated via realtime:', updatedConversation);
      setConversations((prev) => {
        const index = prev.findIndex(
          (c) => c.conversation_id === updatedConversation.conversation_id
        );
        if (index >= 0) {
          // Update existing conversation
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
      
      // If this is the currently selected conversation, update it
      if (selectedConversation?.conversation_id === updatedConversation.conversation_id) {
        console.log('Updating selected conversation');
        setSelectedConversation(updatedConversation);
      }
    });

    conversationSubscriptionRef.current = unsubscribe;

    return () => {
      console.log('Cleaning up conversation subscription');
      if (unsubscribe) unsubscribe();
      conversationSubscriptionRef.current = null;
    };
  }, [selectedConversation?.conversation_id]);

  // Fetch messages ONCE when conversation is selected
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      messageIdsRef.current.clear();
      return;
    }

    const fetchInitialMessages = async () => {
      try {
        const data = await ChatService.getConversationMessages(selectedConversation.conversation_id, 100, 0);
        console.log('Fetched messages for conversation:', data);
        setMessages(data);
        // Populate message IDs set
        messageIdsRef.current = new Set(data.map(m => m.message_id));
        
        // Mark messages as read
        if (user?.user_id) {
          ChatService.markMessagesAsRead(selectedConversation.conversation_id, user.user_id)
            .catch((err) => console.error('Failed to mark messages as read:', err));
        }
      } catch (err: any) {
        console.error('Error fetching messages:', err);
        setError(err.message || 'Failed to fetch messages');
      }
    };

    fetchInitialMessages();
  }, [selectedConversation?.conversation_id, user?.user_id]);

  // Subscribe to messages for selected conversation (INSERT and UPDATE events)
  useEffect(() => {
    if (!selectedConversation) {
      // Clean up message subscription if no conversation selected
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current();
        messageSubscriptionRef.current = null;
      }
      return;
    }

    console.log('Setting up message subscription for conversation:', selectedConversation.conversation_id);
    
    // Clean up previous subscription before creating new one
    if (messageSubscriptionRef.current) {
      messageSubscriptionRef.current();
      messageSubscriptionRef.current = null;
    }
    
    const unsubscribe = ChatService.subscribeToMessages(
      selectedConversation.conversation_id,
      {
        onInsert: (newMessage: ChatMessage) => {
          console.log('New message INSERT received via realtime:', newMessage);
          
          // Deduplication: Check if message already exists
          if (messageIdsRef.current.has(newMessage.message_id)) {
            console.log('Message already exists, skipping:', newMessage.message_id);
            return;
          }

          // Add to message IDs set
          messageIdsRef.current.add(newMessage.message_id);

          // Add message to UI
          setMessages((prev) => {
            // Double-check for duplicates in state
            if (prev.some((m) => m.message_id === newMessage.message_id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // Update conversation in list (last_message_text, last_message_at)
          setConversations((prev) => {
            return prev.map((conv) => {
              if (conv.conversation_id === selectedConversation.conversation_id) {
                return {
                  ...conv,
                  last_message_text: newMessage.message_text,
                  last_message_at: newMessage.created_at,
                  // Update unread count if message is from user
                  unread_count_executive: newMessage.sender_type === 'user' 
                    ? (conv.unread_count_executive || 0) + 1 
                    : conv.unread_count_executive,
                };
              }
              return conv;
            }).sort((a, b) => {
              const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
              const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
              return bTime - aTime;
            });
          });

          // Mark as read if admin is viewing and message is from user
          if (user?.user_id && newMessage.sender_type === 'user') {
            ChatService.markMessagesAsRead(selectedConversation.conversation_id, user.user_id)
              .catch((err) => console.error('Failed to mark messages as read:', err));
          }
        },
        onUpdate: (updatedMessage: ChatMessage) => {
          console.log('Message UPDATE received via realtime:', updatedMessage);
          
          // Update message in state (e.g., is_read status)
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.message_id === updatedMessage.message_id) {
                return { ...msg, ...updatedMessage };
              }
              return msg;
            });
          });
        },
      }
    );

    messageSubscriptionRef.current = unsubscribe;

    return () => {
      console.log('Cleaning up message subscription');
      if (unsubscribe) unsubscribe();
      messageSubscriptionRef.current = null;
    };
  }, [selectedConversation?.conversation_id, user?.user_id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user?.user_id) return;

    const messageTextToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    // Optimistic UI: Add temporary message with pending flag
    const tempId = Date.now(); // Temporary ID for optimistic update
    const optimisticMessage: ChatMessage = {
      message_id: tempId,
      conversation_id: selectedConversation.conversation_id,
      sender_id: user.user_id,
      sender_type: 'executive',
      sender_name: user.full_name || user.email || 'Admin',
      message_text: messageTextToSend,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    // Add optimistic message to UI
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Send message - realtime will deliver the actual message
      const newMessage = await ChatService.sendMessage(
        selectedConversation.conversation_id,
        user.user_id,
        messageTextToSend
      );

      // Replace optimistic message with real message
      setMessages((prev) => {
        // Remove optimistic message
        const filtered = prev.filter((m) => m.message_id !== tempId);
        // Add real message if not already present (realtime might have added it)
        if (!filtered.some((m) => m.message_id === newMessage.message_id)) {
          messageIdsRef.current.add(newMessage.message_id);
          return [...filtered, newMessage];
        }
        return filtered;
      });

      // Update conversation in list
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.conversation_id === selectedConversation.conversation_id) {
            return {
              ...conv,
              last_message_text: newMessage.message_text,
              last_message_at: newMessage.created_at,
            };
          }
          return conv;
        }).sort((a, b) => {
          const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return bTime - aTime;
        });
      });
    } catch (err: any) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.message_id !== tempId));
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

  const handleOpenNewChatDialog = async () => {
    setNewChatDialogOpen(true);
    setUserSearchTerm('');
    await fetchUsers();
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const allUsers = await UserService.getAllUsers();
      // Filter out the current admin user
      const filteredUsers = allUsers.filter((u) => u.user_id !== user?.user_id);
      setUsers(filteredUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSelectUser = async (selectedUser: User) => {
    if (!user?.user_id) return;

    try {
      setNewChatDialogOpen(false);
      // Create or get conversation with the selected user
      const conversation = await ChatService.createOrGetConversation(
        selectedUser.user_id,
        'executive'
      );
      
      // Add to conversations list if not already present
      setConversations((prev) => {
        const exists = prev.some(c => c.conversation_id === conversation.conversation_id);
        if (exists) {
          return prev;
        }
        return [conversation, ...prev];
      });
      
      // Select the new/existing conversation
      setSelectedConversation(conversation);
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setError(err.message || 'Failed to create conversation');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter((u) => {
    const searchLower = userSearchTerm.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      (u.phone && u.phone.includes(searchLower))
    );
  });

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
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            Messages
          </Typography>
          <IconButton
            size="small"
            onClick={handleOpenNewChatDialog}
            sx={{
              bgcolor: '#f08060',
              color: '#ffffff',
              '&:hover': {
                bgcolor: '#d96b4a',
              },
            }}
            title="New Chat"
          >
            <AddIcon />
          </IconButton>
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
                        invisible={unreadCount === 0 || isSelected}
                        sx={{ mr: 1.5 }}
                      >
                        <Avatar
                          src={conversation.user_avatar_url}
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
              <Avatar 
                src={selectedConversation.user_avatar_url}
                sx={{ bgcolor: '#f08060', width: 40, height: 40 }}
              >
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

      {/* New Chat Dialog */}
      <Dialog
        open={newChatDialogOpen}
        onClose={() => setNewChatDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            New Chat
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Select a user to start a conversation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search by name, email, or phone..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {usersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {userSearchTerm ? 'No users found' : 'No users available'}
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredUsers.map((userItem) => {
                  const hasExistingConversation = conversations.some(
                    (c) => c.user_id === userItem.user_id
                  );
                  return (
                    <ListItem
                      key={userItem.user_id}
                      disablePadding
                      sx={{ mb: 0.5 }}
                    >
                      <ListItemButton
                        onClick={() => handleSelectUser(userItem)}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          px: 2,
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                        }}
                      >
                        <Avatar
                          src={userItem.avatar_url}
                          sx={{
                            bgcolor: '#f08060',
                            width: 48,
                            height: 48,
                            fontSize: '0.875rem',
                            mr: 1.5,
                          }}
                        >
                          {getInitials(userItem.full_name || 'U')}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight={500}>
                              {userItem.full_name || 'Unknown User'}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {userItem.email}
                              {hasExistingConversation && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{ ml: 1, color: '#f08060' }}
                                >
                                  • Existing chat
                                </Typography>
                              )}
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
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Chat;
