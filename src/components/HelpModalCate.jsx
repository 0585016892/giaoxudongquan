import React from "react";
import { Modal, Row, Col, Divider } from "antd";

import {
  HeartFilled,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  ScanOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  TrophyOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const HelpModal = ({ open, onClose }) => {
  const FeatureCard = ({ icon, title, description }) => (
    <div className="faith-feature-card">
      <div className="faith-feature-icon">{icon}</div>

      <div className="faith-feature-content">
        <div className="faith-feature-title">{title}</div>

        <div className="faith-feature-description">{description}</div>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={900}
        destroyOnClose
        className="faithedu-help-modal"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        {/* ================= HERO ================= */}
        <div className="faith-hero">
          {/* decoration */}
          <span className="faith-decor faith-decor-1">♡</span>
          <span className="faith-decor faith-decor-2">✦</span>
          <span className="faith-decor faith-decor-3">♡</span>

          <div className="faith-hero-icon">
            <HeartFilled />
          </div>

          <div className="faith-hero-content">
            <div className="faith-hero-title">Chào mừng đến với FaithEdu</div>

            <div className="faith-hero-subtitle">
              ✨ Số hóa giáo lý, kết nối đức tin ✨
            </div>

            <p>
              FaithEdu là nền tảng hỗ trợ số hóa và quản lý hoạt động giáo lý
              trong giáo xứ.
            </p>
          </div>
        </div>

        <Divider />

        {/* ================= FAITHEDU ================= */}
        <div className="faith-section">
          <div className="faith-section-title">
            <div className="faith-title-icon">
              <BookOutlined />
            </div>

            <span>FaithEdu giúp bạn làm gì?</span>
          </div>

          <p className="faith-section-description">
            FaithEdu giúp giáo lý viên giảm bớt những công việc quản lý thủ công
            và tập trung hơn vào việc đồng hành cùng các em.
          </p>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <FeatureCard
                icon={<TeamOutlined />}
                title="Quản lý lớp học"
                description="Quản lý các lớp giáo lý, thông tin lớp học và giáo lý viên phụ trách."
              />
            </Col>

            <Col xs={24} md={12}>
              <FeatureCard
                icon={<UserOutlined />}
                title="Quản lý học sinh"
                description="Theo dõi danh sách học sinh và thông tin học tập của từng em."
              />
            </Col>

            <Col xs={24} md={12}>
              <FeatureCard
                icon={<ScanOutlined />}
                title="Điểm danh bằng QR"
                description="Mỗi học sinh có một mã QR riêng giúp điểm danh nhanh chóng và chính xác."
              />
            </Col>

            <Col xs={24} md={12}>
              <FeatureCard
                icon={<PlayCircleOutlined />}
                title="Học tập tương tác"
                description="Tạo trải nghiệm học giáo lý sinh động thông qua các trò chơi tương tác."
              />
            </Col>

            <Col xs={24} md={12}>
              <FeatureCard
                icon={<BarChartOutlined />}
                title="Kết quả học tập"
                description="Theo dõi kết quả học tập và quá trình tiến bộ của học sinh."
              />
            </Col>

            <Col xs={24} md={12}>
              <FeatureCard
                icon={<TrophyOutlined />}
                title="Bảng thành tích"
                description="Ghi nhận sự cố gắng và tạo động lực học tập cho các em."
              />
            </Col>
          </Row>
        </div>

        <Divider />

        {/* ================= ĐIỂM NỔI BẬT ================= */}
        <div className="faith-section">
          <div className="faith-section-title">
            <div className="faith-title-icon pink">
              <SafetyCertificateOutlined />
            </div>

            <span>Điểm nổi bật</span>
          </div>

          <div className="faith-check-list">
            <div>
              <CheckCircleFilled />
              <span>Quản lý giáo lý tập trung trên một nền tảng.</span>
            </div>

            <div>
              <CheckCircleFilled />
              <span>Điểm danh học sinh nhanh chóng bằng mã QR.</span>
            </div>

            <div>
              <CheckCircleFilled />
              <span>Hỗ trợ nhiều hình thức học tập và trò chơi tương tác.</span>
            </div>

            <div>
              <CheckCircleFilled />
              <span>Theo dõi kết quả và thành tích học tập của học sinh.</span>
            </div>

            <div>
              <CheckCircleFilled />
              <span>Giúp giáo lý viên tiết kiệm thời gian quản lý.</span>
            </div>
          </div>
        </div>

        <Divider />

        {/* ================= GIÁO LÝ VIÊN ================= */}
        <div className="faith-role-box">
          <div className="faith-role-character">
            <div className="faith-role-icon">
              <TeamOutlined />
            </div>

            <span className="faith-role-heart">♥</span>
          </div>

          <div>
            <div className="faith-role-title">Dành cho giáo lý viên 🌸</div>

            <div className="faith-role-description">
              FaithEdu được xây dựng với mục tiêu trở thành công cụ hỗ trợ giáo
              lý viên trong công tác giảng dạy, quản lý lớp học và đồng hành
              cùng học sinh.
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="faith-footer">
          <div className="faith-footer-decoration">
            <span>♡</span>
            <span>✦</span>
            <span>♡</span>
          </div>

          <div className="faith-footer-brand">
            <div className="faith-footer-heart">
              <HeartFilled />
            </div>

            <span>FaithEdu</span>
          </div>

          <div className="faith-footer-slogan">
            Số hóa giáo lý, kết nối đức tin.
          </div>

          <div className="faith-footer-domain">https://www.giaolyso.site</div>
        </div>
      </Modal>

      {/* ================= CSS ================= */}
      <style>{`
        /* =========================================
           FAITHEDU CHIBI PASTEL
        ========================================= */

        .faithedu-help-modal .ant-modal-content {
          padding: 0 !important;
          overflow: hidden;
          border-radius: 26px !important;
          background: #fffdfd;
          box-shadow:
            0 24px 70px rgba(224, 145, 170, 0.22),
            0 8px 25px rgba(214, 164, 180, 0.12);
        }

        .faithedu-help-modal .ant-modal-close {
          top: 16px;
          right: 16px;
          z-index: 20;

          width: 34px;
          height: 34px;

          border-radius: 50%;

          background: rgba(255, 255, 255, 0.85);

          color: #d78ca5;

          transition: all 0.2s ease;
        }

        .faithedu-help-modal .ant-modal-close:hover {
          background: #fff;
          color: #c96d8d;

          transform: rotate(8deg) scale(1.05);
        }

        /* =========================================
           HERO
        ========================================= */

        .faith-hero {
          position: relative;

          display: flex;
          align-items: center;

          gap: 20px;

          padding: 32px 38px;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(255, 255, 255, 0.95) 0,
              rgba(255, 255, 255, 0) 28%
            ),
            radial-gradient(
              circle at 90% 10%,
              rgba(255, 224, 235, 0.9) 0,
              rgba(255, 224, 235, 0) 30%
            ),
            linear-gradient(
              135deg,
              #fff6f9 0%,
              #fffaf4 50%,
              #fff1f6 100%
            );

          border-bottom: 1px solid #f7dfe7;
        }

        .faith-hero::after {
          content: "";

          position: absolute;

          width: 180px;
          height: 180px;

          right: -70px;
          bottom: -100px;

          border-radius: 50%;

          background: rgba(255, 210, 225, 0.35);
        }

        .faith-hero-icon {
          position: relative;
          z-index: 2;

          width: 72px;
          height: 72px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 24px;

          background: linear-gradient(
            145deg,
            #fff,
            #ffe8f0
          );

          border: 2px solid #f5cbd8;

          color: #d87899;

          font-size: 32px;

          box-shadow:
            0 8px 18px rgba(216, 120, 153, 0.15);

          transform: rotate(-3deg);
        }

        .faith-hero-icon::before {
          content: "";

          position: absolute;

          inset: -6px;

          border-radius: 27px;

          border: 1px dashed #efb7c9;

          pointer-events: none;
        }

        .faith-hero-content {
          position: relative;
          z-index: 2;
        }

        .faith-hero-title {
          color: #74485a;

          font-size: 26px;
          font-weight: 800;

          letter-spacing: -0.4px;

          margin-bottom: 5px;
        }

        .faith-hero-subtitle {
          color: #d27d9b;

          font-size: 14px;
          font-weight: 700;

          margin-bottom: 8px;
        }

        .faith-hero-content p {
          margin: 0;

          max-width: 650px;

          color: #806d75;

          font-size: 14px;

          line-height: 1.65;
        }

        /* =========================================
           DECORATIONS
        ========================================= */

        .faith-decor {
          position: absolute;

          color: #e9a9bc;

          font-weight: 700;

          opacity: 0.75;

          pointer-events: none;
        }

        .faith-decor-1 {
          left: 26px;
          top: 14px;

          font-size: 22px;

          transform: rotate(-15deg);
        }

        .faith-decor-2 {
          right: 100px;
          top: 25px;

          color: #e7c77e;

          font-size: 16px;
        }

        .faith-decor-3 {
          right: 48px;
          bottom: 22px;

          font-size: 18px;

          transform: rotate(12deg);
        }

        /* =========================================
           DIVIDER
        ========================================= */

        .faithedu-help-modal .ant-divider {
          margin: 0;

          border-color: #f5e5ea;
        }

        /* =========================================
           SECTION
        ========================================= */

        .faith-section {
          padding: 25px 32px 27px;
        }

        .faith-section-title {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-bottom: 9px;

          color: #74485a;

          font-size: 18px;
          font-weight: 800;
        }

        .faith-title-icon {
          width: 36px;
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: #fff0f5;

          color: #d57d9c;

          border: 1px solid #f5d5df;

          font-size: 17px;

          box-shadow: 0 3px 8px rgba(220, 130, 160, 0.08);
        }

        .faith-title-icon.pink {
          background: #fff1f5;
          color: #d986a2;
        }

        .faith-section-description {
          margin: 0 0 19px;

          color: #8b777f;

          font-size: 13.5px;

          line-height: 1.65;
        }

        /* =========================================
           FEATURE CARD
        ========================================= */

        .faith-feature-card {
          position: relative;

          height: 100%;

          display: flex;
          align-items: flex-start;

          gap: 13px;

          padding: 16px;

          background: #fff;

          border: 1px solid #f3dfe6;

          border-radius: 18px;

          box-shadow:
            0 4px 12px rgba(212, 140, 165, 0.06);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .faith-feature-card::before {
          content: "";

          position: absolute;

          width: 7px;
          height: 7px;

          top: 9px;
          right: 12px;

          border-radius: 50%;

          background: #f4c5d5;

          opacity: 0.7;
        }

        .faith-feature-card:hover {
          transform: translateY(-3px);

          border-color: #efbfd0;

          box-shadow:
            0 10px 22px rgba(213, 126, 155, 0.12);
        }

        .faith-feature-icon {
          width: 44px;
          height: 44px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background: linear-gradient(
            145deg,
            #fff2f6,
            #ffe9f0
          );

          border: 1px solid #f5d3df;

          color: #d47b9a;

          font-size: 20px;

          box-shadow:
            0 4px 10px rgba(214, 125, 155, 0.08);
        }

        .faith-feature-title {
          margin-bottom: 4px;

          color: #76505f;

          font-size: 14px;
          font-weight: 800;
        }

        .faith-feature-description {
          color: #8c7980;

          font-size: 12.5px;

          line-height: 1.55;
        }

        /* =========================================
           CHECK LIST
        ========================================= */

        .faith-check-list {
          display: flex;

          flex-direction: column;

          gap: 11px;

          padding: 16px 18px;

          border-radius: 17px;

          background: #fff8fa;

          border: 1px solid #f6e1e8;
        }

        .faith-check-list > div {
          display: flex;
          align-items: center;

          gap: 10px;

          color: #806f77;

          font-size: 13.5px;
        }

        .faith-check-list .anticon {
          flex-shrink: 0;

          color: #e092ad;

          font-size: 16px;
        }

        /* =========================================
           ROLE BOX
        ========================================= */

        .faith-role-box {
          position: relative;

          display: flex;
          align-items: center;

          gap: 15px;

          margin: 25px 32px;

          padding: 18px 20px;

          border-radius: 20px;

          background:
            linear-gradient(
              135deg,
              #fff7fa,
              #fffaf5
            );

          border: 1px solid #f2d8e1;

          box-shadow:
            0 5px 15px rgba(218, 139, 164, 0.07);
        }

        .faith-role-character {
          position: relative;

          flex-shrink: 0;
        }

        .faith-role-icon {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          background: #ffe8f0;

          border: 1px solid #f2c6d5;

          color: #d27c9a;

          font-size: 21px;

          transform: rotate(-2deg);
        }

        .faith-role-heart {
          position: absolute;

          right: -7px;
          bottom: -5px;

          color: #e69ab4;

          font-size: 12px;
        }

        .faith-role-title {
          color: #744b5b;

          font-size: 14px;
          font-weight: 800;

          margin-bottom: 4px;
        }

        .faith-role-description {
          color: #8b777f;

          font-size: 13px;

          line-height: 1.6;
        }

        /* =========================================
           FOOTER
        ========================================= */

        .faith-footer {
          position: relative;

          overflow: hidden;

          padding: 24px 20px 22px;

          text-align: center;

          background:
            radial-gradient(
              circle at 15% 80%,
              rgba(255, 255, 255, 0.5),
              transparent 24%
            ),
            linear-gradient(
              135deg,
              #fff0f5,
              #ffe7ef
            );

          border-top: 1px solid #f4d8e1;
        }

        .faith-footer-decoration {
          position: absolute;

          inset: 0;

          pointer-events: none;
        }

        .faith-footer-decoration span {
          position: absolute;

          color: rgba(210, 125, 154, 0.35);

          font-size: 18px;
        }

        .faith-footer-decoration span:nth-child(1) {
          left: 15%;
          top: 17px;
        }

        .faith-footer-decoration span:nth-child(2) {
          right: 17%;
          top: 13px;

          color: rgba(211, 174, 92, 0.45);

          font-size: 13px;
        }

        .faith-footer-decoration span:nth-child(3) {
          right: 12%;
          bottom: 14px;

          font-size: 14px;
        }

        .faith-footer-brand {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          color: #74485a;

          font-size: 22px;
          font-weight: 900;
        }

        .faith-footer-heart {
          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #fff;

          color: #d77d9b;

          font-size: 15px;

          box-shadow:
            0 3px 8px rgba(214, 125, 155, 0.13);
        }

        .faith-footer-slogan {
          position: relative;
          z-index: 2;

          margin-top: 5px;

          color: #c47794;

          font-size: 13px;
          font-weight: 700;
        }

        .faith-footer-domain {
          position: relative;
          z-index: 2;

          margin-top: 5px;

          color: #b69aa4;

          font-size: 11.5px;
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 576px) {
          .faithedu-help-modal .ant-modal-content {
            border-radius: 20px !important;
          }

          .faith-hero {
            flex-direction: column;

            text-align: center;

            padding: 30px 22px 25px;
          }

          .faith-hero-icon {
            width: 62px;
            height: 62px;

            font-size: 27px;
          }

          .faith-hero-title {
            font-size: 21px;
          }

          .faith-hero-subtitle {
            font-size: 12.5px;
          }

          .faith-section {
            padding: 22px 20px;
          }

          .faith-role-box {
            margin: 20px;
          }

          .faith-feature-card {
            padding: 14px;
          }
        }
      `}</style>
    </>
  );
};

export default HelpModal;
