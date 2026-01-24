import { useRef, useCallback, useEffect, useState } from 'react';

interface UseAvatarIframeReturn {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isReady: boolean;
  sendGesture: (gesture: string) => void;
  sendEmotion: (emotion: string) => void;
  switchAvatar: (avatarId: string) => void;
}

export function useAvatarIframe(): UseAvatarIframeReturn {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'avatar-ready') {
        setIsReady(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendMessage = useCallback((message: object) => {
    iframeRef.current?.contentWindow?.postMessage(message, '*');
  }, []);

  const sendGesture = useCallback((gesture: string) => {
    sendMessage({ type: 'gesture', gesture });
  }, [sendMessage]);

  const sendEmotion = useCallback((emotion: string) => {
    sendMessage({ type: 'emotion', emotion });
  }, [sendMessage]);

  const switchAvatar = useCallback((avatarId: string) => {
    sendMessage({ type: 'switch-avatar', avatarId });
    setIsReady(false);
  }, [sendMessage]);

  return {
    iframeRef,
    isReady,
    sendGesture,
    sendEmotion,
    switchAvatar,
  };
}
