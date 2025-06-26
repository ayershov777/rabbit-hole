import { useCallback } from 'react';

export const useKeyboardNavigation = ({
    currentBreakdown,
    selectedIndex,
    expandedIndex,
    setSelectedIndex,
    setExpandedIndex,
    setMenuButtonsReady,
    handleMenuCollapse,
    handleActionSelect
}) => {
    const handleListboxKeyDown = useCallback((event) => {
        if (!currentBreakdown) return;

        const activeElement = document.activeElement;
        const isActionButtonFocused = activeElement && activeElement.closest('[data-option-index]') && activeElement.tagName === 'BUTTON';

        if (isActionButtonFocused && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            return;
        }

        const maxIndex = currentBreakdown.breakdown.length - 1;
        let newIndex = selectedIndex;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (selectedIndex === -1) {
                    newIndex = 0;
                } else {
                    newIndex = selectedIndex < maxIndex ? selectedIndex + 1 : 0;
                }
                setSelectedIndex(newIndex);
                setExpandedIndex(newIndex);
                setTimeout(() => {
                    setMenuButtonsReady(true);
                }, 150);
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (selectedIndex === -1) {
                    newIndex = maxIndex;
                } else {
                    newIndex = selectedIndex > 0 ? selectedIndex - 1 : maxIndex;
                }
                setSelectedIndex(newIndex);
                setExpandedIndex(newIndex);
                setTimeout(() => {
                    setMenuButtonsReady(true);
                }, 150);
                break;
            case 'Tab':
                if (expandedIndex >= 0) {
                    return;
                }
                break;
            case 'Enter':
                event.preventDefault();
                if (selectedIndex >= 0 && selectedIndex <= maxIndex) {
                    const option = currentBreakdown.breakdown[selectedIndex];
                    handleActionSelect(option, 'overview');
                }
                return;
            case 'Escape':
                event.preventDefault();
                handleMenuCollapse();
                return;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                setSelectedIndex(newIndex);
                setExpandedIndex(newIndex);
                setTimeout(() => {
                    setMenuButtonsReady(true);
                }, 150);
                break;
            case 'End':
                event.preventDefault();
                newIndex = maxIndex;
                setSelectedIndex(newIndex);
                setExpandedIndex(newIndex);
                setTimeout(() => {
                    setMenuButtonsReady(true);
                }, 150);
                break;
            default:
                return;
        }

        // Scroll the selected item into view
        setTimeout(() => {
            const selectedElement = document.querySelector(`[data-option-index="${newIndex}"]`);
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }, 50);
    }, [currentBreakdown, selectedIndex, expandedIndex, setSelectedIndex, setExpandedIndex, setMenuButtonsReady, handleMenuCollapse, handleActionSelect]);

    return {
        handleListboxKeyDown
    };
};
