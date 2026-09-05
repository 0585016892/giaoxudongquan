import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  ConfigProvider,
  Checkbox,
  Spin,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  HeartFilled,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

import background from "../../assets/images/login-background.png";
import logobackground from "../../assets/images/logo-giao-ly.png.png";

/* =========================================================
   🖼️ HÌNH ẢNH
========================================================= */

const LOGIN_BACKGROUND = background;
const LOGIN_LOGO = logobackground;

/* =========================================================
   🎨 PALETTE
========================================================= */

const colors = {
  primary: "#6366F1",

  primaryGradient:
    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #C084FC 100%)",

  accentGold: "#F59E0B",
  accentCyan: "#06B6D4",

  bgDark: "#0B0F19",

  cardBg: "rgba(255, 255, 255, 0.94)",

  textMain: "#0F172A",
  textMuted: "#64748B",
};

const antIcon = (
  <LoadingOutlined
    style={{
      fontSize: 44,
      color: colors.primary,
    }}
    spin
  />
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  /* =========================================================
     REMEMBER LOGIN
  ========================================================= */

  useEffect(() => {
    const savedUser = localStorage.getItem("remember_me");

    if (savedUser) {
      try {
        const { email, password } = JSON.parse(savedUser);

        form.setFieldsValue({
          email,
          password,
          remember: true,
        });
      } catch (e) {
        console.error("Lỗi đọc ghi nhớ đăng nhập:", e);
      }
    }
  }, [form]);

  /* =========================================================
     LOGIN
  ========================================================= */
  const onFinish = async (values) => {
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      // ========================================================
      // KIỂM TRA TOKEN
      // ========================================================

      if (!res.data?.token) {
        message.error("Đăng nhập thất bại: Server không trả token");
        return;
      }

      // ========================================================
      // REMEMBER ME
      // ========================================================

      if (values.remember) {
        localStorage.setItem(
          "remember_me",
          JSON.stringify({
            email: values.email,
          }),
        );
      } else {
        localStorage.removeItem("remember_me");
      }

      // ========================================================
      // LOGIN CONTEXT
      // ========================================================

      try {
        await login(res.data.token);
      } catch (loginError) {
        console.error("Lỗi lưu phiên đăng nhập:", loginError);

        message.error("Không thể lưu phiên đăng nhập");

        return;
      }

      // ========================================================
      // SUCCESS
      // ========================================================

      message.success("Chào mừng Huynh Trưởng / GLV trở lại!");

      // Đợi Context cập nhật user rồi chuyển trang
      setTimeout(() => {
        navigate("/catechist", {
          replace: true,
        });
      }, 800);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại!";

      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
          borderRadius: 14,
          controlHeightLG: 52,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      {/* =====================================================
          LOADING
      ====================================================== */}

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="neo-loading-overlay"
          >
            <motion.div
              initial={{
                scale: 0.85,
                y: 15,
              }}
              animate={{
                scale: 1,
                y: 0,
              }}
              exit={{
                scale: 0.85,
                opacity: 0,
              }}
              className="neo-loading-card"
            >
              <Spin indicator={antIcon} />

              <h3 className="loading-title">ĐANG KẾT NỐI HỆ THỐNG...</h3>

              <p className="loading-desc">
                Xác thực quyền Quản trị & Huynh Trưởng
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          FULL PAGE
      ====================================================== */}

      <div className="canvas-wrapper">
        {/* ===================================================
            BACKGROUND
        ==================================================== */}

        <div className="art-layer">
          <img
            src={LOGIN_BACKGROUND}
            alt="Background Artwork"
            className="art-image"
          />

          <div className="art-overlay-vignette" />

          <div className="art-blur-spheres">
            <div className="sphere sphere-1" />
            <div className="sphere sphere-2" />
          </div>
        </div>

        {/* ===================================================
            HEADER
        ==================================================== */}

        <motion.header
          className="canvas-header"
          initial={{
            y: -40,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
        >
          <div className="brand-pill">
            <img src={LOGIN_LOGO} alt="Logo" className="brand-logo" />

            <div className="brand-divider" />

            <span className="brand-tag">CỔNG THIẾU NHI THANH THỂ</span>
          </div>

          <div className="header-status">
            <span className="status-dot" />

            <span>Hệ thống Quản trị v2026</span>
          </div>
        </motion.header>

        {/* ===================================================
            MAIN
        ==================================================== */}

        <main className="canvas-content">
          <motion.div
            className="glass-card"
            initial={{
              scale: 0.92,
              y: 25,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
            }}
            transition={{
              duration: 0.65,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* =================================================
                CARD HEADER
            ================================================== */}

            <div className="card-header">
              <div className="role-tag">
                <ThunderboltOutlined />

                <span>HUYNH TRƯỞNG / GIÁO LÝ VIÊN</span>
              </div>

              <h1 className="card-title">Trang Quản Trị Giáo Lý</h1>

              <p className="card-subtitle">
                Đăng nhập tài khoản quản trị để đồng hành cùng Thiếu Nhi.
              </p>
            </div>

            {/* =================================================
                LOGIN FORM
            ================================================== */}

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              size="large"
            >
              {/* EMAIL */}

              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập Email hoặc Tên tài khoản!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="Email hoặc Tên tài khoản Huynh Trưởng"
                  className="neo-input"
                  autoComplete="username"
                />
              </Form.Item>

              {/* PASSWORD */}

              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập Mật khẩu!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Mật khẩu"
                  className="neo-input"
                  autoComplete="current-password"
                />
              </Form.Item>

              {/* OPTIONS */}

              <div className="card-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="neo-checkbox">
                    Ghi nhớ đăng nhập
                  </Checkbox>
                </Form.Item>

                <button
                  type="button"
                  className="neo-forgot"
                  onClick={() => {
                    message.info(
                      "Vui lòng liên hệ Ban Quản Trị Hệ Thống để cấp lại mật khẩu!",
                    );
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* LOGIN BUTTON */}

              <Form.Item
                style={{
                  marginTop: 22,
                  marginBottom: 0,
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<ArrowRightOutlined />}
                  className="neo-submit-btn"
                  loading={loading}
                >
                  ĐĂNG NHẬP QUẢN TRỊ
                </Button>
              </Form.Item>
            </Form>

            {/* =================================================
                FEATURES
            ================================================== */}

            <div className="card-footer-info">
              <div className="info-chip">
                <SafetyCertificateOutlined />

                <span>Quyền Quản Trị</span>
              </div>

              <div className="info-chip">
                <CheckCircleOutlined className="security-icon" />

                <span>Bảo Mật Cao</span>
              </div>

              <div className="info-chip">
                <HeartFilled className="heart-icon" />

                <span>Phụng Sự</span>
              </div>
            </div>
          </motion.div>
        </main>

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <footer className="canvas-footer">
          <span>© 2026 E-Catechism Leader Portal</span>

          <span>Nền tảng Giáo Lý Thông Minh</span>
        </footer>
      </div>

      {/* =====================================================
          CSS
      ====================================================== */}

      <style
        dangerouslySetInnerHTML={{
          __html: `

          @import url(
            'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap'
          );

          * {
            box-sizing: border-box;
          }

          html,
          body,
          #root {
            width: 100%;
            min-height: 100%;
            margin: 0;
            padding: 0;
            font-family: 'Be Vietnam Pro', sans-serif;
          }

          body {
            background: ${colors.bgDark};
          }

          /* =================================================
             PAGE
          ================================================== */

          .canvas-wrapper {
            position: relative;

            width: 100%;
            min-height: 100vh;

            display: flex;
            flex-direction: column;

            padding: 24px 36px;

            overflow: hidden;
          }

          /* =================================================
             BACKGROUND
          ================================================== */

          .art-layer {
            position: fixed;
            inset: 0;

            z-index: 0;

            overflow: hidden;
          }

          .art-image {
            width: 100%;
            height: 100%;

            object-fit: cover;
            object-position: center;

            filter:
              brightness(0.65)
              contrast(1.15)
              saturate(1.2);

            transform: scale(1.02);
          }

          .art-overlay-vignette {
            position: absolute;
            inset: 0;

            background:
              radial-gradient(
                circle at center,
                rgba(11, 15, 25, 0.25) 0%,
                rgba(11, 15, 25, 0.8) 70%,
                rgba(11, 15, 25, 0.95) 100%
              );
          }

          .art-blur-spheres .sphere {
            position: absolute;

            border-radius: 50%;

            filter: blur(100px);

            opacity: 0.45;

            pointer-events: none;
          }

          .sphere-1 {
            width: 380px;
            height: 380px;

            top: -120px;
            left: -100px;

            background: #4F46E5;
          }

          .sphere-2 {
            width: 420px;
            height: 420px;

            right: -100px;
            bottom: -160px;

            background: #7C3AED;
          }

          /* =================================================
             HEADER
          ================================================== */

          .canvas-header {
            position: relative;

            z-index: 10;

            display: flex;
            align-items: center;
            justify-content: space-between;

            width: 100%;
          }

          .brand-pill {
            display: flex;
            align-items: center;

            gap: 12px;

            padding: 8px 18px;

            background: rgba(255, 255, 255, 0.12);

            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);

            border-radius: 40px;

            border: 1px solid
              rgba(255, 255, 255, 0.22);

            box-shadow:
              0 8px 32px
              rgba(0, 0, 0, 0.25);
          }

          .brand-logo {
            height: 36px;
            width: auto;

            max-width: 160px;

            object-fit: contain;
          }

          .brand-divider {
            width: 1px;
            height: 18px;

            background:
              rgba(255, 255, 255, 0.3);
          }

          .brand-tag {
            color: #FFFFFF;

            font-size: 11px;

            font-weight: 800;

            letter-spacing: 1px;

            white-space: nowrap;
          }

          .header-status {
            display: flex;
            align-items: center;

            gap: 8px;

            padding: 6px 14px;

            background:
              rgba(15, 23, 42, 0.65);

            backdrop-filter: blur(12px);

            border-radius: 20px;

            border: 1px solid
              rgba(255, 255, 255, 0.12);

            color:
              rgba(255, 255, 255, 0.85);

            font-size: 11px;

            white-space: nowrap;
          }

          .status-dot {
            width: 7px;
            height: 7px;

            flex-shrink: 0;

            border-radius: 50%;

            background: #22C55E;

            box-shadow:
              0 0 10px #22C55E;
          }

          /* =================================================
             MAIN CONTENT
          ================================================== */

          .canvas-content {
            position: relative;

            z-index: 5;

            flex: 1;

            min-height: 0;

            display: flex;

            align-items: center;

            justify-content: center;

            margin: 20px 0;
          }

          /* =================================================
             CARD
          ================================================== */

          .glass-card {
            width: min(100%, 430px);

            background: ${colors.cardBg};

            backdrop-filter:
              blur(28px)
              saturate(190%);

            -webkit-backdrop-filter:
              blur(28px)
              saturate(190%);

            border-radius: 28px;

            padding: 38px 34px 28px;

            border: 1px solid
              rgba(255, 255, 255, 0.8);

            box-shadow:
              0 25px 60px
              rgba(0, 0, 0, 0.35),

              0 0 40px
              rgba(99, 102, 241, 0.15),

              inset 0 1px 0
              rgba(255, 255, 255, 1);
          }

          /* =================================================
             CARD HEADER
          ================================================== */

          .card-header {
            margin-bottom: 24px;
          }

          .role-tag {
            display: inline-flex;

            align-items: center;

            gap: 6px;

            max-width: 100%;

            color: ${colors.primary};

            font-size: 10px;

            font-weight: 800;

            letter-spacing: 0.8px;

            background: #EEF2FF;

            padding: 4px 10px;

            border-radius: 20px;

            margin-bottom: 8px;

            border: 1px solid #C7D2FE;
          }

          .role-tag span {
            white-space: nowrap;
          }

          .card-title {
            font-size: 28px;

            font-weight: 800;

            color: ${colors.textMain};

            letter-spacing: -0.5px;

            line-height: 1.2;

            margin: 0;
          }

          .card-subtitle {
            font-size: 13px;

            color: ${colors.textMuted};

            margin-top: 7px;

            margin-bottom: 0;

            line-height: 1.5;
          }

          /* =================================================
             INPUT
          ================================================== */

          .neo-input {
            width: 100%;

            border-radius: 12px !important;

            background: #F8FAFC !important;

            border: 1px solid
              #E2E8F0 !important;

            transition: all 0.25s ease !important;
          }

          .neo-input:hover {
            border-color:
              #A5B4FC !important;

            background:
              #FFFFFF !important;
          }

          .neo-input:focus,
          .ant-input-affix-wrapper-focused {
            border-color:
              ${colors.primary} !important;

            background:
              #FFFFFF !important;

            box-shadow:
              0 0 0 4px
              rgba(99, 102, 241, 0.15) !important;
          }

          .input-icon {
            color: #94A3B8;

            font-size: 16px;

            margin-right: 8px;
          }

          /* =================================================
             OPTIONS
          ================================================== */

          .card-options {
            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;

            margin-bottom: 10px;
          }

          .neo-checkbox {
            font-size: 12px;

            color: ${colors.textMuted};
          }

          .neo-forgot {
            border: none;

            padding: 0;

            margin: 0;

            background: transparent;

            cursor: pointer;

            font-family: inherit;

            font-size: 12px;

            font-weight: 700;

            color: ${colors.primary};

            white-space: nowrap;
          }

          .neo-forgot:hover {
            text-decoration: underline;
          }

          /* =================================================
             BUTTON
          ================================================== */

          .neo-submit-btn {
            height: 52px !important;

            border-radius: 14px !important;

            background:
              ${colors.primaryGradient} !important;

            border: none !important;

            font-size: 13px !important;

            font-weight: 800 !important;

            letter-spacing: 0.8px;

            box-shadow:
              0 10px 25px
              rgba(79, 70, 229, 0.35) !important;

            transition:
              all 0.3s
              cubic-bezier(
                0.34,
                1.56,
                0.64,
                1
              ) !important;
          }

          .neo-submit-btn:hover {
            transform: translateY(-2px);

            box-shadow:
              0 14px 30px
              rgba(79, 70, 229, 0.45) !important;
          }

          /* =================================================
             FEATURES
          ================================================== */

          .card-footer-info {
            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 8px;

            margin-top: 22px;

            padding-top: 18px;

            border-top:
              1px dashed
              rgba(203, 213, 225, 0.8);
          }

          .info-chip {
            display: flex;

            align-items: center;

            justify-content: center;

            gap: 5px;

            min-width: 0;

            font-size: 11px;

            font-weight: 600;

            color: ${colors.textMuted};

            white-space: nowrap;
          }

          .security-icon {
            color: #22C55E;
          }

          .heart-icon {
            color: #EC4899;
          }

          /* =================================================
             FOOTER
          ================================================== */

          .canvas-footer {
            position: relative;

            z-index: 10;

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 20px;

            color:
              rgba(255, 255, 255, 0.6);

            font-size: 11px;

            font-weight: 500;
          }

          /* =================================================
             LOADING
          ================================================== */

          .neo-loading-overlay {
            position: fixed;

            inset: 0;

            z-index: 9999;

            background:
              rgba(11, 15, 25, 0.82);

            backdrop-filter:
              blur(12px);

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 20px;
          }

          .neo-loading-card {
            width: min(100%, 360px);

            background: #FFFFFF;

            padding: 38px 30px;

            border-radius: 24px;

            text-align: center;

            box-shadow:
              0 25px 50px
              rgba(0, 0, 0, 0.3);
          }

          .loading-title {
            font-size: 15px;

            font-weight: 800;

            color: ${colors.textMain};

            margin-top: 16px;

            letter-spacing: 0.5px;
          }

          .loading-desc {
            font-size: 12px;

            color: ${colors.textMuted};

            margin-top: 4px;
          }

          /* =================================================
             TABLET
          ================================================== */

          @media (max-width: 768px) {

            .canvas-wrapper {
              padding: 18px 20px;
            }

            .canvas-content {
              margin: 14px 0;
            }

            .glass-card {
              max-width: 420px;

              padding:
                32px 28px 24px;
            }

            .card-title {
              font-size: 25px;
            }

            .header-status {
              font-size: 10px;
            }

            .canvas-footer {
              font-size: 10px;
            }
          }

          /* =================================================
             MOBILE
          ================================================== */

          @media (max-width: 576px) {

            html,
            body,
            #root {
              min-height: 100%;
              height: auto;
              overflow-x: hidden;
            }

            .canvas-wrapper {

              width: 100%;

              min-height: 100svh;

              height: auto;

              padding:
                12px 12px 14px;

              overflow-y: auto;

              overflow-x: hidden;
            }

            /* HEADER */

            .canvas-header {
              justify-content: center;
            }

            .brand-pill {

              padding:
                7px 14px;

              gap: 9px;

              border-radius: 30px;
            }

            .brand-logo {

              height: 32px;

              max-width: 145px;
            }

            .brand-tag,
            .brand-divider,
            .header-status {
              display: none;
            }

            /* MAIN */

            .canvas-content {

              flex: 1;

              width: 100%;

              margin:
                12px 0;

              align-items: center;
            }

            /* CARD */

            .glass-card {

              width: 100%;

              max-width: 430px;

              padding:
                26px 20px 20px;

              border-radius: 22px;

              box-shadow:
                0 18px 45px
                rgba(0, 0, 0, 0.32),

                0 0 30px
                rgba(99, 102, 241, 0.12);
            }

            /* HEADER */

            .card-header {

              margin-bottom: 20px;

              text-align: center;
            }

            .role-tag {

              font-size: 9px;

              padding:
                4px 9px;

              margin-bottom: 9px;
            }

            .card-title {

              font-size: 23px;

              line-height: 1.25;

              letter-spacing: -0.3px;
            }

            .card-subtitle {

              font-size: 12px;

              line-height: 1.55;

              margin-top: 7px;
            }

            /* INPUT */

            .neo-input {

              min-height: 48px;

              border-radius: 11px !important;
            }

            /* OPTIONS */

            .card-options {

              gap: 8px;

              flex-wrap: wrap;

              margin-top: -2px;
            }

            .neo-checkbox {

              font-size: 11px;
            }

            .neo-forgot {

              font-size: 11px;
            }

            /* BUTTON */

            .neo-submit-btn {

              height: 50px !important;

              border-radius: 12px !important;

              font-size: 12px !important;
            }

            /* FEATURES */

            .card-footer-info {

              margin-top: 18px;

              padding-top: 15px;

              gap: 4px;
            }

            .info-chip {

              font-size: 9px;

              gap: 3px;
            }

            /* FOOTER */

            .canvas-footer {

              justify-content: center;

              text-align: center;

              font-size: 9px;

              line-height: 1.4;
            }

            .canvas-footer span:last-child {

              display: none;
            }
          }

          /* =================================================
             SMALL PHONE
          ================================================== */

          @media (max-width: 380px) {

            .canvas-wrapper {

              padding:
                10px 9px 12px;
            }

            .brand-logo {

              height: 29px;
            }

            .glass-card {

              padding:
                23px 17px 18px;

              border-radius: 20px;
            }

            .card-title {

              font-size: 21px;
            }

            .card-subtitle {

              font-size: 11px;
            }

            .neo-input {

              min-height: 46px;
            }

            .neo-submit-btn {

              height: 48px !important;

              font-size: 11px !important;
            }

            .info-chip {

              font-size: 8.5px;
            }

            .card-footer-info {

              gap: 2px;
            }
          }

          /* =================================================
             VERY SHORT SCREEN
          ================================================== */

          @media (max-height: 700px) and (max-width: 576px) {

            .canvas-wrapper {

              padding-top: 8px;

              padding-bottom: 8px;
            }

            .canvas-content {

              margin:
                6px 0;
            }

            .glass-card {

              padding:
                20px 18px 16px;
            }

            .card-header {

              margin-bottom: 15px;
            }

            .card-title {

              font-size: 21px;
            }

            .card-subtitle {

              margin-top: 4px;
            }

            .neo-submit-btn {

              height: 46px !important;
            }

            .card-footer-info {

              margin-top: 13px;

              padding-top: 12px;
            }
          }

          /* =================================================
             REDUCE MOTION
          ================================================== */

          @media (prefers-reduced-motion: reduce) {

            .neo-submit-btn {

              transition: none !important;
            }
          }

        `,
        }}
      />
    </ConfigProvider>
  );
}
