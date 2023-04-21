import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { RefObject, useEffect, useMemo, useState } from 'react';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default function useOnScreen(ref: RefObject<HTMLElement>) {
    const [isIntersecting, setIntersecting] = useState(false)

    const observer = useMemo(() => new IntersectionObserver(
        ([entry]) => setIntersecting(entry.isIntersecting),
        {
            // TODO: This is probably too much or too less
            rootMargin: "70px"
        }
    ), [ref])


    useEffect(() => {
        observer.observe(ref.current as Element)
        return () => observer.disconnect()
    }, [])

    return isIntersecting
}
