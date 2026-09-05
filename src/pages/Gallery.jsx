import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Image,
  Badge,
  Typography,
  Space,
  Empty,
  ConfigProvider,
  Tag,
  Button,
  Skeleton,
  Input,
  Tooltip,
  Modal,
} from "antd";
import {
  AppstoreOutlined,
  BankOutlined,
  CalendarOutlined,
  TeamOutlined,
  PictureOutlined,
  UserOutlined,
  CompassOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileImageOutlined,
  SearchOutlined,
  DownloadOutlined,
  PlaySquareOutlined,
  LeftOutlined,
  RightOutlined,
  PauseOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { getGalleryImages } from "../api/galleryApi";

const { Title, Text, Paragraph } = Typography;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const FALLBACK_IMAGE =
  "https://placehold.co/600x400/1b365d/d4af37?text=Thu+Vien+Hinh+Anh";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States cho tính năng Slideshow toàn màn hình
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_URL || "";

  const fetchGallery = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await getGalleryImages();
      const rawData = res.data?.data || res.data || [];
      const validImages = Array.isArray(rawData) ? rawData : [];
      setImages(validImages);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu kho ảnh:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Lọc ảnh theo Danh mục và Từ khóa tìm kiếm
  const filteredImages = useMemo(() => {
    return images.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const titleText = item.title || item.name || item.full_name || "";
      const matchesSearch =
        !searchKeyword ||
        titleText.toLowerCase().includes(searchKeyword.toLowerCase().trim());
      return matchesType && matchesSearch;
    });
  }, [images, typeFilter, searchKeyword]);

  // Danh mục phân loại hình ảnh khoảnh khắc
  const menuItems = [
    {
      key: "all",
      icon: <AppstoreOutlined />,
      label: "Tất cả",
      count: images.length,
    },
    {
      key: "church",
      icon: <BankOutlined />,
      label: "Giáo xứ",
      count: images.filter((i) => i.type === "church").length,
    },
    {
      key: "image",
      icon: <CalendarOutlined />,
      label: "Sự kiện",
      count: images.filter((i) => i.type === "image").length,
    },
    {
      key: "group",
      icon: <TeamOutlined />,
      label: "Hội đoàn",
      count: images.filter((i) => i.type === "group").length,
    },
    {
      key: "slide",
      icon: <PictureOutlined />,
      label: "Slide Banner",
      count: images.filter((i) => i.type === "slide").length,
    },
    {
      key: "admin",
      icon: <UserOutlined />,
      label: "Ban quản trị",
      count: images.filter((i) => i.type === "admin").length,
    },
  ];

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string" || image.trim() === "") {
      return FALLBACK_IMAGE;
    }
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads")) return `${BASE_URL}${image}`;
    return `${BASE_URL}/uploads/events/${image}`;
  };

  // Xử lý Tải xuống hình ảnh
  const handleDownload = async (e, imageUrl, title) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const cleanTitle = (title || "hinh-anh-giao-xu")
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();
      link.download = `${cleanTitle}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback mở tab mới nếu CORS chặn fetch blob trực tiếp
      window.open(imageUrl, "_blank");
    }
  };

  // Logic Slideshow tự động chạy ảnh
  useEffect(() => {
    let timer;
    if (isPlaying && slideshowOpen && filteredImages.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, slideshowOpen, filteredImages.length]);

  const openSlideshowAtIndex = (index) => {
    setCurrentIndex(index);
    setSlideshowOpen(true);
    setIsPlaying(false);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="gallery-editorial-layout">
        <div className="gallery-editorial-container">
          {/* 1. HEADER CHÍNH TIÊU ĐỀ BÁO CHÍ */}
          <div className="gallery-header-section">
            <div className="header-top-row">
              <span className="sacred-badge">
                <CompassOutlined /> LƯU TRỮ KHOẢNH KHẮC MỤC VỤ
              </span>
              <Space size={8}>
                {filteredImages.length > 0 && (
                  <Button
                    icon={<PlaySquareOutlined />}
                    onClick={() => openSlideshowAtIndex(0)}
                    className="gallery-slideshow-btn"
                  >
                    Trình chiếu
                  </Button>
                )}
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchGallery(true)}
                  loading={refreshing}
                  className="gallery-refresh-btn"
                >
                  Làm mới
                </Button>
              </Space>
            </div>
            <Title level={2} className="gallery-main-title">
              THƯ VIỆN HÌNH ẢNH GIÁO XỨ
            </Title>
            <Paragraph className="gallery-sub-title">
              Không gian lưu trữ tư liệu hình ảnh sinh hoạt, sự kiện, hội đoàn
              và các thánh lễ toàn xứ. Có thể tìm kiếm, tải xuống hoặc trình
              chiếu ảnh dễ dàng.
            </Paragraph>
          </div>

          {/* 2. THANH TÌM KIẾM & BỘ LỌC DANH MỤC */}
          <div className="filter-search-container">
            <div className="gallery-search-input-box">
              <Input
                placeholder="Tìm kiếm theo tiêu đề ảnh, sự kiện..."
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                className="custom-gallery-search"
              />
            </div>

            <div className="pill-navigation-wrapper custom-scroll">
              {menuItems.map((item) => {
                const isActive = typeFilter === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setTypeFilter(item.key)}
                    className={`pill-tab-btn ${isActive ? "active" : ""}`}
                  >
                    <span className="tab-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <Badge
                      count={item.count}
                      style={{
                        backgroundColor: isActive
                          ? accentGold
                          : "rgba(27, 54, 93, 0.08)",
                        color: isActive ? primaryNavy : "#64748b",
                        boxShadow: "none",
                        fontWeight: 700,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. HIỂN THỊ SKELETON HOẶC LƯỚI ẢNH THỰC TẾ */}
          {loading ? (
            <div className="masonry-wrapper">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="masonry-item">
                  <div
                    className="gallery-card skeleton-card-box"
                    style={{ padding: 12 }}
                  >
                    <Skeleton.Image
                      active
                      style={{
                        width: "100%",
                        height: item % 2 === 0 ? 240 : 180,
                        borderRadius: 12,
                      }}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Skeleton
                        active
                        paragraph={{ rows: 1, width: "60%" }}
                        title={false}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="empty-gallery-box">
              <Empty
                image={
                  <FileImageOutlined
                    style={{ fontSize: 60, color: "#cbd5e1" }}
                  />
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Text
                      style={{
                        color: primaryNavy,
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      Không tìm thấy hình ảnh phù hợp
                    </Text>
                    <Text style={{ color: "#94a3b8", fontSize: 13 }}>
                      Vui lòng thử lại với từ khóa tìm kiếm khác hoặc chuyển
                      sang danh mục khác.
                    </Text>
                  </Space>
                }
              />
            </div>
          ) : (
            <div className="masonry-wrapper">
              <AnimatePresence mode="popLayout">
                {filteredImages.map((item, idx) => {
                  const imageUrl = getImageUrl(item.image);
                  const isFallback = imageUrl === FALLBACK_IMAGE;
                  const itemTitle =
                    item.title ||
                    item.name ||
                    item.full_name ||
                    "Khoảnh khắc Giáo xứ";

                  return (
                    <motion.div
                      key={`${item.id || idx}-${idx}`}
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.28 }}
                      className="masonry-item"
                    >
                      <div
                        className="gallery-card"
                        onClick={() => openSlideshowAtIndex(idx)}
                      >
                        <Image
                          src={imageUrl}
                          alt={itemTitle}
                          fallback={FALLBACK_IMAGE}
                          preview={false} // Tắt preview mặc định để chuyển sang slideshow toàn màn hình hoặc click thông minh
                          style={{
                            width: "100%",
                            display: "block",
                            minHeight: 180,
                            objectFit: "cover",
                          }}
                        />

                        {/* NÚT TẢI XUỐNG NHANH GÓC TRÊN */}
                        {!isFallback && (
                          <Tooltip title="Tải xuống hình ảnh gốc">
                            <button
                              className="quick-download-badge"
                              onClick={(e) =>
                                handleDownload(e, imageUrl, itemTitle)
                              }
                            >
                              <DownloadOutlined />
                            </button>
                          </Tooltip>
                        )}

                        {/* LỚP PHỦ THÔNG TIN BÊN DƯỚI */}
                        <div className="image-overlay">
                          <div
                            style={{
                              padding: "16px 16px 12px 16px",
                              width: "100%",
                            }}
                          >
                            <Text className="overlay-image-title" ellipsis>
                              {itemTitle}
                            </Text>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Tag className="gold-category-tag">
                                {item.type
                                  ? item.type.toUpperCase()
                                  : "TƯ LIỆU"}
                              </Tag>
                              <span
                                style={{
                                  color: "#ffffff",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <EyeOutlined /> Xem ảnh
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* MODAL TRÌNH DIỄN ẢNH (SLIDESHOW / LIGHTBOX NÂNG CAO) */}
        <Modal
          open={slideshowOpen}
          onCancel={() => {
            setSlideshowOpen(false);
            setIsPlaying(false);
          }}
          footer={null}
          width="90vw"
          centered
          className="slideshow-fullscreen-modal"
          closable={true}
        >
          {filteredImages.length > 0 &&
            (() => {
              const currentItem =
                filteredImages[currentIndex] || filteredImages[0];
              const currentUrl = getImageUrl(currentItem.image);
              const currentTitle =
                currentItem.title ||
                currentItem.name ||
                currentItem.full_name ||
                "Khoảnh khắc Giáo xứ";

              return (
                <div className="slideshow-content-wrapper">
                  <div className="slideshow-main-stage">
                    <button
                      className="slide-nav-btn prev"
                      onClick={() =>
                        setCurrentIndex((prev) =>
                          prev === 0 ? filteredImages.length - 1 : prev - 1,
                        )
                      }
                    >
                      <LeftOutlined />
                    </button>

                    <div className="slide-image-container">
                      <img
                        src={currentUrl}
                        alt={currentTitle}
                        className="slideshow-active-img"
                      />
                    </div>

                    <button
                      className="slide-nav-btn next"
                      onClick={() =>
                        setCurrentIndex(
                          (prev) => (prev + 1) % filteredImages.length,
                        )
                      }
                    >
                      <RightOutlined />
                    </button>
                  </div>

                  <div className="slideshow-footer-bar">
                    <div className="slide-info-meta">
                      <Text className="slideshow-title-text">
                        {currentTitle}
                      </Text>
                      <span className="slideshow-counter">
                        Ảnh {currentIndex + 1} / {filteredImages.length}
                      </span>
                    </div>

                    <Space size={12}>
                      <Button
                        type="primary"
                        icon={
                          isPlaying ? <PauseOutlined /> : <PlaySquareOutlined />
                        }
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="slideshow-play-btn"
                      >
                        {isPlaying ? "Tạm dừng" : "Trình chiếu tự động"}
                      </Button>
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={(e) =>
                          handleDownload(e, currentUrl, currentTitle)
                        }
                        className="slideshow-download-btn"
                      >
                        Tải ảnh gốc
                      </Button>
                    </Space>
                  </div>
                </div>
              );
            })()}
        </Modal>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .gallery-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .gallery-editorial-container {
              max-width: 1200px;
              margin: 0 auto;
            }

            /* Header Section */
            .gallery-header-section {
              text-align: center;
              margin-bottom: 28px;
            }

            .header-top-row {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 12px;
              margin-bottom: 10px;
              flex-wrap: wrap;
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
            }

            .gallery-refresh-btn, .gallery-slideshow-btn {
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              height: 30px;
              border-color: rgba(212, 175, 55, 0.5);
              color: ${primaryNavy};
            }
            .gallery-slideshow-btn {
              background: rgba(27, 54, 93, 0.06);
            }
            .gallery-refresh-btn:hover, .gallery-slideshow-btn:hover {
              color: ${accentGold} !important;
              border-color: ${accentGold} !important;
            }

            .gallery-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(26px, 4vw, 36px) !important;
            }

            .gallery-sub-title {
              color: #64748b;
              margin: 8px auto 0 auto !important;
              font-size: 14px;
              max-width: 650px;
              line-height: 1.6;
            }

            /* Filter & Search Bar Container */
            .filter-search-container {
              display: flex;
              flex-direction: column;
              gap: 16px;
              margin-bottom: 36px;
              align-items: center;
            }

            .gallery-search-input-box {
              width: 100%;
              max-width: 450px;
            }

            .custom-gallery-search {
              border-radius: 24px !important;
              height: 42px;
              border: 1px solid rgba(212, 175, 55, 0.4) !important;
              box-shadow: 0 4px 12px rgba(27, 54, 93, 0.03);
            }

            /* Pill Navigation Bar */
            .pill-navigation-wrapper {
              display: flex;
              gap: 8px;
              background: #ffffff;
              padding: 6px;
              border-radius: 30px;
              border: 1px solid rgba(212, 175, 55, 0.3);
              box-shadow: 0 4px 16px rgba(27, 54, 93, 0.04);
              max-width: 100%;
              overflow-x: auto;
            }

            .pill-tab-btn {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 18px;
              border: none;
              border-radius: 24px;
              background: transparent;
              color: #64748b;
              font-weight: 600;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.25s ease;
              white-space: nowrap;
            }

            .pill-tab-btn.active {
              background: ${primaryNavy};
              color: #ffffff;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            .tab-icon {
              display: flex;
              align-items: center;
            }

            /* Pinterest Masonry Layout */
            .masonry-wrapper {
              columns: 4 260px;
              column-gap: 20px;
            }

            .masonry-item {
              margin-bottom: 20px;
              break-inside: avoid;
            }

            .gallery-card {
              position: relative;
              border-radius: 16px;
              overflow: hidden;
              cursor: pointer;
              background: #ffffff;
              border: 1px solid rgba(212, 175, 55, 0.25);
              box-shadow: 0 6px 20px rgba(27, 54, 93, 0.04);
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .skeleton-card-box {
              background: #ffffff;
              border: 1px solid rgba(212, 175, 55, 0.15);
              cursor: default;
            }
            .skeleton-card-box:hover {
              transform: none !important;
              box-shadow: 0 6px 20px rgba(27, 54, 93, 0.04) !important;
            }

            .gallery-card:hover {
              transform: translateY(-6px);
              box-shadow: 0 12px 30px rgba(27, 54, 93, 0.12);
              border-color: ${accentGold};
            }

            .gallery-card img {
              transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1) !important;
            }

            .gallery-card:hover img {
              transform: scale(1.05);
            }

            .quick-download-badge {
              position: absolute;
              top: 12px;
              right: 12px;
              background: rgba(27, 54, 93, 0.75);
              border: 1px solid ${accentGold};
              color: #ffffff;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              z-index: 3;
              opacity: 0;
              transition: all 0.2s ease;
            }
            .gallery-card:hover .quick-download-badge {
              opacity: 1;
            }
            .quick-download-badge:hover {
              background: ${primaryNavy};
              transform: scale(1.1);
            }

            .image-overlay {
              position: absolute;
              inset: 0;
              background: linear-gradient(to top, rgba(27, 54, 93, 0.9) 0%, rgba(27, 54, 93, 0.2) 60%, transparent 100%);
              display: flex;
              align-items: flex-end;
              opacity: 0;
              transition: opacity 0.3s ease;
            }

            .gallery-card:hover .image-overlay {
              opacity: 1;
            }

            .overlay-image-title {
              color: #ffffff !important;
              font-size: 15px;
              font-weight: 700;
              font-family: 'Playfair Display', serif;
              display: block;
              margin-bottom: 4px;
            }

            .gold-category-tag {
              background: rgba(212, 175, 55, 0.25) !important;
              border: 1px solid ${accentGold} !important;
              color: #ffffff !important;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 700;
              margin: 0;
            }

            .empty-gallery-box {
              padding: 80px 20px;
              background: #ffffff;
              border-radius: 20px;
              border: 1px dashed rgba(212, 175, 55, 0.4);
              text-align: center;
            }

            /* Slideshow Fullscreen Modal Styles */
            .slideshow-fullscreen-modal .ant-modal-content {
              background: #0f172a !important;
              border-radius: 20px;
              border: 1px solid rgba(212, 175, 55, 0.3);
              padding: 24px;
            }
            .slideshow-fullscreen-modal .ant-modal-close {
              color: #ffffff !important;
            }

            .slideshow-content-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 20px;
            }

            .slideshow-main-stage {
              position: relative;
              width: 100%;
              height: 65vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .slide-image-container {
              max-width: 100%;
              max-height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .slideshow-active-img {
              max-width: 100%;
              max-height: 65vh;
              object-fit: contain;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }

            .slide-nav-btn {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              background: rgba(27, 54, 93, 0.8);
              border: 1px solid ${accentGold};
              color: #ffffff;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 18px;
              transition: all 0.2s ease;
              z-index: 10;
            }
            .slide-nav-btn:hover {
              background: ${primaryNavy};
              transform: translateY(-50%) scale(1.1);
            }
            .slide-nav-btn.prev { left: 10px; }
            .slide-nav-btn.next { right: 10px; }

            .slideshow-footer-bar {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: rgba(30, 41, 59, 0.8);
              padding: 14px 20px;
              border-radius: 12px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              flex-wrap: wrap;
              gap: 12px;
            }

            .slide-info-meta {
              display: flex;
              flex-direction: column;
            }

            .slideshow-title-text {
              color: #ffffff !important;
              font-size: 16px;
              font-weight: 700;
              font-family: 'Playfair Display', serif;
            }

            .slideshow-counter {
              color: #94a3b8;
              font-size: 12px;
            }

            .slideshow-play-btn, .slideshow-download-btn {
              border-radius: 8px;
              font-weight: 600;
              height: 36px;
            }
            .slideshow-play-btn {
              background: ${primaryNavy} !important;
              border-color: ${accentGold} !important;
            }
            .slideshow-download-btn {
              background: transparent;
              color: #ffffff;
              border-color: rgba(255, 255, 255, 0.2);
            }
            .slideshow-download-btn:hover {
              color: ${accentGold} !important;
              border-color: ${accentGold} !important;
            }

            .custom-scroll::-webkit-scrollbar {
              height: 4px;
            }
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

export default Gallery;
