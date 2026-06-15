import type { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { getAllByRole } from "../../../service/UsersService";
import type { TSimpleUser, UsersTeacherResponse } from "../../../types/UserType";
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space } from "antd";
import { createSubject, deleteSubject, updateSubject } from "../../../service/SubjectsService";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

export type TSubjectPropsData = {
    id: string,
    nome: string,
    professores: string[],
    sigla: string
};

interface IEditVisualizeModal {
    subjectData: TSubjectPropsData | undefined,
    isOpen: boolean,
    onClose: (wasSuccessful: boolean, shouldReload: boolean) => void
    isEditing: boolean
};

export const EditViewSubject = ({ subjectData, isOpen, onClose, isEditing }: IEditVisualizeModal) => {

    const [modalIsLoading, setModalIsLoading] = useState<boolean>(false);
    const [teachers, setTeachers] = useState<TSimpleUser[]>([]);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [popConfirmOpen, setPopConfirmOpen] = useState(false);
    const [professorFields, setProfessorFields] = useState<string[]>(['']);

    useEffect(() => {
        getAllTeacher();
    }, []);

    useEffect(() => {
        if (isOpen && subjectData && isEditing && teachers.length > 0) {
            const professorIds = subjectData.professores || [];

            form.setFieldsValue({
                sigla: subjectData.sigla,
                nome: subjectData.nome,
                professores: professorIds,
            });
            setProfessorFields(professorIds.length > 0 ? professorIds : ['']);
        } else if (!isOpen) {
            form.resetFields();
            setProfessorFields(['']);
        }
    }, [isOpen, subjectData, teachers, form]);

    const addProfessorField = () => {
        if (canAddMoreProfessors()) {
            setProfessorFields([...professorFields, '']);
        }
    };

    const canAddMoreProfessors = () => {
        const values = form.getFieldValue('professores') || [];
        const lastValue = values[values.length - 1];

        return lastValue && lastValue !== '';
    };

    const removeProfessorField = (index: number) => {
        if (professorFields.length > 1) {
            const newFields = [...professorFields];
            newFields.splice(index, 1);
            setProfessorFields(newFields);

            const values = form.getFieldsValue();
            values.professores = values.professores?.filter((_: any, i: number) => i !== index);
            form.setFieldsValue(values);
        }
    };

    const getAllTeacher = () => {
        setModalIsLoading(true);
        getAllByRole("professor")
            .then((response: UsersTeacherResponse) => {
                const tempArray: TSimpleUser[] = [{ id: '', nome: 'Sem', sobrenome: 'professor' }, ...response.data.data];
                setTeachers(tempArray);
            })
            .finally(() => {
                setModalIsLoading(false);
            });
    };

    const saveSubject = (values: any) => {
        setModalIsLoading(true);

        const dataToSave = {
            ...values,
            professores: values.professores?.filter((id: string) => id && id !== '')
        };

        updateSubject(subjectData?.id, dataToSave)
            .then((_: AxiosResponse) => {
                setModalIsLoading(false);
                onClose(true, true);
            })
            .catch((error: any) => {
                setModalIsLoading(false);

                if (error.response?.status === 422 && error.response?.data?.errors) {
                    const validationErrors = error.response.data.errors;

                    const errorMessages = Object.entries(validationErrors)
                        .map(([_, messages]) => {
                            return `${(messages as string[]).join(', ')}`;
                        })
                        .join('\n');

                    messageApi.error({
                        content: (
                            <div>
                                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                                    Erros de validação:
                                </div>
                                <div>{errorMessages}</div>
                            </div>
                        ),
                        duration: 5,
                        style: { whiteSpace: 'pre-line' }
                    });
                } else {
                    messageApi.error({
                        content: error.response?.data?.message || 'Ocorreu um erro ao salvar',
                        duration: 5
                    });
                }
            });
    };

    const handleCreateSubject = (values: any) => {
        setModalIsLoading(true);

        const dataToCreate = {
            ...values,
            professores: values.professores?.filter((id: string) => id && id !== '')
        };

        createSubject(dataToCreate)
            .then((_: AxiosResponse) => {
                setModalIsLoading(false);
                onClose(true, true);
            })
            .catch((error: any) => {
                setModalIsLoading(false);

                if (error.response?.status === 422 && error.response?.data?.errors) {
                    const validationErrors = error.response.data.errors;

                    const errorMessages = Object.entries(validationErrors)
                        .map(([_, messages]) => {
                            return `${(messages as string[]).join(', ')}`;
                        })
                        .join('\n');

                    messageApi.error({
                        content: (
                            <div>
                                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                                    Erros de validação:
                                </div>
                                <div>{errorMessages}</div>
                            </div>
                        ),
                        duration: 5,
                        style: { whiteSpace: 'pre-line' }
                    });
                } else {
                    messageApi.error({
                        content: error.response?.data?.message || 'Ocorreu um erro ao criar',
                        duration: 5
                    });
                }
            });
    }

    const showPopConfirm = () => {
        setPopConfirmOpen(true)
    };

    const handleDeleteSubject = () => {
        setModalIsLoading(true);
        deleteSubject(subjectData?.id)
            .then((response: AxiosResponse) => {
                if (response.status == 204) {
                    setModalIsLoading(false);
                    onClose(true, true)
                } else {
                    setModalIsLoading(false);
                    messageApi.open({
                        content: 'Falha ao deletar matéria',
                        duration: 5
                    });
                }
            })
    };

    const cancelPopConfirm = () => {
        setPopConfirmOpen(false);
    };

    return (
        <>
            {contextHolder}
            <Modal
                title={isEditing ? "Editar disciplina" : "Adicionar disciplina"}
                open={isOpen}
                onCancel={() => onClose(true, false)}
                footer={[
                    <Space key='delete' style={{ marginRight: '8px' }}>
                        {isEditing && (
                            <Popconfirm title="Deseja realmente deletar?" open={popConfirmOpen} onCancel={cancelPopConfirm} onConfirm={handleDeleteSubject} >
                                <Button color={modalIsLoading ? "default" : "danger"} variant={modalIsLoading ? "text" : "solid"} onClick={showPopConfirm} disabled={modalIsLoading}>
                                    Apagar
                                </Button>
                            </Popconfirm>

                        )}
                    </Space>,
                    <Button key="back" onClick={() => onClose(true, false)}>
                        Cancelar
                    </Button>,
                    <Button key="submit" type="primary" htmlType="submit" onClick={() => form.submit()} loading={modalIsLoading}>
                        {isEditing ? 'Salvar' : 'Criar'}
                    </Button>,
                ]}
            >

                <Form
                    form={form}
                    layout="vertical"
                    name="Edit-view-subject-form"
                    onFinish={isEditing ? saveSubject : handleCreateSubject}
                >
                    <Form.Item label="Sigla">
                        <Form.Item name="sigla" rules={[{ required: true, message: 'Por favor, preencha a sigla' }]}>
                            <Input placeholder="Sigla da matéria" />
                        </Form.Item>
                    </Form.Item>

                    <Form.Item label="Professores" name="professor_id">
                        {professorFields.map((_, index) => (
                            <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                <Form.Item
                                    name={['professores', index]}
                                >
                                    <Select
                                        placeholder="Selecione um professor"
                                        loading={modalIsLoading}
                                        style={{ width: 'auto' }}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={((input, option) =>
                                            option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
                                        )}
                                        onChange={() => { setProfessorFields([...professorFields]) }}
                                    >
                                        <>
                                            {teachers.filter(teacher => {
                                                const selectedTeachers = form.getFieldValue('professores') || [];
                                                return !selectedTeachers.includes(teacher.id) || selectedTeachers[index] === teacher.id;
                                            })
                                                .map(teacher => {
                                                    return (
                                                        <Option key={teacher.id} value={teacher.id}>
                                                            {teacher.nome} {teacher.sobrenome}
                                                        </Option>
                                                    )
                                                })}
                                        </>
                                    </Select>
                                </Form.Item>
                                {professorFields.length > 1 && (
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeProfessorField(index)}
                                    />
                                )}
                            </Space>
                        ))}
                        {canAddMoreProfessors() && (
                            <Button
                                type="dashed"
                                onClick={addProfessorField}
                                icon={<PlusOutlined />}
                            >
                                Adicionar professor
                            </Button>
                        )}
                    </Form.Item>

                    <Form.Item label="Nome" >
                        <Form.Item name="nome" rules={[{ required: true, message: "Por favor, preencha o nome da matéria" }]}>
                            <Input placeholder="Nome da matéria" />
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};