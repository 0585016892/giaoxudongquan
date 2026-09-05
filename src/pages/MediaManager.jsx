import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  Upload,
  message,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Typography,
  Spin,
  Image,
  ConfigProvider,
  Tabs,
  Descriptions,
  Divider,
} from "antd";

import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  EyeOutlined,
  UploadOutlined,
  CopyOutlined,
  CompassOutlined,
  UserOutlined,
  PictureOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import {
  getMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  increaseMediaView,
  searchMedia,
  getAudios,
  getVideos,
  getMediaByCategory,
  changeMediaStatus,
} from "../api/mediaApi";

import { useUser } from "../context/UserContext";

const { Title, Text } = Typography;

/* =====================================================
   STYLE SYSTEM
===================================================== */

const NAVY_DARK = "#1B2A4A";
const GOLD_ACCENT = "#D4AF37";
const GOLD_LIGHT_BG = "#FFFDF0";
const GOLD_BORDER = "#E8D8A0";
const PAGE_BG = "#F9FAFB";
const TEXT_MUTED = "#6B7280";

const CATEGORY_OPTIONS = ["Bài giảng", "Thánh ca", "Giáo lý", "Phụng vụ"];

/* =====================================================
   STATUS
===================================================== */

const STATUS_STYLES = {
  published: {
    label: "Đã xuất bản",
    bg: "#ECFDF5",
    color: "#047857",
    border: "#A7F3D0",
    dot: "#10B981",
  },

  active: {
    label: "Hoạt động",
    bg: "#EFF6FF",
    color: "#1D4ED8",
    border: "#BFDBFE",
    dot: "#3B82F6",
  },

  draft: {
    label: "Bản nháp",
    bg: "#FFFBEB",
    color: "#B45309",
    border: "#FDE68A",
    dot: "#F59E0B",
  },

  hidden: {
    label: "Đã ẩn",
    bg: "#F3F4F6",
    color: "#4B5563",
    border: "#E5E7EB",
    dot: "#9CA3AF",
  },
};

/* =====================================================
   STATUS BADGE
===================================================== */

const RenderStatusBadge = ({ status }) => {
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.draft;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 20,
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: cfg.dot,
        }}
      />

      {cfg.label}
    </div>
  );
};

/* =====================================================
   HELPERS
===================================================== */

const formatFileSize = (bytes) => {
  if (!bytes || Number(bytes) === 0) {
    return "---";
  }

  const size = Number(bytes);

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

const formatDuration = (seconds) => {
  if (!seconds || Number(seconds) === 0) {
    return "---";
  }

  const sec = Number(seconds);
  const mins = Math.floor(sec / 60);
  const remainingSecs = Math.floor(sec % 60);

  return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
};

/* =====================================================
   COMPONENT
===================================================== */

export default function MediaManager() {
  const { user } = useUser();

  const URL = process.env.REACT_APP_API_URL || "";

  const canManage = ["admin", "priest"].includes(user?.role);

  /* =====================================================
     STATES
  ===================================================== */

  const [mediaList, setMediaList] = useState([]);

  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [previewLoading, setPreviewLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("all");

  const [searchKeyword, setSearchKeyword] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);

  const [previewMedia, setPreviewMedia] = useState(null);

  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();

  const watchedType = Form.useWatch("type", form);

  /* =====================================================
     PAGINATION VALUES
     
     Tách ra để ESLint không cảnh báo dependency
  ===================================================== */

  const currentPage = pagination.current;

  const currentPageSize = pagination.pageSize;

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = useCallback(
    async ({
      page = 1,
      pageSize = 10,
      keyword = searchKeyword,
      tab = activeTab,
      status = statusFilter,
      category = categoryFilter,
    } = {}) => {
      try {
        setLoading(true);

        let res;

        const params = {
          page,
          limit: pageSize,
          status,
        };

        if (keyword && keyword.trim() !== "") {
          res = await searchMedia({
            query: keyword,
            keyword,
            ...params,
          });
        } else if (category && category !== "all") {
          res = await getMediaByCategory(category, params);
        } else if (tab === "audio") {
          res = await getAudios(params);
        } else if (tab === "video") {
          res = await getVideos(params);
        } else {
          res = await getMedia({
            ...params,
            type: "all",
            category,
          });
        }

        const responseData = res?.data?.data || res?.data || {};

        const list =
          responseData?.data || responseData?.items || responseData || [];

        const total = Number(res?.data?.total ?? responseData?.total ?? 0);

        setMediaList(Array.isArray(list) ? list : []);

        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total,
        }));
      } catch (error) {
        message.error(
          error?.response?.data?.message || "Không thể tải kho media",
        );
      } finally {
        setLoading(false);
      }
    },
    [searchKeyword, activeTab, statusFilter, categoryFilter],
  );

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadData({
      page: 1,
      pageSize: 10,
    });
  }, [loadData]);

  /* =====================================================
     TAB
  ===================================================== */

  const handleTabChange = useCallback(
    (key) => {
      setActiveTab(key);

      loadData({
        page: 1,
        pageSize: currentPageSize,
        tab: key,
      });
    },
    [loadData, currentPageSize],
  );

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = useCallback(() => {
    loadData({
      page: 1,
      pageSize: currentPageSize,
    });
  }, [loadData, currentPageSize]);

  /* =====================================================
     RESET
  ===================================================== */

  const handleReset = useCallback(() => {
    setSearchKeyword("");

    setActiveTab("all");

    setStatusFilter("all");

    setCategoryFilter("all");

    loadData({
      page: 1,
      pageSize: 10,
      keyword: "",
      tab: "all",
      status: "all",
      category: "all",
    });
  }, [loadData]);

  /* =====================================================
     TABLE PAGINATION
  ===================================================== */

  const handleTableChange = useCallback(
    (newPagination) => {
      loadData({
        page: newPagination.current,
        pageSize: newPagination.pageSize,
      });
    },
    [loadData],
  );

  /* =====================================================
     CREATE
  ===================================================== */

  const handleCreate = useCallback(() => {
    setEditing(null);

    form.resetFields();

    form.setFieldsValue({
      type: "audio",
      status: "active",
      category: "",
    });

    setModalOpen(true);
  }, [form]);

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = useCallback(
    (record) => {
      setEditing(record);

      form.setFieldsValue({
        title: record.title,
        author: record.author,
        description: record.description,
        type: record.type,
        category: record.category,
        status: record.status || "active",
      });

      setModalOpen(true);
    },
    [form],
  );

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const handleCloseModal = useCallback(() => {
    if (submitLoading) {
      return;
    }

    setModalOpen(false);

    setEditing(null);

    form.resetFields();
  }, [submitLoading, form]);

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      setSubmitLoading(true);

      const formData = new FormData();

      formData.append("title", values.title);

      formData.append("author", values.author || "");

      formData.append("description", values.description || "");

      formData.append("type", values.type);

      formData.append("category", values.category || "");

      formData.append("status", values.status);

      /* MEDIA FILE */

      if (values.mediaFile?.fileList?.length) {
        const file = values.mediaFile.fileList[0]?.originFileObj;

        if (file) {
          formData.append(values.type, file);
        }
      }

      /* THUMBNAIL */

      if (values.thumbnail?.fileList?.length) {
        const thumbnail = values.thumbnail.fileList[0]?.originFileObj;

        if (thumbnail) {
          formData.append("thumbnail", thumbnail);
        }
      }

      /* UPDATE */

      if (editing) {
        await updateMedia(editing.id, formData);

        message.success("Cập nhật media thành công");
      } else {

      /* CREATE */
        if (!values.mediaFile?.fileList?.length) {
          message.warning("Vui lòng chọn file Audio hoặc Video");

          setSubmitLoading(false);

          return;
        }

        await createMedia(formData);

        message.success("Thêm media thành công");
      }

      handleCloseModal();

      /*
       * Sau khi thêm / sửa:
       * reload trang 1
       */

      await loadData({
        page: 1,
        pageSize: 10,
      });
    } catch (error) {
      if (error?.errorFields) {
        message.warning("Vui lòng nhập đầy đủ các trường thông tin bắt buộc");
      } else {
        message.error(error?.response?.data?.message || "Không thể lưu media");
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [form, editing, handleCloseModal, loadData]);

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = useCallback(
    async (id) => {
      try {
        setLoading(true);

        await deleteMedia(id);

        message.success("Đã xóa media thành công");

        /*
         * Nếu trang hiện tại chỉ còn 1 item
         * và đang ở trang > 1
         * → quay về trang trước.
         */

        const shouldPrevious = mediaList.length === 1 && currentPage > 1;

        const targetPage = shouldPrevious ? currentPage - 1 : currentPage;

        await loadData({
          page: targetPage,
          pageSize: currentPageSize,
        });
      } catch (error) {
        message.error(error?.response?.data?.message || "Không thể xóa media");
      } finally {
        setLoading(false);
      }
    },
    [mediaList.length, currentPage, currentPageSize, loadData],
  );

  /* =====================================================
     PREVIEW
  ===================================================== */

  const handlePreview = useCallback(async (record) => {
    try {
      setPreviewLoading(true);

      setPreviewOpen(true);

      const detailRes = await getMediaById(record.id);

      const detailedData = detailRes?.data?.data || detailRes?.data || record;

      setPreviewMedia(detailedData);

      await increaseMediaView(record.id);

      setMediaList((prevList) =>
        prevList.map((item) =>
          item.id === record.id
            ? {
                ...item,
                views: Number(item.views || 0) + 1,
              }
            : item,
        ),
      );
    } catch (error) {
      setPreviewMedia(record);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  /* =====================================================
     CHANGE STATUS
  ===================================================== */

  const handleChangeStatus = useCallback(
    async (id, status) => {
      const previousStatus = mediaList.find((item) => item.id === id)?.status;

      try {
        /*
         * Optimistic UI
         */

        setMediaList((prevList) =>
          prevList.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                }
              : item,
          ),
        );

        await changeMediaStatus(id, status);

        message.success("Cập nhật trạng thái thành công");
      } catch (error) {
        /*
         * Rollback nếu API lỗi
         */

        setMediaList((prevList) =>
          prevList.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: previousStatus,
                }
              : item,
          ),
        );

        message.error(
          error?.response?.data?.message || "Lỗi khi cập nhật trạng thái",
        );
      }
    },
    [mediaList],
  );

  /* =====================================================
     COPY LINK
  ===================================================== */

  const handleCopyLink = useCallback(
    async (record) => {
      const fileUrl = record.file_url?.startsWith("http")
        ? record.file_url
        : `${URL}${record.file_url || ""}`;

      try {
        await navigator.clipboard.writeText(fileUrl);

        message.success("Đã sao chép liên kết!");
      } catch (error) {
        message.error("Không thể sao chép liên kết");
      }
    },
    [URL],
  );

  /* =====================================================
     COLUMNS
  ===================================================== */

  const columns = useMemo(
    () => [
      /* STT */

      {
        title: "STT",
        width: 60,
        align: "center",

        render: (_, __, index) => (
          <Text
            style={{
              color: TEXT_MUTED,
              fontWeight: 600,
            }}
          >
            {(currentPage - 1) * currentPageSize + index + 1}
          </Text>
        ),
      },

      /* PREVIEW */

      {
        title: "Xem trước",
        width: 80,
        align: "center",

        render: (_, record) => {
          const imgSrc = record.thumbnail_url
            ? record.thumbnail_url.startsWith("http")
              ? record.thumbnail_url
              : `${URL}${record.thumbnail_url}`
            : null;

          if (imgSrc) {
            return (
              <Image
                width={54}
                height={38}
                src={imgSrc}
                style={{
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #E5E7EB",
                }}
              />
            );
          }

          return (
            <div
              style={{
                width: 54,
                height: 38,
                borderRadius: 6,
                background: record.type === "audio" ? "#EFF6FF" : "#FFFBEB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                color: record.type === "audio" ? NAVY_DARK : GOLD_ACCENT,
                fontSize: 16,
              }}
            >
              {record.type === "audio" ? (
                <AudioOutlined />
              ) : (
                <VideoCameraOutlined />
              )}
            </div>
          );
        },
      },

      /* TITLE */

      {
        title: "Tên Media & Tác giả",
        dataIndex: "title",
        key: "title",

        render: (title, record) => (
          <div>
            <Text
              strong
              style={{
                color: NAVY_DARK,
                fontSize: 14,
                display: "block",
                marginBottom: 2,
              }}
            >
              {title}
            </Text>

            <Space
              size={4}
              style={{
                color: TEXT_MUTED,
                fontSize: 12,
              }}
            >
              <UserOutlined
                style={{
                  fontSize: 11,
                }}
              />

              <span>
                {record.author || record.uploader_name || "Chưa rõ tác giả"}
              </span>
            </Space>
          </div>
        ),
      },

      /* CATEGORY */

      {
        title: "Chuyên Mục",
        dataIndex: "category",
        width: 140,

        render: (category) =>
          category ? (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                background: "#F3F4F6",
                fontSize: 12,
                color: "#374151",
                fontWeight: 500,
              }}
            >
              {category}
            </span>
          ) : (
            <Text
              style={{
                color: "#D1D5DB",
              }}
            >
              ---
            </Text>
          ),
      },

      /* FILE INFO */

      {
        title: "Thông Số Tệp",
        dataIndex: "file_size",
        width: 130,

        render: (size, record) => (
          <Space direction="vertical" size={0}>
            <Text
              style={{
                color: "#1F2937",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {formatFileSize(size)}
            </Text>

            {record.duration > 0 && (
              <Text
                style={{
                  color: TEXT_MUTED,
                  fontSize: 11,
                }}
              >
                <ClockCircleOutlined /> {formatDuration(record.duration)}
              </Text>
            )}
          </Space>
        ),
      },

      /* STATUS */

      {
        title: "Trạng Thái",
        dataIndex: "status",
        width: 160,
        align: "center",

        render: (status, record) =>
          canManage ? (
            <Select
              value={status || "draft"}
              size="small"
              variant="borderless"
              style={{
                borderRadius: 20,
                padding: 0,
              }}
              dropdownStyle={{
                borderRadius: 10,
                padding: 4,
              }}
              onChange={(newStatus) => handleChangeStatus(record.id, newStatus)}
            >
              {Object.keys(STATUS_STYLES).map((key) => (
                <Select.Option key={key} value={key}>
                  <RenderStatusBadge status={key} />
                </Select.Option>
              ))}
            </Select>
          ) : (
            <RenderStatusBadge status={status} />
          ),
      },

      /* ACTION */

      {
        title: "Thao tác",
        width: 130,
        fixed: "right",
        align: "center",

        render: (_, record) => (
          <Space size={2}>
            <Tooltip title="Xem trước">
              <Button
                type="text"
                shape="circle"
                style={{
                  color: NAVY_DARK,
                }}
                icon={<EyeOutlined />}
                onClick={() => handlePreview(record)}
              />
            </Tooltip>

            <Tooltip title="Sao chép link">
              <Button
                type="text"
                shape="circle"
                style={{
                  color: TEXT_MUTED,
                }}
                icon={<CopyOutlined />}
                onClick={() => handleCopyLink(record)}
              />
            </Tooltip>

            {canManage && (
              <>
                <Tooltip title="Chỉnh sửa">
                  <Button
                    type="text"
                    shape="circle"
                    style={{
                      color: NAVY_DARK,
                    }}
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  />
                </Tooltip>

                <Popconfirm
                  title="Xóa tệp media này?"
                  description="Hành động này không thể hoàn tác."
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{
                    danger: true,
                  }}
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Tooltip title="Xóa">
                    <Button
                      type="text"
                      shape="circle"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>
              </>
            )}
          </Space>
        ),
      },
    ],
    [
      currentPage,
      currentPageSize,
      canManage,
      URL,
      handlePreview,
      handleCopyLink,
      handleEdit,
      handleDelete,
      handleChangeStatus,
    ],
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: NAVY_DARK,
          borderRadius: 8,
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        },
      }}
    >
      <div
        style={{
          background: PAGE_BG,
          minHeight: "100vh",
          padding: "28px 36px",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
          }}
        >
          {/* =====================================================
             HEADER
          ===================================================== */}

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <Row justify="space-between" align="bottom" gutter={[20, 20]}>
              <Col>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 14px",
                    borderRadius: 50,
                    border: `1px solid ${GOLD_BORDER}`,
                    backgroundColor: GOLD_LIGHT_BG,
                    color: "#A17C00",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    marginBottom: 10,
                  }}
                >
                  <CompassOutlined />
                  HỆ THỐNG LƯU TRỮ VÀ QUẢN LÝ TÀI NGUYÊN TRUYỀN THÔNG
                </div>

                <Title
                  level={1}
                  style={{
                    margin: 0,
                    color: NAVY_DARK,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    fontSize: 32,
                    lineHeight: 1.1,
                  }}
                >
                  KHO MEDIA
                </Title>

                <Text
                  style={{
                    color: TEXT_MUTED,
                    fontSize: 14,
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  Quản lý nội dung các bài giảng, audio thánh ca và tệp truyền
                  thông
                </Text>
              </Col>

              <Col>
                <Space size={12}>
                  <Button
                    size="large"
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    style={{
                      borderRadius: 10,
                      borderColor: "#D1D5DB",
                      fontWeight: 600,
                      color: "#374151",
                      height: 42,
                      paddingLeft: 18,
                      paddingRight: 18,
                    }}
                  >
                    Làm mới
                  </Button>

                  {canManage && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={handleCreate}
                      style={{
                        backgroundColor: NAVY_DARK,
                        borderColor: NAVY_DARK,
                        borderRadius: 10,
                        fontWeight: 600,
                        height: 42,
                        paddingLeft: 20,
                        paddingRight: 20,
                        boxShadow: "0 4px 12px rgba(27,42,74,0.2)",
                      }}
                    >
                      Soạn Nội Dung Mới
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </div>

          {/* =====================================================
             FILTER
          ===================================================== */}

          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
              marginBottom: 20,
            }}
            bodyStyle={{
              padding: "16px 20px",
            }}
          >
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={10}>
                <Input
                  size="large"
                  placeholder="Tìm tiêu đề / trích dẫn Lời Chúa..."
                  prefix={
                    <SearchOutlined
                      style={{
                        color: "#9CA3AF",
                      }}
                    />
                  }
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                  allowClear
                  style={{
                    borderRadius: 10,
                  }}
                />
              </Col>

              <Col xs={12} md={7}>
                <Select
                  size="large"
                  style={{
                    width: "100%",
                  }}
                  value={categoryFilter}
                  onChange={(val) => {
                    setCategoryFilter(val);

                    loadData({
                      page: 1,
                      pageSize: currentPageSize,
                      category: val,
                    });
                  }}
                >
                  <Select.Option value="all">Tất cả chuyên mục</Select.Option>

                  {CATEGORY_OPTIONS.map((cat) => (
                    <Select.Option key={cat} value={cat}>
                      {cat}
                    </Select.Option>
                  ))}
                </Select>
              </Col>

              <Col xs={12} md={7}>
                <Select
                  size="large"
                  style={{
                    width: "100%",
                  }}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);

                    loadData({
                      page: 1,
                      pageSize: currentPageSize,
                      status: val,
                    });
                  }}
                >
                  <Select.Option value="all">Tất cả trạng thái</Select.Option>

                  {Object.keys(STATUS_STYLES).map((key) => (
                    <Select.Option key={key} value={key}>
                      {STATUS_STYLES[key].label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>

          {/* =====================================================
             TABLE
          ===================================================== */}

          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
            }}
            bodyStyle={{
              padding: 20,
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={[
                {
                  key: "all",
                  label: "Tất cả tệp",
                },
                {
                  key: "audio",
                  label: "🎵 Audio / Thánh Ca",
                },
                {
                  key: "video",
                  label: "🎬 Video / Bài Giảng",
                },
              ]}
              style={{
                marginBottom: 12,
              }}
            />

            <Spin spinning={loading}>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={mediaList}
                scroll={{
                  x: 900,
                }}
                pagination={{
                  current: currentPage,
                  pageSize: currentPageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) => `Tổng số ${total} bản ghi`,
                }}
                onChange={handleTableChange}
                components={{
                  header: {
                    cell: (props) => (
                      <th
                        {...props}
                        style={{
                          background: "#F8FAFC",
                          color: "#334155",
                          fontWeight: 700,
                          borderBottom: "1px solid #E2E8F0",
                          paddingTop: 14,
                          paddingBottom: 14,
                        }}
                      />
                    ),
                  },
                }}
              />
            </Spin>
          </Card>
        </div>

        {/* =====================================================
           CREATE / EDIT MODAL
        ===================================================== */}

        <Modal
          title={
            <Text
              strong
              style={{
                fontSize: 17,
                color: NAVY_DARK,
              }}
            >
              {editing ? "Chỉnh sửa nội dung Media" : "Soạn tệp Media mới"}
            </Text>
          }
          open={modalOpen}
          width={620}
          centered
          destroyOnClose
          confirmLoading={submitLoading}
          onCancel={handleCloseModal}
          onOk={handleSubmit}
          okText={editing ? "Lưu thay đổi" : "Thêm mới"}
          cancelText="Hủy bỏ"
          okButtonProps={{
            style: {
              backgroundColor: NAVY_DARK,
              borderRadius: 8,
            },
          }}
        >
          <Form
            form={form}
            layout="vertical"
            style={{
              marginTop: 16,
            }}
          >
            <Form.Item
              name="title"
              label="Tiêu đề media"
              rules={[
                {
                  required: true,
                  message: "Vui lòng điền tiêu đề",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập tên bài hát, trích dẫn..."
                style={{
                  borderRadius: 8,
                }}
              />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="author" label="Tác giả / Diễn giả">
                  <Input
                    size="large"
                    placeholder="Linh mục, Ca đoàn..."
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="category" label="Chuyên mục">
                  <Select
                    size="large"
                    placeholder="Chọn chuyên mục"
                    style={{
                      borderRadius: 8,
                    }}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <Select.Option key={cat} value={cat}>
                        {cat}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Định dạng tệp"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn định dạng",
                    },
                  ]}
                >
                  <Select
                    size="large"
                    disabled={!!editing}
                    style={{
                      borderRadius: 8,
                    }}
                  >
                    <Select.Option value="audio">
                      🎵 Audio (Âm thanh)
                    </Select.Option>

                    <Select.Option value="video">
                      🎬 Video (Hình ảnh)
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    size="large"
                    style={{
                      borderRadius: 8,
                    }}
                  >
                    {Object.keys(STATUS_STYLES).map((key) => (
                      <Select.Option key={key} value={key}>
                        {STATUS_STYLES[key].label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Mô tả / Lời bài hát">
              <Input.TextArea
                rows={3}
                placeholder="Nội dung lời nhắn hoặc tóm tắt bài giảng..."
                style={{
                  borderRadius: 8,
                }}
              />
            </Form.Item>

            <Divider
              style={{
                margin: "12px 0",
              }}
            />

            <Form.Item
              name="mediaFile"
              label={`Chọn tệp ${watchedType === "video" ? "Video" : "Audio"}`}
              rules={[
                {
                  required: !editing,
                  message: "Vui lòng chọn tệp",
                },
              ]}
            >
              <Upload maxCount={1} beforeUpload={() => false}>
                <Button
                  icon={<UploadOutlined />}
                  style={{
                    borderRadius: 8,
                  }}
                >
                  Tải lên từ thiết bị
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item name="thumbnail" label="Ảnh Thumbnail (Tùy chọn)">
              <Upload maxCount={1} beforeUpload={() => false} accept="image/*">
                <Button
                  icon={<PictureOutlined />}
                  style={{
                    borderRadius: 8,
                  }}
                >
                  Chọn ảnh đại diện
                </Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* =====================================================
           PREVIEW MODAL
        ===================================================== */}

        <Modal
          open={previewOpen}
          footer={null}
          width={640}
          centered
          destroyOnClose
          onCancel={() => {
            setPreviewOpen(false);
            setPreviewMedia(null);
          }}
        >
          <Spin spinning={previewLoading}>
            {previewMedia && (
              <div
                style={{
                  paddingTop: 10,
                }}
              >
                <div
                  style={{
                    background: NAVY_DARK,
                    borderRadius: 12,
                    padding: 24,
                    textAlign: "center",
                    color: "#FFF",
                    marginBottom: 16,
                  }}
                >
                  {previewMedia.type === "audio" ? (
                    <div>
                      <Title
                        level={4}
                        style={{
                          color: "#FFF",
                          margin: "0 0 4px",
                        }}
                      >
                        {previewMedia.title}
                      </Title>

                      <Text
                        style={{
                          color: "#9CA3AF",
                          display: "block",
                          marginBottom: 16,
                        }}
                      >
                        {previewMedia.author || "Chưa có thông tin tác giả"}
                      </Text>

                      <audio
                        controls
                        autoPlay
                        style={{
                          width: "100%",
                        }}
                        src={
                          previewMedia.file_url?.startsWith("http")
                            ? previewMedia.file_url
                            : `${URL}${previewMedia.file_url || ""}`
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      <video
                        controls
                        autoPlay
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          maxHeight: 320,
                        }}
                        src={
                          previewMedia.file_url?.startsWith("http")
                            ? previewMedia.file_url
                            : `${URL}${previewMedia.file_url || ""}`
                        }
                      />

                      <Title
                        level={4}
                        style={{
                          color: "#FFF",
                          marginTop: 12,
                          marginBottom: 0,
                        }}
                      >
                        {previewMedia.title}
                      </Title>
                    </div>
                  )}
                </div>

                <Descriptions size="small" column={2} bordered>
                  <Descriptions.Item label="Chuyên mục">
                    {previewMedia.category || "---"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Lượt xem">
                    {previewMedia.views || 0}
                  </Descriptions.Item>

                  <Descriptions.Item label="Kích thước">
                    {formatFileSize(previewMedia.file_size)}
                  </Descriptions.Item>

                  <Descriptions.Item label="Trạng thái">
                    <RenderStatusBadge status={previewMedia.status} />
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </Spin>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
