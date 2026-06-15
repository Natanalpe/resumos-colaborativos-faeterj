import { useCallback, useRef } from "react";

export const useDebounce = (delay = 1500, notDelayInFirstTime = true) => {
    const isFirstTime = useRef(notDelayInFirstTime);
    const debouncing = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debounce = useCallback((funct: () => void) => {
        if (isFirstTime.current) {
            isFirstTime.current = false;
            funct();
        } else {
            if (debouncing.current) {
                clearTimeout(debouncing.current);
            }
            debouncing.current = setTimeout(() => funct(), delay);
        }
    }, [delay]);
    return { debounce };
}