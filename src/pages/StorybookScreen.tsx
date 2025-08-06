import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { generateStorybookContent, clearErrors } from '../features/storybook/storybookSlice';
import SimbaMascot from '../components/SimbaMascot';
import PrimaryButton from '../components/PrimaryButton';
import DynamicBackground from '../components/DynamicBackground';
import UserMenu from '../components/UserMenu';
import { MdArrowBack } from 'react-icons/md';

interface StorybookScreenProps {
  onNavigate: (screen: string) => void;
}

const StorybookScreen: React.FC<StorybookScreenProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  
  const { currentTopic } = useAppSelector((state) => state.topics);
  const { storybookContent, isGeneratingContent, contentError } = useAppSelector((state) => state.storybook);
  const { currentUser } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (currentTopic) {
      dispatch(generateStorybookContent(currentTopic));
    }
  }, [currentTopic, dispatch]);

  if (!currentTopic) {
    onNavigate('topics');
    return null;
  }

  if (isGeneratingContent) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <SimbaMascot size="lg" animate={true} />
            <motion.div
              className="mt-4 text-white text-xl font-comic"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Creating your {currentTopic.title} storybook... 🦁
            </motion.div>
          </div>
        </div>
      </DynamicBackground>
    );
  }

  if (contentError) {
    return (
      <DynamicBackground theme={currentTopic.backgroundTheme}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center bg-white/90 backdrop-blur rounded-3xl p-6 max-w-md">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="font-comic text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">I couldn't create the storybook. Let's try again!</p>
            <PrimaryButton
              onClick={() => {
                dispatch(clearErrors());
                dispatch(generateStorybookContent(currentTopic));
              }}
              className="w-full mb-2"
            >
              Try Again
            </PrimaryButton>
            <button
              onClick={() => onNavigate('activity')}
              className="text-gray-500 text-sm underline"
            >
              Choose Different Activity
            </button>
          </div>
        </div>
      </DynamicBackground>
    );
  }

  return (
    <DynamicBackground theme={currentTopic.backgroundTheme}>
      <div className="storybook-screen-wrapper max-h-screen flex flex-col">
        <div className="flex-shrink-0 p-4 bg-white/10 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <button 
              onClick={() => onNavigate('activity')}
              type="button"
              className="p-2 text-xl rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 backdrop-blur-lg shadow-lg min-w-[40px] h-10 flex items-center justify-center"
            >
              {(MdArrowBack as any)({ style: { display: 'inline' } })}
            </button>
            <div className="flex-1 text-center text-white text-lg font-bold drop-shadow-lg">
              {currentTopic.title} Storybook
            </div>
            <UserMenu />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto bg-white/20 backdrop-blur-lg rounded-2xl p-6"
            >
              {storybookContent.map((part, index) => (
                <div key={index} className="mb-4">
                  {part.type === 'text' && <p className="text-white text-lg leading-relaxed">{part.data}</p>}
                  {part.type === 'image' && <img src={`data:${part.mime_type};base64,${part.data}`} alt="Storybook illustration" className="rounded-lg shadow-lg my-4" />}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DynamicBackground>
  );
};

export default StorybookScreen;