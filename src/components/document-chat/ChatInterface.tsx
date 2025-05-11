import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToBedrock } from '../../services/bedrockService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  documentId: string;
  documentName: string;
  knowledgeBaseId: string;
  vectorDatabaseId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  documentId, 
  documentName,
  knowledgeBaseId,
  vectorDatabaseId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial system message
  useEffect(() => {
    setMessages([
      {
        id: 'system-1',
        text: `I'm ready to answer questions about "${documentName}". What would you like to know?`,
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
  }, [documentName]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send message to Bedrock via our service
      const response = await sendMessageToBedrock({
        message: inputText,
        documentId,
        knowledgeBaseId,
        vectorDatabaseId,
        conversationHistory: messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      });

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: response.answer,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Chat with: {documentName}</h3>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">{message.text}</div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your document..."
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;