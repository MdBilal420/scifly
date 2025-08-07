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

const getBookTheme = (theme: string | undefined) => {
  switch (theme) {
    case 'space':
      return {
        book: 'bg-slate-800',
        page: 'bg-slate-700',
        hover: 'hover:bg-slate-600',
        text: 'text-slate-200',
        subtleText: 'text-slate-400',
      };
    case 'jungle':
      return {
        book: 'bg-emerald-50',
        page: 'bg-emerald-100',
        hover: 'hover:bg-emerald-200',
        text: 'text-emerald-900',
        subtleText: 'text-emerald-500',
      };
    case 'sky':
       return {
        book: 'bg-sky-50',
        page: 'bg-sky-100',
        hover: 'hover:bg-sky-200',
        text: 'text-sky-900',
        subtleText: 'text-sky-500',
      };
    default:
      return {
        book: 'bg-gray-200',
        page: 'bg-gradient-to-r from-gray-50 to-gray-100',
        hover: 'hover:bg-gray-200',
        text: 'text-stone-800',
        subtleText: 'text-gray-500',
      };
  }
};

const StorybookScreen: React.FC<StorybookScreenProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const isStoryGenarated = useRef(false);
  
  const { currentTopic } = useAppSelector((state) => state.topics);
  const { pages, isGeneratingContent, contentError } = useAppSelector((state) => state.storybook);
  const { currentUser } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (currentTopic && !isStoryGenarated.current) {
      isStoryGenarated.current = true;
      dispatch(generateStorybookPages(currentTopic));
    }
    return () => {
      dispatch(resetStorybook());
    };
  }, [currentTopic, dispatch]);

  useEffect(() => {
    if (currentTopic && pages.length > 0) {
      pages.forEach((page, index) => {
        if (page && !page.image && !page.isGeneratingImage && !page.imageError) {
          dispatch(generatePageImage({ pageIndex: index, text: page.text, topic: currentTopic }));
        }
      });
    }
  }, [pages, currentTopic, dispatch]);

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setDirection(1);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const bookTheme = getBookTheme(currentTopic?.backgroundTheme);

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

        <div className="flex-1 p-4 flex flex-col items-center justify-center overflow-hidden">
          <div className={`w-full max-w-4xl aspect-[2/1.4] ${bookTheme.book} rounded-2xl shadow-2xl flex p-2`}>
            {/* Left Page - Image */}
            <div className={`w-1/2 h-full ${bookTheme.page} rounded-l-xl flex items-center justify-center p-6 overflow-hidden cursor-pointer ${bookTheme.hover} transition-colors`} onClick={handlePrevPage}>
              <div className="w-full h-full relative">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={currentPage}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'tween', ease: 'easeInOut', duration: 0.4 },
                      opacity: { duration: 0.2 }
                    }}
                    className="w-full h-full"
                  >
                    {pages[currentPage]?.isGeneratingImage && (
                      <motion.div className={`w-full h-full flex flex-col items-center justify-center ${bookTheme.subtleText}`} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                        {(MdImage as any)({ className: "text-5xl mb-4" })}
                        <p className="font-serif">Generating illustration...</p>
                      </motion.div>
                    )}
                    {pages[currentPage]?.image && <img src={pages[currentPage].image!} alt={`Storybook illustration for page ${currentPage + 1}`} className="rounded-lg shadow-lg object-cover w-full h-full" />}
                    {pages[currentPage]?.imageError && (
                      <div className="w-full h-full flex flex-col items-center justify-center text-red-500">
                        {(MdError as any)({ className: "text-5xl mb-4" })}
                        <p className="font-serif mb-4">Could not load image.</p>
                        <button onClick={(e) => { e.stopPropagation(); if(currentTopic) dispatch(generatePageImage({ pageIndex: currentPage, text: pages[currentPage].text, topic: currentTopic }))}} className="px-4 py-2 bg-red-500/80 text-white rounded-md text-sm hover:bg-red-500">Retry</button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            {/* Right Page - Text */}
            <div className={`w-1/2 h-full ${bookTheme.book} rounded-r-xl flex flex-col p-10 relative font-serif cursor-pointer ${bookTheme.hover} transition-colors`} onClick={handleNextPage}>
              <div className={`absolute top-8 right-10 ${bookTheme.subtleText} text-xs tracking-widest`}>{currentUser?.name?.toUpperCase() || 'SCIFLY STORY'}</div>
              <div className="flex-grow flex items-center justify-center overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.p
                    key={currentPage}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'tween', ease: 'easeInOut', duration: 0.4 },
                      opacity: { duration: 0.2 }
                    }}
                    className={`${bookTheme.text} text-xl md:text-2xl leading-relaxed`}
                  >
                    {pages[currentPage]?.text}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className={`absolute bottom-8 right-10 ${bookTheme.subtleText} text-lg`}>{currentPage + 1}</div>
            </div>
          </div>
        </div>
      </div>
    </DynamicBackground>
  );
};

export default StorybookScreen;