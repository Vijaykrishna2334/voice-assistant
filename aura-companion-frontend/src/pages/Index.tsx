import { useState, useEffect, useCallback } from 'react';
import { Avatar, Screen } from '@/types/avatar';
import { AvatarSelector } from '@/components/avatar-selector/AvatarSelector';
import { MainApp } from '@/components/main-app/MainApp';

// URLs from environment variables (configure in .env file)
const AVATAR_IFRAME_URL = import.meta.env.VITE_AVATAR_IFRAME_URL || 'http://localhost:3000';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const STORAGE_KEY = 'selected_avatar';

function loadSavedAvatar(): Avatar | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveAvatar(avatar: Avatar): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(avatar));
}

function clearSavedAvatar(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('avatar-select');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  // Load saved avatar on mount
  useEffect(() => {
    const saved = loadSavedAvatar();
    if (saved) {
      setSelectedAvatar(saved);
      setCurrentScreen('main');
    }
  }, []);

  const handleSelectAvatar = useCallback((avatar: Avatar) => {
    setSelectedAvatar(avatar);
    saveAvatar(avatar);
    setCurrentScreen('main');
  }, []);

  const handleChangeAvatar = useCallback(() => {
    clearSavedAvatar();
    setSelectedAvatar(null);
    setCurrentScreen('avatar-select');
  }, []);

  if (currentScreen === 'avatar-select') {
    return (
      <AvatarSelector
        onSelect={handleSelectAvatar}
        iframeUrl={AVATAR_IFRAME_URL || undefined}
      />
    );
  }

  if (selectedAvatar) {
    return (
      <MainApp
        avatar={selectedAvatar}
        onChangeAvatar={handleChangeAvatar}
        iframeUrl={AVATAR_IFRAME_URL || undefined}
        backendUrl={BACKEND_URL || undefined}
      />
    );
  }

  return null;
}
