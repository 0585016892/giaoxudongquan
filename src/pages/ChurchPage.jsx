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
  CheckOutlined,
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
  PictureOutlined,
  PlusOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  UnlockOutlined,
  UploadOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

import PageHeroHeader from "../components/common/PageHeroHeader";
import { useChurch } from "../hooks/useChurch";
import { useUser } from "../context/UserContext";
import axios from "../api/axios";

import dayjs from "dayjs";

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
// DESIGN
// ======================================================

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const successGreen = "#2E7D32";
const dangerRed = "#C62828";
const warningOrange = "#D97706";

// ======================================================
// DEFAULT MAP
// ======================================================

const defaultCenter = {
  lat: 21.0285,
  lng: 105.8542,
};

// ======================================================
// LEAFLET ICON
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// ======================================================
// MAP VIEW
// ======================================================

const ChangeView = ({ lat, lng, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (
      lat !== undefined &&
      lat !== null &&
      lng !== undefined &&
      lng !== null
    ) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);

  return null;
};

// ======================================================
// LICENSE DAYS
// ======================================================

const getLicenseDaysRemaining = (expiresAt) => {
  if (!expiresAt) {
    return null;
  }

  const expires = dayjs(expiresAt);

  if (!expires.isValid()) {
    return null;
  }

  const now = dayjs();

  return Math.max(0, expires.startOf("day").diff(now.startOf("day"), "day"));
};

// ======================================================
// LICENSE NORMALIZE
// ======================================================

const normalizeLicenseType = (value) => {
  if (value === "year" || value === "1_year") {
    return "yearly";
  }

  if (value === "forever") {
    return "lifetime";
  }

  return value || "trial";
};

const normalizeLicenseStatus = (value) => {
  return value || "trial";
};

// ======================================================
// CHURCH PAGE
// ======================================================

const ChurchPage = () => {
  // ====================================================
  // MESSAGE
  // ====================================================

  const [messageApi, contextHolder] = message.useMessage();

  // ====================================================
  // HOOKS
  // ====================================================

  const {
    fetchChurches,
    addChurch,
    editChurch,
    removeChurch,
    toggleActive,
    activateLicense,
  } = useChurch();

  const { user } = useUser();

  const isSystemAdmin = user?.role === "admin";

  const [form] = Form.useForm();

  // ====================================================
  // TABLE
  // ====================================================

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const currentPage = pagination.current;
  const pageSize = pagination.pageSize;
  const total = pagination.total;

  // ====================================================
  // SEARCH
  // ====================================================

  const [search, setSearch] = useState("");

  const [type, setType] = useState("");

  // ====================================================
  // CREATE / EDIT
  // ====================================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState(null);

  // ====================================================
  // MAP
  // ====================================================

  const [marker, setMarker] = useState(defaultCenter);

  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const [mapStyle, setMapStyle] = useState("street");

  // ====================================================
  // IMAGE
  // ====================================================

  const [fileList, setFileList] = useState([]);

  const [imageTab, setImageTab] = useState("file");

  const [previewImage, setPreviewImage] = useState("");

  // ====================================================
  // LICENSE
  // ====================================================

  const [activateModalOpen, setActivateModalOpen] = useState(false);

  const [activateChurch, setActivateChurch] = useState(null);

  const [selectedLicenseType, setSelectedLicenseType] = useState("yearly");

  const [activatingId, setActivatingId] = useState(null);

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

    if (
      cleanImagePath.startsWith("http://") ||
      cleanImagePath.startsWith("https://")
    ) {
      return cleanImagePath;
    }

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    const serverBase = apiUrl.replace(/\/api\/?$/, "");

    const cleanPath = cleanImagePath.startsWith("/")
      ? cleanImagePath
      : `/${cleanImagePath}`;

    return `${serverBase}${cleanPath}`;
  }, []);

  // ====================================================
  // LOAD DATA
  // ====================================================

  const loadData = useCallback(
    async (page = 1, requestedPageSize = pageSize) => {
      setLoading(true);

      try {
        const params = {
          page,
          limit: requestedPageSize,
        };

        if (search?.trim()) {
          params.search = search.trim();
        }

        if (type) {
          params.type = type;
        }

        const res = await fetchChurches(params);

        const rows = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];

        const serverPagination = res?.pagination ||
          res?.data?.pagination || {
            page,
            limit: requestedPageSize,
            total: 0,
            totalPages: 0,
          };

        const serverPage = Number(serverPagination.page || page);

        const serverLimit = Number(serverPagination.limit || requestedPageSize);

        const serverTotal = Number(serverPagination.total || 0);

        setData(rows);

        setPagination({
          current: serverPage,
          pageSize: serverLimit,
          total: serverTotal,
        });

        return {
          rows,
          pagination: serverPagination,
        };
      } catch (error) {
        console.error("CHURCH LOAD ERROR:", error);

        messageApi.error(
          error?.response?.data?.message || "Không thể tải danh sách giáo xứ.",
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchChurches, messageApi, pageSize, search, type],
  );

  // ====================================================
  // INITIAL / FILTER LOAD
  // ====================================================

  useEffect(() => {
    loadData(1, pageSize);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type]);

  // ====================================================
  // TABLE CHANGE
  // ====================================================

  const handleTableChange = useCallback(
    (tablePagination) => {
      const nextPage = tablePagination.current || 1;

      const nextPageSize = tablePagination.pageSize || pageSize;

      loadData(nextPage, nextPageSize);
    },
    [loadData, pageSize],
  );

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
        console.error("REVERSE GEOCODE ERROR:", error);
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
              q: value.trim(),
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
          lat: Number(result.lat),
          lng: Number(result.lon),
        };

        setMapCenter(newPos);

        setMarker(newPos);

        await reverseGeocode(newPos.lat, newPos.lng);

        messageApi.success("Đã định vị địa điểm.");
      } catch (error) {
        console.error("SEARCH LOCATION ERROR:", error);

        messageApi.error("Lỗi trong quá trình tìm kiếm tọa độ.");
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

        const position = {
          lat,
          lng,
        };

        setMarker(position);

        reverseGeocode(lat, lng);
      },
    });

    return <Marker position={marker} />;
  };

  // ====================================================
  // OPEN CREATE / EDIT
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
  // CLOSE CREATE / EDIT
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

      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      formData.set("is_active", values.is_active ? "1" : "0");

      if (imageTab === "file" && fileList.length > 0) {
        const file = fileList[0]?.originFileObj;

        if (file) {
          formData.append("image", file);
        }
      }

      if (imageTab === "url" && values.image) {
        formData.set("image", values.image);
      }

      if (editingItem) {
        await editChurch(editingItem.id, formData);

        messageApi.success("Cập nhật hồ sơ cơ sở thành công.");
      } else {
        await addChurch(formData);

        messageApi.success("Thêm cơ sở mới thành công.");
      }

      closeModal();

      await loadData(currentPage, pageSize);
    } catch (error) {
      console.error("SAVE CHURCH ERROR:", error);

      if (error?.errorFields) {
        messageApi.warning("Vui lòng kiểm tra lại các trường bắt buộc.");

        return;
      }

      messageApi.error(
        error?.response?.data?.message || "Không thể lưu hồ sơ cơ sở.",
      );
    }
  }, [
    addChurch,
    closeModal,
    currentPage,
    editChurch,
    editingItem,
    fileList,
    form,
    imageTab,
    loadData,
    messageApi,
    pageSize,
  ]);

  // ====================================================
  // LICENSE CURRENT STATE
  // ====================================================

  const currentLicenseType = normalizeLicenseType(activateChurch?.license_type);

  const currentLicenseStatus = normalizeLicenseStatus(
    activateChurch?.license_status,
  );

  const isCurrentLifetime = currentLicenseType === "lifetime";

  const isCurrentYearly = currentLicenseType === "yearly";

  const isCurrentYearlyActive =
    isCurrentYearly && currentLicenseStatus === "active";

  const isCurrentYearlyExpired =
    isCurrentYearly && currentLicenseStatus === "expired";

  const isCurrentTrial =
    currentLicenseType === "trial" || currentLicenseStatus === "trial";

  // ====================================================
  // SELECTED
  // ====================================================

  const isSelectedYearly = selectedLicenseType === "yearly";

  const isSelectedLifetime = selectedLicenseType === "lifetime";

  // ====================================================
  // LICENSE OPERATION
  // ====================================================

  const getLicenseOperation = useCallback(() => {
    if (!activateChurch) {
      return null;
    }

    if (isCurrentLifetime) {
      return "none";
    }

    if (isCurrentYearlyActive && isSelectedYearly) {
      return "renew_yearly";
    }

    if (isCurrentYearlyActive && isSelectedLifetime) {
      return "upgrade_yearly_to_lifetime";
    }

    if (isCurrentYearlyExpired && isSelectedYearly) {
      return "reactivate_yearly";
    }

    if (isCurrentYearlyExpired && isSelectedLifetime) {
      return "expired_yearly_to_lifetime";
    }

    if (isCurrentTrial && isSelectedYearly) {
      return "activate_yearly_from_trial";
    }

    if (isCurrentTrial && isSelectedLifetime) {
      return "activate_lifetime_from_trial";
    }

    return "activation";
  }, [
    activateChurch,
    isCurrentLifetime,
    isCurrentTrial,
    isCurrentYearlyActive,
    isCurrentYearlyExpired,
    isSelectedLifetime,
    isSelectedYearly,
  ]);

  // ====================================================
  // OPEN LICENSE
  // ====================================================

  const openActivateModal = useCallback(
    (church) => {
      if (!isSystemAdmin) {
        messageApi.error(
          "Chỉ quản trị hệ thống mới có quyền quản lý license FaithEdu.",
        );

        return;
      }

      if (!church?.id) {
        messageApi.error("Không xác định được giáo xứ.");

        return;
      }

      setActivateChurch(church);

      const type = normalizeLicenseType(church.license_type);

      const status = normalizeLicenseStatus(church.license_status);

      /*
       * LIFETIME
       * Không còn lựa chọn.
       */
      if (type === "lifetime") {
        setSelectedLicenseType("lifetime");
      } else if (type === "yearly") {

      /*
       * YEARLY
       * Cho phép:
       * - yearly -> yearly
       * - yearly -> lifetime
       */
        setSelectedLicenseType("yearly");
      } else if (type === "trial" || status === "trial") {

      /*
       * TRIAL
       * Mặc định yearly.
       */
        setSelectedLicenseType("yearly");
      } else {
        setSelectedLicenseType("yearly");
      }

      setActivateModalOpen(true);
    },
    [isSystemAdmin, messageApi],
  );

  // ====================================================
  // CLOSE LICENSE
  // ====================================================

  const closeActivateModal = useCallback(() => {
    if (activatingId) {
      return;
    }

    setActivateModalOpen(false);

    setActivateChurch(null);

    setSelectedLicenseType("yearly");
  }, [activatingId]);

  // ====================================================
  // LICENSE ACTION DISABLED
  // ====================================================

  const licenseActionDisabled =
    !activateChurch ||
    !selectedLicenseType ||
    isCurrentLifetime ||
    activatingId !== null;

  // ====================================================
  // LICENSE DAYS
  // ====================================================

  const daysRemaining = getLicenseDaysRemaining(
    activateChurch?.license_expires_at,
  );

  // ====================================================
  // FORMAT DATE
  // ====================================================

  const formatDate = useCallback((value) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  // ====================================================
  // ACTIVATE LICENSE
  // ====================================================

  const handleActivateLicense = useCallback(async () => {
    if (!activateChurch) {
      messageApi.warning("Không xác định được giáo xứ cần quản lý license.");

      return;
    }

    if (!isSystemAdmin) {
      messageApi.error(
        "Chỉ quản trị hệ thống mới có quyền quản lý license FaithEdu.",
      );

      return;
    }

    if (!["yearly", "lifetime"].includes(selectedLicenseType)) {
      messageApi.warning("Gói FaithEdu không hợp lệ.");

      return;
    }

    if (isCurrentLifetime) {
      messageApi.info("Cơ sở này đã sử dụng gói FaithEdu vĩnh viễn.");

      return;
    }

    const churchId = Number(activateChurch.id);

    if (!Number.isInteger(churchId) || churchId <= 0) {
      messageApi.error("ID giáo xứ không hợp lệ.");

      return;
    }

    const expectedOperation = getLicenseOperation();

    console.group("FAITHEDU LICENSE ACTION");

    console.log("Church ID:", churchId);

    console.log("Current Type:", currentLicenseType);

    console.log("Current Status:", currentLicenseStatus);

    console.log("Selected Type:", selectedLicenseType);

    console.log("Expected Operation:", expectedOperation);

    console.groupEnd();

    try {
      setActivatingId(churchId);

      const res = await activateLicense(churchId, selectedLicenseType);

      console.log("FAITHEDU LICENSE RESPONSE:", res);

      if (!res?.success) {
        messageApi.error(res?.message || "Không thể quản lý license FaithEdu.");

        return;
      }

      const operation = res.operation || expectedOperation;

      const operationMessages = {
        renew_yearly: "Gia hạn FaithEdu gói 1 năm thành công.",

        reactivate_yearly: "Kích hoạt lại FaithEdu gói 1 năm thành công.",

        upgrade_yearly_to_lifetime:
          "Nâng cấp FaithEdu lên gói vĩnh viễn thành công.",

        expired_yearly_to_lifetime:
          "Kích hoạt FaithEdu gói vĩnh viễn thành công.",

        activate_yearly_from_trial:
          "Kích hoạt FaithEdu gói 1 năm từ bản dùng thử thành công.",

        activate_lifetime_from_trial:
          "Kích hoạt FaithEdu gói vĩnh viễn từ bản dùng thử thành công.",

        activation: "Kích hoạt FaithEdu thành công.",
      };

      messageApi.success(
        res.message ||
          operationMessages[operation] ||
          "Quản lý license FaithEdu thành công.",
      );

      setActivateModalOpen(false);

      setActivateChurch(null);

      setSelectedLicenseType("yearly");

      await loadData(currentPage, pageSize);
    } catch (error) {
      console.error("FAITHEDU LICENSE ACTION ERROR:", error);

      console.error("RESPONSE:", error?.response?.data);

      const status = error?.response?.status;

      const code = error?.response?.data?.code;

      const serverMessage = error?.response?.data?.message;

      if (status === 401 || code === "UNAUTHORIZED") {
        messageApi.error(serverMessage || "Phiên đăng nhập đã hết hạn.");

        return;
      }

      if (status === 403 || code === "LICENSE_ACTIVATION_FORBIDDEN") {
        messageApi.error(
          serverMessage ||
            "Chỉ quản trị hệ thống mới có quyền quản lý license FaithEdu.",
        );

        return;
      }

      if (code === "CHURCH_NOT_FOUND") {
        messageApi.error(serverMessage || "Không tìm thấy giáo xứ.");

        setActivateModalOpen(false);

        setActivateChurch(null);

        await loadData(currentPage, pageSize);

        return;
      }

      if (code === "INVALID_CHURCH_ID") {
        messageApi.error(serverMessage || "ID giáo xứ không hợp lệ.");

        return;
      }

      if (code === "INVALID_LICENSE_TYPE") {
        messageApi.error(serverMessage || "Gói FaithEdu không hợp lệ.");

        return;
      }

      if (code === "LICENSE_TYPE_MISSING") {
        messageApi.error(
          serverMessage || "License của giáo xứ chưa xác định được loại gói.",
        );

        return;
      }

      if (code === "LICENSE_ALREADY_LIFETIME") {
        messageApi.info(
          serverMessage || "Cơ sở này đã sử dụng gói FaithEdu vĩnh viễn.",
        );

        setActivateModalOpen(false);

        setActivateChurch(null);

        await loadData(currentPage, pageSize);

        return;
      }

      messageApi.error(
        serverMessage || "Lỗi server khi quản lý license FaithEdu.",
      );
    } finally {
      setActivatingId(null);
    }
  }, [
    activateChurch,
    activateLicense,
    currentLicenseStatus,
    currentLicenseType,
    currentPage,
    getLicenseOperation,
    isCurrentLifetime,
    isSystemAdmin,
    loadData,
    messageApi,
    pageSize,
    selectedLicenseType,
  ]);

  // ====================================================
  // LICENSE RENDER
  // ====================================================

  const renderLicense = useCallback(
    (church) => {
      const status = normalizeLicenseStatus(church?.license_status);

      const type = normalizeLicenseType(church?.license_type);

      // ----------------------------------------------
      // LIFETIME
      // ----------------------------------------------

      if (type === "lifetime") {
        return (
          <Space direction="vertical" size={3} align="center">
            <Tag
              icon={<CheckCircleFilled />}
              color="gold"
              style={{
                borderRadius: 20,
                fontWeight: 700,
                margin: 0,
              }}
            >
              VĨNH VIỄN
            </Tag>

            <Button
              type="link"
              size="small"
              onClick={() => openActivateModal(church)}
              style={{
                padding: 0,
                height: "auto",
                fontSize: 11,
                color: primaryNavy,
              }}
            >
              Xem chi tiết
            </Button>
          </Space>
        );
      }

      // ----------------------------------------------
      // YEARLY ACTIVE
      // ----------------------------------------------

      if (type === "yearly" && status === "active") {
        const days = Number(
          church.days_remaining ??
            getLicenseDaysRemaining(church.license_expires_at) ??
            0,
        );

        let color = "success";

        if (days <= 3) {
          color = "error";
        } else if (days <= 30) {
          color = "warning";
        }

        return (
          <Space direction="vertical" size={3} align="center">
            <Tag
              icon={<CheckCircleFilled />}
              color={color}
              style={{
                borderRadius: 20,
                fontWeight: 700,
                margin: 0,
              }}
            >
              GÓI 1 NĂM
            </Tag>

            <Text
              strong
              style={{
                fontSize: 10,
                color:
                  days <= 3
                    ? dangerRed
                    : days <= 30
                      ? warningOrange
                      : successGreen,
              }}
            >
              Còn {days} ngày
            </Text>

            {isSystemAdmin && (
              <Button
                type="link"
                size="small"
                icon={<SafetyCertificateOutlined />}
                onClick={() => openActivateModal(church)}
                style={{
                  padding: 0,
                  height: "auto",
                  fontSize: 11,
                  color: primaryNavy,
                }}
              >
                Gia hạn / Nâng cấp
              </Button>
            )}
          </Space>
        );
      }

      // ----------------------------------------------
      // EXPIRED
      // ----------------------------------------------

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
                Mua lại
              </Button>
            )}
          </Space>
        );
      }

      // ----------------------------------------------
      // TRIAL
      // ----------------------------------------------

      const days = Number(
        church.days_remaining ??
          getLicenseDaysRemaining(church.license_expires_at) ??
          0,
      );

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
              Kích hoạt
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
                backgroundColor: "rgba(212,175,55,0.12)",
                color: primaryNavy,
                border: "1px solid rgba(212,175,55,0.3)",
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

              <div
                style={{
                  marginTop: 3,
                }}
              >
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
        width: 160,
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

                    messageApi.success(
                      active ? "Đã ẩn cơ sở." : "Đã kích hoạt cơ sở.",
                    );

                    await loadData(currentPage, pageSize);
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

                  const nextTotal = Math.max(total - 1, 0);

                  const nextTotalPages = Math.max(
                    Math.ceil(nextTotal / pageSize),
                    1,
                  );

                  const nextPage = Math.min(currentPage, nextTotalPages);

                  await loadData(nextPage, pageSize);
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
      currentPage,
      getImageUrl,
      loadData,
      messageApi,
      openModal,
      pageSize,
      removeChurch,
      renderLicense,
      toggleActive,
      total,
    ],
  );

  // ====================================================
  // SUMMARY
  // ====================================================

  const summary = useMemo(() => {
    return {
      total,

      active: data.filter(
        (item) => item.is_active === 1 || item.is_active === true,
      ).length,

      trial: data.filter(
        (item) => normalizeLicenseStatus(item.license_status) === "trial",
      ).length,

      expired: data.filter(
        (item) => normalizeLicenseStatus(item.license_status) === "expired",
      ).length,
    };
  }, [data, total]);

  // ====================================================
  // LICENSE UI
  // ====================================================

  const licenseCurrentLabel = isCurrentLifetime
    ? "VĨNH VIỄN"
    : isCurrentYearlyExpired
      ? "1 NĂM - ĐÃ HẾT HẠN"
      : isCurrentYearlyActive
        ? "1 NĂM - ĐANG HOẠT ĐỘNG"
        : "TRIAL";

  const selectedLabel = isSelectedLifetime ? "VĨNH VIỄN" : "1 NĂM";

  const isUpgradeToLifetime = isCurrentYearlyActive && isSelectedLifetime;

  const isRenewYearly = isCurrentYearlyActive && isSelectedYearly;

  const isReactivateYearly = isCurrentYearlyExpired && isSelectedYearly;

  const isExpiredToLifetime = isCurrentYearlyExpired && isSelectedLifetime;

  const isTrialToYearly = isCurrentTrial && isSelectedYearly;

  const isTrialToLifetime = isCurrentTrial && isSelectedLifetime;

  // ====================================================
  // RENDER
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
              onRefresh={() => loadData(currentPage, pageSize)}
              refreshLoading={loading}
              actionText="Thêm Cơ Sở Mới"
              onAction={() => openModal()}
            />

            {/* ==================================================
                FILTER
            ================================================== */}

            <Card bordered={false} className="church-filter-card">
              <Row gutter={12}>
                <Col xs={24} md={14} lg={16}>
                  <Input
                    allowClear
                    prefix={
                      <SearchOutlined
                        style={{
                          color: "#94a3b8",
                        }}
                      />
                    }
                    placeholder="Tìm kiếm tên giáo xứ, mã, địa chỉ, linh mục..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="custom-form-input"
                  />
                </Col>

                <Col xs={24} md={10} lg={8}>
                  <Select
                    allowClear
                    value={type || undefined}
                    onChange={(value) => setType(value || "")}
                    placeholder="Tất cả loại hình"
                    style={{
                      width: "100%",
                    }}
                  >
                    <Option value="GIAO_XU">Giáo xứ</Option>

                    <Option value="GIAO_HO">Giáo họ</Option>
                  </Select>
                </Col>
              </Row>
            </Card>

            {/* ==================================================
                SUMMARY
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
                ADMIN NOTICE
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
                      Tài khoản hiện tại có quyền quản lý license FaithEdu cho
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
                rowKey={(record) => `church-${record.id}`}
                onChange={handleTableChange}
                pagination={{
                  current: currentPage,

                  pageSize,

                  total,

                  showSizeChanger: true,

                  pageSizeOptions: ["10", "20", "50", "100"],

                  showQuickJumper: true,

                  showTotal: (totalValue, range) =>
                    `Hiển thị ${range[0]}-${range[1]} / ${totalValue} cơ sở`,

                  locale: {
                    items_per_page: " / trang",
                  },
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
                {/* LEFT */}

                <Col xs={24} lg={10}>
                  <div className="form-left-box">
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

                {/* RIGHT MAP */}

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
              LICENSE MODAL
          ================================================== */}

          <Modal
            open={activateModalOpen}
            onCancel={closeActivateModal}
            footer={null}
            centered
            width={620}
            destroyOnClose
            closable={!activatingId}
          >
            <div className="activate-modal">
              {/* ICON */}

              <div className="activate-icon">
                <SafetyCertificateOutlined />
              </div>

              {/* TITLE */}

              <Title
                level={3}
                style={{
                  color: primaryNavy,
                  marginTop: 18,
                  marginBottom: 6,
                }}
              >
                {isCurrentLifetime
                  ? "Chi tiết bản quyền FaithEdu"
                  : isUpgradeToLifetime
                    ? "Nâng cấp FaithEdu"
                    : isRenewYearly
                      ? "Gia hạn FaithEdu"
                      : isReactivateYearly
                        ? "Kích hoạt lại FaithEdu"
                        : isExpiredToLifetime
                          ? "Mua gói vĩnh viễn"
                          : "Kích hoạt FaithEdu"}
              </Title>

              <Paragraph
                type="secondary"
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  marginBottom: 18,
                }}
              >
                {isCurrentLifetime
                  ? "Cơ sở này đang sử dụng gói FaithEdu vĩnh viễn."
                  : isUpgradeToLifetime
                    ? "Nâng cấp từ gói 1 năm lên gói FaithEdu vĩnh viễn."
                    : isRenewYearly
                      ? "Gia hạn thêm 12 tháng cho license FaithEdu hiện tại."
                      : isReactivateYearly
                        ? "Kích hoạt lại license FaithEdu đã hết hạn."
                        : isExpiredToLifetime
                          ? "Chuyển cơ sở sang gói FaithEdu vĩnh viễn."
                          : "Chọn gói bản quyền FaithEdu muốn sử dụng cho cơ sở này."}
              </Paragraph>

              {/* CHURCH */}

              {activateChurch && (
                <div className="activate-church-card">
                  <div className="activate-church-icon">
                    <HomeOutlined />
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

              {/* CURRENT STATUS */}

              <div className="activate-current-status">
                <div className="license-status-side">
                  <Text type="secondary">Gói hiện tại</Text>

                  <div>
                    <Tag
                      color={
                        isCurrentLifetime
                          ? "gold"
                          : isCurrentYearlyExpired
                            ? "error"
                            : isCurrentYearlyActive
                              ? "processing"
                              : "default"
                      }
                    >
                      {licenseCurrentLabel}
                    </Tag>
                  </div>
                </div>

                <div className="activate-arrow">→</div>

                <div className="license-status-side">
                  <Text type="secondary">Sau khi thao tác</Text>

                  <div>
                    <Tag
                      color={isSelectedLifetime ? "gold" : "success"}
                      icon={<CheckCircleFilled />}
                    >
                      {selectedLabel}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* DETAIL */}

              <div className="license-detail-card">
                <div className="license-detail-item">
                  <span>Trạng thái</span>

                  <strong>
                    {isCurrentLifetime
                      ? "Đang hoạt động"
                      : isCurrentYearlyActive
                        ? "Đang hoạt động"
                        : isCurrentYearlyExpired
                          ? "Đã hết hạn"
                          : "Đang dùng thử"}
                  </strong>
                </div>

                <div className="license-detail-item">
                  <span>Gói sử dụng</span>

                  <strong>
                    {isCurrentLifetime
                      ? "Vĩnh viễn"
                      : isCurrentYearly
                        ? "1 năm"
                        : "Trial"}
                  </strong>
                </div>

                {activateChurch?.activated_at && (
                  <div className="license-detail-item">
                    <span>Ngày kích hoạt</span>

                    <strong>
                      {formatDate(activateChurch.activated_at) || "—"}
                    </strong>
                  </div>
                )}

                {isCurrentLifetime ? (
                  <div className="license-detail-item">
                    <span>Hạn sử dụng</span>

                    <strong
                      style={{
                        color: accentGold,
                      }}
                    >
                      Vĩnh viễn
                    </strong>
                  </div>
                ) : activateChurch?.license_expires_at ? (
                  <div className="license-detail-item">
                    <span>Hạn sử dụng</span>

                    <strong
                      style={{
                        color: isCurrentYearlyExpired ? dangerRed : primaryNavy,
                      }}
                    >
                      {formatDate(activateChurch.license_expires_at) || "—"}
                    </strong>
                  </div>
                ) : null}

                {isCurrentYearlyActive && (
                  <div className="license-detail-item">
                    <span>Thời gian còn lại</span>

                    <strong
                      style={{
                        color:
                          Number(
                            activateChurch?.days_remaining ??
                              daysRemaining ??
                              0,
                          ) <= 7
                            ? warningOrange
                            : successGreen,
                      }}
                    >
                      Còn{" "}
                      {Number(
                        activateChurch?.days_remaining ?? daysRemaining ?? 0,
                      )}{" "}
                      ngày
                    </strong>
                  </div>
                )}
              </div>

              {/* PACKAGE */}

              {!isCurrentLifetime && (
                <>
                  <div className="license-package-title">
                    {isUpgradeToLifetime
                      ? "Chọn gói nâng cấp"
                      : "Chọn gói FaithEdu"}
                  </div>

                  <div className="license-package-grid">
                    {/* YEARLY */}

                    <div
                      className={`license-package-card ${
                        isSelectedYearly ? "selected" : ""
                      } ${isCurrentYearlyActive ? "current" : ""}`}
                      onClick={() => {
                        if (activatingId) {
                          return;
                        }

                        setSelectedLicenseType("yearly");
                      }}
                      style={{
                        cursor: activatingId ? "not-allowed" : "pointer",
                      }}
                    >
                      <div className="package-radio">
                        {isSelectedYearly && <CheckCircleFilled />}
                      </div>

                      <div className="package-content">
                        <div className="package-name">
                          Gói 1 năm
                          {isCurrentYearlyActive && (
                            <Tag
                              color="blue"
                              style={{
                                marginLeft: 6,
                                fontSize: 10,
                                borderRadius: 20,
                              }}
                            >
                              ĐANG SỬ DỤNG
                            </Tag>
                          )}
                          {isCurrentYearlyExpired && (
                            <Tag
                              color="red"
                              style={{
                                marginLeft: 6,
                                fontSize: 10,
                                borderRadius: 20,
                              }}
                            >
                              ĐÃ HẾT HẠN
                            </Tag>
                          )}
                        </div>

                        <div className="package-price">599.000đ</div>

                        <div className="package-description">
                          {isCurrentYearlyActive
                            ? "Gia hạn thêm 12 tháng"
                            : isCurrentYearlyExpired
                              ? "Kích hoạt lại 12 tháng"
                              : "Sử dụng FaithEdu trong 12 tháng"}
                        </div>

                        <div className="package-feature">
                          <CheckOutlined />
                          Đầy đủ chức năng
                        </div>

                        <div className="package-feature">
                          <CheckOutlined />
                          Không giới hạn người dùng
                        </div>
                      </div>
                    </div>

                    {/* LIFETIME */}

                    <div
                      className={`license-package-card lifetime ${
                        isSelectedLifetime ? "selected" : ""
                      }`}
                      onClick={() => {
                        if (activatingId) {
                          return;
                        }

                        setSelectedLicenseType("lifetime");
                      }}
                      style={{
                        cursor: activatingId ? "not-allowed" : "pointer",
                      }}
                    >
                      <div className="package-radio">
                        {isSelectedLifetime && <CheckCircleFilled />}
                      </div>

                      <div className="package-content">
                        <div className="package-name">Gói vĩnh viễn</div>

                        <div className="package-price">2.599.000đ</div>

                        <div className="package-description">
                          Sử dụng FaithEdu không thời hạn
                        </div>

                        <div className="package-feature">
                          <CheckOutlined />
                          Không cần gia hạn
                        </div>

                        <div className="package-feature">
                          <CheckOutlined />
                          Đầy đủ chức năng
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SELECTED INFO */}

              <div className="selected-license-info">
                <SafetyCertificateOutlined />

                <div>
                  <Text
                    strong
                    style={{
                      color: primaryNavy,
                    }}
                  >
                    {isCurrentLifetime
                      ? "Gói vĩnh viễn đang được sử dụng"
                      : isUpgradeToLifetime
                        ? "Nâng cấp lên gói vĩnh viễn"
                        : isRenewYearly
                          ? "Gia hạn gói 1 năm"
                          : isReactivateYearly
                            ? "Kích hoạt lại gói 1 năm"
                            : isExpiredToLifetime
                              ? "Mua gói vĩnh viễn"
                              : isTrialToYearly
                                ? "Kích hoạt gói 1 năm"
                                : isTrialToLifetime
                                  ? "Kích hoạt gói vĩnh viễn"
                                  : "Gói FaithEdu"}
                  </Text>

                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      {isCurrentLifetime
                        ? "License không có ngày hết hạn và không cần gia hạn."
                        : isRenewYearly
                          ? "License sẽ được gia hạn thêm 12 tháng."
                          : isReactivateYearly
                            ? "License sẽ được kích hoạt lại trong 12 tháng."
                            : isUpgradeToLifetime ||
                                isExpiredToLifetime ||
                                isTrialToLifetime
                              ? "License sẽ chuyển sang vĩnh viễn và không còn ngày hết hạn."
                              : "License có thời hạn 12 tháng kể từ ngày kích hoạt."}
                    </Text>
                  </div>
                </div>
              </div>

              {/* RENEW NOTICE */}

              {isRenewYearly && (
                <div className="yearly-notice">
                  <SafetyCertificateOutlined />

                  <div>
                    <b>Gia hạn gói 1 năm</b>

                    <div>
                      Gói hiện tại đang hoạt động. Thao tác này sẽ cộng thêm 12
                      tháng vào thời hạn license.
                    </div>
                  </div>
                </div>
              )}

              {/* REACTIVATE NOTICE */}

              {isReactivateYearly && (
                <div className="reactivate-notice">
                  <UnlockOutlined />

                  <div>
                    <b>Kích hoạt lại gói 1 năm</b>

                    <div>
                      License hiện tại đã hết hạn. Sau khi xác nhận, cơ sở sẽ có
                      thêm 12 tháng sử dụng FaithEdu.
                    </div>
                  </div>
                </div>
              )}

              {/* UPGRADE NOTICE */}

              {(isUpgradeToLifetime ||
                isExpiredToLifetime ||
                isTrialToLifetime) && (
                <div className="upgrade-notice">
                  <SafetyCertificateOutlined />

                  <div>
                    <b>Gói vĩnh viễn</b>

                    <div>
                      Sau khi xác nhận, license sẽ không còn ngày hết hạn và
                      không cần gia hạn.
                    </div>
                  </div>
                </div>
              )}

              {/* LIFETIME */}

              {isCurrentLifetime && (
                <div className="lifetime-notice">
                  <CheckCircleFilled />

                  <div>
                    <b>License vĩnh viễn đang hoạt động</b>

                    <div>
                      Cơ sở này không cần gia hạn và không thể kích hoạt một
                      license khác.
                    </div>
                  </div>
                </div>
              )}

              {/* WARNING */}

              {!isCurrentLifetime && (
                <div className="activate-warning">
                  <InfoCircleOutlined />

                  <span>
                    Bạn đang thao tác license cho{" "}
                    <b>{activateChurch?.name || "cơ sở này"}</b>. Vui lòng kiểm
                    tra đúng gói trước khi xác nhận.
                  </span>
                </div>
              )}

              {/* ACTION */}

              <div className="license-actions">
                <Button
                  size="large"
                  onClick={closeActivateModal}
                  disabled={!!activatingId}
                  style={{
                    borderRadius: 9,
                  }}
                >
                  {isCurrentLifetime ? "Đóng" : "Hủy"}
                </Button>

                {!isCurrentLifetime && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<UnlockOutlined />}
                    loading={!!activatingId}
                    onClick={handleActivateLicense}
                    disabled={licenseActionDisabled}
                    style={{
                      background: primaryNavy,
                      borderColor: primaryNavy,
                      borderRadius: 9,
                      fontWeight: 600,
                    }}
                  >
                    {isUpgradeToLifetime ||
                    isExpiredToLifetime ||
                    isTrialToLifetime
                      ? "Kích hoạt vĩnh viễn"
                      : isRenewYearly
                        ? "Gia hạn 1 năm"
                        : isReactivateYearly
                          ? "Mua lại 1 năm"
                          : "Kích hoạt gói 1 năm"}
                  </Button>
                )}
              </div>
            </div>
          </Modal>

          {/* ==================================================
              STYLE
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

                .church-filter-card {
                  margin-bottom: 18px;
                  border-radius: 16px !important;
                  border: 1px solid rgba(27,54,93,.08) !important;
                  box-shadow: 0 6px 20px rgba(27,54,93,.04) !important;
                }

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

                .license-status-side {
                  min-width: 130px;
                }

                .activate-arrow {
                  font-size: 22px;
                  color: ${accentGold};
                  font-weight: 700;
                }

                .license-detail-card {
                  margin-top: 14px;
                  padding: 12px 14px;
                  border-radius: 11px;
                  background: #fff;
                  border: 1px solid rgba(27,54,93,.09);
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
                }

                .license-detail-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  gap: 15px;
                  font-size: 12px;
                }

                .license-detail-item span {
                  color: #64748b;
                }

                .license-detail-item strong {
                  color: ${primaryNavy};
                  text-align: right;
                }

                .license-package-title {
                  text-align: left;
                  color: ${primaryNavy};
                  font-size: 13px;
                  font-weight: 700;
                  margin-top: 20px;
                  margin-bottom: 10px;
                }

                .license-package-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 12px;
                }

                .license-package-card {
                  position: relative;
                  display: flex;
                  gap: 10px;
                  padding: 15px;
                  cursor: pointer;
                  text-align: left;
                  border-radius: 13px;
                  background: #fff;
                  border: 2px solid #e2e8f0;
                  transition: all .2s ease;
                }

                .license-package-card:hover {
                  border-color: rgba(27,54,93,.35);
                  box-shadow: 0 5px 15px rgba(27,54,93,.06);
                }

                .license-package-card.selected {
                  border-color: ${primaryNavy};
                  background: rgba(27,54,93,.035);
                  box-shadow: 0 6px 18px rgba(27,54,93,.08);
                }

                .license-package-card.lifetime.selected {
                  border-color: ${accentGold};
                  background: rgba(212,175,55,.045);
                }

                .license-package-card.current {
                  box-shadow: none;
                }

                .package-radio {
                  width: 22px;
                  height: 22px;
                  flex-shrink: 0;
                  color: ${primaryNavy};
                  font-size: 20px;
                  line-height: 22px;
                }

                .license-package-card.lifetime .package-radio {
                  color: ${accentGold};
                }

                .package-content {
                  min-width: 0;
                }

                .package-name {
                  color: ${primaryNavy};
                  font-size: 14px;
                  font-weight: 700;
                }

                .package-price {
                  margin-top: 3px;
                  color: ${primaryNavy};
                  font-size: 21px;
                  font-weight: 800;
                }

                .package-description {
                  margin-top: 4px;
                  color: #64748b;
                  font-size: 11px;
                  line-height: 1.5;
                }

                .package-feature {
                  display: flex;
                  align-items: center;
                  gap: 5px;
                  margin-top: 7px;
                  color: #475569;
                  font-size: 11px;
                }

                .package-feature svg {
                  color: ${successGreen};
                  font-size: 11px;
                }

                .selected-license-info {
                  display: flex;
                  align-items: flex-start;
                  gap: 10px;
                  margin-top: 14px;
                  padding: 11px 13px;
                  text-align: left;
                  border-radius: 10px;
                  background: rgba(27,54,93,.045);
                  border: 1px solid rgba(27,54,93,.1);
                }

                .selected-license-info > svg {
                  margin-top: 2px;
                  color: ${accentGold};
                  font-size: 18px;
                }

                .yearly-notice,
                .reactivate-notice,
                .upgrade-notice,
                .lifetime-notice {
                  margin-top: 12px;
                  padding: 12px 14px;
                  display: flex;
                  align-items: flex-start;
                  gap: 9px;
                  text-align: left;
                  border-radius: 10px;
                  font-size: 12px;
                  line-height: 1.6;
                }

                .yearly-notice {
                  color: ${primaryNavy};
                  background: rgba(27,54,93,.045);
                  border: 1px solid rgba(27,54,93,.12);
                }

                .reactivate-notice {
                  color: #92400e;
                  background: #fffbeb;
                  border: 1px solid #fde68a;
                }

                .upgrade-notice {
                  color: ${primaryNavy};
                  background: rgba(212,175,55,.08);
                  border: 1px solid rgba(212,175,55,.3);
                }

                .lifetime-notice {
                  color: ${successGreen};
                  background: rgba(46,125,50,.06);
                  border: 1px solid rgba(46,125,50,.2);
                }

                .yearly-notice > svg,
                .reactivate-notice > svg,
                .upgrade-notice > svg,
                .lifetime-notice > svg {
                  margin-top: 2px;
                  font-size: 17px;
                  flex-shrink: 0;
                }

                .yearly-notice b,
                .reactivate-notice b,
                .upgrade-notice b,
                .lifetime-notice b {
                  display: block;
                  margin-bottom: 2px;
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

                .license-actions {
                  display: flex;
                  justify-content: flex-end;
                  gap: 10px;
                  margin-top: 24px;
                }

                .modal-custom-title {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-family: 'Playfair Display', Georgia, serif;
                  color: ${primaryNavy};
                  font-size: 18px;
                  font-weight: 700;
                }

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

                  .license-package-grid {
                    grid-template-columns: 1fr;
                  }

                  .activate-current-status {
                    gap: 12px;
                  }

                  .license-status-side {
                    min-width: 0;
                  }

                  .church-editorial-layout {
                    padding: 20px 8px 50px;
                  }

                  .map-container-wrapper .leaflet-container {
                    height: 380px !important;
                  }

                  .license-detail-item {
                    align-items: flex-start;
                  }

                  .license-actions {
                    flex-direction: column-reverse;
                  }

                  .license-actions .ant-btn {
                    width: 100%;
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
