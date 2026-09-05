import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button, Card, Modal, Space, Spin, Tag, Typography } from "antd";

import {
  CameraOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  ScanOutlined,
  WarningFilled,
  ClockCircleOutlined,
} from "@ant-design/icons";

import { Scanner } from "@yudiel/react-qr-scanner";

import { scanQRCode } from "../../api/attendanceApi";

const { Text, Title } = Typography;

/**
 * =========================================================
 * COLORS
 * =========================================================
 */

const COLORS = {
  primary: "#6366F1",

  accentPink: "#F472B6",

  accentYellow: "#FBBF24",

  success: "#059669",
  successBg: "#ECFDF5",
  successBorder: "#A7F3D0",

  warning: "#D97706",
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",

  danger: "#E11D48",
  dangerBg: "#FFF1F2",
  dangerBorder: "#FECDD3",
};

/**
 * =========================================================
 * DISPLAY TIME
 * =========================================================
 */

const DISPLAY_TIME = {
  success: 1500,
  warning: 1800,
  error: 2200,
};

/**
 * =========================================================
 * DUPLICATE SCAN
 * =========================================================
 */

const DUPLICATE_SCAN_TIME = 2500;

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const QRCodeScanner = ({
  open,
  onClose,
  classId,
  onSuccess,
  onFinishAttendance,
}) => {
  /**
   * =======================================================
   * STATE
   * =======================================================
   */

  const [processing, setProcessing] = useState(false);

  const [scanMessage, setScanMessage] = useState(null);

  /**
   * =======================================================
   * REFS
   * =======================================================
   */

  const processingRef = useRef(false);

  const lastScanRef = useRef({
    token: null,
    time: 0,
  });

  const messageTimeoutRef = useRef(null);

  const mountedRef = useRef(false);

  /**
   * =======================================================
   * CLEAR MESSAGE TIMEOUT
   * =======================================================
   */

  const clearMessageTimeout = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);

      messageTimeoutRef.current = null;
    }
  }, []);

  /**
   * =======================================================
   * RESET SCANNER
   * =======================================================
   */

  const resetScanner = useCallback(() => {
    clearMessageTimeout();

    processingRef.current = false;

    setProcessing(false);

    setScanMessage(null);

    lastScanRef.current = {
      token: null,
      time: 0,
    };
  }, [clearMessageTimeout]);

  /**
   * =======================================================
   * MOUNT
   * =======================================================
   */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      clearMessageTimeout();

      processingRef.current = false;
    };
  }, [clearMessageTimeout]);

  /**
   * =======================================================
   * RESET WHEN CLOSED
   * =======================================================
   */

  useEffect(() => {
    if (!open) {
      resetScanner();
    }
  }, [open, resetScanner]);

  /**
   * =======================================================
   * VIBRATE
   * =======================================================
   */

  const vibrate = (pattern) => {
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function"
      ) {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.warn("VIBRATE ERROR:", error);
    }
  };

  /**
   * =======================================================
   * SHOW MESSAGE
   * =======================================================
   */

  const showMessage = (data, duration) => {
    if (!mountedRef.current) {
      return;
    }

    clearMessageTimeout();

    setScanMessage(data);

    messageTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }

      setScanMessage(null);

      processingRef.current = false;

      setProcessing(false);

      messageTimeoutRef.current = null;
    }, duration);
  };

  /**
   * =======================================================
   * HANDLE SCAN
   * =======================================================
   */

  const handleScan = async (detectedCodes) => {
    /**
     * Scanner không mở
     */

    if (!open) {
      return;
    }

    /**
     * Đang xử lý request
     */

    if (processingRef.current) {
      return;
    }

    /**
     * Không có QR
     */

    if (!Array.isArray(detectedCodes) || detectedCodes.length === 0) {
      return;
    }

    const rawValue = detectedCodes[0]?.rawValue;

    if (!rawValue || typeof rawValue !== "string") {
      return;
    }

    const qrToken = rawValue.trim();

    if (!qrToken) {
      return;
    }

    /**
     * Chưa chọn lớp
     */

    if (!classId) {
      processingRef.current = true;

      showMessage(
        {
          type: "error",

          title: "Chưa chọn lớp nha!",

          message: "Vui lòng chọn lớp trước khi quét mã QR nhé.",
        },

        DISPLAY_TIME.error,
      );

      vibrate([150, 100, 150]);

      return;
    }

    /**
     * Chống scanner đọc cùng QR liên tục
     */

    const now = Date.now();

    const isDuplicate =
      lastScanRef.current.token === qrToken &&
      now - lastScanRef.current.time < DUPLICATE_SCAN_TIME;

    if (isDuplicate) {
      return;
    }

    lastScanRef.current = {
      token: qrToken,
      time: now,
    };

    /**
     * Bắt đầu xử lý
     */

    processingRef.current = true;

    setProcessing(true);

    clearMessageTimeout();

    setScanMessage(null);

    try {
      /**
       * GỌI API
       */

      const response = await scanQRCode({
        qr_token: qrToken,

        class_id: Number(classId),
      });

      const data = response?.data || response;

      /**
       * Cập nhật AttendancePage
       */

      if (typeof onSuccess === "function") {
        try {
          await onSuccess(data);
        } catch (callbackError) {
          console.error("QR onSuccess ERROR:", callbackError);
        }
      }

      /**
       * Hiển thị thành công
       */

      showMessage(
        {
          type: "success",

          title: "Điểm danh siêu đỉnh! 🎉",

          message: data?.message || "Học sinh đã điểm danh thành công.",

          student: data?.student || null,

          class: data?.class || null,

          attendance: data?.attendance || null,
        },

        DISPLAY_TIME.success,
      );

      vibrate(120);
    } catch (error) {
      console.error("QR SCAN ERROR:", error);

      const status = error?.response?.status;

      const data = error?.response?.data || {};

      /**
       * ===================================================
       * ĐÃ ĐIỂM DANH
       * ===================================================
       */

      if (status === 409 || data?.code === "ALREADY_ATTENDED") {
        showMessage(
          {
            type: "warning",

            title: "Ái chà, điểm danh rồi! ⏰",

            message: data?.message || "Học sinh này đã điểm danh hôm nay rồi.",

            student: data?.student || null,

            class: data?.class || null,

            attendance: data?.attendance || null,
          },

          DISPLAY_TIME.warning,
        );

        vibrate([100, 80, 100]);

        return;
      }

      /**
       * ===================================================
       * SAI LỚP
       * ===================================================
       */

      if (
        data?.code === "STUDENT_NOT_IN_CLASS" ||
        data?.message === "Học sinh này không thuộc lớp đang điểm danh"
      ) {
        showMessage(
          {
            type: "class_error",

            title: "Nhầm lớp mất rồi! 🎒",

            message: data?.message || "Học sinh này không thuộc lớp đang chọn.",

            student: data?.student || null,

            class: data?.class || null,
          },

          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);

        return;
      }

      /**
       * ===================================================
       * QR KHÔNG HỢP LỆ
       * ===================================================
       */

      if (data?.code === "INVALID_QR" || data?.code === "INVALID_QR_TOKEN") {
        showMessage(
          {
            type: "error",

            title: "Mã QR lạ quá! ❓",

            message: data?.message || "Mã QR không hợp lệ hoặc đã cũ.",
          },

          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);

        return;
      }

      /**
       * ===================================================
       * KHÔNG TÌM THẤY HỌC SINH
       * ===================================================
       */

      if (status === 404 || data?.code === "STUDENT_NOT_FOUND") {
        showMessage(
          {
            type: "error",

            title: "Không tìm thấy bé! 🔍",

            message: data?.message || "Không tìm thấy học sinh từ mã QR này.",

            student: data?.student || null,
          },

          DISPLAY_TIME.error,
        );

        vibrate([150, 100, 150]);

        return;
      }

      /**
       * ===================================================
       * LỖI KHÁC
       * ===================================================
       */

      showMessage(
        {
          type: "error",

          title: "Có chút trục trặc! 🥺",

          message:
            data?.message || error?.message || "Không thể điểm danh lúc này.",

          student: data?.student || null,

          class: data?.class || null,
        },

        DISPLAY_TIME.error,
      );

      vibrate([150, 100, 150]);
    }
  };

  /**
   * =======================================================
   * FINISH ATTENDANCE
   * =======================================================
   */

  const handleFinishAttendance = async () => {
    if (typeof onFinishAttendance === "function") {
      try {
        await onFinishAttendance();
      } catch (error) {
        console.error("FINISH ATTENDANCE ERROR:", error);
      }

      return;
    }

    resetScanner();

    onClose?.();
  };

  /**
   * =======================================================
   * MESSAGE CONFIG
   * =======================================================
   */

  const getMessageConfig = () => {
    if (!scanMessage) {
      return null;
    }

    switch (scanMessage.type) {
      case "success":
        return {
          color: COLORS.success,
          background: COLORS.successBg,
          border: COLORS.successBorder,
          icon: <CheckCircleFilled />,
        };

      case "warning":
        return {
          color: COLORS.warning,
          background: COLORS.warningBg,
          border: COLORS.warningBorder,
          icon: <WarningFilled />,
        };

      default:
        return {
          color: COLORS.danger,
          background: COLORS.dangerBg,
          border: COLORS.dangerBorder,
          icon: <CloseCircleFilled />,
        };
    }
  };

  /**
   * =======================================================
   * RESULT OVERLAY
   * =======================================================
   */

  const renderResultOverlay = () => {
    if (!scanMessage) {
      return null;
    }

    const config = getMessageConfig();

    const {
      title,
      message,
      student,
      class: classData,
      attendance,
    } = scanMessage;

    return (
      <div className="qr-result-overlay">
        <Card
          bordered={false}
          styles={{
            body: {
              padding: 0,
            },
          }}
          className="qr-result-card"
          style={{
            background: config.background,

            border: `2px solid ${config.border}`,

            boxShadow: "0 12px 30px rgba(99, 102, 241, 0.18)",
          }}
        >
          <div className="qr-result-inner">
            <div
              className="qr-result-icon"
              style={{
                color: config.color,
              }}
            >
              {config.icon}
            </div>

            <div className="qr-result-content">
              <Text
                strong
                className="qr-result-title"
                style={{
                  color: config.color,
                }}
              >
                {title}
              </Text>

              {student?.name && (
                <Text strong className="qr-student-name">
                  ✨ {student.name}
                </Text>
              )}

              {student?.code && (
                <Text type="secondary" className="qr-student-code">
                  Mã học sinh: {student.code}
                </Text>
              )}

              {classData?.name && (
                <Text type="secondary" className="qr-class-name">
                  Lớp: {classData.name}
                </Text>
              )}

              {attendance?.check_in_time && (
                <Tag
                  color={scanMessage.type === "success" ? "success" : "warning"}
                  icon={<ClockCircleOutlined />}
                  className="qr-time-tag"
                >
                  {scanMessage.type === "warning"
                    ? "Đã vào lúc "
                    : "Điểm danh lúc "}

                  {String(attendance.check_in_time).slice(0, 5)}
                </Tag>
              )}

              {message && (
                <Text type="secondary" className="qr-result-message">
                  {message}
                </Text>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  /**
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <>
      <style>
        {`
          @keyframes chibiBounceIn {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(20px);
            }

            70% {
              transform: scale(1.03) translateY(-4px);
            }

            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes chibiPulse {
            0% {
              transform: scale(1);
            }

            50% {
              transform: scale(1.05);
            }

            100% {
              transform: scale(1);
            }
          }

          .chibi-modal .ant-modal-content {
            border-radius: 32px !important;
            overflow: hidden;
            background: #FFFDF9 !important;
            box-shadow:
              0 25px 50px rgba(99, 102, 241, 0.2) !important;
            border: 3px solid #E0E7FF;
          }

          .chibi-modal .ant-modal-header {
            background: transparent !important;
            padding: 24px 28px 12px 28px !important;
            border-bottom: none !important;
          }

          .chibi-modal .ant-modal-body {
            padding: 12px 28px 28px 28px !important;
          }

          /* =================================================
             QR CAMERA
             ================================================= */

          .qr-camera-wrapper {
            position: relative;
            width: 100%;
            height: 440px;
            overflow: hidden;
            border-radius: 28px;
            background: #1E293B;
            border: 3px solid #E2E8F0;
          }

          .qr-camera-wrapper video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }

          /* =================================================
             QR FRAME
             ================================================= */

          .qr-frame-container {
            position: absolute;
            inset: 0;
            pointer-events: none;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .qr-frame {
            width: 260px;
            height: 260px;
            border: 4px dashed ${COLORS.accentYellow};
            border-radius: 32px;
            box-shadow:
              0 0 0 9999px rgba(30, 41, 59, 0.45);
            animation:
              chibiPulse 3s infinite ease-in-out;
          }

          /* =================================================
             PROCESSING
             ================================================= */

          .qr-processing-overlay {
            position: absolute;
            inset: 0;
            z-index: 20;
            background: rgba(255, 253, 249, 0.88);
            backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .qr-processing-card {
            border-radius: 24px !important;
            text-align: center;
            min-width: 180px;
            box-shadow:
              0 12px 30px rgba(0, 0, 0, 0.1);
            border: 2px solid #E0E7FF !important;
          }

          /* =================================================
             RESULT
             ================================================= */

          .qr-result-overlay {
            position: absolute;
            left: 20px;
            right: 20px;
            bottom: 20px;
            z-index: 30;
            animation:
              chibiBounceIn
              0.35s
              cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          .qr-result-card {
            border-radius: 26px !important;
            overflow: hidden;
          }

          .qr-result-inner {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 22px;
          }

          .qr-result-icon {
            flex: 0 0 auto;
            font-size: 38px;
            line-height: 1;
            margin-top: 2px;
          }

          .qr-result-content {
            flex: 1;
            min-width: 0;
          }

          .qr-result-title {
            display: block;
            font-size: 18px;
            line-height: 1.3;
            font-family:
              Nunito,
              Quicksand,
              sans-serif;
          }

          .qr-student-name {
            display: block;
            margin-top: 6px;
            font-size: 20px;
            line-height: 1.3;
            color: #1E293B;
          }

          .qr-student-code,
          .qr-class-name {
            display: block;
            margin-top: 3px;
            font-size: 14px;
          }

          .qr-time-tag {
            margin-top: 10px !important;
            border-radius: 14px !important;
            padding: 4px 12px !important;
            font-weight: 600 !important;
            font-size: 13px !important;
          }

          .qr-result-message {
            display: block;
            margin-top: 8px;
            font-size: 13px;
            line-height: 1.5;
          }

          /* =================================================
             GUIDE
             ================================================= */

          .qr-guide {
            text-align: center;
            margin-top: 18px;
          }

          .qr-guide-title {
            margin-bottom: 4px !important;
            color: #475569 !important;
            font-size: 16px !important;
          }

          .qr-guide-description {
            font-size: 14px;
          }

          /* =================================================
             STATUS
             ================================================= */

          .qr-status {
            margin-top: 16px;
            padding: 12px 16px;
            border-radius: 18px;
            background: #F1F5F9;
            border: 1px solid #E2E8F0;
            text-align: center;
          }

          .qr-status-dot {
            width: 11px;
            height: 11px;
            border-radius: 50%;
            display: inline-block;
          }

          .qr-status-text {
            font-size: 14px;
            font-weight: 500;
          }

          /* =================================================
             FINISH BUTTON
             ================================================= */

          .qr-finish-button {
            height: 52px !important;
            border-radius: 18px !important;
            margin-top: 16px;
            background: #EEF2FF !important;
            border-color: #C7D2FE !important;
            color: ${COLORS.primary} !important;
            font-weight: 700 !important;
            font-size: 15px !important;
            box-shadow:
              0 4px 14px rgba(99, 102, 241, 0.12);
          }

          /* =================================================
             TABLET
             ================================================= */

          @media (max-width: 768px) {
            .chibi-modal {
              max-width: calc(100vw - 24px) !important;
              margin: 12px auto !important;
            }

            .chibi-modal .ant-modal-content {
              border-radius: 26px !important;
            }

            .chibi-modal .ant-modal-header {
              padding:
                18px
                20px
                10px
                20px !important;
            }

            .chibi-modal .ant-modal-body {
              padding:
                10px
                20px
                20px
                20px !important;
            }

            .qr-camera-wrapper {
              height: min(
                58vh,
                440px
              );
              min-height: 330px;
              border-radius: 24px;
            }

            .qr-frame {
              width: min(
                58vw,
                240px
              );

              height: min(
                58vw,
                240px
              );

              border-radius: 28px;
            }

            .qr-result-overlay {
              left: 12px;
              right: 12px;
              bottom: 12px;
            }

            .qr-result-inner {
              padding: 18px;
              gap: 12px;
            }

            .qr-result-icon {
              font-size: 32px;
            }

            .qr-student-name {
              font-size: 18px;
            }
          }

          /* =================================================
             MOBILE
             ================================================= */

          @media (max-width: 576px) {
            .chibi-modal {
              width: calc(100vw - 16px) !important;
              max-width: calc(100vw - 16px) !important;
              margin: 8px auto !important;
            }

            .chibi-modal .ant-modal-content {
              border-radius: 22px !important;
              border-width: 2px !important;
            }

            .chibi-modal .ant-modal-header {
              padding:
                14px
                14px
                8px
                14px !important;
            }

            .chibi-modal .ant-modal-body {
              padding:
                8px
                14px
                14px
                14px !important;
            }

            /* HEADER */

            .chibi-modal .ant-modal-title {
              font-size: 17px !important;
            }

            .chibi-modal .ant-modal-title > span {
              gap: 8px !important;
            }

            .chibi-modal .ant-modal-title > span > div {
              width: 36px !important;
              height: 36px !important;
              font-size: 17px !important;
            }

            .chibi-modal .ant-modal-title > span > span {
              font-size: 17px !important;
            }

            /* CAMERA */

            .qr-camera-wrapper {
              height: min(
                68vh,
                430px
              );

              min-height: 300px;

              border-radius: 20px;

              border-width: 2px;
            }

            .qr-frame {
              width: min(
                68vw,
                240px
              );

              height: min(
                68vw,
                240px
              );

              border-width: 3px;

              border-radius: 24px;
            }

            /* PROCESSING */

            .qr-processing-card {
              min-width: 150px !important;
              border-radius: 20px !important;
            }

            .qr-processing-card .ant-card-body {
              padding: 18px !important;
            }

            /* RESULT */

            .qr-result-overlay {
              left: 8px;
              right: 8px;
              bottom: 8px;
            }

            .qr-result-card {
              border-radius: 20px !important;
            }

            .qr-result-inner {
              padding: 13px;
              gap: 10px;
            }

            .qr-result-icon {
              font-size: 28px;
            }

            .qr-result-title {
              font-size: 15px;
            }

            .qr-student-name {
              font-size: 17px;
              margin-top: 4px;
            }

            .qr-student-code,
            .qr-class-name {
              font-size: 12px;
            }

            .qr-time-tag {
              margin-top: 7px !important;
              padding:
                3px
                8px !important;
              font-size: 11px !important;
            }

            .qr-result-message {
              margin-top: 5px;
              font-size: 11px;
            }

            /* GUIDE */

            .qr-guide {
              margin-top: 12px;
            }

            .qr-guide-title {
              font-size: 14px !important;
            }

            .qr-guide-description {
              font-size: 12px;
              line-height: 1.5;
            }

            /* STATUS */

            .qr-status {
              margin-top: 12px;
              padding:
                9px
                10px;
              border-radius: 14px;
            }

            .qr-status-text {
              font-size: 12px;
            }

            .qr-status-dot {
              width: 9px;
              height: 9px;
            }

            /* BUTTON */

            .qr-finish-button {
              height: 46px !important;
              margin-top: 12px;
              border-radius: 15px !important;
              font-size: 13px !important;
            }
          }

          /* =================================================
             SMALL PHONE
             ================================================= */

          @media (max-width: 380px) {
            .chibi-modal {
              width: calc(100vw - 10px) !important;
              max-width: calc(100vw - 10px) !important;
              margin: 5px auto !important;
            }

            .chibi-modal .ant-modal-header {
              padding:
                10px
                10px
                5px
                10px !important;
            }

            .chibi-modal .ant-modal-body {
              padding:
                5px
                10px
                10px
                10px !important;
            }

            .chibi-modal .ant-modal-title > span > div {
              width: 32px !important;
              height: 32px !important;
              font-size: 15px !important;
            }

            .chibi-modal .ant-modal-title > span > span {
              font-size: 15px !important;
            }

            .qr-camera-wrapper {
              height: 55vh;
              min-height: 270px;
              border-radius: 18px;
            }

            .qr-frame {
              width: 62vw;
              height: 62vw;
              border-radius: 20px;
            }

            .qr-result-inner {
              padding: 10px;
              gap: 8px;
            }

            .qr-result-icon {
              font-size: 24px;
            }

            .qr-result-title {
              font-size: 13px;
            }

            .qr-student-name {
              font-size: 15px;
            }

            .qr-student-code,
            .qr-class-name {
              font-size: 11px;
            }

            .qr-time-tag {
              font-size: 10px !important;
            }

            .qr-result-message {
              font-size: 10px;
            }

            .qr-guide-title {
              font-size: 13px !important;
            }

            .qr-guide-description {
              font-size: 11px;
            }

            .qr-status-text {
              font-size: 11px;
            }

            .qr-finish-button {
              height: 42px !important;
              font-size: 12px !important;
            }
          }

          /* =================================================
             SHORT SCREEN
             ================================================= */

          @media (
            max-width: 576px
          ) and (
            max-height: 700px
          ) {
            .qr-camera-wrapper {
              height: 52vh;
              min-height: 250px;
            }

            .qr-guide {
              margin-top: 8px;
            }

            .qr-status {
              margin-top: 8px;
            }

            .qr-finish-button {
              margin-top: 8px;
            }
          }

          /* =================================================
             REDUCE MOTION
             ================================================= */

          @media (
            prefers-reduced-motion: reduce
          ) {
            .qr-frame,
            .qr-result-overlay {
              animation: none !important;
            }
          }
        `}
      </style>

      <Modal
        open={open}
        onCancel={handleFinishAttendance}
        footer={null}
        centered
        width={620}
        destroyOnClose
        maskClosable={false}
        className="chibi-modal"
        title={
          <Space size={10}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#EEF2FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.primary,
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              <CameraOutlined />
            </div>

            <span
              style={{
                fontFamily: "Nunito, Quicksand, sans-serif",

                fontSize: 20,

                fontWeight: 700,

                color: "#334155",
              }}
            >
              Quét QR Điểm Danh 🌸
            </span>
          </Space>
        }
      >
        <div className="qr-scanner-content">
          {/* =================================================
              CAMERA
              ================================================= */}

          <div className="qr-camera-wrapper">
            <Scanner
              onScan={handleScan}
              allowMultiple
              scanDelay={300}
              constraints={{
                facingMode: "environment",
              }}
              styles={{
                container: {
                  width: "100%",
                  height: "100%",
                },

                video: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              }}
            />

            {/* QR FRAME */}

            <div className="qr-frame-container">
              <div className="qr-frame" />
            </div>

            {/* =================================================
                PROCESSING
                ================================================= */}

            {processing && !scanMessage && (
              <div className="qr-processing-overlay">
                <Card bordered={false} className="qr-processing-card">
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{
                          fontSize: 36,
                          color: COLORS.primary,
                        }}
                        spin
                      />
                    }
                  />

                  <div
                    style={{
                      marginTop: 12,
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color: COLORS.primary,
                        fontSize: 15,
                      }}
                    >
                      Đang xác nhận... ✨
                    </Text>
                  </div>
                </Card>
              </div>
            )}

            {/* RESULT */}

            {renderResultOverlay()}
          </div>

          {/* =================================================
              GUIDE
              ================================================= */}

          {!scanMessage && (
            <div className="qr-guide">
              <Title level={5} className="qr-guide-title">
                <ScanOutlined
                  style={{
                    color: COLORS.primary,
                  }}
                />{" "}
                Đưa mã QR vào khung hình nha!
              </Title>

              <Text type="secondary" className="qr-guide-description">
                Hệ thống sẽ tự động ghi nhận và chuyển tiếp học sinh tiếp theo.
              </Text>
            </div>
          )}

          {/* =================================================
              STATUS
              ================================================= */}

          <div className="qr-status">
            <Space size={10}>
              <span
                className="qr-status-dot"
                style={{
                  background: processing
                    ? COLORS.warning
                    : scanMessage?.type === "error" ||
                        scanMessage?.type === "class_error"
                      ? COLORS.danger
                      : COLORS.success,

                  boxShadow: processing
                    ? "0 0 0 4px rgba(217, 119, 6, 0.15)"
                    : "0 0 0 4px rgba(5, 150, 105, 0.15)",
                }}
              />

              <Text type="secondary" className="qr-status-text">
                {processing && !scanMessage
                  ? "Đang xử lý thông tin..."
                  : scanMessage
                    ? "Đang hiển thị kết quả..."
                    : "Sẵn sàng đón học sinh tiếp theo ✨"}
              </Text>
            </Space>
          </div>

          {/* =================================================
              FINISH BUTTON
              ================================================= */}

          <Button
            size="large"
            block
            onClick={handleFinishAttendance}
            className="qr-finish-button"
          >
            Đóng máy quét 🌻
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default QRCodeScanner;
