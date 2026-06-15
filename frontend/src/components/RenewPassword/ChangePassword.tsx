import { Button, Flex, Form, Input } from "antd";
import { useState } from "react";

export default function ChangePassword() {

    const [form] = Form.useForm();

    const [isFetching, setIsFetching] = useState<boolean>(false);

    const handleChangePassword = () => {
        setIsFetching(true);
        form.validateFields()
            .then(() => {

            })
            .catch(() => {

            })
            .finally(() => {
                setIsFetching(false);
            });
    }

    return (
        <>
            <Flex vertical>
                <Form
                    form={form}
                    disabled={isFetching}
                    layout="vertical"
                    name="change-password"
                >
                    <Form.Item
                        name="newPassword"
                        label="Nova senha:"
                        rules={[
                            {
                                whitespace: true,
                                message: 'Este campo não pode ficar em branco'
                            },
                            { required: true, message: 'A senha não pode ficar vazia.' },
                            { min: 8, message: 'A senha precisa ter no mínimo 8 caracteres.' },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="newPasswordConfirmation"
                        label="Repita a nova senha:"
                        rules={[
                            {
                                whitespace: true,
                                message: 'Este campo não pode ficar em branco'
                            },
                            { required: true, message: 'A senha não pode ficar vazia.' },
                            { min: 8, message: 'A senha precisa ter no mínimo 8 caracteres.' },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={handleChangePassword} type="primary" htmlType="submit">Mudar</Button>
                    </Form.Item>
                </Form>
            </Flex>
        </>
    );
}