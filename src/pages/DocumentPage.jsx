import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Space,
  Button,
  Typography,
  Empty,
  Spin,
  Tag,
  Modal,
  Divider,
  Form,
  Upload,
  message,
  Popconfirm,
  ConfigProvider,
  Tooltip,
  Switch,
  Pagination,
  Statistic,
} from "antd";

import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  CompassOutlined,
  CalendarOutlined,
  HddOutlined,
  StarFilled,
  FullscreenOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";

import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
} from "../api/documentApi";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const DocumentPage = () => {
  // Bảng màu Truyền Thống & Tôn Nghiêm (Option 1)
  const primaryNavy = "#1B365D"; // Xanh Đêm Navy
  const accentGold = "#D4AF37"; // Vàng Đồng Ánh Kim
  const textDark = "#1E293B";
  const softBg = "#FAFAFA";

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Bộ lọc & Tìm kiếm
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [fileFormat, setFileFormat] = useState("");
  const [sort, setSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // State Modal Xem Chi Tiết & Preview Smart
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // State Modal Thêm Mới & Chỉnh Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Kho Tài Liệu & Biểu Mẫu | Giáo xứ Đồng Quan";
    fetchDocuments();
  }, []);

  // 1. LẤY DANH SÁCH TÀI LIỆU
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await getDocuments();
      const data = res?.data?.data || res?.data || [];
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi tải danh sách tài liệu:", err);
      message.error("Không thể tải danh sách tài liệu!");
    } finally {
      setLoading(false);
    }
  };

  // 📊 TÍNH TOÁN CÁC CHỈ SỐ THỐNG KÊ (MINI DASHBOARD)
  const statsOverview = useMemo(() => {
    const totalDocs = documents.length;
    const totalDownloads = documents.reduce(
      (sum, item) => sum + (Number(item.download_count) || 0),
      0,
    );
    const totalViews = documents.reduce(
      (sum, item) => sum + (Number(item.view_count) || 0),
      0,
    );
    const featuredDocs = documents.filter((item) =>
      Boolean(item.is_featured),
    ).length;

    return { totalDocs, totalDownloads, totalViews, featuredDocs };
  }, [documents]);

  // 2. XEM CHI TIẾT TÀI LIỆU
  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await getDocumentById(id);
      const detail = res?.data?.data || res?.data || null;
      setSelectedDoc(detail);

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? { ...doc, view_count: (doc.view_count || 0) + 1 }
            : doc,
        ),
      );
    } catch (err) {
      console.error("Lỗi lấy chi tiết tài liệu:", err);
      message.error("Không thể xem chi tiết tài liệu!");
    } finally {
      setDetailLoading(false);
    }
  };

  // 3. TẢI FILE TÀI LIỆU
  const handleDownload = async (item) => {
    try {
      if (!item?.file_url) {
        message.error("Đường dẫn file không hợp lệ!");
        return;
      }

      await downloadDocument(item.id);

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === item.id
            ? { ...doc, download_count: (doc.download_count || 0) + 1 }
            : doc,
        ),
      );

      window.open(getFullFileUrl(item.file_url), "_blank");
      message.success("Đang mở file tải về...");
    } catch (err) {
      console.error("Lỗi tải xuống:", err);
      message.error("Không thể tải tài liệu này!");
    }
  };

  // 4. XÓA TÀI LIỆU
  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      message.success("Đã xóa tài liệu khỏi hệ thống!");
      if (selectedDoc?.id === id) setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      console.error("Lỗi xóa tài liệu:", err);
      message.error(err?.response?.data?.message || "Không thể xóa tài liệu!");
    }
  };

  // 5. LƯU (TẠO MỚI HOẶC CẬP NHẬT TÀI LIỆU)
  const handleSaveDocument = async (values) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("category", values.category);
      formData.append("is_featured", values.is_featured ? 1 : 0);

      const fileObj = values.file?.[0]?.originFileObj || values.file?.[0];
      if (fileObj) {
        formData.append("file", fileObj);
      }

      if (editingDoc) {
        await updateDocument(editingDoc.id, formData);
        message.success("Cập nhật thông tin tài liệu thành công!");
      } else {
        if (!fileObj) {
          message.warning("Vui lòng chọn file đính kèm khi thêm mới!");
          setSubmitting(false);
          return;
        }
        await createDocument(formData);
        message.success("Đã tải lên tài liệu mới thành công!");
      }

      setIsModalOpen(false);
      setEditingDoc(null);
      form.resetFields();
      fetchDocuments();
    } catch (err) {
      console.error("Lỗi lưu tài liệu:", err);
      message.error(err?.response?.data?.message || "Lỗi thao tác tài liệu!");
    } finally {
      setSubmitting(false);
    }
  };

  // Mở Modal Chỉnh Sửa
  const handleOpenEditModal = (item) => {
    setEditingDoc(item);
    form.setFieldsValue({
      title: item.title,
      category: item.category,
      description: item.description,
      is_featured: Boolean(item.is_featured),
    });
    setIsModalOpen(true);
  };

  // Lọc danh mục duy nhất
  const categories = useMemo(() => {
    return [...new Set(documents.map((x) => x.category).filter(Boolean))];
  }, [documents]);

  // Bộ lọc tìm kiếm, phân loại & sắp xếp
  const filteredDocuments = useMemo(() => {
    let data = [...documents];

    if (keyword) {
      const kw = keyword.toLowerCase();
      data = data.filter(
        (item) =>
          item.title?.toLowerCase().includes(kw) ||
          item.description?.toLowerCase().includes(kw) ||
          item.file_name?.toLowerCase().includes(kw),
      );
    }

    if (category) {
      data = data.filter((item) => item.category === category);
    }

    if (fileFormat) {
      data = data.filter((item) => {
        const typeStr = (item.file_type || item.file_name || "").toLowerCase();
        if (fileFormat === "pdf") return typeStr.includes("pdf");
        if (fileFormat === "word")
          return typeStr.includes("doc") || typeStr.includes("docx");
        if (fileFormat === "excel")
          return typeStr.includes("xls") || typeStr.includes("excel");
        return true;
      });
    }

    if (sort === "newest") {
      data.sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt || 0) -
          new Date(a.created_at || a.createdAt || 0),
      );
    }

    if (sort === "oldest") {
      data.sort(
        (a, b) =>
          new Date(a.created_at || a.createdAt || 0) -
          new Date(b.created_at || b.createdAt || 0),
      );
    }

    return data;
  }, [documents, keyword, category, fileFormat, sort]);

  // Danh sách hiển thị sau khi phân trang
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, currentPage]);

  // Format dung lượng Byte sang KB/MB
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "Không xác định";
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Render Icon theo định dạng File
  const renderFileIcon = (fileName, fileType) => {
    const typeStr = (fileType || fileName || "").toLowerCase();
    if (typeStr.includes("pdf")) {
      return <FilePdfOutlined style={{ fontSize: 52, color: "#e74c3c" }} />;
    }
    if (
      typeStr.includes("doc") ||
      typeStr.includes("word") ||
      typeStr.includes("docx")
    ) {
      return <FileWordOutlined style={{ fontSize: 52, color: "#2980b9" }} />;
    }
    if (
      typeStr.includes("xls") ||
      typeStr.includes("sheet") ||
      typeStr.includes("excel")
    ) {
      return <FileExcelOutlined style={{ fontSize: 52, color: "#27ae60" }} />;
    }
    if (typeStr.includes("zip") || typeStr.includes("rar")) {
      return <FileZipOutlined style={{ fontSize: 52, color: "#8e44ad" }} />;
    }
    return <FileUnknownOutlined style={{ fontSize: 52, color: accentGold }} />;
  };

  // Tạo URL đầy đủ xem file
  const getFullFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `${baseUrl}${cleanPath}`;
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 14,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="document-page-editorial-layout">
        <div className="document-container">
          {/* HEADER TRANG */}
          <div className="document-header">
            <div>
              <span className="document-tag-sacred">
                <CompassOutlined /> HỆ THỐNG LƯU TRỮ MỤC VỤ
              </span>
              <Title level={2} className="document-main-title">
                Kho Tài Liệu & Biểu Mẫu Giáo Xứ
              </Title>
              <div className="gold-accent-divider" />
              <Paragraph className="document-sub-title">
                Nơi lưu trữ các mẫu đơn hôn phối, giáo trình giáo lý, lịch phụng
                vụ và văn bản chính thức của Giáo xứ Đồng Quan.
              </Paragraph>
            </div>

            <Space wrap size="middle" style={{ marginTop: 12 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingDoc(null);
                  form.resetFields();
                  setIsModalOpen(true);
                }}
                className="add-doc-btn"
              >
                Tải Lên Tài Liệu
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchDocuments}
                className="reload-doc-btn"
              >
                Làm mới
              </Button>
            </Space>
          </div>

          {/* 📊 MINI DASHBOARD THỐNG KÊ TỔNG QUAN */}
          <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
            <Col xs={12} sm={6}>
              <Card bordered={false} className="stat-doc-card">
                <Statistic
                  title={<span className="stat-label">TỔNG TÀI LIỆU</span>}
                  value={statsOverview.totalDocs}
                  prefix={
                    <FolderOpenOutlined
                      style={{ color: accentGold, marginRight: 8 }}
                    />
                  }
                  valueStyle={{
                    color: primaryNavy,
                    fontWeight: "bold",
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card bordered={false} className="stat-doc-card">
                <Statistic
                  title={<span className="stat-label">LƯỢT TẢI VỀ</span>}
                  value={statsOverview.totalDownloads}
                  prefix={
                    <DownloadOutlined
                      style={{ color: accentGold, marginRight: 8 }}
                    />
                  }
                  valueStyle={{
                    color: primaryNavy,
                    fontWeight: "bold",
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card bordered={false} className="stat-doc-card">
                <Statistic
                  title={<span className="stat-label">LƯỢT XEM TÀI LIỆU</span>}
                  value={statsOverview.totalViews}
                  prefix={
                    <EyeOutlined
                      style={{ color: accentGold, marginRight: 8 }}
                    />
                  }
                  valueStyle={{
                    color: primaryNavy,
                    fontWeight: "bold",
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card bordered={false} className="stat-doc-card">
                <Statistic
                  title={<span className="stat-label">MỤC VỤ NỔI BẬT</span>}
                  value={statsOverview.featuredDocs}
                  prefix={
                    <StarFilled style={{ color: accentGold, marginRight: 8 }} />
                  }
                  valueStyle={{
                    color: primaryNavy,
                    fontWeight: "bold",
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* BỘ LỌC CẢI TIẾN */}
          <Card bordered={false} className="filter-card">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} lg={8}>
                <Search
                  placeholder="Tìm theo tên tài liệu, mô tả, file..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="search-input-box"
                />
              </Col>

              <Col xs={24} sm={8} lg={5}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Lọc Danh Mục"
                  allowClear
                  onChange={(val) => {
                    setCategory(val);
                    setCurrentPage(1);
                  }}
                  options={categories.map((c) => ({ value: c, label: c }))}
                />
              </Col>

              <Col xs={24} sm={8} lg={5}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Lọc Định Dạng File"
                  allowClear
                  onChange={(val) => {
                    setFileFormat(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "pdf", label: "📄 File PDF" },
                    { value: "word", label: "📝 File Word (.docx)" },
                    { value: "excel", label: "📊 File Excel (.xlsx)" },
                  ]}
                />
              </Col>

              <Col xs={24} sm={8} lg={6}>
                <Select
                  style={{ width: "100%" }}
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: "newest", label: "Mới nhất trước" },
                    { value: "oldest", label: "Cũ nhất trước" },
                  ]}
                />
              </Col>
            </Row>
          </Card>

          {/* DANH SÁCH TÀI LIỆU */}
          {loading ? (
            <div className="loading-center-box">
              <Spin size="large" tip="Đang tải danh sách tài liệu..." />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <Card bordered={false} className="empty-doc-card">
              <Empty description="Chưa có tài liệu hoặc biểu mẫu nào phù hợp với bộ lọc." />
            </Card>
          ) : (
            <>
              <Row gutter={[20, 20]}>
                {paginatedDocuments.map((item) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                    <Card
                      hoverable
                      className="doc-item-card"
                      actions={[
                        <Tooltip
                          title="Xem chi tiết & Preview"
                          key="view-tooltip"
                        >
                          <EyeOutlined
                            style={{ color: primaryNavy }}
                            onClick={() => handleViewDetail(item.id)}
                          />
                        </Tooltip>,
                        <Tooltip title="Chỉnh sửa" key="edit-tooltip">
                          <EditOutlined
                            style={{ color: "#fa8c16" }}
                            onClick={() => handleOpenEditModal(item)}
                          />
                        </Tooltip>,
                        <Tooltip title="Tải xuống" key="download-tooltip">
                          <DownloadOutlined
                            style={{ color: accentGold }}
                            onClick={() => handleDownload(item)}
                          />
                        </Tooltip>,
                        <Popconfirm
                          title="Xóa tài liệu này?"
                          description="Bạn có chắc chắn muốn xóa tài liệu này khỏi kho lưu trữ không?"
                          onConfirm={() => handleDelete(item.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                          key="delete-confirm"
                        >
                          <Tooltip title="Xóa tài liệu">
                            <DeleteOutlined style={{ color: "#ff4d4f" }} />
                          </Tooltip>
                        </Popconfirm>,
                      ]}
                    >
                      {/* Badge Nổi bật */}
                      {Boolean(item.is_featured) && (
                        <div className="featured-star-badge">
                          <StarFilled /> Nổi bật
                        </div>
                      )}

                      <div className="doc-icon-wrapper">
                        {renderFileIcon(
                          item.file_name || item.file_url,
                          item.file_type,
                        )}
                      </div>

                      <Title
                        level={5}
                        className="doc-item-title"
                        ellipsis={{ rows: 2 }}
                      >
                        {item.title}
                      </Title>

                      <Paragraph
                        type="secondary"
                        className="doc-item-desc"
                        ellipsis={{ rows: 2 }}
                      >
                        {item.description ||
                          "Tài liệu chính thức của Ban Mục vụ Giáo xứ."}
                      </Paragraph>

                      <Divider
                        style={{
                          margin: "12px 0",
                          borderColor: "rgba(212, 175, 55, 0.2)",
                        }}
                      />

                      <div className="doc-item-meta">
                        <Tag className="category-tag">
                          {item.category || "Chung"}
                        </Tag>
                        <Space size={8}>
                          <Text className="stats-tag">
                            <EyeOutlined /> {item.view_count || 0}
                          </Text>
                          <Text className="stats-tag">
                            <DownloadOutlined /> {item.download_count || 0}
                          </Text>
                        </Space>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* PHÂN TRANG */}
              {filteredDocuments.length > pageSize && (
                <div style={{ textAlign: "center", marginTop: 32 }}>
                  <Pagination
                    current={currentPage}
                    total={filteredDocuments.length}
                    pageSize={pageSize}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}

          {/* MODAL 1: XEM CHI TIẾT & SMART FILE PREVIEW */}
          <Modal
            open={!!selectedDoc}
            footer={null}
            width={880}
            onCancel={() => setSelectedDoc(null)}
            centered
            className="doc-detail-modal"
          >
            {detailLoading ? (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <Spin size="large" tip="Đang tải bản xem trước..." />
              </div>
            ) : (
              selectedDoc && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Title
                      level={3}
                      className="modal-doc-title"
                      style={{ margin: 0, textAlign: "left" }}
                    >
                      {selectedDoc.title}
                    </Title>
                    <Button
                      icon={<FullscreenOutlined />}
                      type="text"
                      onClick={() =>
                        window.open(
                          getFullFileUrl(selectedDoc.file_url),
                          "_blank",
                        )
                      }
                    >
                      Mở tab mới
                    </Button>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Space wrap>
                      <Tag className="category-tag">
                        {selectedDoc.category || "Tài liệu mục vụ"}
                      </Tag>
                      {Boolean(selectedDoc.is_featured) && (
                        <Tag color="gold">
                          <StarFilled /> Nổi bật
                        </Tag>
                      )}
                    </Space>
                  </div>

                  <Paragraph className="modal-doc-desc">
                    {selectedDoc.description ||
                      "Không có mô tả thêm cho tài liệu này."}
                  </Paragraph>

                  {/* KHUNG XEM TRƯỚC FILE THÔNG MINH */}
                  {(() => {
                    const fullUrl = getFullFileUrl(selectedDoc.file_url);
                    const typeStr = (
                      selectedDoc.file_type ||
                      selectedDoc.file_name ||
                      ""
                    ).toLowerCase();

                    if (typeStr.includes("pdf")) {
                      return (
                        <div className="pdf-preview-box">
                          <iframe
                            src={fullUrl}
                            title={selectedDoc.title}
                            width="100%"
                            height="460px"
                            style={{ border: "none", borderRadius: 10 }}
                          />
                        </div>
                      );
                    }

                    if (
                      typeStr.includes("doc") ||
                      typeStr.includes("docx") ||
                      typeStr.includes("xls") ||
                      typeStr.includes("xlsx")
                    ) {
                      const msOfficeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
                      return (
                        <div className="pdf-preview-box">
                          <iframe
                            src={msOfficeUrl}
                            title={selectedDoc.title}
                            width="100%"
                            height="460px"
                            style={{ border: "none", borderRadius: 10 }}
                          />
                        </div>
                      );
                    }

                    return (
                      <div className="non-pdf-preview-notice">
                        {renderFileIcon(
                          selectedDoc.file_name || selectedDoc.file_url,
                          selectedDoc.file_type,
                        )}
                        <Paragraph style={{ marginTop: 12, color: "#64748b" }}>
                          Định dạng file này chưa hỗ trợ xem trước trực tiếp.
                          Vui lòng nhấn nút bên dưới để tải file về máy.
                        </Paragraph>
                      </div>
                    );
                  })()}

                  <div className="modal-meta-grid" style={{ marginTop: 20 }}>
                    <div className="meta-grid-item">
                      <HddOutlined style={{ color: accentGold }} />
                      <Text>
                        Tên file:{" "}
                        <strong style={{ wordBreak: "break-all" }}>
                          {selectedDoc.file_name || "Tài liệu"}
                        </strong>
                      </Text>
                    </div>
                    <div className="meta-grid-item">
                      <HddOutlined style={{ color: accentGold }} />
                      <Text>
                        Dung lượng:{" "}
                        <strong>{formatFileSize(selectedDoc.file_size)}</strong>
                      </Text>
                    </div>
                    <div className="meta-grid-item">
                      <CalendarOutlined style={{ color: accentGold }} />
                      <Text>
                        Ngày đăng:{" "}
                        <strong>
                          {selectedDoc.created_at
                            ? new Date(
                                selectedDoc.created_at,
                              ).toLocaleDateString("vi-VN")
                            : "—"}
                        </strong>
                      </Text>
                    </div>
                    <div className="meta-grid-item">
                      <EyeOutlined style={{ color: accentGold }} />
                      <Text>
                        Lượt xem:{" "}
                        <strong>{selectedDoc.view_count || 0} lượt</strong>
                      </Text>
                    </div>
                  </div>

                  <Divider style={{ borderColor: "rgba(212, 175, 55, 0.2)" }} />

                  <Button
                    type="primary"
                    block
                    size="large"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(selectedDoc)}
                    className="modal-download-btn"
                  >
                    TẢI XUỐNG TÀI LIỆU NÀY
                  </Button>
                </div>
              )
            )}
          </Modal>

          {/* MODAL 2: THÊM MỚI / CHỈNH SỬA TÀI LIỆU */}
          <Modal
            title={
              <span className="modal-header-title">
                {editingDoc
                  ? "Chỉnh Sửa Thông Tin Tài Liệu"
                  : "Tải Lên Tài Liệu / Biểu Mẫu Mới"}
              </span>
            }
            open={isModalOpen}
            footer={null}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingDoc(null);
              form.resetFields();
            }}
            centered
            width={580}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveDocument}
              style={{ marginTop: 16 }}
            >
              <Form.Item
                label={
                  <span className="field-label">Tên tiêu đề tài liệu *</span>
                }
                name="title"
                rules={[
                  { required: true, message: "Vui lòng nhập tên tài liệu!" },
                ]}
              >
                <Input placeholder="Ví dụ: Đơn xin học Giáo lý Hôn nhân 2026" />
              </Form.Item>

              <Form.Item
                label={<span className="field-label">Danh mục tài liệu *</span>}
                name="category"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn hoặc nhập danh mục!",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  showSearch
                  options={[
                    { value: "Thông báo Giáo xứ", label: "Thông báo Giáo xứ" },
                    { value: "Giáo lý Hôn nhân", label: "Giáo lý Hôn nhân" },
                    { value: "Giáo lý Dự tòng", label: "Giáo lý Dự tòng" },
                    { value: "Biểu mẫu Hôn phối", label: "Biểu mẫu Hôn phối" },
                    { value: "Lịch Phụng Vụ", label: "Lịch Phụng Vụ" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span className="field-label">Đánh dấu Nổi bật</span>}
                name="is_featured"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Nổi bật"
                  unCheckedChildren="Bình thường"
                />
              </Form.Item>

              <Form.Item
                label={<span className="field-label">Mô tả chi tiết</span>}
                name="description"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Ghi chú thêm về tài liệu (đối tượng sử dụng, lưu ý khi điền...)"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="field-label">
                    {editingDoc
                      ? "Thay đổi file đính kèm mới (Để trống nếu giữ file cũ)"
                      : "File đính kèm (PDF, Word, Excel, ZIP) *"}
                  </span>
                }
                name="file"
                valuePropName="fileList"
                getValueFromEvent={(e) =>
                  Array.isArray(e) ? e : e && e.fileList
                }
                rules={
                  editingDoc
                    ? []
                    : [
                        {
                          required: true,
                          message: "Vui lòng chọn file đính kèm!",
                        },
                      ]
                }
              >
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button icon={<UploadOutlined />}>
                    Chọn File từ máy tính
                  </Button>
                </Upload>
              </Form.Item>

              <div style={{ textAlign: "right", marginTop: 24 }}>
                <Space>
                  <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    className="add-doc-btn"
                  >
                    {editingDoc ? "Cập Nhật Tài Liệu" : "Tải Lên Kho Lưu Trữ"}
                  </Button>
                </Space>
              </div>
            </Form>
          </Modal>
        </div>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

          .document-page-editorial-layout {
            background: ${softBg};
            min-height: 100vh;
            padding: 60px 16px 80px 16px;
            font-family: 'Be Vietnam Pro', sans-serif;
            color: ${textDark};
          }

          .document-container {
            max-width: 1140px;
            margin: 0 auto;
          }

          .document-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 28px;
          }

          .document-tag-sacred {
            background: rgba(212, 175, 55, 0.15);
            border: 1px solid ${accentGold};
            color: ${primaryNavy};
            padding: 6px 18px;
            border-radius: 30px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }

          .document-main-title {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: clamp(28px, 4.5vw, 38px) !important;
            font-weight: 700 !important;
            color: ${primaryNavy} !important;
            margin: 0 !important;
          }

          .gold-accent-divider {
            width: 60px;
            height: 3px;
            background: ${accentGold};
            margin: 12px 0;
            border-radius: 2px;
          }

          .document-sub-title {
            font-size: 15px;
            color: #64748b;
            max-width: 620px;
            margin: 0 !important;
            line-height: 1.6;
          }

          /* Stat Cards */
          .stat-doc-card {
            border-radius: 16px !important;
            background: #ffffff !important;
            border: 1px solid rgba(212, 175, 55, 0.25) !important;
            box-shadow: 0 4px 20px rgba(27, 54, 93, 0.04) !important;
            transition: all 0.3s ease !important;
            height: 100%;
          }

          .stat-doc-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(27, 54, 93, 0.1) !important;
            border-color: ${accentGold} !important;
          }

          .stat-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #64748b;
            display: block;
          }

          .add-doc-btn {
            background: ${primaryNavy} !important;
            border-color: ${primaryNavy} !important;
            font-weight: 700 !important;
            border-radius: 10px !important;
            height: 42px !important;
            box-shadow: 0 4px 12px rgba(27, 54, 93, 0.2);
          }

          .reload-doc-btn {
            border-radius: 10px !important;
            height: 42px !important;
            font-weight: 600;
          }

          /* Filter Card */
          .filter-card {
            border-radius: 20px !important;
            border: 1px solid rgba(212, 175, 55, 0.25) !important;
            background: #ffffff !important;
            box-shadow: 0 4px 20px rgba(27, 54, 93, 0.04) !important;
            margin-bottom: 30px;
            padding: 6px;
          }

          .search-input-box {
            border-radius: 10px !important;
          }

          .loading-center-box {
            text-align: center;
            padding: 80px 0;
          }

          .empty-doc-card {
            border-radius: 20px !important;
            padding: 60px 20px;
            border: 1px solid rgba(212, 175, 55, 0.25) !important;
          }

          /* Doc Item Card */
          .doc-item-card {
            border-radius: 16px !important;
            border: 1px solid rgba(212, 175, 55, 0.25) !important;
            background: #ffffff !important;
            box-shadow: 0 6px 20px rgba(27, 54, 93, 0.05) !important;
            transition: all 0.3s ease !important;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
          }

          .doc-item-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 28px rgba(27, 54, 93, 0.12) !important;
            border-color: ${accentGold} !important;
          }

          .featured-star-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(212, 175, 55, 0.2);
            border: 1px solid ${accentGold};
            color: ${primaryNavy};
            font-size: 10px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 10px;
          }

          .doc-icon-wrapper {
            text-align: center;
            padding: 20px 0 12px 0;
          }

          .doc-item-title {
            font-family: 'Playfair Display', Georgia, serif !important;
            color: ${primaryNavy} !important;
            font-weight: 700 !important;
            margin-bottom: 6px !important;
            min-height: 44px;
          }

          .doc-item-desc {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 0 !important;
            min-height: 38px;
          }

          .doc-item-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .category-tag {
            background: rgba(212, 175, 55, 0.15) !important;
            border: 1px solid ${accentGold} !important;
            color: ${primaryNavy} !important;
            font-weight: 700;
            border-radius: 12px;
          }

          .stats-tag {
            font-size: 12px;
            color: #64748b;
          }

          /* Modal Detail & PDF Box */
          .modal-doc-title {
            font-family: 'Playfair Display', Georgia, serif !important;
            color: ${primaryNavy} !important;
            font-weight: 700 !important;
          }

          .modal-doc-desc {
            font-size: 14px;
            line-height: 1.6;
            color: ${textDark};
            background: ${softBg};
            padding: 12px 16px;
            border-radius: 10px;
            border-left: 4px solid ${accentGold};
            margin-bottom: 16px !important;
          }

          .pdf-preview-box {
            background: #0f172a;
            border-radius: 12px;
            padding: 4px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          }

          .non-pdf-preview-notice {
            text-align: center;
            padding: 30px 20px;
            background: ${softBg};
            border-radius: 12px;
            border: 1px dashed rgba(212, 175, 55, 0.4);
          }

          .modal-meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            background: ${softBg};
            padding: 16px;
            border-radius: 12px;
            border: 1px solid rgba(27, 54, 93, 0.08);
          }

          .meta-grid-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
          }

          .modal-download-btn {
            height: 48px !important;
            border-radius: 12px !important;
            background: ${primaryNavy} !important;
            font-weight: 700 !important;
            box-shadow: 0 6px 20px rgba(27, 54, 93, 0.2);
          }

          .modal-header-title {
            font-family: 'Playfair Display', Georgia, serif;
            color: ${primaryNavy};
            font-weight: 700;
            font-size: 18px;
          }

          .field-label {
            font-size: 13px;
            color: ${primaryNavy};
            font-weight: 600;
          }

          @media (max-width: 576px) {
            .document-page-editorial-layout { padding: 40px 12px; }
            .modal-meta-grid { grid-template-columns: 1fr; }
          }
        `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default DocumentPage;
