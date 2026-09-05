import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Input,
  Tag,
  Empty,
  Select,
  message,
  Table,
  Button,
  Descriptions,
  Divider,
} from "antd";

import {
  TeamOutlined,
  SearchOutlined,
  BookOutlined,
  ManOutlined,
  WomanOutlined,
  FilterOutlined,
  EyeOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MailOutlined,
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import StatCard from "../../components/common/StatCard";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";

import studentApi from "../../api/studentApi";
import ErrorPage from "./ErrorPage";

const { Text } = Typography;

const MyStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [error, setError] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await studentApi.getStudentClass();
      const data = response?.data;

      if (Array.isArray(data)) {
        setStudents(data);
      } else if (Array.isArray(data?.data)) {
        setStudents(data.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      setError("Bạn chưa được phân vào lớp học nào!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // =====================================================
  // XEM CHI TIẾT
  // =====================================================

  const handleViewDetail = async (student) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedStudent(student);

    try {
      if (student?.id && typeof studentApi.getStudentById === "function") {
        const res = await studentApi.getStudentById(student.id);

        if (res?.data) {
          setSelectedStudent(res.data);
        }
      }
    } catch (error) {
      console.error("GET STUDENT DETAIL ERROR:", error);

      message.warning("Đang hiển thị thông tin sẵn có của học sinh.");
    } finally {
      setDetailLoading(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const renderValue = (val) => {
    if (val === null || val === undefined || val === "") {
      return "-";
    }

    return val;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (e) {
      return dateString;
    }
  };

  // =====================================================
  // DANH SÁCH LỚP
  // =====================================================

  const classes = useMemo(() => {
    const map = new Map();

    students.forEach((student) => {
      if (student.class_id) {
        map.set(student.class_id, {
          id: student.class_id,
          name: student.class_name,
          code: student.class_code,
        });
      }
    });

    return Array.from(map.values());
  }, [students]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredStudents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return students.filter((student) => {
      const studentName = (student.name || "").toLowerCase();

      const studentCode = (student.code || "").toLowerCase();

      const studentPhone = (student.phone || "").toLowerCase();

      const className = (student.class_name || "").toLowerCase();

      const matchSearch =
        !keyword ||
        studentName.includes(keyword) ||
        studentCode.includes(keyword) ||
        studentPhone.includes(keyword) ||
        className.includes(keyword);

      const matchClass =
        classFilter === "all" ||
        String(student.class_id) === String(classFilter);

      return matchSearch && matchClass;
    });
  }, [students, searchText, classFilter]);

  // =====================================================
  // THỐNG KÊ
  // =====================================================

  const statistics = useMemo(() => {
    const male = students.filter(
      (student) =>
        student.gender?.toLowerCase() === "nam" || student.gender === "male",
    ).length;

    const female = students.filter(
      (student) =>
        student.gender?.toLowerCase() === "nữ" || student.gender === "female",
    ).length;

    return {
      total: students.length,
      classes: classes.length,
      male,
      female,
    };
  }, [students, classes]);

  // =====================================================
  // AVATAR
  // =====================================================

  const getAvatarColor = (index) => {
    const colors = ["#FF6B8B", "#FFC048", "#A855F7", "#38BDF8", "#34D399"];

    return colors[index % colors.length];
  };

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <ErrorPage
        title="Không thể tải danh sách học sinh"
        message={error}
        onRetry={() => {
          setError(null);
          fetchStudents();
        }}
      />
    );
  }

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = [
    {
      title: "Học sinh",
      dataIndex: "name",
      key: "name",
      width: 250,
      fixed: "left",

      render: (text, record, index) => (
        <div className="student-table-cell">
          <Avatar
            size={40}
            src={record.avatar}
            style={{
              background: getAvatarColor(index),
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: 14,
              border: "2px solid #FFFFFF",
              boxShadow: "0 3px 8px rgba(255, 107, 139, 0.2)",
              flexShrink: 0,
            }}
          >
            {(text || "?").charAt(0)?.toUpperCase()}
          </Avatar>

          <div className="student-table-info">
            <Text strong className="student-table-name">
              {record.saint_name ? `${record.saint_name} ` : ""}
              {text || "Chưa cập nhật"}
            </Text>

            {record.code && (
              <Text className="student-table-code">{record.code}</Text>
            )}
          </div>
        </div>
      ),
    },

    {
      title: "Lớp học",
      dataIndex: "class_name",
      key: "class_name",
      width: 220,

      render: (className, record) => (
        <div className="class-table-cell">
          <BookOutlined className="class-icon" />

          <Text className="class-name">{className || "Chưa xếp lớp"}</Text>

          {record.class_code && (
            <Tag bordered={false} className="class-code-tag">
              {record.class_code}
            </Tag>
          )}
        </div>
      ),
    },

    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 130,

      render: (gender) => {
        const isMale = gender?.toLowerCase() === "nam" || gender === "male";

        return (
          <div className="gender-cell">
            {isMale ? (
              <ManOutlined
                style={{
                  color: "#38BDF8",
                }}
              />
            ) : (
              <WomanOutlined
                style={{
                  color: "#A855F7",
                }}
              />
            )}

            <Text className="table-secondary-text">{renderValue(gender)}</Text>
          </div>
        );
      },
    },

    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 160,

      render: (phone) => (
        <Text className="table-secondary-text">{renderValue(phone)}</Text>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "class_student_status",
      key: "status",
      width: 140,

      render: (status) => (
        <Tag
          color={status === "studying" ? "success" : "default"}
          className="status-tag"
        >
          {status === "studying" ? "Đang học" : renderValue(status)}
        </Tag>
      ),
    },

    {
      title: "Thao tác",
      key: "action",
      width: 110,
      fixed: "right",

      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          className="detail-button"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="my-students-page">
      {/* =================================================
          HERO
      ================================================= */}

      <PageHeroHeader
        title="Học sinh của tôi"
        subtitle="Danh sách học sinh thuộc các lớp bạn đang phụ trách."
        badgeText="🌸 QUẢN LÝ HỌC SINH"
        icon={<TeamOutlined />}
      />

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Tổng học sinh"
            value={statistics.total}
            icon={<TeamOutlined />}
            color="#FF6B8B"
          />
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Học sinh Nam"
            value={statistics.male}
            icon={<ManOutlined />}
            color="#38BDF8"
          />
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Học sinh Nữ"
            value={statistics.female}
            icon={<WomanOutlined />}
            color="#A855F7"
          />
        </Col>
      </Row>

      {/* =================================================
          FILTER
      ================================================= */}

      <Card
        bordered={false}
        className="students-filter-card"
        styles={{
          body: {
            padding: 14,
          },
        }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={15}>
            <Input
              size="large"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={
                <SearchOutlined
                  style={{
                    color: "#FF6B8B",
                  }}
                />
              }
              placeholder="Tìm tên học sinh, mã học sinh, số điện thoại, lớp..."
              className="student-search-input"
            />
          </Col>

          <Col xs={24} lg={9}>
            <Select
              size="large"
              value={classFilter}
              onChange={setClassFilter}
              style={{
                width: "100%",
              }}
              className="student-class-select"
              suffixIcon={
                <FilterOutlined
                  style={{
                    color: "#FF6B8B",
                  }}
                />
              }
              options={[
                {
                  label: "🌸 Tất cả lớp",
                  value: "all",
                },

                ...classes.map((item) => ({
                  label: `${item.name}${item.code ? ` • ${item.code}` : ""}`,
                  value: item.id,
                })),
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* =================================================
          TABLE
      ================================================= */}

      <Card
        bordered={false}
        className="students-table-card"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <Table
          dataSource={filteredStudents}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{
            x: 1010,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            responsive: true,
            showLessItems: true,

            showTotal: (total) => `Tổng số ${total} học sinh`,
          }}
          locale={{
            emptyText: (
              <div className="table-empty">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text className="empty-table-text">
                      Chưa có học sinh nào trong các lớp bạn phụ trách 🌸
                    </Text>
                  }
                />
              </div>
            ),
          }}
        />
      </Card>

      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      <AppDetailModal
        open={detailModalOpen}
        showEdit={false}
        title="Chi tiết học sinh"
        loading={detailLoading}
        width={850}
        onCancel={() => setDetailModalOpen(false)}
      >
        {selectedStudent && (
          <div className="student-detail-container">
            {/* ===========================================
                PROFILE
            =========================================== */}

            <div className="student-detail-profile">
              <Avatar
                size={64}
                src={selectedStudent.avatar}
                className="student-detail-avatar"
              >
                {(selectedStudent.name || "H").charAt(0)?.toUpperCase()}
              </Avatar>

              <div className="student-detail-heading">
                <Text className="student-detail-name">
                  {selectedStudent.saint_name
                    ? `${selectedStudent.saint_name} `
                    : ""}
                  {selectedStudent.name}
                </Text>

                <Text className="student-detail-code">
                  Mã học sinh: {renderValue(selectedStudent.code)}
                </Text>
              </div>
            </div>

            <Divider className="student-detail-divider" />

            {/* ===========================================
                DESCRIPTIONS
            =========================================== */}

            <Descriptions
              bordered
              column={{
                xs: 1,
                sm: 1,
                md: 2,
              }}
              size="small"
              className="student-descriptions"
              labelStyle={{
                fontWeight: "bold",
              }}
              contentStyle={{
                wordBreak: "break-word",
              }}
            >
              {/* =========================================
                  ĐỊNH DANH
              ========================================= */}

              <Descriptions.Item label="Mã học sinh (code)">
                {renderValue(selectedStudent.code)}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái hồ sơ">
                <Tag color="processing">
                  {selectedStudent.status === "active"
                    ? "Đang hoạt động"
                    : "Ngưng hoạt động"}
                </Tag>
              </Descriptions.Item>

              {/* =========================================
                  LỚP
              ========================================= */}

              <Descriptions.Item
                label={
                  <span>
                    <BookOutlined className="description-icon pink" />
                    Lớp học
                  </span>
                }
              >
                {renderValue(selectedStudent.class_name)}
              </Descriptions.Item>

              <Descriptions.Item label="Mã lớp">
                {renderValue(selectedStudent.class_code)}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái trong lớp">
                <Tag color="success">
                  {renderValue(selectedStudent.class_student_status)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tham gia lớp">
                {formatDate(selectedStudent.joined_at)}
              </Descriptions.Item>

              {/* =========================================
                  CÁ NHÂN
              ========================================= */}

              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined className="description-icon blue" />
                    Tên Thánh
                  </span>
                }
              >
                {renderValue(selectedStudent.saint_name)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <ManOutlined className="description-icon blue" />
                    Giới tính
                  </span>
                }
              >
                {renderValue(selectedStudent.gender)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <CalendarOutlined className="description-icon yellow" />
                    Ngày sinh
                  </span>
                }
              >
                {formatDate(selectedStudent.date_of_birth)}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi sinh">
                {renderValue(selectedStudent.birth_place)}
              </Descriptions.Item>

              <Descriptions.Item label="Quốc tịch">
                {renderValue(selectedStudent.nationality)}
              </Descriptions.Item>

              <Descriptions.Item label="Xứ đạo (Parish)">
                {renderValue(selectedStudent.parish)}
              </Descriptions.Item>

              {/* =========================================
                  LIÊN LẠC
              ========================================= */}

              <Descriptions.Item
                label={
                  <span>
                    <PhoneOutlined className="description-icon green" />
                    Số điện thoại
                  </span>
                }
              >
                {renderValue(selectedStudent.phone)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined className="description-icon green" />
                    Email
                  </span>
                }
              >
                {renderValue(selectedStudent.email)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <EnvironmentOutlined className="description-icon red" />
                    Địa chỉ
                  </span>
                }
                span={2}
              >
                {renderValue(selectedStudent.address)}
              </Descriptions.Item>

              {/* =========================================
                  GIA ĐÌNH
              ========================================= */}

              <Descriptions.Item
                label={
                  <span>
                    <HeartOutlined className="description-icon pink" />
                    Họ tên Bố
                  </span>
                }
              >
                {renderValue(selectedStudent.father_name)}
              </Descriptions.Item>

              <Descriptions.Item label="Số điện thoại Bố">
                {renderValue(selectedStudent.father_phone)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <HeartOutlined className="description-icon pink" />
                    Họ tên Mẹ
                  </span>
                }
              >
                {renderValue(selectedStudent.mother_name)}
              </Descriptions.Item>

              <Descriptions.Item label="Số điện thoại Mẹ">
                {renderValue(selectedStudent.mother_phone)}
              </Descriptions.Item>

              <Descriptions.Item label="Người giám hộ">
                {renderValue(selectedStudent.guardian_name)} (
                {renderValue(selectedStudent.guardian_relationship)})
              </Descriptions.Item>

              <Descriptions.Item label="SĐT Người giám hộ">
                {renderValue(selectedStudent.guardian_phone)}
              </Descriptions.Item>

              {/* =========================================
                  GIÁO LÝ
              ========================================= */}

              <Descriptions.Item
                label={
                  <span>
                    <FileTextOutlined className="description-icon purple" />
                    Trình độ giáo lý
                  </span>
                }
              >
                {renderValue(selectedStudent.catechism_level)}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái giáo lý">
                <Tag color="cyan">
                  {renderValue(selectedStudent.catechism_status)}
                </Tag>
              </Descriptions.Item>

              {/* =========================================
                  RỬA TỘI
              ========================================= */}

              <Descriptions.Item
                label={
                  <span>
                    <SafetyCertificateOutlined className="description-icon blue" />
                    Rửa tội
                  </span>
                }
                span={2}
              >
                <div className="sacrament-detail">
                  <div>
                    <strong>Tên thánh:</strong>{" "}
                    {renderValue(selectedStudent.baptism_name)}
                  </div>

                  <div>
                    <strong>Ngày:</strong>{" "}
                    {formatDate(selectedStudent.baptism_date)}
                  </div>

                  <div>
                    <strong>Nơi:</strong>{" "}
                    {renderValue(selectedStudent.baptism_place)}
                  </div>
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Xứ rửa tội / Chứng chỉ">
                <div className="sacrament-detail">
                  <div>
                    <strong>Xứ:</strong>{" "}
                    {renderValue(selectedStudent.baptism_parish)}
                  </div>

                  <div>
                    <strong>Số chứng chỉ:</strong>{" "}
                    {renderValue(selectedStudent.baptism_certificate_no)}
                  </div>
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày ghi danh">
                {formatDate(selectedStudent.enrollment_date)}
              </Descriptions.Item>

              {/* =========================================
                  RƯỚC LỄ
              ========================================= */}

              <Descriptions.Item label="Rước lễ lần đầu">
                <div className="sacrament-detail">
                  <div>
                    <strong>Ngày:</strong>{" "}
                    {formatDate(selectedStudent.first_communion_date)}
                  </div>

                  <div>
                    <strong>Nơi:</strong>{" "}
                    {renderValue(selectedStudent.first_communion_place)}
                  </div>
                </div>
              </Descriptions.Item>

              {/* =========================================
                  THÊM SỨC
              ========================================= */}

              <Descriptions.Item label="Thêm sức">
                <div className="sacrament-detail">
                  <div>
                    <strong>Ngày:</strong>{" "}
                    {formatDate(selectedStudent.confirmation_date)}
                  </div>

                  <div>
                    <strong>Nơi:</strong>{" "}
                    {renderValue(selectedStudent.confirmation_place)}
                  </div>

                  <div>
                    <strong>Tên thánh:</strong>{" "}
                    {renderValue(selectedStudent.confirmation_saint_name)}
                  </div>
                </div>
              </Descriptions.Item>

              {/* =========================================
                  GHI CHÚ
              ========================================= */}

              <Descriptions.Item label="Ghi chú" span={2}>
                <div className="note-content">
                  {renderValue(selectedStudent.note)}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo tham gia">
                {renderValue(selectedStudent.created_at)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </AppDetailModal>

      {/* =================================================
          RESPONSIVE CSS
      ================================================= */}

      <style>{`
        /* =====================================================
           ROOT
        ===================================================== */

        .my-students-page {
          min-height: 100vh;
          padding: 24px;
          background: #FFF9FA;
          overflow-x: hidden;
        }

        /* =====================================================
           STATISTICS
        ===================================================== */

        .statistics-row {
          margin-bottom: 20px;
        }

        /* =====================================================
           FILTER
        ===================================================== */

        .students-filter-card {
          border-radius: 24px;
          margin-bottom: 20px;
          background: #FFFFFF;
          border: 2px solid #FFE4E6;
          box-shadow:
            0 10px 25px
            rgba(255, 182, 193, 0.12);
          overflow: hidden;
        }

        .student-search-input {
          width: 100%;
          height: 44px;
          border-radius: 16px;
          background: #FFF5F7;
          border: 1px solid #FFE4E6;
          font-size: 13px;
          font-weight: 600;
        }

        .student-class-select {
          width: 100%;
        }

        .student-class-select
          .ant-select-selector {
          height: 44px !important;
          min-height: 44px !important;
          border-radius: 16px !important;
          font-weight: 600;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .students-table-card {
          border-radius: 24px;
          border: 2px solid #FFE4E6;
          box-shadow:
            0 10px 24px
            rgba(255, 182, 193, 0.12);
          overflow: hidden;
        }

        .students-table-card
          .ant-table-container {
          border-radius: 0;
        }

        .students-table-card
          .ant-table-thead
          > tr
          > th {
          background: #FFF7F8 !important;
          color: #475569;
          font-weight: 800;
          font-size: 12px;
          white-space: nowrap;
        }

        .students-table-card
          .ant-table-tbody
          > tr
          > td {
          font-size: 13px;
          vertical-align: middle;
        }

        .students-table-card
          .ant-table-tbody
          > tr:hover
          > td {
          background: #FFF9FA !important;
        }

        .student-table-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .student-table-info {
          min-width: 0;
          max-width: 175px;
        }

        .student-table-name {
          display: block;
          color: #334155;
          font-size: 13.5px;
          line-height: 1.4;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .student-table-code {
          display: block;
          margin-top: 2px;
          font-size: 11px;
          color: #94A3B8;
          font-weight: 700;
        }

        .class-table-cell {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
        }

        .class-icon {
          color: #FF6B8B;
          flex-shrink: 0;
        }

        .class-name {
          color: #334155;
          font-size: 13px;
          font-weight: 600;

          max-width: 105px;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .class-code-tag {
          flex-shrink: 0;
          border-radius: 8px !important;
          background: #FEF3C7 !important;
          color: #D97706 !important;
          font-size: 10px;
          font-weight: 800;
          margin: 0 !important;
        }

        .gender-cell {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .table-secondary-text {
          color: #64748B;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-tag {
          border-radius: 8px !important;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .detail-button {
          border-radius: 10px !important;
          font-weight: 700;
          border-color: #FF6B8B !important;
          color: #FF6B8B !important;
          white-space: nowrap;
        }

        .detail-button:hover {
          background: #FFF1F2 !important;
        }

        .table-empty {
          padding: 40px 20px;
        }

        .empty-table-text {
          color: #94A3B8;
          font-weight: 700;
          font-size: 13px;
        }

        /* =====================================================
           PAGINATION
        ===================================================== */

        .students-table-card
          .ant-pagination {
          padding: 14px 18px;
          margin: 0 !important;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        /* =====================================================
           MODAL
        ===================================================== */

        .student-detail-container {
          width: 100%;
          min-width: 0;
        }

        .student-detail-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          min-width: 0;
        }

        .student-detail-avatar {
          background: #FF6B8B !important;
          color: #FFFFFF !important;
          font-weight: 800 !important;
          font-size: 22px !important;
          border: 3px solid #FFF0F5 !important;
          flex-shrink: 0;
        }

        .student-detail-heading {
          min-width: 0;
        }

        .student-detail-name {
          display: block;
          font-size: 18px;
          font-weight: 800;
          color: #334155;
          line-height: 1.4;
          word-break: break-word;
        }

        .student-detail-code {
          display: block;
          margin-top: 4px;
          font-size: 13px;
          color: #94A3B8;
          word-break: break-word;
        }

        .student-detail-divider {
          margin: 12px 0 !important;
        }

        .student-descriptions {
          width: 100%;
        }

        .student-descriptions
          .ant-descriptions-item-label {
          color: #475569;
          font-weight: 700;
          white-space: normal;
        }

        .student-descriptions
          .ant-descriptions-item-content {
          color: #334155;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .description-icon {
          margin-right: 6px;
        }

        .description-icon.pink {
          color: #FF6B8B;
        }

        .description-icon.blue {
          color: #38BDF8;
        }

        .description-icon.yellow {
          color: #FFC048;
        }

        .description-icon.green {
          color: #34D399;
        }

        .description-icon.red {
          color: #EF4444;
        }

        .description-icon.purple {
          color: #A855F7;
        }

        .sacrament-detail {
          display: flex;
          flex-direction: column;
          gap: 4px;
          line-height: 1.5;
        }

        .note-content {
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
          line-height: 1.6;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 991px) {
          .my-students-page {
            padding: 18px;
          }

          .student-table-info {
            max-width: 160px;
          }

          .student-detail-name {
            font-size: 17px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .my-students-page {
            padding: 12px;
            background: #FFF9FA;
          }

          .statistics-row {
            margin-bottom: 14px;
          }

          /* FILTER */

          .students-filter-card {
            border-radius: 18px;
            margin-bottom: 14px;
          }

          .students-filter-card
            .ant-card-body {
            padding: 10px !important;
          }

          .student-search-input {
            height: 42px;
            border-radius: 13px;
            font-size: 12px;
          }

          .student-class-select
            .ant-select-selector {
            height: 42px !important;
            min-height: 42px !important;
            border-radius: 13px !important;
            font-size: 12px;
          }

          /* TABLE */

          .students-table-card {
            border-radius: 18px;
          }

          .students-table-card
            .ant-table-thead
            > tr
            > th {
            padding: 10px 8px !important;
            font-size: 11px;
          }

          .students-table-card
            .ant-table-tbody
            > tr
            > td {
            padding: 9px 8px !important;
            font-size: 12px;
          }

          .student-table-cell {
            gap: 8px;
          }

          .student-table-cell
            .ant-avatar {
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
            font-size: 12px !important;
          }

          .student-table-info {
            max-width: 145px;
          }

          .student-table-name {
            font-size: 12px;
          }

          .student-table-code {
            font-size: 10px;
          }

          .class-name {
            font-size: 12px;
            max-width: 90px;
          }

          .class-code-tag {
            font-size: 9px;
            padding: 2px 5px !important;
          }

          .table-secondary-text {
            font-size: 12px;
          }

          .status-tag {
            font-size: 10px;
          }

          .detail-button {
            font-size: 11px;
            padding: 3px 7px !important;
          }

          .students-table-card
            .ant-pagination {
            padding: 12px;
            justify-content: flex-start;
          }

          .students-table-card
            .ant-pagination-total-text {
            width: 100%;
            margin-bottom: 4px;
            font-size: 11px;
          }

          /* MODAL */

          .student-detail-profile {
            gap: 11px;
            margin-bottom: 15px;
          }

          .student-detail-avatar {
            width: 52px !important;
            height: 52px !important;
            line-height: 52px !important;
            font-size: 18px !important;
          }

          .student-detail-name {
            font-size: 16px;
          }

          .student-detail-code {
            font-size: 11px;
          }

          .student-descriptions
            .ant-descriptions-item-label {
            font-size: 12px;
            padding: 9px 10px !important;
          }

          .student-descriptions
            .ant-descriptions-item-content {
            font-size: 12px;
            padding: 9px 10px !important;
          }

          .student-descriptions
            .ant-descriptions-item {
            padding-bottom: 0;
          }

          .sacrament-detail {
            gap: 3px;
          }
        }

        /* =====================================================
           MOBILE NHỎ
        ===================================================== */

        @media (max-width: 480px) {
          .my-students-page {
            padding: 9px;
          }

          /* STAT */

          .statistics-row {
            gap: 0 !important;
          }

          /* FILTER */

          .students-filter-card {
            border-radius: 16px;
          }

          .students-filter-card
            .ant-card-body {
            padding: 8px !important;
          }

          .student-search-input {
            height: 40px;
            font-size: 11px;
          }

          .student-class-select
            .ant-select-selector {
            height: 40px !important;
            min-height: 40px !important;
            font-size: 11px;
          }

          /* TABLE */

          .students-table-card {
            border-radius: 16px;
          }

          .students-table-card
            .ant-table-thead
            > tr
            > th {
            padding: 8px 6px !important;
            font-size: 10px;
          }

          .students-table-card
            .ant-table-tbody
            > tr
            > td {
            padding: 8px 6px !important;
          }

          .student-table-cell
            .ant-avatar {
            width: 32px !important;
            height: 32px !important;
            line-height: 32px !important;
            font-size: 11px !important;
          }

          .student-table-info {
            max-width: 125px;
          }

          .student-table-name {
            font-size: 11px;
          }

          .student-table-code {
            font-size: 9px;
          }

          .class-name {
            max-width: 75px;
            font-size: 11px;
          }

          .class-code-tag {
            display: none;
          }

          .table-secondary-text {
            font-size: 11px;
          }

          .detail-button {
            font-size: 10px;
            padding:
              2px 6px !important;
          }

          .students-table-card
            .ant-pagination {
            padding: 10px;
          }

          .students-table-card
            .ant-pagination
            .ant-pagination-options {
            width: 100%;
            margin-inline-start: 0 !important;
          }

          /* MODAL */

          .student-detail-profile {
            gap: 9px;
          }

          .student-detail-avatar {
            width: 46px !important;
            height: 46px !important;
            line-height: 46px !important;
            font-size: 16px !important;
          }

          .student-detail-name {
            font-size: 14px;
          }

          .student-detail-code {
            font-size: 10px;
          }

          .student-descriptions
            .ant-descriptions-item-label {
            font-size: 11px;
            padding: 8px !important;
          }

          .student-descriptions
            .ant-descriptions-item-content {
            font-size: 11px;
            padding: 8px !important;
          }
        }

        /* =====================================================
           MOBILE SIÊU NHỎ
        ===================================================== */

        @media (max-width: 360px) {
          .my-students-page {
            padding: 7px;
          }

          .student-table-info {
            max-width: 105px;
          }

          .student-table-name {
            font-size: 10px;
          }

          .student-table-code {
            font-size: 8px;
          }

          .class-name {
            max-width: 65px;
            font-size: 10px;
          }

          .table-secondary-text {
            font-size: 10px;
          }

          .detail-button {
            font-size: 9px;
            padding:
              2px 5px !important;
          }

          .student-detail-name {
            font-size: 13px;
          }

          .student-descriptions
            .ant-descriptions-item-label {
            font-size: 10px;
          }

          .student-descriptions
            .ant-descriptions-item-content {
            font-size: 10px;
          }
        }

        /* =====================================================
           MODAL RESPONSIVE GLOBAL
        ===================================================== */

        .my-students-page
          .ant-modal {
          max-width:
            calc(100vw - 20px);
        }

        .my-students-page
          .ant-modal-content {
          max-width:
            calc(100vw - 20px);
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .my-students-page
            .ant-modal {
            width:
              calc(100vw - 20px) !important;
            max-width:
              calc(100vw - 20px);
            margin: 10px auto;
          }

          .my-students-page
            .ant-modal-body {
            max-height:
              calc(100vh - 150px);
            overflow-y: auto;
            overflow-x: hidden;
          }
        }

        @media (max-width: 480px) {
          .my-students-page
            .ant-modal {
            width:
              calc(100vw - 14px) !important;
            max-width:
              calc(100vw - 14px);
            margin: 7px auto;
          }

          .my-students-page
            .ant-modal-body {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyStudentsPage;
