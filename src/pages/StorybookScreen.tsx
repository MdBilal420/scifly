import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { generateStorybookPages, generatePageImage, clearErrors, resetStorybook } from '../features/storybook/storybookSlice';
import SimbaMascot from '../components/SimbaMascot';
import PrimaryButton from '../components/PrimaryButton';
import DynamicBackground from '../components/DynamicBackground';
import UserMenu from '../components/UserMenu';
import { MdArrowBack, MdImage, MdError } from 'react-icons/md';

interface StorybookScreenProps {
  onNavigate: (screen: string) => void;
}

const StorybookScreen: React.FC<StorybookScreenProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const isLoaded = useRef(false);
  
  const { currentTopic } = useAppSelector((state) => state.topics);
  const { pages, isGeneratingContent, contentError } = useAppSelector((state) => state.storybook);
  const { currentUser } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (currentTopic) {
      dispatch(generateStorybookPages(currentTopic));
    }
    return () => {
      dispatch(resetStorybook());
    };
  }, [currentTopic, dispatch]);

  useEffect(() => {
    if (currentTopic && pages.length > 0) {
      const page = pages[currentPage];
      if (page && !page.image && !page.isGeneratingImage && !page.imageError && !isLoaded.current) {
        isLoaded.current = true;
        dispatch(generatePageImage({ pageIndex: currentPage, text: page.text, topic: currentTopic }));
      }
    }
  }, [pages, currentPage, currentTopic, dispatch]);

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      isLoaded.current = false; // Reset loaded state for next page
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      isLoaded.current = false; // Reset loaded state for previous page
    }
  };

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
            <p className="text-gray-600 mb-4">I couldn't create the storybook content. Let's try again!</p>
            <PrimaryButton
              onClick={() => {
                dispatch(clearErrors());
                if(currentTopic) dispatch(generateStorybookPages(currentTopic));
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

        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          <AnimatePresence mode="wait">
            {pages.length > 0 && (
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto w-full bg-white/20 backdrop-blur-lg rounded-2xl p-6 flex-grow"
              >
                <div className="grid md:grid-cols-2 gap-6 items-center h-full">
                  <div className="text-white text-lg leading-relaxed">
                    {pages[currentPage].text}
                  </div>
                  <div className="relative aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                    {pages[currentPage].isGeneratingImage && (
                      <motion.div
                        className="text-center text-white"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {(MdImage as any)({ className: "text-4xl mx-auto mb-2" })}
                        Generating image...
                      </motion.div>
                    )}
                    {pages[currentPage].image && (
                      <img src={pages[currentPage].image!} alt={`Storybook illustration for page ${currentPage + 1}`} className="rounded-lg shadow-lg object-cover w-full h-full" />
                    )}
                    {pages[currentPage].imageError && (
                       <div className="text-center text-red-300">
                         {(MdError as any)({ className: "text-4xl mx-auto mb-2" })}
                         <p>Could not load image.</p>
                         <button
                           onClick={() => currentTopic && dispatch(generatePageImage({ pageIndex: currentPage, text: pages[currentPage].text, topic: currentTopic }))}
                           className="mt-2 px-3 py-1 bg-red-400/50 text-white rounded-md text-sm hover:bg-red-400/80"
                         >
                           Retry
                         </button>
                       </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex-shrink-0 pt-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <PrimaryButton onClick={handlePrevPage} disabled={currentPage === 0}>
                Previous
              </PrimaryButton>
              <div className="text-white font-bold">
                Page {currentPage + 1} of {pages.length}
              </div>
              <PrimaryButton onClick={handleNextPage} disabled={currentPage === pages.length - 1}>
                Next
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </DynamicBackground>
  );
};

export default StorybookScreen;