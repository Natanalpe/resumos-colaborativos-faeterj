import { Grid, Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { SideMenu } from "../SideMenu/SideMenu";
import { Outlet, useLocation } from "react-router-dom";
import { mainLayoutStyle, getSiderWrapperStyle, getMainContentStyle } from "./Style";
import type { TPages } from "../../types/PagesType";
import { ScrollToTop } from "../ScrollToTop/ScrollToTop";
import { useState, useEffect, useRef } from "react";

const { useBreakpoint } = Grid;

export const MainLayout = () => {
    const location = useLocation();
    const currentPage = location.pathname.split('/')[1] || 'home';

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);

    useEffect(() => {
        if (!isMobile) return;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            touchEndX.current = e.touches[0].clientX;
            touchEndY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = () => {
            const swipeDistanceX = touchEndX.current - touchStartX.current;
            const swipeDistanceY = Math.abs(touchEndY.current - touchStartY.current);
            
            const startedFromLeft = touchStartX.current < 50;
            
            const isHorizontalSwipe = Math.abs(swipeDistanceX) > swipeDistanceY;
            
            if (startedFromLeft && swipeDistanceX > 100 && isHorizontalSwipe) {
                setMobileMenuOpen(true);
            }
            
            if (mobileMenuOpen && swipeDistanceX < -100 && isHorizontalSwipe) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, mobileMenuOpen]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            <Layout style={mainLayoutStyle}>
                {!isMobile && (
                    <Sider style={getSiderWrapperStyle(isMobile)} width={200}>
                        <SideMenu 
                            props={currentPage as TPages} 
                            mobileMenuOpen={false}
                            setMobileMenuOpen={() => {}}
                        />
                    </Sider>
                )}
                {isMobile && (
                    <SideMenu 
                        props={currentPage as TPages}
                        mobileMenuOpen={mobileMenuOpen}
                        setMobileMenuOpen={setMobileMenuOpen}
                    />
                )}
                <Layout style={getMainContentStyle(isMobile)}>
                    <Outlet />
                </Layout>
                <ScrollToTop />
            </Layout>
        </>
    );
};