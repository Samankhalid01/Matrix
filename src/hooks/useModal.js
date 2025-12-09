import { useState } from 'react';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openModal = (data = null) => {
    setModalData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setModalData(null), 300); // Delay to allow exit animation
  };

  return {
    isOpen,
    modalData,
    openModal,
    closeModal,
  };
};
