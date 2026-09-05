import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  ConfigProvider,
  Checkbox,
  Spin,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  CompassOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Logo from "../assets/images/logologin.jpg";

const { Title, Text, Paragraph } = Typography;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

// Icon xoay tùy chỉnh phong cách Tôn Nghiêm
const antIcon = (
  <LoadingOutlined style={{ fontSize: 44, color: accentGold }} spin />
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const savedUser = localStorage.getItem("remember_me");
    if (savedUser) {
      try {
        const { email, password } = JSON.parse(savedUser);
        form.setFieldsValue({ email, password, remember: true });
      } catch (e) {
        console.error("Failed to parse remember_me data");
      }
    }
  }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", values);

      if (res.data?.token) {
        if (values.remember) {
          localStorage.setItem(
            "remember_me",
            JSON.stringify({ email: values.email, password: values.password }),
          );
        } else {
          localStorage.removeItem("remember_me");
        }

        login(res.data.token);
        message.success("Bản khai hợp lệ! Xin chào Quản trị viên.");

        // Delay nhẹ cho người dùng cảm nhận được phản hồi
        setTimeout(() => navigate("/giao-xu"), 800);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Đăng nhập thất bại!";
      message.error(msg);
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          controlHeightLG: 48,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      {/* 1. HIỆU ỨNG LOADING OVERLAY SANG TRỌNG */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="login-loading-overlay"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="login-loading-box"
            >
              <Spin indicator={antIcon} />
              <Title
                level={4}
                style={{ color: primaryNavy, margin: "16px 0 4px 0" }}
              >
                Đang Xác Thực Quyền Mục Vụ...
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Vui lòng đợi trong giây lát
              </Text>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="login-editorial-page">
        {/* PHẦN TRÁI: BANNER NGHỆ THUẬT & LỜI CHÚA */}
        <div className="login-image-section">
          <div className="login-image-overlay">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hero-text-wrapper"
            >
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG NỘI BỘ MỤC VỤ
              </span>

              <Title level={1} className="login-hero-title">
                GIÁO XỨ <br />
                ĐỒNG QUAN
              </Title>

              <div className="gold-divider-line" />

              <Paragraph className="login-hero-quote">
                "Người ta sống không chỉ nhờ cơm bánh, nhưng còn nhờ mọi lời
                miệng Thiên Chúa phán ra."
                <br />
                <span className="bible-citation">(Mt 4:4)</span>
              </Paragraph>
            </motion.div>

            <div className="bottom-diocesan-tag">
              <BankOutlined style={{ color: accentGold }} />
              <span>GIÁO PHẬN THÁI BÌNH • GIÁO HẠT KIẾN XƯƠNG</span>
            </div>
          </div>

          <img
            src={Logo}
            alt="Giao Xu Dong Quan Church"
            className="login-bg-img"
          />
        </div>

        {/* PHẦN PHẢI: FORM ĐĂNG NHẬP */}
        <div className="login-form-section">
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="login-form-container"
          >
            <div className="form-header-box">
              <span className="form-sub-badge">CỔNG TRUY CẬP QUẢN TRỊ</span>
              <Title level={2} className="login-form-title">
                Đăng Nhập
              </Title>
              <Text type="secondary" className="login-form-subtitle">
                Chào mừng Quản trị viên trở lại hệ thống mục vụ.
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              initialValues={{ remember: true }}
            >
              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    TÀI KHOẢN EMAIL
                  </Text>
                }
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập Email tài khoản!" },
                  { type: "email", message: "Định dạng Email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={
                    <UserOutlined
                      style={{ color: accentGold, marginRight: 8 }}
                    />
                  }
                  placeholder="vanphong@giaoxudongquan.com"
                  size="large"
                  className="login-custom-input"
                />
              </Form.Item>

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    MẬT KHẨU BẢO MẬT
                  </Text>
                }
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập Mật khẩu!" }]}
              >
                <Input.Password
                  prefix={
                    <LockOutlined
                      style={{ color: accentGold, marginRight: 8 }}
                    />
                  }
                  placeholder="••••••••••••"
                  size="large"
                  className="login-custom-input"
                />
              </Form.Item>

              <div className="login-options-row">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="remember-checkbox">
                    Ghi nhớ thông tin đăng nhập
                  </Checkbox>
                </Form.Item>

                <a
                  href="#forgot"
                  className="forgot-password-link"
                  onClick={(e) => {
                    e.preventDefault();
                    message.info(
                      "Vui lòng liên hệ Admin (0336041807) để cấp lại mật khẩu!",
                    );
                  }}
                >
                  Quên mật khẩu?
                </a>
              </div>

              <Form.Item style={{ marginTop: 28 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  icon={<ArrowRightOutlined />}
                  className="login-submit-btn"
                >
                  XÁC THỰC & ĐĂNG NHẬP
                </Button>
              </Form.Item>
            </Form>

            <div className="login-footer-credits">
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                TRANG THÔNG TIN ĐIỆN TỬ GIÁO XỨ © 2026
              </Text>

              <Text type="secondary" style={{ fontSize: 11, opacity: 0.6 }}>
                Phát triển & Bảo trì bởi HT Developer
              </Text>
            </div>
          </motion.div>
        </div>
      </div>

      {/* STYLES SCOPED EDITORIAL SACRED */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

          .login-editorial-page {
            display: flex;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
            background-color: #ffffff;
            font-family: 'Be Vietnam Pro', sans-serif;
            color: ${textDark};
          }

          /* Image Section Left */
          .login-image-section {
            flex: 1.35;
            position: relative;
            background: ${primaryNavy};
            overflow: hidden;
          }

          .login-bg-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: brightness(0.85) contrast(1.05);
          }

          .login-image-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              180deg,
              rgba(27, 54, 93, 0.4) 0%,
              rgba(27, 54, 93, 0.88) 100%
            );
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 60px;
            z-index: 2;
          }

          .sacred-badge {
            background: rgba(212, 175, 55, 0.2);
            border: 1px solid ${accentGold};
            color: #ffffff;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.2px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            backdrop-filter: blur(8px);
            margin-bottom: 24px;
          }

          .login-hero-title {
            color: #ffffff !important;
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: clamp(38px, 4vw, 56px) !important;
            line-height: 1.15 !important;
            margin: 0 !important;
            font-weight: 700 !important;
            text-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          }

          .gold-divider-line {
            width: 60px;
            height: 3px;
            background: ${accentGold};
            margin: 24px 0;
            border-radius: 2px;
          }

          .login-hero-quote {
            color: rgba(255, 255, 255, 0.9) !important;
            font-size: 16px;
            line-height: 1.7;
            max-width: 460px;
            margin: 0 !important;
            font-weight: 400;
          }

          .bible-citation {
            display: block;
            font-style: italic;
            font-size: 13px;
            color: ${accentGold};
            margin-top: 6px;
          }

          .bottom-diocesan-tag {
            display: flex;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.75);
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }

          /* Form Section Right */
          .login-form-section {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
            background: ${softBg};
          }

          .login-form-container {
            width: 100%;
            max-width: 380px;
          }

          .form-header-box {
            margin-bottom: 32px;
          }

          .form-sub-badge {
            font-size: 11px;
            font-weight: 700;
            color: ${accentGold};
            letter-spacing: 1.2px;
            display: block;
            margin-bottom: 6px;
          }

          .login-form-title {
            font-family: 'Playfair Display', Georgia, serif !important;
            color: ${primaryNavy} !important;
            margin: 0 0 6px 0 !important;
            font-weight: 700 !important;
            font-size: 32px !important;
          }

          .login-form-subtitle {
            color: #64748b;
            font-size: 14px;
          }

          .form-field-label {
            font-size: 11px;
            color: ${primaryNavy};
            letter-spacing: 0.8px;
          }

          .login-custom-input {
            border-radius: 10px !important;
            border: 1px solid rgba(27, 54, 93, 0.15) !important;
            background: #ffffff !important;
          }

          .login-custom-input:hover,
          .login-custom-input:focus {
            border-color: ${accentGold} !important;
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.15) !important;
          }

          .login-options-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: -4px;
            margin-bottom: 8px;
          }

          .remember-checkbox {
            font-size: 13px;
            color: #64748b;
          }

          .forgot-password-link {
            color: ${primaryNavy};
            font-size: 13px;
            font-weight: 600;
            transition: color 0.2s;
          }

          .forgot-password-link:hover {
            color: ${accentGold};
          }

          .login-submit-btn {
            height: 48px !important;
            border-radius: 12px !important;
            background: ${primaryNavy} !important;
            border-color: ${primaryNavy} !important;
            font-weight: 700 !important;
            font-size: 14px !important;
            letter-spacing: 0.5px;
            box-shadow: 0 6px 18px rgba(27, 54, 93, 0.25) !important;
          }

          .login-submit-btn:hover {
            background: #142a48 !important;
            border-color: #142a48 !important;
          }

          .login-footer-credits {
            margin-top: 48px;
            text-align: center;
            border-top: 1px dashed rgba(27, 54, 93, 0.12);
            padding-top: 20px;
          }

          /* Loading Overlay */
          .login-loading-overlay {
            position: fixed;
            inset: 0;
            background: rgba(255, 255, 255, 0.82);
            backdrop-filter: blur(12px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }

          .login-loading-box {
            background: #ffffff;
            padding: 36px 48px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 15px 35px rgba(27, 54, 93, 0.12);
            border: 1px solid rgba(212, 175, 55, 0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          @media (max-width: 900px) {
            .login-image-section {
              display: none;
            }
          }
        `,
        }}
      />
    </ConfigProvider>
  );
}
