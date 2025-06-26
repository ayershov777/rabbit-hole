import { useState, useEffect } from 'react';

export const useScrollVisibility = (threshold = 10) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Only trigger if scroll difference is above threshold
            if (Math.abs(currentScrollY - lastScrollY) > threshold) {
                // Show when scrolling up, hide when scrolling down
                setIsVisible(currentScrollY < lastScrollY);
                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY, threshold]);

    return isVisible;
}; 