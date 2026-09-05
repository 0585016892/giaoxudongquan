import React from "react";
import {
  Card,
  Col,
  Row,
  Space,
  Typography,
  Tag,
  Dropdown,
  Button,
  Avatar,
  Tooltip,
} from "antd";
import {
  BookOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  ArrowRightOutlined,
  HeartFilled,
} from "@ant-design/icons";

const { Text } = Typography;

// Mock helper functions nếu chưa import
const getCategoryShortName = (cat) => cat || "Khác";
const getDayName = (day) => day || "Chủ Nhật";
const formatTime = (time) => time || "08:00";

const StatusTag = ({ status }) => {
  const isFinished = status === "finished" || status === "Đã kết thúc";
  return (
    <Tag
      bordered={false}
      style={{
        borderRadius: 12,
        fontSize: 10,
        fontWeight: 800,
        padding: "2px 8px",
        margin: 0,
        backgroundColor: isFinished ? "#F1F5F9" : "#E0F2FE",
        color: isFinished ? "#64748B" : "#0284C7",
      }}
    >
      {status || "Đang hoạt động"}
    </Tag>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div
    style={{
      padding: "8px 10px",
      borderRadius: 14,
      background: "#FFF9FA",
      border: "1px solid #FFE4E6",
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <div
      style={{
        color: "#FF6B8B",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
      }}
    >
      {icon}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <Text
        style={{
          display: "block",
          fontSize: 10,
          color: "#94A3B8",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {label}
      </Text>
      <Text
        strong
        ellipsis
        style={{
          display: "block",
          fontSize: 11,
          color: "#334155",
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </div>
  </div>
);

const ClassCard = ({
  item = {},
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const catechists = Array.isArray(item.catechists) ? item.catechists : [];
  const studentsCount = Number(item.studentsCount || 0);

  return (
    <Card
      bordered={false}
      hoverable
      onClick={() => onView?.(item)}
      className="chibi-class-card"
      style={{
        height: "100%",
        borderRadius: 26,
        overflow: "hidden",
        cursor: "pointer",
        background: "#FFFFFF",
        border: "2px solid #FFE4E6",
        boxShadow: "0 12px 28px rgba(255, 182, 193, 0.2)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.01)";
        e.currentTarget.style.boxShadow =
          "0 20px 35px rgba(255, 182, 193, 0.35)";
        e.currentTarget.style.borderColor = "#FFB6C1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow =
          "0 12px 28px rgba(255, 182, 193, 0.2)";
        e.currentTarget.style.borderColor = "#FFE4E6";
      }}
    >
      {/* HEADER PASTEL */}
      <div
        style={{
          position: "relative",
          padding: 20,
          background:
            "linear-gradient(135deg, #FFF5F7 0%, #FFF0F3 50%, #FFE4E6 100%)",
          borderBottom: "1.5px dashed #FFD1D9",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.5)",
            pointerEvents: "none",
          }}
        />

        <Row
          justify="space-between"
          align="start"
          gutter={12}
          style={{ position: "relative", zIndex: 1 }}
        >
          <Col flex="auto">
            <Space align="start" size={12}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: 18,
                  background: "#FFFFFF",
                  color: "#FF6B8B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  border: "1.5px solid #FFD1D9",
                  boxShadow: "0 4px 10px rgba(255, 107, 139, 0.2)",
                }}
              >
                <BookOutlined />
              </div>

              <div style={{ minWidth: 0 }}>
                <Text
                  strong
                  ellipsis
                  style={{
                    display: "block",
                    maxWidth: 200,
                    color: "#334155",
                    fontSize: 16,
                    fontWeight: 800,
                    fontFamily: "'Quicksand', sans-serif",
                    lineHeight: 1.3,
                  }}
                >
                  {item.name || "Chưa đặt tên"}
                </Text>

                <Space size={6} wrap style={{ marginTop: 6 }}>
                  {item.code && (
                    <Tag
                      style={{
                        margin: 0,
                        border: 0,
                        borderRadius: 12,
                        background: "#FEF3C7",
                        color: "#D97706",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "1px 8px",
                      }}
                    >
                      ✨ {item.code}
                    </Tag>
                  )}

                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#FF6B8B",
                    }}
                  >
                    {getCategoryShortName(item.category)}
                  </Text>
                </Space>
              </div>
            </Space>
          </Col>

          <Col>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "view",
                    icon: <EyeOutlined />,
                    label: "Xem chi tiết",
                    onClick: ({ domEvent }) => {
                      domEvent.stopPropagation();
                      onView?.(item);
                    },
                  },

                  // CHỈ HIỆN KHI CÓ QUYỀN SỬA
                  ...(canEdit
                    ? [
                        {
                          key: "edit",
                          icon: <EditOutlined />,
                          label: "Chỉnh sửa",
                          onClick: ({ domEvent }) => {
                            domEvent.stopPropagation();
                            onEdit?.(item);
                          },
                        },
                      ]
                    : []),

                  // Chỉ hiện divider nếu có quyền sửa hoặc xóa
                  ...(canEdit || canDelete
                    ? [
                        {
                          type: "divider",
                        },
                      ]
                    : []),

                  // CHỈ HIỆN KHI CÓ QUYỀN XÓA
                  ...(canDelete
                    ? [
                        {
                          key: "delete",
                          danger: true,
                          icon: <DeleteOutlined />,
                          label: "Xóa lớp",
                          onClick: ({ domEvent }) => {
                            domEvent.stopPropagation();
                            onDelete?.(item);
                          },
                        },
                      ]
                    : []),
                ],
              }}
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  color: "#FF6B8B",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #FFD1D9",
                }}
              />
            </Dropdown>
          </Col>
        </Row>

        <Row
          justify="space-between"
          align="middle"
          style={{ marginTop: 14, position: "relative", zIndex: 1 }}
        >
          <Col>
            <Text style={{ color: "#94A3B8", fontSize: 11, fontWeight: 700 }}>
              {item.category || "Chưa phân loại"}
            </Text>
          </Col>

          <Col>
            <StatusTag status={item.status} />
          </Col>
        </Row>
      </div>

      {/* BODY PASTEL */}
      <div style={{ padding: 18 }}>
        <Row gutter={[10, 10]}>
          <Col span={12}>
            <InfoItem
              icon={<CalendarOutlined />}
              label="Lịch học"
              value={getDayName(item.day_of_week)}
            />
          </Col>

          <Col span={12}>
            <InfoItem
              icon={<ClockCircleOutlined />}
              label="Thời gian"
              value={`${formatTime(item.start_time)} - ${formatTime(
                item.end_time,
              )}`}
            />
          </Col>

          <Col span={12}>
            <InfoItem
              icon={<EnvironmentOutlined />}
              label="Phòng học"
              value={item.room || "Chưa cập nhật"}
            />
          </Col>

          <Col span={12}>
            <InfoItem
              icon={<TeamOutlined />}
              label="Học viên"
              value={`${studentsCount} bé`}
            />
          </Col>
        </Row>

        {/* GIÁO LÝ VIÊN CARD */}
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: 18,
            background: "#FFF5F7",
            border: "1.5px solid #FFE4E6",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space size={10}>
                <Avatar.Group
                  max={{
                    count: 3,
                    style: {
                      background: "#FF6B8B",
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: 800,
                      border: "2px solid #FFFFFF",
                    },
                  }}
                >
                  {catechists.length > 0 ? (
                    catechists.map((catechist, index) => (
                      <Tooltip
                        key={catechist.id || catechist.catechist_id || index}
                        title={catechist.full_name || "Giáo lý viên"}
                      >
                        <Avatar
                          size={32}
                          style={{
                            background: index % 2 === 0 ? "#FF6B8B" : "#FFC048",
                            color: "#FFFFFF",
                            fontSize: 12,
                            fontWeight: 800,
                            border: "2px solid #FFFFFF",
                          }}
                        >
                          {catechist.full_name?.charAt(0)?.toUpperCase() || "G"}
                        </Avatar>
                      </Tooltip>
                    ))
                  ) : (
                    <Avatar
                      size={32}
                      icon={<UserOutlined />}
                      style={{
                        background: "#E2E8F0",
                        color: "#94A3B8",
                        border: "2px solid #FFFFFF",
                      }}
                    />
                  )}
                </Avatar.Group>

                <div>
                  <Text
                    strong
                    style={{
                      display: "block",
                      color: "#334155",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {catechists.length > 0
                      ? `${catechists.length} Giáo lý viên`
                      : "Chưa phân công"}
                  </Text>

                  <Text
                    style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}
                  >
                    <HeartFilled style={{ color: "#FF6B8B", marginRight: 3 }} />
                    Phụ trách lớp
                  </Text>
                </div>
              </Space>
            </Col>

            <Col>
              <Button
                type="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(item);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  color: "#FF6B8B",
                  background: "#FFFFFF",
                  border: "1px solid #FFD1D9",
                  boxShadow: "0 2px 6px rgba(255, 107, 139, 0.15)",
                }}
                icon={<ArrowRightOutlined />}
              />
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default ClassCard;
