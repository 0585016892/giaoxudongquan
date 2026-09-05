import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Switch,
  message,
  Modal,
  Form,
  Popconfirm,
  Card,
  Typography,
  Select,
  Row,
  Col,
  Avatar,
  Tag,
  Divider,
  Tooltip,
  Badge,
  ConfigProvider,
  Upload,
  Image,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  CompassOutlined,
  ReloadOutlined,
  PictureOutlined,
  UploadOutlined,
  LinkOutlined,
} from "@ant-design/icons";

import { useChurch } from "../hooks/useChurch";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const defaultCenter = { lat: 21.0285, lng: 105.8542 };

// Khắc phục lỗi hiển thị Marker của thư viện Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Component điều khiển View bản đồ (Dùng memo & kiểm tra lat/lng để tránh loop)
function ChangeView({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);
  return null;
}

const ChurchPage = () => {
  const { fetchChurches, addChurch, editChurch, removeChurch, toggleActive } =
    useChurch();
  const [form] = Form.useForm();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [marker, setMarker] = useState(defaultCenter);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapStyle, setMapStyle] = useState("street");

  // State Quản lý Upload Ảnh
  const [fileList, setFileList] = useState([]);
  const [imageTab, setImageTab] = useState("file"); // 'file' | 'url'
  const [previewImage, setPreviewImage] = useState("");

  // ✅ FIX LỖI 1: Bỏ 'fetchChurches' ra khỏi dependency array để tránh lặp vô tận
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchChurches();
      setData(res?.data || res || []);
    } catch (err) {
      console.error("Lỗi gọi dữ liệu:", err);
      message.error("Không gọi được dữ liệu từ Server!");
    } finally {
      setLoading(false);
    }
  }, [fetchChurches]); // Bọc mảng rỗng []

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper xử lý đường dẫn hiển thị ảnh chuẩn
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === "") return null;
    if (imagePath.startsWith("http")) return imagePath;

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    console.log(cleanPath);

    console.log("getImageUrl:", `${baseUrl}${cleanPath}`);
    return `${baseUrl}${cleanPath}`;
  };

  const handleSearchLocation = async (value) => {
    if (!value) return;
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: { q: value, format: "json", limit: 1 },
        },
      );
      if (res.data?.[0]) {
        const newPos = {
          lat: parseFloat(res.data[0].lat),
          lng: parseFloat(res.data[0].lon),
        };
        setMapCenter(newPos);
        setMarker(newPos);
        reverseGeocode(newPos.lat, newPos.lng);
      } else {
        message.warning("Không tìm thấy địa điểm yêu cầu.");
      }
    } catch (error) {
      message.error("Lỗi trong quá trình tìm kiếm tọa độ vị trí!");
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: { lat, lon: lng, format: "json" },
        },
      );
      const addr = res.data.address;
      form.setFieldsValue({
        address: res.data.display_name,
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
    } catch (e) {
      console.error(e);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setMarker(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return <Marker position={marker} />;
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFileList([]);
    setPreviewImage("");

    if (item) {
      const pos = {
        lat: Number(item.latitude) || defaultCenter.lat,
        lng: Number(item.longitude) || defaultCenter.lng,
      };
      form.setFieldsValue(item);
      setMarker(pos);
      setMapCenter(pos);

      if (item.image) {
        setPreviewImage(getImageUrl(item.image));
        if (item.image.startsWith("http")) {
          setImageTab("url");
        } else {
          setImageTab("file");
        }
      }
    } else {
      form.resetFields();
      form.setFieldsValue({ type: "GIAO_HO", is_active: 1 });
      setMarker(defaultCenter);
      setMapCenter(defaultCenter);
    }
    setIsModalOpen(true);
  };

  // Xử lý Lưu Form
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      formData.set("is_active", values.is_active ? 1 : 0);

      if (imageTab === "file" && fileList.length > 0) {
        formData.append("image", fileList[0].originFileObj);
      } else if (imageTab === "url" && values.image) {
        formData.append("image", values.image);
      }

      if (editingItem) {
        await editChurch(editingItem.id, formData);
      } else {
        await addChurch(formData);
      }

      message.success("Lưu hồ sơ cơ sở thành công!");
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      message.warning("Vui lòng kiểm tra lại các trường thông tin bắt buộc!");
    }
  };
  console.log(data);

  const columns = [
    {
      title: "Hình ảnh",
      key: "image",
      width: 90,
      align: "center",
      render: (_, r) => {
        const url = getImageUrl(r.image);
        return url ? (
          <Image
            src={url}
            alt={r.name}
            width={54}
            height={54}
            style={{ objectFit: "cover", borderRadius: "10px" }}
            fallback="https://via.placeholder.com/150?text=No+Image"
          />
        ) : (
          <Avatar
            shape="square"
            size={54}
            style={{
              backgroundColor: "rgba(212, 175, 55, 0.12)",
              color: primaryNavy,
              borderRadius: "10px",
              border: "1px solid rgba(212, 175, 55, 0.3)",
            }}
            icon={<HomeOutlined style={{ fontSize: 24 }} />}
          />
        );
      },
    },
    {
      title: "Cơ sở Giáo phận",
      key: "church_info",
      width: 280,
      render: (_, r) => (
        <Space size="middle">
          <Badge
            count={r.type === "GIAO_XU" ? "Xứ" : "Họ"}
            style={{
              backgroundColor: r.type === "GIAO_XU" ? primaryNavy : "#475569",
              color: "#fff",
              fontWeight: 700,
              fontSize: "10px",
              boxShadow: "none",
            }}
          />
          <div>
            <Text strong style={{ fontSize: 15, color: primaryNavy }}>
              {r.name}
            </Text>
            <div style={{ marginTop: 2 }}>
              <Tag className="gold-code-tag">
                <GlobalOutlined style={{ marginRight: 4 }} />
                {r.code || "N/A"}
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
      render: (_, r) => (
        <Space direction="vertical" size={2} style={{ fontSize: "13px" }}>
          <div>
            <UserOutlined style={{ color: primaryNavy, marginRight: 6 }} />
            <Text type="secondary">LM:</Text>{" "}
            <b style={{ color: primaryNavy }}>{r.pastor_name || "Chưa có"}</b>
          </div>
          <div>
            <PhoneOutlined style={{ color: primaryNavy, marginRight: 6 }} />
            {r.phone ? (
              <a
                href={`tel:${r.phone}`}
                style={{ color: primaryNavy, fontWeight: 600 }}
              >
                {r.phone}
              </a>
            ) : (
              <Text type="secondary" italic>
                ---
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Địa chỉ mục vụ",
      dataIndex: "address",
      ellipsis: { showTitle: true },
      render: (text) => (
        <Tooltip title={text}>
          <Text style={{ color: "#64748b", fontSize: "13px" }}>
            {text || "Chưa xác định"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      align: "center",
      width: 120,
      render: (val, r) => (
        <Space direction="vertical" size={2} align="center">
          <Switch
            size="small"
            checked={val === 1}
            onChange={() => toggleActive(r.id).then(loadData)}
          />
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: val === 1 ? "#2e7d32" : "#94a3b8",
              marginTop: 2,
            }}
          >
            {val === 1 ? "HOẠT ĐỘNG" : "ẨN CƠ SỞ"}
          </span>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      align: "center",
      width: 110,
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              shape="circle"
              icon={
                <EditOutlined style={{ color: primaryNavy, fontSize: 16 }} />
              }
              onClick={() => openModal(r)}
              className="action-btn-edit"
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận gỡ bỏ cơ sở này?"
            description="Tất cả dữ liệu phân phối công tác mục vụ đi kèm sẽ bị xóa."
            okText="Xóa dữ liệu"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => removeChurch(r.id).then(loadData)}
          >
            <Tooltip title="Xóa cơ sở">
              <Button
                type="text"
                shape="circle"
                danger
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                className="action-btn-delete"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
      <div className="church-editorial-layout">
        <div className="church-editorial-container">
          {/* HEADER SECTION */}
          <div className="church-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG QUẢN LÝ ĐỊA GIỚI MỤC VỤ
              </span>
              <Title level={2} className="church-main-title">
                DANH MỤC GIÁO XỨ & GIÁO HỌ
              </Title>
              <Paragraph className="church-sub-title">
                Thiết lập hệ thống phân cấp hành chính các cơ sở nhà thờ, hình
                ảnh và tọa độ bản đồ trực tuyến.
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Button
                icon={<ReloadOutlined />}
                onClick={loadData}
                loading={loading}
                className="refresh-btn"
                style={{ marginRight: 10 }}
              >
                Làm mới
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
                className="add-church-btn"
              >
                Thêm Cơ Sở Mới
              </Button>
            </div>
          </div>

          {/* MAIN DATA TABLE CARD */}
          <Card bordered={false} className="main-table-card">
            <Table
              loading={loading}
              dataSource={data}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng số: ${total} cơ sở Giáo phận`,
                style: { marginTop: 20 },
              }}
              scroll={{ x: 950 }}
              className="custom-admin-table"
            />
          </Card>
        </div>

        {/* STRUCTURE MODAL */}
        <Modal
          title={
            <div className="modal-custom-title">
              <CompassOutlined style={{ color: accentGold }} />
              <span>
                {editingItem
                  ? "Cập Nhật Hồ Sơ Cơ Sở Giáo Xứ/Họ"
                  : "Khai Báo Cơ Sở Giáo Phận Mới"}
              </span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSave}
          width={1250}
          centered
          destroyOnClose
          okText="Lưu hồ sơ"
          cancelText="Đóng"
          okButtonProps={{
            style: {
              backgroundColor: primaryNavy,
              borderRadius: 8,
              height: 38,
              fontWeight: 600,
            },
          }}
          cancelButtonProps={{
            style: { borderRadius: 8, height: 38 },
          }}
        >
          <Form form={form} layout="vertical" style={{ paddingTop: 12 }}>
            <Row gutter={24}>
              {/* CỘT TRÁI: FORM ĐIỀU KHIỂN & HÌNH ẢNH */}
              <Col span={10}>
                <div className="form-left-box">
                  {/* MỤC UPLOAD HÌNH ẢNH */}
                  <Divider
                    orientation="left"
                    plain
                    style={{ margin: "0 0 14px 0" }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: primaryNavy,
                        fontSize: 13,
                      }}
                    >
                      <PictureOutlined
                        style={{ color: accentGold, marginRight: 6 }}
                      />{" "}
                      Hình ảnh đại diện cơ sở
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
                            <UploadOutlined /> Tải file từ máy
                          </span>
                        ),
                        children: (
                          <div style={{ marginTop: 8 }}>
                            <Upload
                              listType="picture-card"
                              maxCount={1}
                              fileList={fileList}
                              beforeUpload={() => false}
                              onChange={({ fileList: newFileList }) => {
                                setFileList(newFileList);
                                if (newFileList.length > 0) {
                                  const file = newFileList[0].originFileObj;
                                  setPreviewImage(URL.createObjectURL(file));
                                } else {
                                  setPreviewImage("");
                                }
                              }}
                            >
                              {fileList.length < 1 && (
                                <div>
                                  <PlusOutlined />
                                  <div style={{ marginTop: 8, fontSize: 12 }}>
                                    Chọn ảnh
                                  </div>
                                </div>
                              )}
                            </Upload>

                            {previewImage && fileList.length === 0 && (
                              <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  Ảnh hiện tại:
                                </Text>
                                <div style={{ marginTop: 4 }}>
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
                            <LinkOutlined /> Nhập URL ảnh
                          </span>
                        ),
                        children: (
                          <Form.Item
                            name="image"
                            style={{ marginBottom: 0, marginTop: 8 }}
                          >
                            <Input
                              prefix={
                                <LinkOutlined style={{ color: "#94a3b8" }} />
                              }
                              placeholder="https://domain.com/hinhanh.jpg"
                              className="custom-form-input"
                              onChange={(e) => setPreviewImage(e.target.value)}
                            />
                          </Form.Item>
                        ),
                      },
                    ]}
                  />

                  <Divider
                    orientation="left"
                    plain
                    style={{ margin: "16px 0 14px 0" }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: primaryNavy,
                        fontSize: 13,
                      }}
                    >
                      <InfoCircleOutlined
                        style={{ color: accentGold, marginRight: 6 }}
                      />{" "}
                      Thông tin cơ bản
                    </span>
                  </Divider>

                  <Row gutter={12}>
                    <Col span={16}>
                      <Form.Item
                        name="name"
                        label={
                          <Text strong className="form-field-label">
                            Tên Giáo xứ / Giáo họ *
                          </Text>
                        }
                        rules={[
                          { required: true, message: "Bắt buộc nhập tên" },
                        ]}
                      >
                        <Input
                          placeholder="Ví dụ: Giáo xứ Đồng Quan..."
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="code"
                        label={
                          <Text strong className="form-field-label">
                            Mã ngắn *
                          </Text>
                        }
                        rules={[{ required: true, message: "Mã ngắn" }]}
                      >
                        <Input
                          placeholder="GX_DQ"
                          style={{ textTransform: "uppercase" }}
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        name="type"
                        label={
                          <Text strong className="form-field-label">
                            Cấp bậc loại hình
                          </Text>
                        }
                      >
                        <Select
                          style={{ width: "100%" }}
                          className="custom-form-input"
                        >
                          <Option value="GIAO_XU">Giáo xứ (Chánh xứ)</Option>
                          <Option value="GIAO_HO">Giáo họ (Thuộc xứ)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="pastor_name"
                        label={
                          <Text strong className="form-field-label">
                            Linh mục phụ trách
                          </Text>
                        }
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                          placeholder="Cha Chánh/Phó xứ..."
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label={
                          <Text strong className="form-field-label">
                            Số điện thoại
                          </Text>
                        }
                      >
                        <Input
                          prefix={
                            <PhoneOutlined style={{ color: "#94a3b8" }} />
                          }
                          placeholder="09xxxx..."
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label={
                          <Text strong className="form-field-label">
                            Email
                          </Text>
                        }
                      >
                        <Input
                          prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                          placeholder="vanphong@..."
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider
                    orientation="left"
                    plain
                    style={{ margin: "16px 0 14px 0" }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: primaryNavy,
                        fontSize: 13,
                      }}
                    >
                      <EnvironmentOutlined
                        style={{ color: accentGold, marginRight: 6 }}
                      />{" "}
                      Địa giới & Tọa độ
                    </span>
                  </Divider>

                  <Form.Item
                    name="address"
                    label={
                      <Text strong className="form-field-label">
                        Địa chỉ chi tiết
                      </Text>
                    }
                  >
                    <TextArea
                      rows={2}
                      placeholder="Số nhà, thôn xóm, đường đi..."
                      className="custom-form-input"
                    />
                  </Form.Item>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        name="district"
                        label={
                          <Text strong className="form-field-label">
                            Quận / Huyện
                          </Text>
                        }
                      >
                        <Input
                          placeholder="Huyện Tiền Hải"
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="ward"
                        label={
                          <Text strong className="form-field-label">
                            Phường / Xã
                          </Text>
                        }
                      >
                        <Input
                          placeholder="Xã Giang Hải"
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        name="latitude"
                        label={
                          <Text strong className="form-field-label">
                            Vĩ độ (Latitude)
                          </Text>
                        }
                      >
                        <Input
                          disabled
                          style={{
                            background: "#f1f5f9",
                            color: primaryNavy,
                            fontWeight: 700,
                          }}
                          prefix={
                            <CompassOutlined style={{ color: accentGold }} />
                          }
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="longitude"
                        label={
                          <Text strong className="form-field-label">
                            Kinh độ (Longitude)
                          </Text>
                        }
                      >
                        <Input
                          disabled
                          style={{
                            background: "#f1f5f9",
                            color: primaryNavy,
                            fontWeight: 700,
                          }}
                          prefix={
                            <CompassOutlined style={{ color: accentGold }} />
                          }
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="is_active"
                    label={
                      <Text strong className="form-field-label">
                        Trạng thái đồng bộ công khai
                      </Text>
                    }
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch
                      checkedChildren="Đang hiển thị"
                      unCheckedChildren="Đang tạm khóa"
                    />
                  </Form.Item>
                </div>
              </Col>

              {/* CỘT PHẢI: MAP BẢN ĐỒ LEAFLET */}
              <Col span={14}>
                <div className="map-right-box">
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    <Input.Search
                      placeholder="Nhập địa danh cần tìm nhanh (Thái Bình, Tiền Hải...)"
                      enterButton={
                        <Button
                          type="primary"
                          icon={<SearchOutlined />}
                          style={{ background: primaryNavy, border: "none" }}
                        >
                          Định vị nhanh
                        </Button>
                      }
                      onSearch={handleSearchLocation}
                      size="large"
                      className="custom-search-map"
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: 600,
                          color: primaryNavy,
                          fontSize: 13,
                        }}
                      >
                        <EnvironmentOutlined
                          style={{ color: accentGold, marginRight: 4 }}
                        />
                        Click chọn vị trí trên bản đồ để tự động lấy tọa độ
                      </Text>

                      <Select
                        defaultValue="street"
                        size="small"
                        style={{ width: 140 }}
                        onChange={setMapStyle}
                      >
                        <Option value="street">Bản đồ giao thông</Option>
                        <Option value="satellite">Ảnh vệ tinh địa hình</Option>
                        <Option value="light">Bản đồ tối giản sáng</Option>
                      </Select>
                    </div>

                    <div className="map-container-wrapper">
                      <MapContainer
                        center={[mapCenter.lat, mapCenter.lng]}
                        zoom={15}
                        style={{ height: 480 }}
                      >
                        {/* ✅ FIX LỖI 2: Truyền lat, lng dạng primitive thay vì Object mới */}
                        <ChangeView
                          lat={mapCenter.lat}
                          lng={mapCenter.lng}
                          zoom={15}
                        />
                        {mapStyle === "street" && (
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        )}
                        {mapStyle === "satellite" && (
                          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        )}
                        {mapStyle === "light" && (
                          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        )}
                        <LocationMarker />
                      </MapContainer>
                    </div>

                    <Text
                      type="secondary"
                      italic
                      style={{ fontSize: "12px", color: "#64748b" }}
                    >
                      * Tích hợp tính năng định vị ngược (Reverse Geocoding):
                      Click chọn điểm bất kỳ trên bản đồ, tọa độ Lat/Lng và tên
                      địa danh sẽ tự động cập nhật vào mẫu khai báo bên trái.
                    </Text>
                  </Space>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .church-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .church-editorial-container {
              max-width: 1200px;
              margin: 0 auto;
            }

            /* Header Section */
            .church-header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 28px;
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

            .church-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .church-sub-title {
              color: #64748b;
              margin: 4px 0 0 0 !important;
              font-size: 14px;
            }

            .refresh-btn {
              border-radius: 10px !important;
              border-color: rgba(27, 54, 93, 0.2) !important;
              color: ${primaryNavy} !important;
              font-weight: 600;
              height: 42px;
            }

            .add-church-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            /* Main Table Card */
            .main-table-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 8px;
            }

            .custom-admin-table .ant-table-thead > tr > th {
              background: ${softBg} !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              border-bottom: 1px solid rgba(27, 54, 93, 0.1) !important;
            }

            .gold-code-tag {
              background: rgba(212, 175, 55, 0.12) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 6px;
              font-weight: 600;
              font-size: 11px;
            }

            .action-btn-edit:hover {
              background: rgba(27, 54, 93, 0.1) !important;
            }

            .action-btn-delete:hover {
              background: #fff5f5 !important;
            }

            /* Modal Style */
            .modal-custom-title {
              display: flex;
              align-items: center;
              gap: 8px;
              font-family: 'Playfair Display', serif;
              color: ${primaryNavy};
              font-size: 18px;
              font-weight: 700;
            }

            .form-left-box {
              background: ${softBg};
              padding: 18px;
              border-radius: 14px;
              border: 1px solid rgba(27, 54, 93, 0.1);
              max-height: 560px;
              overflow-y: auto;
            }

            .map-right-box {
              background: #ffffff;
              padding: 18px;
              border-radius: 14px;
              border: 1px solid rgba(212, 175, 55, 0.3);
              height: 100%;
            }

            .map-container-wrapper {
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid rgba(27, 54, 93, 0.1);
              box-shadow: 0 4px 12px rgba(27, 54, 93, 0.05);
            }

            .form-field-label {
              font-size: 13px;
              color: ${primaryNavy};
            }

            .custom-form-input {
              border-radius: 8px !important;
            }

            .leaflet-container {
              z-index: 10 !important;
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default ChurchPage;
