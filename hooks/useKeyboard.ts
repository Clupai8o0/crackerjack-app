import { useEffect, useState } from 'react';
import { Keyboard, type KeyboardEvent } from 'react-native';

export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsVisible(true);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsVisible(false);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return { keyboardHeight, isVisible };
}
