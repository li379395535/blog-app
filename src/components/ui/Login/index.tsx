'use client';

import { useState, useEffect } from 'react';
import { Button, Form, Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login, signup, isLogin } from './actions';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      if (await isLogin()) {
        redirect('/');
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async (values: { email: string; password: string; remember: boolean }) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', values.email);
      formData.append('password', values.password);
      await login(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (values: { email: string; password: string }) => {
    setIsSignupLoading(true);
    try {
      await signup(values);
    } finally {
      setIsSignupLoading(false);
    }
  };
  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <Form
        name="login"
        className="mt-8 space-y-6"
        initialValues={{ remember: true }}
        onFinish={handleLogin}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="邮箱地址"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="密码"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>记住我</Checkbox>
          </Form.Item>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="w-full"
            size="large"
          >
            登录
          </Button>
        </Form.Item>

        <div className="text-center text-sm text-gray-600">
          或者
        </div>

        <Form.Item>
          <Button
            onClick={() => {
              const form = document.forms.namedItem('login');
              if (form) {
                const formData = new FormData(form);
                handleSignup({
                  email: formData.get('email') as string,
                  password: formData.get('password') as string
                });
              }
            }}
            loading={isSignupLoading}
            className="w-full"
            size="large"
          >
            立即注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}