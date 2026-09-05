import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Tag,
  Row,
  Col,
  Card,
  Divider,
  Typography,
  Tooltip,
  Drawer,
  Badge,
  Statistic,
  ConfigProvider,
  Empty,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  BookOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CopyOutlined,
  HeartOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import "dayjs/locale/vi";

import dailyVerseApi from "../../api/dailyVerseApi";

dayjs.locale("vi");

const { Title, Text, Paragraph } = Typography;

// =====================================================
// DESIGN SYSTEM
// =====================================================

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const DailyVerseAdmin = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [verses, setVerses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [editing, setEditing] = useState(null);
  const [viewingVerse, setViewingVerse] = useState(null);

  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchVerses = useCallback(async () => {
    try {
      setLoading(true);

      const res = await dailyVerseApi.getAll();

      const data = res?.data?.data || res?.data || [];

      setVerses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FETCH DAILY VERSES ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể tải danh sách Lời Chúa!",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerses();
  }, [fetchVerses]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredVerses = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return verses;

    return verses.filter((item) => {
      return (
        item.verse_text?.toLowerCase().includes(keyword) ||
        item.reference?.toLowerCase().includes(keyword)
      );
    });
  }, [verses, searchText]);

  // =====================================================
  // STATS
  // =====================================================

  const totalVerses = verses.length;

  //   const todayVerse = verses.length > 0;

  // =====================================================
  // CREATE
  // =====================================================

  const openCreate = () => {
    setEditing(null);

    form.resetFields();

    setOpen(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (record) => {
    setEditing(record);

    form.setFieldsValue({
      verse_text: record.verse_text || "",
      reference: record.reference || "",
    });

    setOpen(true);
  };

  // =====================================================
  // SUBMIT CREATE / UPDATE
  // =====================================================

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setSubmitting(true);

      const payload = {
        verse_text: values.verse_text.trim(),
        reference: values.reference.trim(),
      };

      if (editing) {
        await dailyVerseApi.update(editing.id, payload);

        message.success("Cập nhật Lời Chúa thành công!");
      } else {
        await dailyVerseApi.create(payload);

        message.success("Thêm Lời Chúa mới thành công!");
      }

      setOpen(false);

      form.resetFields();

      setEditing(null);

      await fetchVerses();
    } catch (error) {
      console.error("SAVE DAILY VERSE ERROR:", error);

      if (error?.errorFields) {
        return;
      }

      message.error(
        error?.response?.data?.message || "Không thể lưu Lời Chúa!",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa Lời Chúa?",
      icon: <DeleteOutlined style={{ color: "#dc2626" }} />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa câu Lời Chúa này?</p>

          <div
            style={{
              padding: 12,
              background: "#f8fafc",
              borderRadius: 8,
              marginTop: 8,
              fontStyle: "italic",
              color: "#475569",
            }}
          >
            “{record.verse_text}”
          </div>

          <div
            style={{
              marginTop: 8,
              fontWeight: 600,
              color: primaryNavy,
            }}
          >
            {record.reference}
          </div>
        </div>
      ),
      okText: "Đồng ý xóa",
      okType: "danger",
      cancelText: "Hủy thao tác",
      centered: true,

      onOk: async () => {
        try {
          await dailyVerseApi.delete(record.id);

          message.success("Đã xóa Lời Chúa!");

          await fetchVerses();
        } catch (error) {
          console.error("DELETE DAILY VERSE ERROR:", error);

          message.error(
            error?.response?.data?.message || "Không thể xóa Lời Chúa!",
          );
        }
      },
    });
  };

  // =====================================================
  // PREVIEW
  // =====================================================

  const handlePreview = (record) => {
    setViewingVerse(record);
    setPreviewOpen(true);
  };

  // =====================================================
  // COPY
  // =====================================================

  const handleCopy = async (record) => {
    try {
      const text = `“${record.verse_text}”\n— ${record.reference}`;

      await navigator.clipboard.writeText(text);

      message.success("Đã sao chép câu Lời Chúa!");
    } catch (error) {
      console.error(error);

      message.error("Không thể sao chép!");
    }
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = [
    {
      title: "Lời Chúa",
      key: "verse",
      width: "55%",

      render: (_, record) => (
        <Space align="start" size={14} style={{ width: "100%" }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: "linear-gradient(135deg, #fff8df, #fef3c7)",
              border: `1px solid rgba(212,175,55,.35)`,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              flexShrink: 0,
            }}
          >
            <BookOutlined
              style={{
                fontSize: 20,
                color: accentGold,
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Text
              strong
              style={{
                color: primaryNavy,
                fontSize: 14,
                display: "block",
                lineHeight: 1.5,
                marginBottom: 6,
              }}
            >
              {record.verse_text}
            </Text>

            <Tag
              style={{
                background: "rgba(212,175,55,.10)",
                border: `1px solid ${accentGold}`,
                color: primaryNavy,
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {record.reference || "Chưa có trích dẫn"}
            </Tag>
          </div>
        </Space>
      ),
    },

    {
      title: "Ngày thêm",
      dataIndex: "created_at",
      width: "18%",

      render: (date) => (
        <div>
          <div
            style={{
              color: primaryNavy,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <CalendarOutlined
              style={{
                marginRight: 6,
                color: accentGold,
              }}
            />

            {date ? dayjs(date).format("DD/MM/YYYY") : "--"}
          </div>

          {date && (
            <Text
              type="secondary"
              style={{
                fontSize: 11,
              }}
            >
              {dayjs(date).fromNow?.() || ""}
            </Text>
          )}
        </div>
      ),
    },

    {
      title: "Trạng thái",
      width: "12%",
      align: "center",

      render: () => (
        <Badge
          status="success"
          text={
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#15803d",
              }}
            >
              Đang sử dụng
            </span>
          }
        />
      ),
    },

    {
      title: "Thao tác",
      width: "15%",
      align: "center",

      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Space size={2}>
            <Tooltip title="Xem Lời Chúa">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EyeOutlined
                    style={{
                      color: primaryNavy,
                    }}
                  />
                }
                onClick={() => handlePreview(record)}
              />
            </Tooltip>

            <Tooltip title="Sao chép">
              <Button
                type="text"
                shape="circle"
                icon={
                  <CopyOutlined
                    style={{
                      color: "#64748b",
                    }}
                  />
                }
                onClick={() => handleCopy(record)}
              />
            </Tooltip>

            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined
                    style={{
                      color: primaryNavy,
                    }}
                  />
                }
                onClick={() => handleEdit(record)}
              />
            </Tooltip>

            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </Space>
        </div>
      ),
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily:
            "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      }}
    >
      <div className="daily-verse-admin">
        <div className="daily-verse-container">
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="daily-header">
            <div>
              <span className="sacred-badge">
                <BookOutlined />
                KHO LỜI CHÚA
              </span>

              <Title level={2} className="daily-main-title">
                LỜI CHÚA HẰNG NGÀY
              </Title>

              <Paragraph className="daily-subtitle">
                Quản lý các câu Kinh Thánh được sử dụng để hiển thị “Lời Chúa
                hôm nay” trên hệ thống.
              </Paragraph>
            </div>

            <div className="daily-header-actions">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchVerses}
                loading={loading}
                className="refresh-btn"
              >
                Làm mới
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
                className="add-verse-btn"
              >
                Thêm Lời Chúa
              </Button>
            </div>
          </div>

          {/* ================================================= */}
          {/* STATS */}
          {/* ================================================= */}

          <Row
            gutter={[16, 16]}
            style={{
              marginBottom: 24,
            }}
          >
            <Col xs={24} sm={8}>
              <Card
                bordered={false}
                className="stat-card"
                style={{
                  borderLeft: `4px solid ${primaryNavy}`,
                }}
              >
                <Statistic
                  title={
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Tổng số câu
                    </Text>
                  }
                  value={totalVerses}
                  prefix={
                    <FileTextOutlined
                      style={{
                        color: primaryNavy,
                      }}
                    />
                  }
                  valueStyle={{
                    color: primaryNavy,
                    fontWeight: 700,
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card
                bordered={false}
                className="stat-card"
                style={{
                  borderLeft: "4px solid #2e7d32",
                }}
              >
                <Statistic
                  title={
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Đang sử dụng
                    </Text>
                  }
                  value={totalVerses}
                  prefix={
                    <CheckCircleOutlined
                      style={{
                        color: "#2e7d32",
                      }}
                    />
                  }
                  valueStyle={{
                    color: "#2e7d32",
                    fontWeight: 700,
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card
                bordered={false}
                className="stat-card"
                style={{
                  borderLeft: `4px solid ${accentGold}`,
                }}
              >
                <Statistic
                  title={
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Chế độ hiển thị
                    </Text>
                  }
                  value="Random"
                  prefix={
                    <HeartOutlined
                      style={{
                        color: accentGold,
                      }}
                    />
                  }
                  valueStyle={{
                    color: primaryNavy,
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

          <Card bordered={false} className="filter-card">
            <Row gutter={[12, 12]}>
              <Col xs={24} md={18}>
                <Input
                  prefix={
                    <SearchOutlined
                      style={{
                        color: "#94a3b8",
                      }}
                    />
                  }
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Tìm kiếm theo nội dung Lời Chúa hoặc sách, chương..."
                  className="custom-filter-input"
                />
              </Col>

              <Col xs={24} md={6}>
                <div className="result-counter">
                  <FileTextOutlined />

                  <span>
                    Hiển thị <strong>{filteredVerses.length}</strong> /{" "}
                    {verses.length} câu
                  </span>
                </div>
              </Col>
            </Row>
          </Card>

          {/* ================================================= */}
          {/* TABLE */}
          {/* ================================================= */}

          <Card bordered={false} className="main-table-card">
            <Table
              columns={columns}
              dataSource={filteredVerses}
              rowKey="id"
              loading={loading}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      searchText
                        ? "Không tìm thấy câu Lời Chúa phù hợp"
                        : "Chưa có dữ liệu Lời Chúa"
                    }
                  />
                ),
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
                showTotal: (total) => `Tổng số: ${total} câu`,
                style: {
                  marginTop: 20,
                },
              }}
              onRow={(record) => ({
                onClick: () => handlePreview(record),

                style: {
                  cursor: "pointer",
                },
              })}
              scroll={{
                x: 900,
              }}
              className="custom-admin-table"
            />
          </Card>
        </div>

        {/* ================================================= */}
        {/* CREATE / UPDATE MODAL */}
        {/* ================================================= */}

        <Modal
          open={open}
          onCancel={() => {
            if (!submitting) {
              setOpen(false);
              form.resetFields();
            }
          }}
          onOk={handleSubmit}
          confirmLoading={submitting}
          centered
          width={720}
          okText={editing ? "Lưu thay đổi" : "Thêm Lời Chúa"}
          cancelText="Đóng"
          okButtonProps={{
            style: {
              background: primaryNavy,
              borderColor: primaryNavy,
              borderRadius: 8,
              height: 40,
              fontWeight: 600,
            },
          }}
          title={
            <div className="modal-title">
              <BookOutlined
                style={{
                  color: accentGold,
                }}
              />

              <span>{editing ? "CẬP NHẬT LỜI CHÚA" : "THÊM LỜI CHÚA MỚI"}</span>
            </div>
          }
        >
          <Form
            form={form}
            layout="vertical"
            style={{
              paddingTop: 16,
            }}
          >
            <Form.Item
              name="verse_text"
              label={<Text strong>Nội dung Lời Chúa *</Text>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập nội dung Lời Chúa!",
                },
              ]}
            >
              <Input.TextArea
                rows={7}
                maxLength={5000}
                showCount
                placeholder="Nhập nguyên văn câu Lời Chúa..."
                className="verse-textarea"
              />
            </Form.Item>

            <Form.Item
              name="reference"
              label={<Text strong>Tham chiếu Kinh Thánh *</Text>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tham chiếu!",
                },
              ]}
            >
              <Input
                prefix={
                  <BookOutlined
                    style={{
                      color: accentGold,
                    }}
                  />
                }
                placeholder="VD: Mt 19,14"
                maxLength={100}
              />
            </Form.Item>

            <Divider />

            <div className="verse-form-preview">
              <div className="preview-icon">
                <BookOutlined />
              </div>

              <div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  XEM TRƯỚC
                </Text>

                <Paragraph
                  style={{
                    margin: "4px 0 4px",
                    fontStyle: "italic",
                    color: textDark,
                  }}
                >
                  {form.getFieldValue("verse_text") ||
                    "Nội dung Lời Chúa sẽ hiển thị tại đây..."}
                </Paragraph>

                <Text
                  strong
                  style={{
                    color: primaryNavy,
                    fontSize: 12,
                  }}
                >
                  —{form.getFieldValue("reference") || " Tham chiếu Kinh Thánh"}
                </Text>
              </div>
            </div>
          </Form>
        </Modal>

        {/* ================================================= */}
        {/* PREVIEW DRAWER */}
        {/* ================================================= */}

        <Drawer
          title={
            <div className="drawer-title">
              <EyeOutlined
                style={{
                  color: accentGold,
                }}
              />

              <span>XEM LỜI CHÚA</span>
            </div>
          }
          width={620}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
        >
          {viewingVerse && (
            <div className="verse-preview">
              <div className="cross-symbol">✝</div>

              <div className="verse-label">
                <BookOutlined />
                LỜI CHÚA HÔM NAY
              </div>

              <div className="decorative-line">
                <span />
                <span>✦</span>
                <span />
              </div>

              <Paragraph className="big-verse">
                “{viewingVerse.verse_text}”
              </Paragraph>

              <div className="reference">— {viewingVerse.reference}</div>

              <Divider />

              <div className="preview-meta">
                <div>
                  <CalendarOutlined />

                  <span>
                    Thêm ngày{" "}
                    {viewingVerse.created_at
                      ? dayjs(viewingVerse.created_at).format("DD/MM/YYYY")
                      : "--"}
                  </span>
                </div>

                <Badge status="success" text="Đang sử dụng" />
              </div>

              <Button
                block
                icon={<CopyOutlined />}
                onClick={() => handleCopy(viewingVerse)}
                style={{
                  marginTop: 20,
                  height: 42,
                  borderRadius: 10,
                  borderColor: accentGold,
                  color: primaryNavy,
                  fontWeight: 600,
                }}
              >
                Sao chép câu Lời Chúa
              </Button>
            </div>
          )}
        </Drawer>

        {/* ================================================= */}
        {/* STYLE */}
        {/* ================================================= */}

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

              .daily-verse-admin {
                background: ${softBg};
                min-height: 100vh;
                padding: 40px 20px 80px;
                font-family: 'Be Vietnam Pro', sans-serif;
                color: ${textDark};
              }

              .daily-verse-container {
                max-width: 1100px;
                margin: 0 auto;
              }

              /* HEADER */

              .daily-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                gap: 20px;
                margin-bottom: 28px;
                flex-wrap: wrap;
              }

              .sacred-badge {
                display: inline-flex;
                align-items: center;
                gap: 7px;
                padding: 5px 14px;
                border-radius: 20px;
                background: rgba(212,175,55,.13);
                border: 1px solid ${accentGold};
                color: ${primaryNavy};
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1px;
                margin-bottom: 10px;
              }

              .daily-main-title {
                margin: 0 !important;
                color: ${primaryNavy} !important;
                font-family: 'Playfair Display', Georgia, serif !important;
                font-size: clamp(25px, 3.5vw, 34px) !important;
                font-weight: 700 !important;
              }

              .daily-subtitle {
                margin: 5px 0 0 !important;
                color: #64748b;
                font-size: 14px;
                max-width: 650px;
              }

              .daily-header-actions {
                display: flex;
                gap: 10px;
              }

              .refresh-btn {
                height: 42px !important;
                border-radius: 10px !important;
                border-color: rgba(27,54,93,.2) !important;
                color: ${primaryNavy} !important;
                font-weight: 600;
              }

              .add-verse-btn {
                height: 42px !important;
                border-radius: 10px !important;
                background: ${primaryNavy} !important;
                border-color: ${primaryNavy} !important;
                font-weight: 700 !important;
                box-shadow: 0 4px 14px rgba(27,54,93,.2);
              }

              /* STATS */

              .stat-card {
                border-radius: 16px !important;
                background: #fff !important;
                border: 1px solid rgba(27,54,93,.08) !important;
                box-shadow: 0 4px 16px rgba(27,54,93,.03) !important;
              }

              /* FILTER */

              .filter-card {
                border-radius: 16px !important;
                background: #fff !important;
                border: 1px solid rgba(27,54,93,.08) !important;
                margin-bottom: 20px;
                padding: 4px;
              }

              .custom-filter-input {
                height: 42px !important;
                border-radius: 10px !important;
              }

              .result-counter {
                height: 42px;
                border-radius: 10px;
                background: ${softBg};
                border: 1px solid #e2e8f0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                color: #64748b;
                font-size: 12px;
              }

              .result-counter svg {
                color: ${accentGold};
              }

              /* TABLE */

              .main-table-card {
                border-radius: 20px !important;
                background: #fff !important;
                border: 1px solid rgba(212,175,55,.25) !important;
                box-shadow: 0 10px 30px rgba(27,54,93,.05) !important;
                padding: 8px;
              }

              .custom-admin-table .ant-table-thead > tr > th {
                background: ${softBg} !important;
                color: ${primaryNavy} !important;
                font-weight: 700 !important;
                border-bottom: 1px solid rgba(27,54,93,.1) !important;
              }

              .custom-admin-table .ant-table-tbody > tr:hover > td {
                background: #fffdf5 !important;
              }

              .custom-admin-table .ant-table-tbody > tr > td {
                border-bottom: 1px solid #f1f5f9 !important;
              }

              /* MODAL */

              .modal-title {
                display: flex;
                align-items: center;
                gap: 9px;
                color: ${primaryNavy};
                font-family: 'Playfair Display', serif;
                font-size: 18px;
                font-weight: 700;
              }

              .verse-textarea {
                border-radius: 10px !important;
                line-height: 1.7 !important;
                resize: vertical;
              }

              .verse-form-preview {
                display: flex;
                gap: 14px;
                padding: 18px;
                border-radius: 14px;
                background: #fffdf5;
                border: 1px solid rgba(212,175,55,.25);
              }

              .preview-icon {
                width: 42px;
                height: 42px;
                border-radius: 12px;
                background: rgba(212,175,55,.15);
                color: ${accentGold};
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }

              /* DRAWER */

              .drawer-title {
                display: flex;
                align-items: center;
                gap: 9px;
                color: ${primaryNavy};
                font-family: 'Playfair Display', serif;
                font-weight: 700;
                font-size: 17px;
              }

              .verse-preview {
                min-height: 600px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 30px;
                background:
                  radial-gradient(
                    circle at center,
                    #fffdf5 0%,
                    #ffffff 65%
                  );
                border-radius: 20px;
                border: 1px solid rgba(212,175,55,.25);
              }

              .cross-symbol {
                font-size: 30px;
                color: ${accentGold};
                margin-bottom: 12px;
              }

              .verse-label {
                display: flex;
                align-items: center;
                gap: 7px;
                color: ${primaryNavy};
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 1.5px;
              }

              .decorative-line {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 180px;
                margin: 22px 0;
                color: ${accentGold};
              }

              .decorative-line span:first-child,
              .decorative-line span:last-child {
                flex: 1;
                height: 1px;
                background: rgba(212,175,55,.45);
              }

              .big-verse {
                max-width: 500px;
                text-align: center;
                color: ${textDark};
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 22px;
                line-height: 1.8;
                font-style: italic;
                margin: 0 !important;
              }

              .reference {
                margin-top: 22px;
                color: ${primaryNavy};
                font-size: 14px;
                font-weight: 700;
              }

              .preview-meta {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                color: #64748b;
                font-size: 12px;
              }

              .preview-meta > div:first-child {
                display: flex;
                align-items: center;
                gap: 6px;
              }

              .preview-meta svg {
                color: ${accentGold};
              }

              /* RESPONSIVE */

              @media (max-width: 768px) {
                .daily-verse-admin {
                  padding: 24px 12px 50px;
                }

                .daily-header {
                  align-items: flex-start;
                }

                .daily-header-actions {
                  width: 100%;
                }

                .daily-header-actions button {
                  flex: 1;
                }

                .big-verse {
                  font-size: 19px;
                }

                .verse-preview {
                  padding: 30px 18px;
                }
              }
            `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default DailyVerseAdmin;
