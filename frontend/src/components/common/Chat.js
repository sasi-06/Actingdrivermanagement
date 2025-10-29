// Chat component for user-driver communication
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { format } from 'date-fns';
import './Chat.css';

const Chat = ({ bookingId, recipientId, recipientName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { emit, on, off } = useSocket();

  useEffect(() => {
    // Load chat history
    loadChatHistory();

    // Listen for new messages
    const handleNewMessage = (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        message: data.message,
        sender: data.senderId,
        timestamp: data.timestamp,
        isOwn: false
      }]);
    };

    on('new_message', handleNewMessage);

    return () => {
      off('new_message', handleNewMessage);
    };
  }, [bookingId, on, off]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    // In a real implementation, load chat history from API
    // For now, we'll start with empty messages
    setMessages([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const messageData = {
      recipientId,
      message: newMessage,
      bookingId
    };

    // Emit message via socket
    emit('send_message', messageData);

    // Add message to local state
    setMessages(prev => [...prev, {
      id: Date.now(),
      message: newMessage,
      sender: 'me',
      timestamp: new Date(),
      isOwn: true
    }]);

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat with {recipientName}</h3>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start a conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.isOwn ? 'own' : 'other'}`}
            >
              <div className="message-content">{msg.message}</div>
              <div className="message-time">
                {format(new Date(msg.timestamp), 'hh:mm a')}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="send-button" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
