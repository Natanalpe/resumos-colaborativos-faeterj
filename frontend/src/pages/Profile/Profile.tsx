import { Badge, Button, Card, Divider, Dropdown, Flex, Layout, message, Space, Tabs, Tag, Tooltip, Typography } from "antd";
import { useParams } from "react-router";
import { ButtonSettingsProfileStyle, CardProfileStyle, LayoutProfileStyle, ProfileContentStyle, ProfilePicContainerStyle, ProfilePicStyle } from "./Style";
import { useEffect, useMemo, useState } from "react";
import { getUserProfile } from "../../service/UsersService";
import type { NoticeType } from "antd/es/message/interface";
import type { TUserProfile } from "../../types/UserType";
import { BookOutlined, HeartOutlined, LockOutlined, SettingOutlined, SmileOutlined, TableOutlined, WarningOutlined } from "@ant-design/icons";
import type { TabsProps } from "antd/lib";
import { useAuth } from "../../context/AuthContext";
import { UserProfileSummaries } from "../../components/UserProfileSummaries/UserProfileSummaries";
import { ChangePassword } from "../../components/ChangePassword/ChangePassword";
import { ProfileBookMarks } from "../../components/ProfileBookmarks/ProfileBookmarks";
import { useQuery } from "@tanstack/react-query";
import { getUserWarningsCount } from "../../service/WarningsService";
import { EditWarnings } from "../configurations/Users/EditWarning";
import Trophy from "../../components/Trophy/Trophy";

const { Text } = Typography;

export function Profile() {
    const { user_id } = useParams();
    const { user } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();
    const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
    const [isModalWarningsOpen, setIsModalWarningsOpen] = useState(false);
    const [countWarnings, setCountWarnings] = useState<number>();

    const { data: userData, isFetching, isError } = useQuery<TUserProfile>({
        queryKey: ['userProfile', user_id],
        queryFn: async () => {
            if (!user_id) throw new Error('User ID não encontrado');
            const response = await getUserProfile(user_id);
            return response.data.data;
        },
        enabled: !!user_id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    useEffect(() => {
        if (isError) {
            showMessage("Usuário não encontrado", "error");
        }
    }, [isError]);

    useEffect(() => {
        loadUserWarningCount();
    }, []);

    const loadUserWarningCount = () => {
        if (user?.user_id) {
            getUserWarningsCount(user?.user_id)
                .then((response) => {
                    setCountWarnings(response.data.data || 0)
                });
        }
    }

    const showMessage = (msg: string, type: NoticeType, duration: number = 3) => {
        messageApi.open({
            content: msg,
            type: type,
            duration: duration
        });
    };

    const tabItems: TabsProps['items'] = useMemo(() => {

        const items: TabsProps['items'] = [
            { key: '1', label: '', icon: <TableOutlined />, children: <UserProfileSummaries /> },
            { key: '2', label: '', icon: <BookOutlined />, children: <ProfileBookMarks /> }
        ];
        return items;
    }, [user?.user_id, user_id]);

    const openChangePasswordModal = () => setIsChangePassModalOpen(true);
    const closeChangePasswordModal = () => setIsChangePassModalOpen(false);

    const getMenuItems = () => {
        let baseItems = [{
            key: '1',
            label: (
                <Text><LockOutlined /><Divider type="vertical" />Alterar senha</Text>
            ),
            onClick: () => openChangePasswordModal()
        }];
        return baseItems;
    };

    const closeModal = () => {
        setIsModalWarningsOpen(false);
    }

    const UserBadge = () => {
        const perfeitoCount = userData?.review.perfeito || 0;
        const utilCount = userData?.review.util || 0;
        const total = perfeitoCount + utilCount || 0;

        return <Trophy count={total} />
    }

    return (
        <>
            {contextHolder}
            <Layout style={LayoutProfileStyle}>
                <Card loading={isFetching} style={CardProfileStyle}>
                    <Flex wrap gap='3vh'>
                        <div style={ProfilePicContainerStyle}>
                            <Card style={ProfilePicStyle}>
                                {userData?.user.nome?.[0]?.toUpperCase() || '?'}
                            </Card>
                        </div>
                        <Flex vertical gap="1vh">
                            <Text>{userData?.user.nome} {userData?.user.sobrenome}</Text>
                            <Flex>
                                {userData?.user.role === 'professor' ? (
                                    <Tag color="#108ee9"><strong>Professor</strong></Tag>
                                ) : userData?.user.role === 'administrador' ? (
                                    <Tag color="#eb5656"><strong>Administrador</strong></Tag>
                                ) : (
                                    <Tag color="#a74ce7"><strong>Aluno</strong></Tag>
                                )}
                            </Flex>
                            <Flex gap='10px'>
                                <Tooltip title="Contagem de resumos perfeitos">
                                    <p>
                                        <HeartOutlined style={{ color: '#ff4d4f' }} />{' '}
                                        {userData?.review?.perfeito && userData.review.perfeito > 999
                                            ? (userData.review.perfeito / 1000).toFixed(1) + ' mil'
                                            : userData?.review?.perfeito ?? 0}
                                    </p>
                                </Tooltip>
                                <Tooltip title="Contagem de resumos úteis">
                                    <p>
                                        <SmileOutlined style={{ color: '#52c41a' }} />
                                        {userData?.review?.util && userData.review.util > 999
                                            ? (userData.review.util / 1000).toFixed(1) + ' mil'
                                            : userData?.review?.util ?? 0}
                                    </p>
                                </Tooltip>
                            </Flex>
                            <p>Resumos postados: {userData?.count_posts?.count ?? 0}</p>
                        </Flex>
                        <Flex>
                            {userData?.user.role === 'aluno' && (
                                <UserBadge />
                            )}
                        </Flex>
                    </Flex>
                    {user?.user_id === user_id && (
                        <div style={ButtonSettingsProfileStyle}>
                            <Flex gap='2vh' align="center">
                                <Tooltip title="Advertências">
                                    <Badge count={countWarnings}>
                                        <Space >
                                            <Button onClick={() => setIsModalWarningsOpen(true)} icon={<WarningOutlined style={{ fontSize: '20px', color: 'black' }} />} />
                                        </Space>
                                    </Badge>
                                </Tooltip>

                                <Tooltip title="Configurações">
                                    <Dropdown menu={{ items: getMenuItems() }} trigger={['click']}>
                                        <a onClick={(e) => e.preventDefault()}>
                                            <Space>
                                                <Button icon={<SettingOutlined style={{ fontSize: '20px', color: 'black' }} />} />
                                            </Space>
                                        </a>
                                    </Dropdown>
                                </Tooltip>
                            </Flex>
                        </div>
                    )}
                </Card>
                <Card style={ProfileContentStyle}>
                    <Tabs
                        defaultActiveKey="1"
                        items={tabItems}
                        centered
                        size="large"
                    />
                </Card>
            </Layout>
            <ChangePassword isOpen={isChangePassModalOpen} onClose={closeChangePasswordModal} />
            {user?.user_id && isModalWarningsOpen && (
                <EditWarnings
                    userData={{ id: user?.user_id }}
                    isOpen={isModalWarningsOpen}
                    onClose={closeModal}
                    userVisualization={true}
                />
            )}
        </>
    );
}