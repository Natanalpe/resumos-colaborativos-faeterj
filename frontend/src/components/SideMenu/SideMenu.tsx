import { HomeOutlined, FileOutlined, UserOutlined, ToolOutlined, PoweroffOutlined, SafetyOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Menu, Image, type MenuProps, Spin, Button, Modal, Grid } from "antd";
import Sider from "antd/es/layout/Sider";
import { useEffect, useMemo, useState } from "react";
import type { TPages } from "../../types/PagesType";
import logo from '../../assets/icons/logo.svg';
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { menuItemStyle, logoStyle, menuStyle, menuBottomStyle, getMenuItemStyle, getResponsiveSiderStyle, overlayStyle, menuButtonStyle, siderStyle } from "./Style";
import { logout } from "../../service/auth/AuthService";
import Rules from "../Rules/Rules";

const { useBreakpoint } = Grid;

type MenuTypeKey = {
    props: TPages;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
};

export const SideMenu = ({ props, mobileMenuOpen, setMobileMenuOpen }: MenuTypeKey) => {

    const { user, loading, checkAuth } = useAuth();
    const [initialized, setInitialized] = useState(false);
    const [isLogouting, setIsLogouting] = useState(false);
    const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
    const [pageSelected, setPageSelected] = useState<TPages>('home');
    const navigate = useNavigate();

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    type MenuItem = Required<MenuProps>['items'][number];

    useEffect(() => {
        if (!initialized) {
            checkAuth();
            setInitialized(true);
        }
    }, [checkAuth, initialized]);

    const mainItems: MenuItem[] = useMemo(() => {
        const items: MenuItem[] = [
            {
                key: 'home',
                label: <Link to="/">Início</Link>,
                icon: <HomeOutlined />,
                style: getMenuItemStyle(pageSelected === 'home')
            },
            {
                key: 'summary',
                label: <Link to="/summary">Resumos</Link>,
                icon: <FileOutlined />,
                style: getMenuItemStyle(pageSelected === 'summary')
            },
            {
                key: 'profile',
                label: user?.user_id ? <Link to={`/profile/${user.user_id}`}>Meu perfil</Link> : <span>Meu perfil</span>,
                icon: <UserOutlined />,
                style: getMenuItemStyle(pageSelected === 'profile')
            }
        ];

        if (user?.role === 'administrador') {
            items.push({
                key: 'configurations',
                label: 'Configurações',
                icon: <ToolOutlined />,
                children: [
                    { label: <Link to="/configurations/users">Usuários</Link>, key: 'configurations/users', style: getMenuItemStyle(pageSelected === 'configurations/users') },
                    { label: <Link to="/configurations/news">Notícias</Link>, key: 'configurations/news', style: getMenuItemStyle(pageSelected === 'configurations/news') },
                    { label: <Link to="/configurations/subjects">Matérias</Link>, key: 'configurations/subjects', style: getMenuItemStyle(pageSelected === 'configurations/subjects') },
                    { label: <Link to="/configurations/system">Sistema</Link>, key: 'configurations/system', style: getMenuItemStyle(pageSelected === 'configurations/system') },
                ],
                style: getMenuItemStyle(pageSelected.includes('configurations'))
            });
        }

        return items;
    }, [user, pageSelected]);

    const bottomItems: MenuItem[] = [
        { key: 'regras', onClick: () => openRulesModal(), label: 'Politicas e Regras', icon: <SafetyOutlined />, style: { ...menuItemStyle, marginTop: 'auto' } },
        { key: 'sair', onClick: () => handleLogout(), label: <>{isLogouting ? 'Saindo...' : 'Sair'}</>, icon: <PoweroffOutlined />, style: { ...menuItemStyle, marginTop: 'auto' } },
    ];

    const handleMenuItemClick = (e: any) => {
        if (e.key === 'sair' || e.key === 'regras') {
            return;
        }

        setPageSelected(e.key);

        if (isMobile) {
            setMobileMenuOpen(false);
        }

        if (e.key === 'home') {
            navigate('/');
        } else if (e.key === 'summary') {
            navigate('/summary');
        } else if (e.key === 'profile' && user?.user_id) {
            navigate(`/profile/${user.user_id}`);
        } else if (e.key.startsWith('configurations/')) {
            navigate(`/${e.key}`);
        }
    };

    const handleLogout = () => {
        setIsLogouting(true);
        logout()
            .then(() => {
                navigate('/login');
            })
            .finally(() => {
                sessionStorage.clear();
                localStorage.clear();
                setIsLogouting(false);
            });
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    useEffect(() => {
        setPageSelected(props);
    }, [props]);

    if (loading || !initialized) {
        return (
            <>
                {isMobile && (
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => { }}
                        style={menuButtonStyle}
                        disabled
                    />
                )}
                <div style={isMobile ? getResponsiveSiderStyle(isMobile, true) : siderStyle}>
                    <Image loading="lazy" src={logo} preview={false} style={logoStyle} alt="logo da plataforma" />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Spin size="large" />
                    </div>
                </div>
            </>
        );
    }

    const openRulesModal = () => {
        setIsRulesModalOpen(true);
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    const closeRulesModal = () => setIsRulesModalOpen(false);

    return (
        <>
            {isMobile && (
                <Button
                    type="text"
                    icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
                    onClick={toggleMobileMenu}
                    style={menuButtonStyle}
                    aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                />
            )}

            {isMobile && mobileMenuOpen && (
                <div style={overlayStyle} onClick={toggleMobileMenu} />
            )}

            <Sider
                style={getResponsiveSiderStyle(isMobile, !mobileMenuOpen)}
                width={isMobile ? 280 : 200}
            >
                <Button color="default" variant="link" href="/" aria-hidden={false}>
                    <Image loading="lazy" src={logo} preview={false} style={logoStyle} alt="logo da plataforma" />
                </Button>
                <Menu
                    disabled={isLogouting}
                    items={mainItems}
                    style={menuStyle}
                    selectedKeys={[pageSelected]}
                    onClick={handleMenuItemClick}
                />
                <Menu
                    disabled={isLogouting}
                    items={bottomItems}
                    style={menuBottomStyle}
                    selectedKeys={[]}
                />
            </Sider>

            <Modal
                open={isRulesModalOpen}
                width={isMobile ? '95%' : '80%'}
                onCancel={closeRulesModal}
                closable
                title="Politicas e regras da plataforma"
                styles={{
                    body: {
                        padding: 0,
                        maxHeight: '70vh',
                        overflow: 'hidden'
                    }
                }}
                footer={[
                    <Button key="close" type="primary" onClick={closeRulesModal}>Fechar</Button>
                ]}
            >
                <div style={{
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    padding: isMobile ? '16px' : '24px'
                }}>
                    <Rules editing={false} />
                </div>
            </Modal>
        </>
    );
}