"use client";
import React, { createContext, useContext, useState } from 'react';

interface PopupContextType {
  isAnyPopupOpen: boolean;
  openPopup: (popupId: string) => void;
  closePopup: (popupId: string) => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openPopups, setOpenPopups] = useState<Set<string>>(new Set());

  const openPopup = (popupId: string) => {
    setOpenPopups(prev => new Set(prev).add(popupId));
  };

  const closePopup = (popupId: string) => {
    setOpenPopups(prev => {
      const newSet = new Set(prev);
      newSet.delete(popupId);
      return newSet;
    });
  };

  const isAnyPopupOpen = openPopups.size > 0;

  return (
    <PopupContext.Provider value={{ isAnyPopupOpen, openPopup, closePopup }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};