import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";

import {
  CheckCircleFilled,
  CompassOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  PictureOutlined,
  PlusOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  UnlockOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";

import PageHeroHeader from "../components/common/PageHeroHeader";
import { useChurch } from "../hooks/useChurch";
import axios from "../api/axios";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ======================================================
// DESIGN SYSTEM
// ======================================================

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";
const successGreen = "#2E7D32";
const dangerRed = "#C62828";
const warningOrange = "#D97706";

const defaultCenter = {
  lat: 21.0285,
  lng: 105.8542,
};

// ======================================================
// LEAFLET MARKER FIX
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// ======================================================
// CHANGE MAP VIEW
// ======================================================

function ChangeView({ lat, lng, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (
      lat !== undefined &&
      lng !== undefined &&
      lat !== null &&
      lng !== null
    ) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);

  return null;
}

// ======================================================
// CHURCH PAGE
// ======================================================

const ChurchPage = () => {
  // ====================================================
  // ANT DESIGN MESSAGE
  // ====================================================

  const [messageApi, contextHolder] = message.useMessage();

  // ====================================================
  // API
  // ====================================================

  const {
    fetchChurches,
    addChurch,
    editChurch,
    removeChurch,
    toggleActive,
    activateLicense,
  } = useChurch();

  const [form] = Form.useForm();

  // ====================================================
  // STATE
  // ====================================================

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // CREATE / EDIT
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // MAP
  const [marker, setMarker] = useState(defaultCenter);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapStyle, setMapStyle] = useState("street");

  // IMAGE
  const [fileList, setFileList] = useState([]);
  const [imageTab, setImageTab] = useState("file");
  const [previewImage, setPreviewImage] = useState("");

  // LICENSE
  const [activatingId, setActivatingId] = useState(null);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [activateChurch, setActivateChurch] = useState(null);

  // ====================================================
  // CURRENT USER
  // ====================================================

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");

      if (!raw) {
        return null;
      }

      return JSON.parse(raw);
    } catch (error) {
      console.error("Parse current user error:", error);
      return null;
    }
  }, []);

  const isSystemAdmin = currentUser?.role === "admin";

  // ====================================================
  // IMAGE URL
  // ====================================================

  const getImageUrl = useCallback((imagePath) => {
    if (
      !imagePath ||
      typeof imagePath !== "string" ||
      imagePath.trim() === ""
    ) {
      return null;
    }

    const cleanImagePath = imagePath.trim();

    // URL đầy đủ
    if (
      cleanImagePath.startsWith("http://") ||
      cleanImagePath.startsWith("https://")
    ) {
      return cleanImagePath;
    }

    // CRA
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    // Bỏ /api ở cuối
    const serverBase = apiUrl.replace(/\/api\/?$/, "");

    const cleanPath = cleanImagePath.startsWith("/")
      ? cleanImagePath
      : `/${cleanImagePath}`;

    return `${serverBase}${cleanPath}`;
  }, []);

  // ====================================================
  // LOAD DATA
  // ====================================================

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetchChurches();

      const rows = res?.data?.data || res?.data || res || [];

      console.log("CHURCH DATA:", rows);

      setData(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("Lỗi tải danh sách giáo xứ:", error);

      messageApi.error(
        error?.response?.data?.message || "Không gọi được dữ liệu từ Server!",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchChurches, messageApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ====================================================
  // REVERSE GEOCODE
  // ====================================================

  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        const res = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          {
            params: {
              lat,
              lon: lng,
              format: "json",
              addressdetails: 1,
            },

            headers: {
              Accept: "application/json",
            },
          },
        );

        const addr = res.data?.address || {};

        form.setFieldsValue({
          address: res.data?.display_name || "",
          latitude: lat,
          longitude: lng,

          district:
            addr.suburb ||
            addr.district ||
            addr.county ||
            addr.city_district ||
            "",

          ward: addr.quarter || addr.suburb || addr.village || addr.town || "",
        });
      } catch (error) {
        console.error("Reverse geocode error:", error);
      }
    },
    [form],
  );

  // ====================================================
  // SEARCH LOCATION
  // ====================================================

  const handleSearchLocation = useCallback(
    async (value) => {
      if (!value?.trim()) {
        messageApi.warning("Vui lòng nhập địa điểm cần tìm.");

        return;
      }

      try {
        const res = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: value,
              format: "json",
              limit: 1,
              addressdetails: 1,
            },

            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!res.data?.length) {
          messageApi.warning("Không tìm thấy địa điểm yêu cầu.");

          return;
        }

        const result = res.data[0];

        const newPos = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        };

        setMapCenter(newPos);
        setMarker(newPos);

        await reverseGeocode(newPos.lat, newPos.lng);

        messageApi.success("Đã định vị địa điểm.");
      } catch (error) {
        console.error("Search location error:", error);

        messageApi.error("Lỗi trong quá trình tìm kiếm tọa độ!");
      }
    },
    [messageApi, reverseGeocode],
  );

  // ====================================================
  // MAP MARKER
  // ====================================================

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        setMarker(e.latlng);

        reverseGeocode(lat, lng);
      },
    });

    return <Marker position={marker} />;
  };

  // ====================================================
  // OPEN CREATE / EDIT MODAL
  // ====================================================

  const openModal = useCallback(
    (item = null) => {
      setEditingItem(item);

      setFileList([]);
      setPreviewImage("");
      setImageTab("file");

      if (item) {
        const pos = {
          lat: Number(item.latitude) || defaultCenter.lat,

          lng: Number(item.longitude) || defaultCenter.lng,
        };

        form.setFieldsValue({
          ...item,

          is_active: item.is_active === 1 || item.is_active === true,
        });

        setMarker(pos);
        setMapCenter(pos);

        if (item.image) {
          const imageUrl = getImageUrl(item.image);

          setPreviewImage(imageUrl);

          if (
            item.image.startsWith("http://") ||
            item.image.startsWith("https://")
          ) {
            setImageTab("url");
          }
        }
      } else {
        form.resetFields();

        form.setFieldsValue({
          type: "GIAO_HO",
          is_active: true,
        });

        setMarker(defaultCenter);
        setMapCenter(defaultCenter);
      }

      setIsModalOpen(true);
    },
    [form, getImageUrl],
  );

  // ====================================================
  // CLOSE CREATE / EDIT MODAL
  // ====================================================

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);

    setFileList([]);
    setPreviewImage("");
    setImageTab("file");

    form.resetFields();
  }, [form]);

  // ====================================================
  // SAVE CHURCH
  // ====================================================

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      formData.set("is_active", values.is_active ? "1" : "0");

      // FILE IMAGE
      if (imageTab === "file" && fileList.length > 0) {
        const file = fileList[0]?.originFileObj;

        if (file) {
          formData.append("image", file);
        }
      }

      // IMAGE URL
      if (imageTab === "url" && values.image) {
        formData.set("image", values.image);
      }

      if (editingItem) {
        await editChurch(editingItem.id, formData);

        messageApi.success("Cập nhật hồ sơ cơ sở thành công!");
      } else {
        await addChurch(formData);

        messageApi.success("Thêm cơ sở mới thành công!");
      }

      closeModal();

      await loadData();
    } catch (error) {
      console.error("SAVE CHURCH ERROR:", error);

      if (error?.errorFields) {
        messageApi.warning(
          "Vui lòng kiểm tra lại các trường thông tin bắt buộc!",
        );
      } else {
        messageApi.error(
          error?.response?.data?.message || "Không thể lưu hồ sơ cơ sở.",
        );
      }
    }
  }, [
    addChurch,
    closeModal,
    editChurch,
    editingItem,
    fileList,
    form,
    imageTab,
    loadData,
    messageApi,
  ]);

  // ====================================================
  // OPEN LICENSE MODAL
  // ====================================================

  const openActivateModal = useCallback(
    (church) => {
      if (!isSystemAdmin) {
        messageApi.error(
          "Chỉ quản trị hệ thống mới có quyền kích hoạt FaithEdu.",
        );

        return;
      }

      if (church?.license_status === "active") {
        messageApi.info("FaithEdu của cơ sở này đã được kích hoạt.");

        return;
      }

      setActivateChurch(church);
      setActivateModalOpen(true);
    },
    [isSystemAdmin, messageApi],
  );

  // ====================================================
  // CLOSE LICENSE MODAL
  // ====================================================

  const closeActivateModal = useCallback(() => {
    if (activatingId) {
      return;
    }

    setActivateModalOpen(false);
    setActivateChurch(null);
  }, [activatingId]);

  // ====================================================
  // ACTIVATE LICENSE
  // ====================================================

  const handleActivateLicense = useCallback(async () => {
    if (!activateChurch) {
      return;
    }

    const churchId = activateChurch.id;

    try {
      setActivatingId(churchId);

      const res = await activateLicense(churchId);

      if (res?.success) {
        messageApi.success(res?.message || "Kích hoạt FaithEdu thành công!");

        setActivateModalOpen(false);
        setActivateChurch(null);

        await loadData();
      } else {
        messageApi.error(res?.message || "Không thể kích hoạt FaithEdu.");
      }
    } catch (error) {
      console.error("ACTIVATE LICENSE ERROR:", error);

      const status = error?.response?.status;

      const code = error?.response?.data?.code;

      if (
        status === 403 ||
        code === "SYSTEM_ADMIN_ONLY" ||
        code === "LICENSE_ACTIVATION_FORBIDDEN"
      ) {
        messageApi.error(
          "Chỉ quản trị hệ thống mới có quyền kích hoạt FaithEdu.",
        );
      } else if (code === "LICENSE_ALREADY_ACTIVE") {
        messageApi.info("License này đã được kích hoạt.");

        await loadData();
      } else {
        messageApi.error(
          error?.response?.data?.message || "Không thể kích hoạt FaithEdu.",
        );
      }
    } finally {
      setActivatingId(null);
    }
  }, [activateChurch, activateLicense, loadData, messageApi]);

  // ====================================================
  // LICENSE STATUS
  // ====================================================

  const renderLicense = useCallback(
    (church) => {
      const status = church.license_status || "trial";

      // ==================================================
      // ACTIVE
      // ==================================================

      if (status === "active") {
        return (
          <Space direction="vertical" size={2} align="center">
            <Tag
              icon={<CheckCircleFilled />}
              color="success"
              style={{
                borderRadius: 20,
                fontWeight: 700,
                margin: 0,
              }}
            >
              ĐANG HOẠT ĐỘNG
            </Tag>

            <Text
              type="secondary"
              style={{
                fontSize: 10,
              }}
            >
              Không giới hạn
            </Text>
          </Space>
        );
      }

      // ==================================================
      // EXPIRED
      // ==================================================

      if (status === "expired") {
        return (
          <Space direction="vertical" size={4} align="center">
            <Tag
              icon={<LockOutlined />}
              color="error"
              style={{
                borderRadius: 20,
                fontWeight: 700,
                margin: 0,
              }}
            >
              ĐÃ HẾT HẠN
            </Tag>

            {isSystemAdmin && (
              <Button
                size="small"
                type="primary"
                icon={<UnlockOutlined />}
                loading={activatingId === church.id}
                onClick={() => openActivateModal(church)}
                style={{
                  background: primaryNavy,
                  borderColor: primaryNavy,
                  borderRadius: 7,
                  fontSize: 11,
                }}
              >
                Kích hoạt
              </Button>
            )}
          </Space>
        );
      }

      // ==================================================
      // TRIAL
      // ==================================================

      const days = Number(church.days_remaining ?? 0);

      let color = "processing";

      if (days <= 3) {
        color = "error";
      } else if (days <= 7) {
        color = "warning";
      }

      return (
        <Space direction="vertical" size={3} align="center">
          <Tag
            color={color}
            style={{
              borderRadius: 20,
              fontWeight: 700,
              margin: 0,
            }}
          >
            TRIAL
          </Tag>

          <Text
            strong
            style={{
              fontSize: 11,
              color:
                days <= 3 ? dangerRed : days <= 7 ? warningOrange : primaryNavy,
            }}
          >
            Còn {days} ngày
          </Text>

          {isSystemAdmin && (
            <Button
              size="small"
              type="link"
              icon={<UnlockOutlined />}
              loading={activatingId === church.id}
              onClick={() => openActivateModal(church)}
              style={{
                padding: 0,
                height: "auto",
                fontSize: 11,
                color: primaryNavy,
              }}
            >
              Kích hoạt ngay
            </Button>
          )}
        </Space>
      );
    },
    [activatingId, isSystemAdmin, openActivateModal],
  );

  // ====================================================
  // TABLE COLUMNS
  // ====================================================

  const columns = useMemo(
    () => [
      {
        title: "Hình ảnh",
        key: "image",
        width: 90,
        align: "center",

        render: (_, record) => {
          const url = getImageUrl(record.image);

          if (url) {
            return (
              <Image
                src={url}
                alt={record.name}
                width={54}
                height={54}
                style={{
                  objectFit: "cover",
                  borderRadius: 10,
                }}
                preview
              />
            );
          }

          return (
            <Avatar
              shape="square"
              size={54}
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.12)",
                color: primaryNavy,
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: 10,
              }}
              icon={
                <HomeOutlined
                  style={{
                    fontSize: 24,
                  }}
                />
              }
            />
          );
        },
      },

      {
        title: "Cơ sở Giáo phận",
        key: "church_info",
        width: 280,

        render: (_, record) => (
          <Space size="middle">
            <Badge
              count={record.type === "GIAO_XU" ? "Xứ" : "Họ"}
              style={{
                backgroundColor:
                  record.type === "GIAO_XU" ? primaryNavy : "#475569",
                color: "#fff",
                fontWeight: 700,
                fontSize: 10,
                boxShadow: "none",
              }}
            />

            <div>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: primaryNavy,
                }}
              >
                {record.name}
              </Text>

              <div style={{ marginTop: 3 }}>
                <Tag className="gold-code-tag">
                  <GlobalOutlined
                    style={{
                      marginRight: 4,
                    }}
                  />

                  {record.code || "N/A"}
                </Tag>
              </div>
            </div>
          </Space>
        ),
      },

      {
        title: "Quản lý & Liên hệ",
        key: "management",
        width: 230,

        render: (_, record) => (
          <Space
            direction="vertical"
            size={3}
            style={{
              fontSize: 13,
            }}
          >
            <div>
              <UserOutlined
                style={{
                  color: primaryNavy,
                  marginRight: 6,
                }}
              />
              <Text type="secondary">LM:</Text>{" "}
              <b
                style={{
                  color: primaryNavy,
                }}
              >
                {record.pastor_name || "Chưa có"}
              </b>
            </div>

            <div>
              <PhoneOutlined
                style={{
                  color: primaryNavy,
                  marginRight: 6,
                }}
              />

              {record.phone ? (
                <a
                  href={`tel:${record.phone}`}
                  style={{
                    color: primaryNavy,
                    fontWeight: 600,
                  }}
                >
                  {record.phone}
                </a>
              ) : (
                <Text type="secondary" italic>
                  —
                </Text>
              )}
            </div>

            {record.email && (
              <div>
                <MailOutlined
                  style={{
                    color: primaryNavy,
                    marginRight: 6,
                  }}
                />

                <Text
                  ellipsis
                  style={{
                    maxWidth: 170,
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                >
                  {record.email}
                </Text>
              </div>
            )}
          </Space>
        ),
      },

      {
        title: "Địa chỉ mục vụ",
        dataIndex: "address",

        ellipsis: {
          showTitle: true,
        },

        render: (text) => (
          <Tooltip title={text}>
            <Text
              style={{
                color: "#64748b",
                fontSize: 13,
              }}
            >
              {text || "Chưa xác định"}
            </Text>
          </Tooltip>
        ),
      },

      {
        title: "Giáo dân",
        dataIndex: "total_parishioners",
        width: 100,
        align: "center",

        render: (value) => (
          <Tag
            style={{
              borderRadius: 20,
              borderColor: "rgba(27,54,93,.15)",
              color: primaryNavy,
              background: "rgba(27,54,93,.05)",
              fontWeight: 700,
            }}
          >
            {Number(value || 0).toLocaleString("vi-VN")}
          </Tag>
        ),
      },

      {
        title: "FaithEdu",
        key: "license",
        width: 150,
        align: "center",

        render: (_, record) => renderLicense(record),
      },

      {
        title: "Trạng thái",
        dataIndex: "is_active",
        align: "center",
        width: 120,

        render: (value, record) => {
          const active = value === 1 || value === true;

          return (
            <Space direction="vertical" size={2} align="center">
              <Switch
                size="small"
                checked={active}
                onChange={async () => {
                  try {
                    await toggleActive(record.id);

                    await loadData();
                  } catch (error) {
                    messageApi.error(
                      error?.response?.data?.message ||
                        "Không thể cập nhật trạng thái.",
                    );
                  }
                }}
              />

              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: active ? successGreen : "#94a3b8",
                }}
              >
                {active ? "HOẠT ĐỘNG" : "ẨN CƠ SỞ"}
              </span>
            </Space>
          );
        },
      },

      {
        title: "Thao tác",
        align: "center",
        width: 110,

        render: (_, record) => (
          <Space size="small">
            <Tooltip title="Chỉnh sửa thông tin">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined
                    style={{
                      color: primaryNavy,
                      fontSize: 16,
                    }}
                  />
                }
                onClick={() => openModal(record)}
                className="action-btn-edit"
              />
            </Tooltip>

            <Popconfirm
              title="Xác nhận gỡ bỏ cơ sở này?"
              description="Tất cả dữ liệu liên quan có thể bị ảnh hưởng."
              okText="Xóa dữ liệu"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
              }}
              onConfirm={async () => {
                try {
                  await removeChurch(record.id);

                  messageApi.success("Đã xóa cơ sở.");

                  await loadData();
                } catch (error) {
                  messageApi.error(
                    error?.response?.data?.message || "Không thể xóa cơ sở.",
                  );
                }
              }}
            >
              <Tooltip title="Xóa cơ sở">
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={
                    <DeleteOutlined
                      style={{
                        fontSize: 16,
                      }}
                    />
                  }
                  className="action-btn-delete"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [
      getImageUrl,
      loadData,
      messageApi,
      openModal,
      removeChurch,
      renderLicense,
      toggleActive,
    ],
  );
  // ====================================================
  // SUMMARY
  // ====================================================

  const summary = useMemo(() => {
    const total = data.length;

    const active = data.filter(
      (item) => item.license_status === "active",
    ).length;

    const trial = data.filter((item) => item.license_status === "trial").length;

    const expired = data.filter(
      (item) => item.license_status === "expired",
    ).length;

    return {
      total,
      active,
      trial,
      expired,
    };
  }, [data]);

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <>
      {contextHolder}

      <ConfigProvider
        theme={{
          token: {
            colorPrimary: primaryNavy,
            borderRadius: 12,
            colorBgLayout: softBg,

            fontFamily:
              "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif",
          },

          components: {
            Table: {
              headerBg: softBg,
              headerColor: primaryNavy,
            },

            Button: {
              controlHeight: 40,
            },
          },
        }}
      >
        <div className="church-editorial-layout">
          <div className="church-editorial-container">
            {/* ==================================================
                HEADER
            ================================================== */}

            <PageHeroHeader
              badge="HỆ THỐNG QUẢN LÝ ĐỊA GIỚI MỤC VỤ"
              title="DANH MỤC GIÁO XỨ & GIÁO HỌ"
              description="Thiết lập hệ thống phân cấp các cơ sở nhà thờ, thông tin mục vụ, hình ảnh, tọa độ và trạng thái sử dụng FaithEdu."
              onRefresh={loadData}
              refreshLoading={loading}
              actionText="Thêm Cơ Sở Mới"
              onAction={() => openModal()}
            />

            {/* ==================================================
                LICENSE SUMMARY
            ================================================== */}

            <div className="license-summary-grid">
              <Card bordered={false} className="license-summary-card">
                <Space>
                  <div className="summary-icon navy">
                    <HomeOutlined />
                  </div>

                  <div>
                    <Text type="secondary">Tổng cơ sở</Text>

                    <div className="summary-number">{summary.total}</div>
                  </div>
                </Space>
              </Card>

              <Card bordered={false} className="license-summary-card">
                <Space>
                  <div className="summary-icon green">
                    <CheckCircleFilled />
                  </div>

                  <div>
                    <Text type="secondary">Đang hoạt động</Text>

                    <div className="summary-number">{summary.active}</div>
                  </div>
                </Space>
              </Card>

              <Card bordered={false} className="license-summary-card">
                <Space>
                  <div className="summary-icon gold">
                    <SafetyCertificateOutlined />
                  </div>

                  <div>
                    <Text type="secondary">Đang dùng Trial</Text>

                    <div className="summary-number">{summary.trial}</div>
                  </div>
                </Space>
              </Card>

              <Card bordered={false} className="license-summary-card">
                <Space>
                  <div className="summary-icon red">
                    <LockOutlined />
                  </div>

                  <div>
                    <Text type="secondary">Hết hạn</Text>

                    <div className="summary-number">{summary.expired}</div>
                  </div>
                </Space>
              </Card>
            </div>

            {/* ==================================================
                SYSTEM ADMIN NOTICE
            ================================================== */}

            {isSystemAdmin && (
              <div className="system-admin-notice">
                <div className="system-admin-notice-icon">
                  <SafetyCertificateOutlined />
                </div>

                <div>
                  <Text
                    strong
                    style={{
                      color: primaryNavy,
                    }}
                  >
                    Quyền quản trị hệ thống
                  </Text>

                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      Tài khoản hiện tại có quyền kích hoạt license FaithEdu cho
                      các giáo xứ.
                    </Text>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                TABLE
            ================================================== */}

            <Card bordered={false} className="main-table-card">
              <Table
                loading={loading}
                dataSource={data}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50", "100"],

                  showTotal: (total) => `Tổng số: ${total} cơ sở`,
                }}
                scroll={{
                  x: 1350,
                }}
                className="custom-admin-table"
              />
            </Card>
          </div>

          {/* ==================================================
              CREATE / EDIT MODAL
          ================================================== */}

          <Modal
            title={
              <div className="modal-custom-title">
                <CompassOutlined
                  style={{
                    color: accentGold,
                  }}
                />

                <span>
                  {editingItem
                    ? "CẬP NHẬT HỒ SƠ CƠ SỞ"
                    : "KHAI BÁO CƠ SỞ GIÁO PHẬN MỚI"}
                </span>
              </div>
            }
            open={isModalOpen}
            onCancel={closeModal}
            onOk={handleSave}
            width={1250}
            centered
            destroyOnClose
            okText="Lưu hồ sơ"
            cancelText="Đóng"
            okButtonProps={{
              style: {
                background: primaryNavy,
                borderColor: primaryNavy,
                borderRadius: 8,
                height: 38,
                fontWeight: 600,
              },
            }}
            cancelButtonProps={{
              style: {
                borderRadius: 8,
                height: 38,
              },
            }}
          >
            <Form
              form={form}
              layout="vertical"
              style={{
                paddingTop: 12,
              }}
            >
              <Row gutter={24}>
                {/* ==================================================
                    LEFT
                ================================================== */}

                <Col xs={24} lg={10}>
                  <div className="form-left-box">
                    {/* IMAGE */}

                    <Divider orientation="left" plain>
                      <span className="section-title">
                        <PictureOutlined />
                        Hình ảnh đại diện
                      </span>
                    </Divider>

                    <Tabs
                      activeKey={imageTab}
                      onChange={setImageTab}
                      size="small"
                      items={[
                        {
                          key: "file",

                          label: (
                            <span>
                              <UploadOutlined /> Tải file
                            </span>
                          ),

                          children: (
                            <div
                              style={{
                                marginTop: 8,
                              }}
                            >
                              <Upload
                                listType="picture-card"
                                maxCount={1}
                                fileList={fileList}
                                beforeUpload={() => false}
                                onChange={({ fileList: newFileList }) => {
                                  setFileList(newFileList);

                                  if (newFileList.length > 0) {
                                    const file = newFileList[0]?.originFileObj;

                                    if (file) {
                                      setPreviewImage(
                                        URL.createObjectURL(file),
                                      );
                                    }
                                  } else {
                                    setPreviewImage("");
                                  }
                                }}
                              >
                                {fileList.length < 1 && (
                                  <div>
                                    <PlusOutlined />

                                    <div
                                      style={{
                                        marginTop: 8,
                                        fontSize: 12,
                                      }}
                                    >
                                      Chọn ảnh
                                    </div>
                                  </div>
                                )}
                              </Upload>

                              {previewImage && fileList.length === 0 && (
                                <div
                                  style={{
                                    marginTop: 8,
                                  }}
                                >
                                  <Text
                                    type="secondary"
                                    style={{
                                      fontSize: 11,
                                    }}
                                  >
                                    Ảnh hiện tại:
                                  </Text>

                                  <div
                                    style={{
                                      marginTop: 5,
                                    }}
                                  >
                                    <Image
                                      src={previewImage}
                                      width={80}
                                      height={80}
                                      style={{
                                        objectFit: "cover",
                                        borderRadius: 8,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ),
                        },

                        {
                          key: "url",

                          label: (
                            <span>
                              <LinkOutlined /> URL ảnh
                            </span>
                          ),

                          children: (
                            <Form.Item
                              name="image"
                              style={{
                                marginTop: 8,
                              }}
                            >
                              <Input
                                prefix={
                                  <LinkOutlined
                                    style={{
                                      color: "#94a3b8",
                                    }}
                                  />
                                }
                                placeholder="https://domain.com/image.jpg"
                                className="custom-form-input"
                                onChange={(e) =>
                                  setPreviewImage(e.target.value)
                                }
                              />
                            </Form.Item>
                          ),
                        },
                      ]}
                    />

                    {/* BASIC */}

                    <Divider orientation="left" plain>
                      <span className="section-title">
                        <InfoCircleOutlined />
                        Thông tin cơ bản
                      </span>
                    </Divider>

                    <Row gutter={12}>
                      <Col span={16}>
                        <Form.Item
                          name="name"
                          label="Tên Giáo xứ / Giáo họ *"
                          rules={[
                            {
                              required: true,
                              message: "Bắt buộc nhập tên",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Ví dụ: Giáo xứ Đồng Quan"
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          name="code"
                          label="Mã ngắn *"
                          rules={[
                            {
                              required: true,
                              message: "Bắt buộc nhập mã",
                            },
                          ]}
                        >
                          <Input
                            placeholder="GX_DQ"
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item name="type" label="Cấp bậc loại hình">
                          <Select>
                            <Option value="GIAO_XU">Giáo xứ</Option>

                            <Option value="GIAO_HO">Giáo họ</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          name="pastor_name"
                          label="Linh mục phụ trách"
                        >
                          <Input
                            prefix={<UserOutlined />}
                            placeholder="Cha Chánh/Phó xứ"
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item name="phone" label="Số điện thoại">
                          <Input
                            prefix={<PhoneOutlined />}
                            placeholder="09xxxx"
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="email" label="Email">
                          <Input
                            prefix={<MailOutlined />}
                            placeholder="vanphong@..."
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* ADDRESS */}

                    <Divider orientation="left" plain>
                      <span className="section-title">
                        <EnvironmentOutlined />
                        Địa giới & Tọa độ
                      </span>
                    </Divider>

                    <Form.Item name="address" label="Địa chỉ chi tiết">
                      <TextArea
                        rows={2}
                        placeholder="Số nhà, thôn xóm, đường đi..."
                        className="custom-form-input"
                      />
                    </Form.Item>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item name="district" label="Quận / Huyện">
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="ward" label="Phường / Xã">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item name="latitude" label="Vĩ độ">
                          <Input
                            disabled
                            prefix={
                              <CompassOutlined
                                style={{
                                  color: accentGold,
                                }}
                              />
                            }
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="longitude" label="Kinh độ">
                          <Input
                            disabled
                            prefix={
                              <CompassOutlined
                                style={{
                                  color: accentGold,
                                }}
                              />
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="is_active"
                      label="Trạng thái công khai"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Hiển thị"
                        unCheckedChildren="Ẩn"
                      />
                    </Form.Item>
                  </div>
                </Col>

                {/* ==================================================
                    RIGHT MAP
                ================================================== */}

                <Col xs={24} lg={14}>
                  <div className="map-right-box">
                    <Space
                      direction="vertical"
                      style={{
                        width: "100%",
                      }}
                      size="middle"
                    >
                      <Input.Search
                        placeholder="Nhập địa danh cần tìm..."
                        enterButton={
                          <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            style={{
                              background: primaryNavy,
                              border: "none",
                            }}
                          >
                            Định vị
                          </Button>
                        }
                        onSearch={handleSearchLocation}
                        size="large"
                      />

                      <div className="map-toolbar">
                        <Text
                          strong
                          style={{
                            color: primaryNavy,
                            fontSize: 13,
                          }}
                        >
                          <EnvironmentOutlined
                            style={{
                              color: accentGold,
                              marginRight: 5,
                            }}
                          />
                          Click trên bản đồ để chọn vị trí
                        </Text>

                        <Select
                          value={mapStyle}
                          size="small"
                          style={{
                            width: 160,
                          }}
                          onChange={setMapStyle}
                        >
                          <Option value="street">Bản đồ giao thông</Option>

                          <Option value="satellite">Ảnh vệ tinh</Option>

                          <Option value="light">Bản đồ tối giản</Option>
                        </Select>
                      </div>

                      <div className="map-container-wrapper">
                        <MapContainer
                          center={[mapCenter.lat, mapCenter.lng]}
                          zoom={15}
                          style={{
                            height: 480,
                            width: "100%",
                          }}
                        >
                          <ChangeView
                            lat={mapCenter.lat}
                            lng={mapCenter.lng}
                            zoom={15}
                          />

                          {mapStyle === "street" && (
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution="© OpenStreetMap contributors"
                            />
                          )}

                          {mapStyle === "satellite" && (
                            <TileLayer
                              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                              attribution="© Esri"
                            />
                          )}

                          {mapStyle === "light" && (
                            <TileLayer
                              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                              attribution="© CARTO"
                            />
                          )}

                          <LocationMarker />
                        </MapContainer>
                      </div>

                      <Text
                        type="secondary"
                        italic
                        style={{
                          fontSize: 12,
                        }}
                      >
                        * Click chọn điểm trên bản đồ để tự động cập nhật địa
                        chỉ, Latitude và Longitude.
                      </Text>
                    </Space>
                  </div>
                </Col>
              </Row>
            </Form>
          </Modal>

          {/* ==================================================
              ACTIVATE LICENSE MODAL
          ================================================== */}

          <Modal
            open={activateModalOpen}
            onCancel={closeActivateModal}
            footer={null}
            centered
            width={500}
            destroyOnClose
            closable={!activatingId}
          >
            <div className="activate-modal">
              <div className="activate-icon">
                <SafetyCertificateOutlined />
              </div>

              <Title
                level={3}
                style={{
                  color: primaryNavy,
                  marginTop: 18,
                  marginBottom: 8,
                }}
              >
                Kích hoạt FaithEdu
              </Title>

              <Paragraph
                type="secondary"
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                Xác nhận kích hoạt hệ thống FaithEdu cho cơ sở này. Sau khi kích
                hoạt, giáo xứ có thể tiếp tục sử dụng hệ thống mà không bị giới
                hạn thời gian.
              </Paragraph>

              {activateChurch && (
                <div className="activate-church-card">
                  <div className="activate-church-icon">
                    <HomeOutlined />
                  </div>

                  <div>
                    <Text
                      strong
                      style={{
                        color: primaryNavy,
                        fontSize: 15,
                      }}
                    >
                      {activateChurch.name}
                    </Text>

                    <div
                      style={{
                        marginTop: 4,
                      }}
                    >
                      <Tag className="gold-code-tag">
                        <GlobalOutlined /> {activateChurch.code || "N/A"}
                      </Tag>
                    </div>
                  </div>
                </div>
              )}

              <div className="activate-current-status">
                <div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                    }}
                  >
                    Trạng thái hiện tại
                  </Text>

                  <div>
                    <Tag
                      color={
                        activateChurch?.license_status === "expired"
                          ? "error"
                          : "processing"
                      }
                      style={{
                        marginTop: 4,
                      }}
                    >
                      {activateChurch?.license_status === "expired"
                        ? "ĐÃ HẾT HẠN"
                        : "TRIAL"}
                    </Tag>
                  </div>
                </div>

                <div className="activate-arrow">→</div>

                <div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                    }}
                  >
                    Sau khi kích hoạt
                  </Text>

                  <div>
                    <Tag
                      color="success"
                      icon={<CheckCircleFilled />}
                      style={{
                        marginTop: 4,
                      }}
                    >
                      HOẠT ĐỘNG
                    </Tag>
                  </div>
                </div>
              </div>

              <div className="activate-warning">
                <InfoCircleOutlined />

                <span>
                  Thao tác này sẽ kích hoạt
                  <b> vĩnh viễn </b>
                  license FaithEdu cho giáo xứ. Không cần gia hạn định kỳ.
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 24,
                }}
              >
                <Button
                  size="large"
                  onClick={closeActivateModal}
                  disabled={!!activatingId}
                  style={{
                    borderRadius: 9,
                  }}
                >
                  Hủy
                </Button>

                <Button
                  type="primary"
                  size="large"
                  icon={<UnlockOutlined />}
                  loading={!!activatingId}
                  onClick={handleActivateLicense}
                  style={{
                    background: primaryNavy,
                    borderColor: primaryNavy,
                    borderRadius: 9,
                    fontWeight: 600,
                  }}
                >
                  Xác nhận kích hoạt
                </Button>
              </div>
            </div>
          </Modal>

          {/* ==================================================
              STYLES
          ================================================== */}

          <style
            dangerouslySetInnerHTML={{
              __html: `
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

                * {
                  box-sizing: border-box;
                }

                .church-editorial-layout {
                  min-height: 100vh;
                  background: ${softBg};
                  padding: 40px 20px 80px;
                  font-family: 'Be Vietnam Pro', sans-serif;
                  color: ${textDark};
                }

                .church-editorial-container {
                  max-width: 1400px;
                  margin: 0 auto;
                }

                /* =========================
                   LICENSE SUMMARY
                ========================= */

                .license-summary-grid {
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 16px;
                  margin-bottom: 18px;
                }

                .license-summary-card {
                  border-radius: 16px !important;
                  border: 1px solid rgba(27,54,93,.08) !important;
                  box-shadow: 0 6px 20px rgba(27,54,93,.04) !important;
                }

                .summary-icon {
                  width: 46px;
                  height: 46px;
                  border-radius: 12px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 21px;
                }

                .summary-icon.navy {
                  color: ${primaryNavy};
                  background: rgba(27,54,93,.08);
                }

                .summary-icon.green {
                  color: ${successGreen};
                  background: rgba(46,125,50,.09);
                }

                .summary-icon.gold {
                  color: ${accentGold};
                  background: rgba(212,175,55,.12);
                }

                .summary-icon.red {
                  color: ${dangerRed};
                  background: rgba(198,40,40,.08);
                }

                .summary-number {
                  font-size: 25px;
                  font-weight: 700;
                  color: ${primaryNavy};
                  margin-top: 2px;
                }

                /* =========================
                   SYSTEM ADMIN NOTICE
                ========================= */

                .system-admin-notice {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 13px 16px;
                  margin-bottom: 18px;
                  border-radius: 12px;
                  background: rgba(27,54,93,.045);
                  border: 1px solid rgba(27,54,93,.1);
                }

                .system-admin-notice-icon {
                  width: 40px;
                  height: 40px;
                  flex-shrink: 0;
                  border-radius: 10px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: ${primaryNavy};
                  background: rgba(212,175,55,.15);
                  font-size: 19px;
                }

                /* =========================
                   TABLE
                ========================= */

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
                  background: rgba(212,175,55,.035) !important;
                }

                .gold-code-tag {
                  background: rgba(212,175,55,.12) !important;
                  border: 1px solid rgba(212,175,55,.5) !important;
                  color: ${primaryNavy} !important;
                  border-radius: 6px !important;
                  font-weight: 600;
                  font-size: 11px;
                }

                .action-btn-edit:hover {
                  background: rgba(27,54,93,.1) !important;
                }

                .action-btn-delete:hover {
                  background: #fff5f5 !important;
                }

                /* =========================
                   FORM
                ========================= */

                .modal-custom-title {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-family: 'Playfair Display', Georgia, serif;
                  color: ${primaryNavy};
                  font-size: 18px;
                  font-weight: 700;
                }

                .form-left-box {
                  background: ${softBg};
                  padding: 18px;
                  border-radius: 14px;
                  border: 1px solid rgba(27,54,93,.1);
                  max-height: 560px;
                  overflow-y: auto;
                }

                .map-right-box {
                  background: #fff;
                  padding: 18px;
                  border-radius: 14px;
                  border: 1px solid rgba(212,175,55,.3);
                  height: 100%;
                }

                .section-title {
                  display: inline-flex;
                  align-items: center;
                  gap: 7px;
                  color: ${primaryNavy};
                  font-size: 13px;
                  font-weight: 700;
                }

                .section-title svg {
                  color: ${accentGold};
                }

                .custom-form-input {
                  border-radius: 8px !important;
                }

                .map-toolbar {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  gap: 12px;
                }

                .map-container-wrapper {
                  overflow: hidden;
                  border-radius: 12px;
                  border: 1px solid rgba(27,54,93,.1);
                  box-shadow: 0 4px 12px rgba(27,54,93,.05);
                }

                .leaflet-container {
                  z-index: 10 !important;
                }

                /* =========================
                   ACTIVATE MODAL
                ========================= */

                .activate-modal {
                  text-align: center;
                  padding: 10px 10px 2px;
                }

                .activate-icon {
                  width: 74px;
                  height: 74px;
                  margin: 0 auto;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 32px;
                  color: ${primaryNavy};
                  background: rgba(212,175,55,.13);
                  border: 1px solid rgba(212,175,55,.35);
                }

                .activate-church-card {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 14px;
                  text-align: left;
                  border-radius: 13px;
                  background: ${softBg};
                  border: 1px solid rgba(27,54,93,.1);
                }

                .activate-church-icon {
                  width: 44px;
                  height: 44px;
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 11px;
                  color: ${primaryNavy};
                  background: rgba(27,54,93,.08);
                  font-size: 20px;
                }

                .activate-current-status {
                  margin-top: 14px;
                  padding: 12px 16px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 30px;
                  border-radius: 11px;
                  background: #fff;
                  border: 1px solid rgba(27,54,93,.08);
                }

                .activate-arrow {
                  font-size: 22px;
                  color: ${accentGold};
                  font-weight: 700;
                }

                .activate-warning {
                  margin-top: 14px;
                  padding: 12px 14px;
                  display: flex;
                  gap: 9px;
                  align-items: flex-start;
                  text-align: left;
                  border-radius: 10px;
                  color: #92400e;
                  background: #fffbeb;
                  border: 1px solid #fde68a;
                  font-size: 12px;
                  line-height: 1.6;
                }

                /* =========================
                   RESPONSIVE
                ========================= */

                @media (max-width: 1100px) {
                  .license-summary-grid {
                    grid-template-columns: repeat(2, 1fr);
                  }
                }

                @media (max-width: 900px) {
                  .church-editorial-layout {
                    padding: 25px 12px 60px;
                  }

                  .map-toolbar {
                    flex-direction: column;
                    align-items: flex-start;
                  }

                  .form-left-box {
                    max-height: none;
                  }
                }

                @media (max-width: 600px) {
                  .license-summary-grid {
                    grid-template-columns: 1fr;
                  }

                  .activate-current-status {
                    gap: 12px;
                  }

                  .church-editorial-layout {
                    padding: 20px 8px 50px;
                  }

                  .map-container-wrapper .leaflet-container {
                    height: 380px !important;
                  }

                  .activate-church-card {
                    text-align: left;
                  }
                }
              `,
            }}
          />
        </div>
      </ConfigProvider>
    </>
  );
};

export default ChurchPage;
