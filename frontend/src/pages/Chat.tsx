import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import Avatar from '../components/Avatar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthStore();
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSending,
    isListening,
    avatarState,
    loadConversations,
    loadConversation,
    createConversation,
    sendMessage,
    deleteConversation,
    startVoiceRecording,
    stopVoiceRecording,
  } = useChatStore();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const handleStartVoice = () => {
    startVoiceRecording();
  };

  const handleStopVoice = async () => {
    const transcription = await stopVoiceRecording();
    if (transcription) {
      sendMessage(transcription);
    }
  };

  const handleNewConversation = () => {
    createConversation();
  };

  const handleSelectConversation = (id: string) => {
    loadConversation(id);
  };

  const handleDeleteConversation = (id: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(id);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onLogout={handleLogout}
        userName={user?.name}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Avatar section */}
        <div className="bg-white border-b">
          <Avatar state={avatarState} isListening={isListening} isSpeaking={isSending} />
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl">Start a conversation with your AI companion</p>
              <p className="text-sm mt-2">Ask me anything, I'm here to help!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isSending && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStartVoice={handleStartVoice}
          onStopVoice={handleStopVoice}
          isListening={isListening}
          isSending={isSending}
        />
      </div>
    </div>
  );
}
