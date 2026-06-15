import { Button, Card, Drawer, Form, Grid, Image, Input, message, Modal, Radio, Select, Tag, Tooltip, Typography, Upload, type SelectProps, type UploadFile, type UploadProps } from "antd";
import type { CheckboxGroupProps } from "antd/es/checkbox";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSubjects } from "../../service/SubjectsService";
import TextArea from "antd/es/input/TextArea";
import type { TAllSubjectsResponse, TSubject } from "../../types/Subjects";
import type { NoticeType } from "antd/es/message/interface";
import { MarkdownHooks } from "react-markdown";
import rehypeStarryNight from "rehype-starry-night"; import { CloseOutlined, DeleteOutlined, EyeOutlined, FileImageOutlined } from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import { createDocument } from "../../service/DocumentsService";
import type { TTypesSummary } from "../../types/SummaryTypes";
import remarkGfm from "remark-gfm";
import "../ViewSummary/ReadmeStyle.css";
import Quill from "quill";
import "quill/dist/quill.snow.css";

import '@wooorm/starry-night/style/dark'

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface IUploadSummary {
    isOpen: boolean,
    onClose: () => void,
    data?: any
}

const optionsType: CheckboxGroupProps<string>['options'] = [
    { label: 'Texto', value: 'txt' },
    { label: 'Imagem', value: 'imagem' },
    { label: 'Readme', value: 'readme' },
    { label: 'Link youtube', value: 'youtube_link' },
];

const optionsTag: { value: 'p1' | 'p2' | 'p3' | 'pf' | 'outros', label: React.ReactNode }[] = [
    { label: (<Tag color="#31ff64"><strong>P1</strong></Tag>), value: 'p1' },
    { label: (<Tag color="#1affec"><strong>P2</strong></Tag>), value: 'p2' },
    { label: (<Tag color="#ff29bf"><strong>P3</strong></Tag>), value: 'p3' },
    { label: (<Tag color="#ff4545"><strong>PF</strong></Tag>), value: 'pf' },
    { label: (<Tag color="#ff9924"><strong>Outro</strong></Tag>), value: 'outros' }
];

const youtubeLinkConvert = (link: string): string => {
    if (!link || (!link.includes('youtube') && !link.includes('youtu.be'))) {
        return '';
    }

    try {
        link = link.trim();

        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            link = 'https://' + link;
        }

        let videoId: string | null = null;

        if (link.includes('youtube.com/watch')) {
            const url = new URL(link);
            videoId = url.searchParams.get('v');
        } else if (link.includes('youtu.be/')) {
            const match = link.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
            videoId = match ? match[1] : null;
        } else if (link.includes('youtube.com/embed/')) {
            const match = link.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
            videoId = match ? match[1] : null;
        } else if (link.includes('youtube.com/live/')) {
            const match = link.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
            videoId = match ? match[1] : null;
        } else if (link.includes('youtube.com/v/')) {
            const match = link.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
            videoId = match ? match[1] : null;
        } else if (link.includes('youtube.com/shorts/')) {
            const match = link.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
            videoId = match ? match[1] : null;
        }

        if (videoId && videoId.includes('?')) {
            videoId = videoId.split('?')[0];
        }

        if (videoId && videoId.includes('&')) {
            videoId = videoId.split('&')[0];
        }

        if (!videoId || videoId.length !== 11) {
            return '';
        }

        return `https://www.youtube.com/embed/${videoId}`;

    } catch (error) {
        return '';
    }
};

export default function UploadSummary({ isOpen, onClose }: IUploadSummary) {

    const [form] = Form.useForm();
    const timeoutRef = useRef<NodeJS.Timeout>(null);
    const screens = useBreakpoint();

    const [_, setMarkdownContent] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [selectedType, setSelectedType] = useState<TTypesSummary>('txt');
    const [messageApi, contextHolder] = message.useMessage();
    const [subjects, setSubjects] = useState<TSubject[]>();
    const [debouncedMarkdownContent, setDebouncedMarkdownContent] = useState('');

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [youtubePreviewLink, setYoutubePreviewLink] = useState('');

    const quillRef = useRef<HTMLDivElement>(null);
    const quillInstanceRef = useRef<Quill | null>(null);
    const isInitializingQuillRef = useRef<boolean>(false);

    const showMessage = (content: string, type: NoticeType, duration: number = 2) => {
        messageApi.open({
            content: content,
            type: type,
            duration: duration
        });
    }

    const loadSubjects = () => {
        setIsModalLoading(true);
        getSubjects()
            .then((response: TAllSubjectsResponse) => {
                const sortedSubjects = response.data.data.sort((a, b) => {
                    if (a.nome < b.nome) return -1;
                    if (a.nome > b.nome) return 1;
                    return 0;
                });
                setSubjects(sortedSubjects);
                setIsModalLoading(false);
            })
            .catch(() => {
                setIsModalLoading(false);
                showMessage('Falha ao carregar matérias.', 'error');
            });
    };

    const handleMarkdownChange = useCallback((value: string) => {
        setMarkdownContent(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setDebouncedMarkdownContent(value);
        }, 1000);
    }, []);

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isOpen && selectedType === 'txt' && quillRef.current && !quillInstanceRef.current) {
            setTimeout(() => {
                initializeQuill();
            }, 100);
        }
    }, [isOpen, selectedType]);

    useEffect(() => {
        if (selectedType !== 'txt' && quillInstanceRef.current) {
            destroyQuill();
        }
    }, [selectedType]);

    useEffect(() => {
        if (isOpen && selectedType === 'txt' && quillRef.current) {
            const checkQuill = () => {
                const hasEditor = quillRef.current?.querySelector('.ql-editor');
                const hasInstance = quillInstanceRef.current;

                if (!hasEditor && !hasInstance) {
                    setTimeout(() => {
                        initializeQuill();
                    }, 100);
                }
                else if (hasInstance && !hasEditor) {
                    quillInstanceRef.current = null;
                    setTimeout(() => {
                        initializeQuill();
                    }, 100);
                }
            };

            checkQuill();

            const timeoutId = setTimeout(checkQuill, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [isOpen, selectedType, isUploading]);

    const initializeQuill = () => {
        if (!quillRef.current) return;

        // Se já está inicializando, não faz nada
        if (isInitializingQuillRef.current) {
            return;
        }

        // Se já existe instância válida, não reinicializa
        if (quillInstanceRef.current) {
            const hasEditor = quillRef.current.querySelector('.ql-editor');
            if (hasEditor) {
                return; // Já está funcionando, não precisa reinicializar
            }
        }

        isInitializingQuillRef.current = true;

        try {
            // Preserva o conteúdo existente ANTES de limpar
            let savedContent: any = null;

            // Tenta obter conteúdo da instância atual do Quill (ANTES de limpar)
            const currentInstance = quillInstanceRef.current;
            if (currentInstance) {
                try {
                    savedContent = currentInstance.getContents();
                } catch (error) {
                    // Se não conseguir, tenta do form
                }
            }

            // Se não tem instância ou não conseguiu obter conteúdo, tenta obter do form
            if (!savedContent) {
                const formContent = form.getFieldValue('conteudo');
                if (formContent) {
                    try {
                        savedContent = typeof formContent === 'string' ? JSON.parse(formContent) : formContent;
                    } catch {
                        // Se não conseguir parsear, mantém null
                    }
                }
            }

            // Agora limpa instância antiga se existir
            if (quillInstanceRef.current) {
                quillInstanceRef.current = null;
            }

            const existingEditor = quillRef.current.querySelector('.ql-editor');
            if (existingEditor) {
                quillRef.current.innerHTML = '';
            }

            const toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean']
            ];

            const quill = new Quill(quillRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: toolbarOptions
                },
                placeholder: 'Digite o texto aqui...'
            });

            // Configurar o editor para crescer automaticamente
            const editor = quillRef.current.querySelector('.ql-editor');
            if (editor) {
                (editor as HTMLElement).style.minHeight = '250px';
                (editor as HTMLElement).style.maxHeight = '600px';
                (editor as HTMLElement).style.overflowY = 'auto';
            }

            // Restaura o conteúdo salvo se existir
            if (savedContent) {
                try {
                    quill.setContents(savedContent);
                } catch (error) {
                    console.error('Erro ao restaurar conteúdo do Quill:', error);
                }
            }

            quill.on('text-change', () => {
                const content = quill.getContents();
                const delta = JSON.stringify(content);
                form.setFieldValue('conteudo', delta);
            });

            quillInstanceRef.current = quill;
        } catch (error) {
            console.error('Erro ao inicializar Quill:', error);
        } finally {
            isInitializingQuillRef.current = false;
        }
    };

    const destroyQuill = () => {
        if (quillInstanceRef.current && quillRef.current) {
            quillRef.current.innerHTML = '';
            quillInstanceRef.current = null;
        }
        isInitializingQuillRef.current = false;
    };

    const handleImageChange: UploadProps['onChange'] = async (info) => {
        const fileTypesAllowed = ['.jpeg', '.jpg', '.png', '.gif', '.svg', '.webp', '.avif'];
        const fileExtension = '.' + info.file.name.split('.').pop()?.toLocaleLowerCase();

        if (!fileTypesAllowed.includes(fileExtension)) {
            showMessage("Por favor, envia apenas arquivos JPEG, JPG, PNG, GIF, SVG, WEBP ou AVIF", 'error');
            return Upload.LIST_IGNORE;
        }

        const latestFileList = info.fileList.slice(-1);

        if (latestFileList.length > 0 && latestFileList[0].originFileObj) {
            const file = latestFileList[0].originFileObj;

            if (!await checkFileSafety(file)) {
                showMessage('Arquivo considerado inseguro. Por favor, escolha outra imagem.', 'error');
                showMessage('O upload de arquivos suspeitos podem causar o bloqueio de sua conta.', 'warning');
                setFileList([]);
                setImagePreview(null);
                return Upload.LIST_IGNORE;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImagePreview(result);
                form.setFieldValue('conteudo', result);
            };
            reader.readAsDataURL(file);
            setFileList(latestFileList);
        } else {
            setFileList([]);
            setImagePreview(null);
            form.setFieldValue('conteudo', null);
        }
    };

    const checkFileSafety = async (file: File): Promise<boolean> => {
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/svg+xml',
            'image/webp',
            'image/avif'
        ];

        if (!allowedMimes.includes(file.type)) {
            return false;
        }

        if (file.size > 10 * 1024 * 1024) {
            return false;
        }

        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!allowedExtensions.includes(fileExtension || '')) {
            return false;
        }

        return true;
    }

    const removeImage = () => {
        setFileList([]);
        setImagePreview(null);
        form.setFieldValue('conteudo', []);
    };

    const ImgInput = () => {
        return (
            <Form.Item
                name="conteudo"
                rules={[
                    { required: true, message: 'Por favor, adicione uma imagem' }
                ]}
            >
                {imagePreview ? (
                    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                        <Image
                            loading="lazy"
                            src={imagePreview}
                            alt="Preview"
                            style={{
                                width: '100%',
                                maxHeight: '300px',
                                objectFit: 'contain',
                                border: '1px dashed #d9d9d9',
                                borderRadius: '8px',
                                padding: '8px'
                            }}
                            preview={{
                                mask: <><EyeOutlined /> Visualizar</>,
                            }}
                        />
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                            }}
                            onClick={removeImage}
                        >
                            Remover
                        </Button>
                    </div>
                ) : (
                    <Dragger
                        disabled={isUploading}
                        accept=".jpeg, .jpg, .png, .gif, .svg, .webp, .avif"
                        fileList={fileList}
                        onChange={handleImageChange}
                        beforeUpload={() => false}
                        multiple={false}
                        maxCount={1}
                    >
                        <p className="ant-upload-drag-icon">
                            <FileImageOutlined />
                        </p>
                        <p className="ant-upload-text">Clique ou arraste a imagem para esta área</p>
                        <p className="ant-upload-hint">Apenas os seguintes formatos são aceitos:</p>
                        <p className="ant-upload-hint">
                            <Tag>.jpeg</Tag>
                            <Tag>.jpg</Tag>
                            <Tag>.png</Tag>
                            <Tag>.gif</Tag>
                            <Tag>.svg</Tag>
                            <Tag>.webp</Tag>
                            <Tag>.avif</Tag>
                        </p>
                    </Dragger>
                )}
            </Form.Item>
        );
    }

    const ReadmeInput = useMemo(() => {
        return (
            <Form.Item
                name="conteudo"
                rules={[{ required: true, message: 'Por favor, digite o conteúdo do readme.' }]}
            >
                <TextArea
                    autoSize={{ minRows: 4 }}
                    onChange={(e) => handleMarkdownChange(e.target.value)}
                    allowClear
                />
            </Form.Item>
        );
    }, []);

    const TxtInput = () => {
        return (
            <Form.Item
                name="conteudo"
                rules={[
                    {
                        whitespace: true,
                        message: 'Este campo não pode ficar em branco'
                    },
                    { required: true, message: 'Por favor, digite o texto.' }
                ]}
            >
                <div style={{
                    backgroundColor: 'white',
                    minHeight: '300px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px'
                }}>
                    <div
                        ref={quillRef}
                        style={{
                            minHeight: '300px'
                        }}
                    />
                </div>
            </Form.Item>
        );
    }

    const YoutubeLink = () => {
        return (
            <Form.Item
                name="conteudo"
                rules={[
                    {
                        whitespace: true,
                        message: 'Este campo não pode ficar em branco'
                    },
                    { required: true, message: 'Por favor, adicione o link do YouTube' },
                    { pattern: new RegExp('^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$'), message: 'O link inserido é inválido' },
                ]}
            >
                <Input type="text" placeholder="Ex. www.youtube.com/XXXXXXXXXXX" onChange={(e) => setYoutubePreviewLink(youtubeLinkConvert(e.target.value))} />
            </Form.Item>
        );
    }

    const subjectsOptions: SelectProps['options'] = subjects?.map((s: TSubject) => ({
        label: `${s.nome} - ${s.sigla}`,
        value: s.id,
    }));

    const changeTabType = (type: any) => {
        removeImage();
        setMarkdownContent('');
        setYoutubePreviewLink('');
        if (type !== 'txt') {
            destroyQuill();
        }
        setSelectedType(type);
    }

    const handleClose = () => {
        form.resetFields();
        removeImage();
        setMarkdownContent('');
        setYoutubePreviewLink('');
        destroyQuill();
        setSelectedType('txt');
        onClose();
    }

    const handleSave = () => {
        setIsUploading(true);

        form.validateFields()
            .then(() => {
                const formData = form.getFieldsValue();
                const contentType = form.getFieldValue('tipo');

                if (contentType == 'txt' || contentType == 'readme') {
                    formData.conteudo = form.getFieldValue('conteudo');
                } else if (contentType == 'youtube_link') {
                    if (youtubeLinkConvert(form.getFieldValue('conteudo')) == '') {
                        return;
                    }
                    formData.conteudo = youtubeLinkConvert(form.getFieldValue('conteudo'));
                } else {
                    formData.conteudo = imagePreview;
                }

                const payload = {
                    ...formData,
                    materia_id: formData.materia,
                };

                if (payload.materia) {
                    delete (payload as any).materia;
                }

                const logPayload = { ...payload };
                if (logPayload.conteudo && typeof logPayload.conteudo === 'string') {
                    logPayload.conteudo = `Base64 String - Tamanho: ${logPayload.conteudo.length}`;
                }

                createDocument({ ...formData, materia_id: formData.materia })
                    .then(() => {
                        showMessage('Documento salvo com sucesso!', 'success');
                        handleClose();
                    })
                    .catch((e) => {
                        if (e.status === 403) {
                            showMessage('Você não tem permissão para criar resumos.', 'error');
                        } else {
                            showMessage('Erro ao salvar documento.', 'error');
                        }
                    })
                    .finally(() => {
                        setIsUploading(false);
                    });

            })
            .catch(() => {
                showMessage("Preencha os campos corretamente", "warning");
            })
            .finally(() => {
                setIsUploading(false);
            });
    }

    return (
        <>
            {contextHolder}
            <Modal
                open={isOpen}
                onCancel={handleClose}
                title="Upload de resumo"
                forceRender
                width={{
                    xs: '100%',
                    sm: '85%',
                    md: '80%',
                    lg: '75%',
                    xl: '70%',
                    xxl: '65%',
                }}
                afterClose={() => {
                    form.resetFields();
                    setMarkdownContent('');
                    setDebouncedMarkdownContent('');
                }}
                footer={[
                    <Button key="cancel-btn" disabled={isUploading || isModalLoading} onClick={handleClose}>Cancelar</Button>,
                    <Button key="save-btn" disabled={isModalLoading} loading={isUploading} type="primary" onClick={handleSave}>Salvar</Button>
                ]}
            >
                <Form
                    form={form}
                    initialValues={{
                        ['tipo']: 'txt',
                        ['tag']: 'outros'
                    }}
                    preserve={false}
                >
                    <Typography>
                        <Text>Título:</Text>
                    </Typography>
                    <Form.Item
                        name="titulo"
                        rules={[
                            {
                                whitespace: true,
                                message: 'Este campo não pode ficar em branco'
                            },
                            { required: true, message: 'Por favor, adicione um título.' },
                            { min: 3, message: 'O título deve ter pelo menos 3 caracteres.' },
                            { max: 255, message: 'O título deve ter pelo menos 3 caracteres.' },
                        ]}
                    >
                        <Input placeholder="Ex. Calculo de derivadas" type="text" disabled={isUploading} />
                    </Form.Item>

                    <Typography>
                        <Text>Tipo:</Text>
                    </Typography>
                    <Form.Item
                        name="tipo"
                    >
                        <Radio.Group
                            onChange={(e) => changeTabType(e.target.value)}
                            buttonStyle="solid"
                            block
                            options={optionsType}
                            optionType="button"
                            disabled={isUploading}
                            style={{ display: 'flex', flexDirection: screens.xs ? 'column' : 'row' }}
                        >
                        </Radio.Group>
                    </Form.Item>

                    <Typography>
                        <Text>Tag:</Text>
                    </Typography>
                    <Form.Item
                        name="tag"
                    >
                        <Select
                            options={optionsTag}
                        />
                    </Form.Item>

                    <Typography>
                        <Text>Matéria:</Text>
                    </Typography>
                    <Form.Item
                        name="materia"
                        rules={[
                            { required: true, message: 'Por favor, selecione uma matéria.' }
                        ]}
                    >
                        <Select
                            placeholder="Selecione a matéria"
                            loading={isUploading || isModalLoading}
                            showSearch
                            optionFilterProp="label"

                            options={subjectsOptions}
                        />
                    </Form.Item>
                    <Form.Item
                        name="conteudo"
                        rules={[
                            { required: true, message: `Por favor, preencha o campo de ${selectedType == 'txt' ? 'texto' : selectedType == 'readme' ? 'readme' : selectedType == 'youtube_link' ? 'URL' : 'imagem'}.` }
                        ]}
                    >
                        <Typography style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {selectedType === 'readme' && (
                                <>
                                    <Typography style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <Text>Digite o texto do readme abaixo:</Text>
                                        <Tooltip title="Pré-visualizar readme">
                                            <Button icon={<EyeOutlined />} shape="circle" type="primary" onClick={() => setIsOpenDrawer(true)}></Button>
                                        </Tooltip>
                                    </Typography>
                                </>
                            )}
                            {selectedType === 'youtube_link' && (
                                <>
                                    <Typography style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text>Cole o link do vídeo abaixo:</Text>
                                    </Typography>
                                </>
                            )}
                            {selectedType === 'imagem' && (
                                <>
                                    <Typography style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text>Adicione a imagem abaixo:</Text>
                                    </Typography>
                                </>
                            )}
                            {selectedType === 'txt' && (
                                <>
                                    <Typography style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text>Digite o texto abaixo:</Text>
                                    </Typography>
                                </>
                            )}
                        </Typography>
                    </Form.Item>
                    {selectedType === 'imagem' && <ImgInput />}
                    {selectedType === 'readme' && ReadmeInput}
                    {selectedType === 'youtube_link' && <YoutubeLink />}
                    {selectedType === 'txt' && <TxtInput />}

                </Form>
                {selectedType === 'readme' && isOpenDrawer && (
                    <Drawer
                        style={{ padding: '2vh' }}
                        open={isOpenDrawer}
                        height='80vh'
                        onClose={() => setIsOpenDrawer(false)}
                        placement="bottom"
                        title="Pré-visualização"
                        closeIcon={<CloseOutlined style={{ position: 'absolute', right: '20px' }} />}
                    >
                        <Card style={{ background: '#0d1117', color: 'white', padding: '2vh' }}>
                            <div className="markdown-container">
                                <MarkdownHooks
                                    rehypePlugins={[rehypeStarryNight]}
                                    remarkPlugins={[remarkGfm]}
                                >
                                    {debouncedMarkdownContent ? debouncedMarkdownContent : 'Digite na caixa de texto para ver o resultado aqui.'}
                                </MarkdownHooks>
                            </div>
                        </Card>
                    </Drawer>
                )}

                {selectedType === 'youtube_link' && youtubePreviewLink.length > 10 && (
                    <div style={{ width: '100%', height: '500px', border: '1px solid grey', borderRadius: '8px', overflow: 'hidden' }}>
                        <iframe
                            style={{ border: 'none' }}
                            width="100%"
                            height="100%"
                            src={youtubePreviewLink}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        >
                        </iframe>
                    </div>
                )}
            </Modal>
        </>
    );
}