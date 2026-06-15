import { useEffect, useRef, useState } from "react";
import { createOrUpdateRules, getRules } from "../../service/SystemService";
import { Button, Flex, message, Spin } from "antd";
import type { NoticeType } from "antd/es/message/interface";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { SaveOutlined } from "@ant-design/icons";

interface IRulesProps {
    editing: boolean
};

interface IRulesData {
    id: number;
    created_at: string;
    updated_at: string;
    rules: string;
}

export default function Rules({ editing }: IRulesProps) {

    const [messageApi, contextHolder] = message.useMessage();
    const [rulesData, setRulesData] = useState<IRulesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingRules, setSavingRules] = useState(false);

    const quillRef = useRef<HTMLDivElement>(null);
    const quillInstanceRef = useRef<Quill | null>(null);
    const displayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadRules();
    }, []);

    useEffect(() => {
        if (!loading && rulesData && editing && quillRef.current && !quillInstanceRef.current) {
            initializeQuill();
        }
    }, [loading, rulesData, editing]);

    useEffect(() => {
        if (!editing && rulesData && displayRef.current) {
            try {
                const delta = JSON.parse(rulesData.rules);
                const tempQuill = new Quill(document.createElement('div'));
                tempQuill.setContents(delta);
                displayRef.current.innerHTML = tempQuill.root.innerHTML;
            } catch {
                displayRef.current.innerHTML = rulesData.rules;
            }
        }
    }, [editing, rulesData]);

    const initializeQuill = () => {
        if (!quillRef.current) return;

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
            placeholder: 'Digite as regras aqui...'
        });

        if (rulesData?.rules) {
            try {
                const delta = JSON.parse(rulesData.rules);
                quill.setContents(delta);
            } catch {
                quill.root.innerHTML = rulesData.rules;
            }
        }

        quill.on('text-change', () => {
            const content = quill.getContents();
            const delta = JSON.stringify(content);

            setRulesData(prev => prev ? {
                ...prev,
                rules: delta
            } : null);
        });

        quillInstanceRef.current = quill;
    };

    const loadRules = () => {
        getRules()
            .then((response: any) => {
                setRulesData(response.data.data);
            })
            .catch(() => {
                showMessage('Falha ao carregar regras.', 'error');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const showMessage = (msg: string, type: NoticeType) => {
        messageApi.open({
            content: msg,
            type: type
        });
    };

    if (loading) {
        return <Spin size="large" spinning />
    }

    if (!rulesData) {
        return <p>Nenhuma regra encontrada.</p>;
    }

    const saveRules = () => {
        setSavingRules(true);
        quillInstanceRef.current?.enable(false);

        createOrUpdateRules(rulesData.rules)
            .then(() => {
                showMessage('Salvo com sucesso', 'success');
            })
            .catch(() => {
                showMessage('Falha ao salvar regras', 'error');
            })
            .finally(() => {
                setSavingRules(false);
                quillInstanceRef.current?.enable(true)
            })
    }

    return (
        <>
            {contextHolder}
            <Flex vertical style={{ gap: '2vh', overflow: 'visible' }}>
                {editing && (
                    <Button
                        onClick={saveRules}
                        disabled={savingRules || loading}
                        style={{ width: '100px', alignSelf: 'end' }}
                        icon={<SaveOutlined />}
                        type="primary"
                    >
                        Salvar
                    </Button>
                )}

                {editing ? (
                    <div style={{
                        backgroundColor: 'white',
                        minHeight: '300px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px'
                    }}>
                        <div ref={quillRef} />
                    </div>
                ) : (
                    <div
                        ref={displayRef}
                        className="ql-editor"
                        style={{
                            backgroundColor: 'white',
                            minHeight: '300px',
                            padding: '12px 15px',
                            borderRadius: '4px'
                        }}
                    />
                )}
            </Flex>
        </>
    );
}