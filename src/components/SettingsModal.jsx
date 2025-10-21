import { useState, useEffect } from 'react';
import { Modal, Input, Button, Form } from 'antd';
import aiService from '../services/aiService';

function SettingsModal({ open, onClose, onNotification, modal }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ apiKey: aiService.getApiKey() });
    }
  }, [open, form]);

  const handleSave = (values) => {
    const keyToSave = values.apiKey || '';
    console.log('💾 Saving API Key:', keyToSave ? `${keyToSave.substring(0, 10)}...` : 'EMPTY');

    if (!keyToSave.trim()) {
      aiService.clearApiKey();
      onNotification('API Key 已清除，将使用本地抬杠模式', 'info');
    } else {
      aiService.setApiKey(keyToSave.trim());

      // 验证保存
      const savedKey = aiService.getApiKey();
      console.log('✅ Verified saved key:', savedKey ? `${savedKey.substring(0, 10)}...` : 'NOT SAVED');

      onNotification(`API Key 配置成功！(长度: ${keyToSave.length})`, 'success');
    }
    onClose();
  };

  const handleClear = () => {
    modal.confirm({
      title: '清除配置',
      content: '确定要清除 API Key 配置吗？此操作等同于“退出登录”。',
      okText: '确定清除',
      cancelText: '取消',
      onOk: () => {
        aiService.clearApiKey();
        form.setFieldsValue({ apiKey: '' });
        onNotification('API Key 已清除，将使用本地抬杠模式', 'info');
        onClose(); // 清除后直接关闭
      }
    });
  };

  return (
    <Modal
      title="🔑 API Key 配置"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="clear" danger onClick={handleClear}>
          清除配置 (登出)
        </Button>,
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={() => form.submit()}>
          保存配置
        </Button>,
      ]}
    >
      <div style={{ marginBottom: '16px' }}>
        <p>为了使用AI功能，你需要配置API Key。</p>
        <p style={{ fontSize: '12px', color: '#999' }}>
          API 端点: <code>/api/chat/completions</code><br />
          当前 localStorage 中的 key: <code>ai_api_key</code>
        </p>
        <Button
          size="small"
          onClick={() => {
            const key = localStorage.getItem('ai_api_key');
            console.log('📋 Current localStorage ai_api_key:', key);
            console.log('📋 All localStorage keys:', Object.keys(localStorage));
            alert(key ? `API Key 已设置 (长度: ${key.length})` : 'API Key 未设置');
          }}
        >
          检查 localStorage
        </Button>
      </div>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: '24px' }}>
        <Form.Item
          name="apiKey"
          label="API Key"
        >
          <Input.Password placeholder="清空并保存即代表“登出”" />
        </Form.Item>
      </Form>
      <p style={{ fontSize: '12px', color: '#999' }}>
        💡 配置将保存在浏览器本地，不会上传到服务器
      </p>
    </Modal>
  );
}

export default SettingsModal;