import React, { useState, useRef, useEffect, useMemo } from "react";

import {
  Modal,
  Tabs,
  Card,
  Typography,
  Space,
  Input,
  Button,
  Avatar,
  Divider,
  Spin,
} from "antd";

import {
  MailOutlined,
  PhoneOutlined,
  SearchOutlined,
  RocketOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";

import socket from "../socket/chatSocket";

const { Text, Title } = Typography;

const HelpModal = ({ open, onCancel }) => {
  const botMessageId = useRef(null);
  const [searchText, setSearchText] = useState("");

  const [chatInput, setChatInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Xin chào! Tôi là trợ lý AI của giáo xứ. Tôi có thể giúp bạn về giáo lý, lịch lễ, sự kiện và thông tin giáo xứ.",
    },
  ]);

  const chatEndRef = useRef(null);

  const sessionId = useMemo(() => {
    let id = localStorage.getItem("chat_session");

    if (!id) {
      id = crypto.randomUUID();

      localStorage.setItem("chat_session", id);
    }

    return id;
  }, []);
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleStream = (data) => {
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === botMessageId.current) {
            return {
              ...msg,
              text: msg.text + data.token,
            };
          }

          return msg;
        });
      });
    };

    const handleEnd = () => {
      setLoading(false);

      botMessageId.current = null;
    };

    const handleError = () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Xin lỗi, hệ thống AI đang gặp lỗi.",
        },
      ]);

      setLoading(false);
    };

    socket.off("chat_stream");

    socket.off("chat_end");

    socket.off("chat_error");

    socket.on("chat_stream", handleStream);

    socket.on("chat_end", handleEnd);

    socket.on("chat_error", handleError);

    return () => {
      socket.off("chat_stream", handleStream);

      socket.off("chat_end", handleEnd);

      socket.off("chat_error", handleError);
    };
  }, []);
  // nhận stream từ server

  useEffect(() => {
    const handleStream = (data) => {
      console.log("TOKEN:", data.token);
      setMessages((prev) => {
        const last = prev[prev.length - 1];

        if (last && last.role === "bot") {
          return [
            ...prev.slice(0, -1),

            {
              ...last,

              text: last.text + data.token,
            },
          ];
        }

        return [
          ...prev,

          {
            role: "bot",
            text: data.token,
          },
        ];
      });
    };

    const handleEnd = () => {
      setLoading(false);
    };

    const handleError = () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Xin lỗi, hệ thống AI đang gặp lỗi.",
        },
      ]);

      setLoading(false);
    };

    socket.on("chat_stream", handleStream);

    socket.on("chat_end", handleEnd);

    socket.on("chat_error", handleError);

    return () => {
      socket.off("chat_stream", handleStream);

      socket.off("chat_end", handleEnd);

      socket.off("chat_error", handleError);
    };
  }, []);

  // auto scroll

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!chatInput.trim() || loading) return;

    const question = chatInput;

    const id = Date.now();

    botMessageId.current = id;

    setMessages((prev) => [
      ...prev,

      {
        id: Date.now(),
        role: "user",
        text: question,
      },

      {
        id,
        role: "bot",
        text: "",
      },
    ]);

    setChatInput("");

    setLoading(true);

    socket.emit("chat_message", {
      sessionId,

      message: question,
    });
  };

  const faqItems = [
    {
      q: "Làm sao thêm dữ liệu?",

      a: "Vào chức năng tương ứng, chọn Thêm mới và lưu thông tin.",
    },

    {
      q: "Làm sao sửa dữ liệu?",

      a: "Chọn bản ghi cần sửa, cập nhật thông tin rồi lưu lại.",
    },

    {
      q: "Làm sao xoá dữ liệu?",

      a: "Chọn bản ghi và xác nhận xoá.",
    },
  ];

  const chatContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: 450,
      }}
    >
      <div
        style={{
          flex: 1,

          overflowY: "auto",

          padding: 15,

          background: "#f5f5f5",

          borderRadius: 12,
        }}
      >
        {messages.map((m, index) => (
          <div
            key={index}
            style={{
              display: "flex",

              justifyContent: m.role === "user" ? "flex-end" : "flex-start",

              marginBottom: 15,

              gap: 10,
            }}
          >
            {m.role === "bot" ? (
              <Avatar
                icon={<RobotOutlined />}
                style={{
                  background: "#1677ff",
                }}
              />
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}

            <div
              style={{
                maxWidth: "75%",

                padding: "10px 15px",

                borderRadius: 16,

                background: m.role === "user" ? "#1677ff" : "#fff",

                color: m.role === "user" ? "#fff" : "#333",

                boxShadow: "0 3px 10px rgba(0,0,0,.08)",
              }}
            >
              {m.text ? (
                m.text
              ) : loading && m.role === "bot" ? (
                <Spin size="small" />
              ) : (
                ""
              )}
            </div>
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      <Input.Search
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onSearch={sendMessage}
        disabled={loading}
        enterButton={<SendOutlined />}
        placeholder="Hỏi trợ lý AI giáo xứ..."
      />
    </div>
  );

  const items = [
    {
      key: "1",

      label: "Hướng dẫn FAQ",

      children: (
        <div>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {faqItems

            .filter((x) => x.q.toLowerCase().includes(searchText.toLowerCase()))

            .map((item, i) => (
              <Card
                key={i}
                size="small"
                style={{
                  marginTop: 10,
                }}
              >
                <Text strong>{item.q}</Text>

                <p>{item.a}</p>
              </Card>
            ))}
        </div>
      ),
    },

    {
      key: "2",

      label: "Chat AI",

      children: chatContent,
    },

    {
      key: "3",

      label: "Liên hệ",

      children: (
        <Card>
          <Space direction="vertical">
            <Text>
              <MailOutlined />
              support@giaoxu.com
            </Text>

            <Text>
              <PhoneOutlined />
              0123 456 789
            </Text>

            <Button icon={<RocketOutlined />}>Tải tài liệu hướng dẫn</Button>
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <Modal open={open} onCancel={onCancel} footer={null} width={850} centered>
      <Title level={3}>🤖 Trợ lý AI Giáo Xứ</Title>

      <Text type="secondary">
        Hỏi về giáo lý, lịch lễ, sự kiện và hoạt động giáo xứ.
      </Text>

      <Divider />

      <Tabs tabPosition="left" items={items} />
    </Modal>
  );
};

export default HelpModal;
