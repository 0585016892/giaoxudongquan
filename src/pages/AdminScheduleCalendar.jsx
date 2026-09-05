import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Drawer,
  Button,
  Tag,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tooltip,
  Space,
  Card,
  Typography,
  Divider,
  ConfigProvider,
  DatePicker,
  TimePicker,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  StarFilled,
  StarOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  UserOutlined,
  EditOutlined,
  HomeOutlined,
  CompassOutlined,
  BookOutlined,
} from "@ant-design/icons";
import viVN from "antd/lib/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useSchedule } from "../hooks/useSchedule";
import { useChurch } from "../hooks/useChurch";

dayjs.locale("vi");
const { Title, Text, Paragraph } = Typography;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

// Cấu hình loại lễ với màu sắc đồng bộ
const TYPE_CONFIG = {
  CN: {
    color: "#dc2626",
    label: "Chúa Nhật",
    bg: "#fef2f2",
    border: "#fca5a5",
  },
  THUONG: {
    color: "#1B365D",
    label: "Thường nhật",
    bg: "#f0f4f9",
    border: "#93c5fd",
  },
  CUOI: {
    color: "#2e7d32",
    label: "Hôn phối",
    bg: "#f0fdf4",
    border: "#86efac",
  },
  AN_TANG: {
    color: "#475569",
    label: "An táng",
    bg: "#f8fafc",
    border: "#cbd5e1",
  },
};

const AdminScheduleCalendar = () => {
  const { fetchChurches } = useChurch();
  const { fetchWeek, add, update, remove, togglePriority } = useSchedule();

  const [currentChurchId, setCurrentChurchId] = useState(null);
  const [churches, setChurches] = useState([]);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  // Load danh sách giáo xứ (Chỉ chạy 1 lần)
  useEffect(() => {
    let mounted = true;

    const initChurches = async () => {
      try {
        const res = await fetchChurches();

        console.log("🔥 API CHURCH:", res);

        const data = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        const normalizedChurches = data.map((church) => ({
          ...church,
          id: Number(church.id),
        }));

        if (!mounted) return;

        setChurches(normalizedChurches);

        if (normalizedChurches.length > 0) {
          setCurrentChurchId(normalizedChurches[0].id);
        }
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách giáo xứ:", err);
        message.error("Không lấy được danh sách giáo xứ");
      }
    };

    initChurches();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Hàm load lịch
  const loadWeek = useCallback(async () => {
    if (!currentChurchId) return;

    try {
      const res = await fetchWeek({
        week_start: dayjs().startOf("week").format("YYYY-MM-DD"),
        church_id: currentChurchId,
      });

      setEvents(res?.events || []);
    } catch (e) {
      console.error("❌ Lỗi load lịch:", e);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChurchId]);
  useEffect(() => {
    if (!currentChurchId) return;

    loadWeek();
  }, [currentChurchId, loadWeek]);

  const disabledDate = (current) => current && current < dayjs().startOf("day");

  const disabledTime = (currentDate) => {
    if (currentDate && currentDate.isSame(dayjs(), "day")) {
      const now = dayjs();
      return {
        disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
        disabledMinutes: (selectedHour) => {
          if (selectedHour === now.hour()) {
            return Array.from({ length: now.minute() }, (_, i) => i);
          }
          return [];
        },
      };
    }
    return {};
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        church_id: currentChurchId,
        event_date: values.event_date.format("YYYY-MM-DD"),
        event_time: values.event_time.format("HH:mm:ss"),
        week_start: dayjs().startOf("week").format("YYYY-MM-DD"),
      };

      if (selected) {
        await update(selected.id, payload);
        message.success("Cập nhật giờ lễ thành công");
      } else {
        await add(payload);
        message.success("Thêm lễ mới thành công");
      }
      setOpen(false);
      loadWeek();
    } catch (e) {
      console.error(e);
    }
  };

  const getSelectedChurchName = () => {
    return churches.find((c) => c.id === currentChurchId)?.name || "";
  };

  // Render ô lịch theo ngày
  const dateCellRender = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayEvents = events.filter(
      (e) => dayjs(e.event_date).format("YYYY-MM-DD") === dateStr,
    );

    return (
      <div className="cell-wrapper custom-scroll">
        {dayEvents.map((item) => {
          const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.THUONG;
          return (
            <Tooltip
              key={item.id}
              title={`${item.title} — 主 tế: ${item.priest || "Chưa phân công"}`}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(item);
                  form.setFieldsValue({
                    ...item,
                    event_date: dayjs(item.event_date),
                    event_time: dayjs(item.event_time, "HH:mm:ss"),
                  });
                  setOpen(true);
                }}
                className={`event-tag-card ${item.is_priority ? "priority-event" : ""}`}
                style={{
                  background: item.is_priority ? "#fffbe6" : cfg.bg,
                  borderLeft: `3px solid ${
                    item.is_priority ? accentGold : cfg.color
                  }`,
                }}
              >
                <div className="event-info">
                  {item.is_priority && (
                    <StarFilled style={{ color: accentGold, marginRight: 4 }} />
                  )}
                  <span className="event-title-text">{item.title}</span>
                </div>
                <span className="event-time-badge">
                  {item.event_time ? item.event_time.slice(0, 5) : "--:--"}
                </span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="schedule-editorial-layout">
        <div className="schedule-editorial-container">
          {/* HEADER BAR */}
          <div className="schedule-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG QUẢN LÝ PHỤNG VỤ
              </span>
              <Title level={2} className="schedule-main-title">
                LỊCH PHỤNG VỤ GIÁO XỨ
              </Title>
              <Paragraph className="schedule-sub-title">
                Thiết lập danh mục giờ lễ, phân công chủ tế và quản lý sự kiện
                tôn giáo theo tuần.
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Space wrap size="middle">
                {/* SELECT CHỌN GIÁO XỨ */}
                <Select
                  value={currentChurchId ?? undefined}
                  onChange={(value) => {
                    console.log("🏠 Chọn giáo xứ:", value);
                    setCurrentChurchId(Number(value));
                  }}
                  style={{ width: 260 }}
                  placeholder="Chọn giáo xứ / giáo họ"
                  allowClear={false}
                  suffixIcon={<HomeOutlined style={{ color: accentGold }} />}
                  className="custom-select-church"
                >
                  {churches.map((church) => (
                    <Select.Option key={church.id} value={church.id}>
                      {church.name}
                    </Select.Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  disabled={!currentChurchId}
                  onClick={() => {
                    setSelected(null);
                    form.resetFields();
                    form.setFieldsValue({
                      church_name: getSelectedChurchName(),
                      type: "THUONG",
                    });
                    setOpen(true);
                  }}
                  className="add-schedule-btn"
                >
                  Thêm Lễ Mới
                </Button>
              </Space>
            </div>
          </div>

          {/* CHÚ THÍCH PHÂN LOẠI LỄ */}
          <Card bordered={false} className="legend-card">
            <Row align="middle" justify="space-between" gutter={[12, 12]}>
              <Col>
                <Space wrap size="middle">
                  <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
                    <BookOutlined
                      style={{ marginRight: 6, color: accentGold }}
                    />
                    Phân loại thánh lễ:
                  </Text>
                  {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                    <Tag
                      key={key}
                      style={{
                        background: val.bg,
                        borderColor: val.border,
                        color: val.color,
                        fontWeight: 600,
                        borderRadius: 8,
                        padding: "2px 10px",
                      }}
                    >
                      {val.label}
                    </Tag>
                  ))}
                </Space>
              </Col>

              <Col>
                <Space>
                  <Tag
                    style={{
                      background: "#fffbe6",
                      borderColor: accentGold,
                      color: primaryNavy,
                      fontWeight: 700,
                      borderRadius: 8,
                    }}
                  >
                    <StarFilled style={{ color: accentGold, marginRight: 4 }} />
                    Lễ Trọng / Đặc biệt
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* MAIN CALENDAR CARD */}
          <Card bordered={false} className="main-calendar-card">
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={(val, info) => {
                if (info.source === "date" && currentChurchId) {
                  setSelected(null);
                  form.resetFields();
                  form.setFieldsValue({
                    event_date: val,
                    type: "THUONG",
                    church_name: getSelectedChurchName(),
                  });
                  setOpen(true);
                }
              }}
              className="custom-editorial-calendar"
            />
          </Card>
        </div>

        {/* DRAWER FORM SOẠN THẢO THÁNH LỄ */}
        <Drawer
          title={
            <div className="drawer-title-box">
              {selected ? (
                <EditOutlined style={{ color: accentGold }} />
              ) : (
                <PlusOutlined style={{ color: accentGold }} />
              )}
              <span>
                {selected ? "Chi Tiết Thánh Lễ" : "Khai Báo Giờ Lễ Mới"}
              </span>
            </div>
          }
          open={open}
          onClose={() => setOpen(false)}
          width={460}
          footer={
            <div style={{ textAlign: "right", padding: "10px 0" }}>
              <Button
                onClick={() => setOpen(false)}
                style={{ marginRight: 8, borderRadius: 8 }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                disabled={!currentChurchId}
                style={{
                  backgroundColor: primaryNavy,
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Lưu Giờ Lễ
              </Button>
            </div>
          }
        >
          <Form form={form} layout="vertical" style={{ paddingTop: 8 }}>
            <Form.Item
              name="title"
              label={
                <Text strong className="form-field-label">
                  Tên chương trình / Thánh lễ *
                </Text>
              }
              rules={[
                { required: true, message: "Vui lòng nhập tên thánh lễ" },
              ]}
            >
              <Input
                placeholder="Ví dụ: Lễ Nhất Chúa Nhật..."
                className="custom-form-input"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="event_date"
                  label={
                    <Text strong className="form-field-label">
                      Ngày tổ chức *
                    </Text>
                  }
                  rules={[{ required: true, message: "Chọn ngày" }]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                    disabledDate={disabledDate}
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="event_time"
                  label={
                    <Text strong className="form-field-label">
                      Giờ cử hành *
                    </Text>
                  }
                  rules={[{ required: true, message: "Chọn giờ" }]}
                >
                  <TimePicker
                    format="HH:mm"
                    style={{ width: "100%" }}
                    disabledTime={() =>
                      disabledTime(form.getFieldValue("event_date"))
                    }
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="type"
              label={
                <Text strong className="form-field-label">
                  Loại hình phụng vụ
                </Text>
              }
            >
              <Select className="custom-form-input">
                {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                  <Select.Option key={key} value={key}>
                    <Tag color={val.color}>{val.label}</Tag>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="church_name"
              label={
                <Text strong className="form-field-label">
                  Địa điểm / Giáo họ
                </Text>
              }
            >
              <Input
                prefix={<EnvironmentOutlined style={{ color: primaryNavy }} />}
                className="custom-form-input"
              />
            </Form.Item>

            <Form.Item
              name="priest"
              label={
                <Text strong className="form-field-label">
                  Linh mục chủ tế
                </Text>
              }
            >
              <Input
                prefix={<UserOutlined style={{ color: primaryNavy }} />}
                className="custom-form-input"
              />
            </Form.Item>

            <Form.Item
              name="note"
              label={
                <Text strong className="form-field-label">
                  Ghi chú / Ý nguyện lễ
                </Text>
              }
            >
              <Input.TextArea
                rows={3}
                placeholder="Nhập ý cầu nguyện hoặc thông báo kèm theo..."
                className="custom-form-input"
              />
            </Form.Item>

            {selected && (
              <Space
                direction="vertical"
                style={{ width: "100%", marginTop: 12 }}
              >
                <Divider style={{ margin: "12px 0" }} />

                <Button
                  block
                  icon={
                    selected.is_priority ? (
                      <StarOutlined />
                    ) : (
                      <StarFilled style={{ color: accentGold }} />
                    )
                  }
                  onClick={async () => {
                    await togglePriority(selected.id);
                    loadWeek();
                    setOpen(false);
                  }}
                  className="priority-toggle-btn"
                >
                  {selected.is_priority
                    ? "Gỡ đánh dấu lễ quan trọng"
                    : "Đánh dấu lễ quan trọng (Trọng)"}
                </Button>

                <Popconfirm
                  title="Xóa giờ lễ này?"
                  description="Dữ liệu lễ sẽ bị loại bỏ khỏi lịch tuần."
                  onConfirm={async () => {
                    await remove(selected.id);
                    setOpen(false);
                    loadWeek();
                  }}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    block
                    icon={<DeleteOutlined />}
                    style={{ borderRadius: 8 }}
                  >
                    Xóa Thánh Lễ
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </Form>
        </Drawer>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .schedule-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .schedule-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Section */
            .schedule-header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 24px;
              flex-wrap: wrap;
              gap: 16px;
            }

            .sacred-badge {
              background: rgba(212, 175, 55, 0.15);
              border: 1px solid ${accentGold};
              color: ${primaryNavy};
              padding: 4px 14px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 10px;
            }

            .schedule-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .schedule-sub-title {
              color: #64748b;
              margin: 4px 0 0 0 !important;
              font-size: 14px;
            }

            .custom-select-church .ant-select-selector {
              border-radius: 10px !important;
              height: 42px !important;
              display: flex;
              align-items: center;
              border-color: rgba(212, 175, 55, 0.4) !important;
            }

            .add-schedule-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            /* Legend Card */
            .legend-card {
              border-radius: 16px !important;
              background: #ffffff !important;
              border: 1px solid rgba(27, 54, 93, 0.08) !important;
              margin-bottom: 20px;
              padding: 4px;
            }

            /* Main Calendar Card */
            .main-calendar-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 12px;
            }

            .custom-editorial-calendar .ant-picker-calendar-header {
              padding: 12px 0 20px 0;
            }

            .custom-editorial-calendar .ant-picker-cell-selected .ant-picker-calendar-date {
              background: rgba(212, 175, 55, 0.12) !important;
            }

            .custom-editorial-calendar .ant-picker-calendar-date-value {
              font-weight: 700;
              color: ${primaryNavy};
            }

            /* Cells & Event Tags */
            .cell-wrapper {
              padding: 2px;
              height: 100%;
              max-height: 85px;
              overflow-y: auto;
            }

            .event-tag-card {
              padding: 4px 8px;
              margin-bottom: 5px;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              transition: all 0.2s ease;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
            }

            .event-tag-card:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 10px rgba(27, 54, 93, 0.12);
            }

            .event-tag-card.priority-event {
              border-color: ${accentGold} !important;
            }

            .event-info {
              display: flex;
              align-items: center;
              overflow: hidden;
              width: 70%;
            }

            .event-title-text {
              font-weight: 700;
              color: ${primaryNavy};
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .event-time-badge {
              font-size: 10px;
              font-weight: 700;
              color: ${accentGold};
              background: rgba(27, 54, 93, 0.06);
              padding: 1px 6px;
              border-radius: 4px;
              flex-shrink: 0;
            }

            .ant-picker-calendar-date-content {
              height: 85px !important;
            }

            /* Drawer Style */
            .drawer-title-box {
              display: flex;
              align-items: center;
              gap: 8px;
              font-family: 'Playfair Display', serif;
              color: ${primaryNavy};
              font-size: 18px;
              font-weight: 700;
            }

            .form-field-label {
              font-size: 13px;
              color: ${primaryNavy};
            }

            .custom-form-input {
              border-radius: 8px !important;
            }

            .priority-toggle-btn {
              border-radius: 8px !important;
              font-weight: 600;
              border-color: ${accentGold} !important;
              color: ${primaryNavy} !important;
              background: #fffdf5 !important;
            }

            .custom-scroll::-webkit-scrollbar { width: 3px; }
            .custom-scroll::-webkit-scrollbar-thumb {
              background: rgba(212, 175, 55, 0.3);
              border-radius: 4px;
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default AdminScheduleCalendar;
