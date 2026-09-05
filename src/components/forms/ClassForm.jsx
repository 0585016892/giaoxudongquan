import React, { useEffect } from "react";

import {
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Row,
  Col,
  Space,
  Typography,
} from "antd";

import {
  EnvironmentOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  ScheduleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

const { TextArea } = Input;
const { Text } = Typography;

/* =========================================================
   THEME
========================================================= */

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const borderColor = "#E8ECF1";

/* =========================================================
   OPTIONS
========================================================= */

const categoryOptions = [
  {
    value: "Lớn Lên Trong Chúa Thánh Thần",
    label: "Lớn Lên Trong Chúa Thánh Thần",
  },
  {
    value: "Đến Bàn Tiệc Thánh",
    label: "Đến Bàn Tiệc Thánh",
  },
  {
    value: "Giáo lý Sống Đạo",
    label: "Giáo lý Sống Đạo",
  },
  {
    value: "Giáo lý Vào Đời",
    label: "Giáo lý Vào Đời",
  },
  {
    value: "Giáo lý Hôn Nhân",
    label: "Giáo lý Hôn Nhân",
  },
];

const statusOptions = [
  {
    value: "active",
    label: "Đang hoạt động",
  },
  {
    value: "paused",
    label: "Tạm dừng",
  },
  {
    value: "completed",
    label: "Đã kết thúc",
  },
];

const dayOptions = [
  {
    value: 1,
    label: "Thứ Hai",
  },
  {
    value: 2,
    label: "Thứ Ba",
  },
  {
    value: 3,
    label: "Thứ Tư",
  },
  {
    value: 4,
    label: "Thứ Năm",
  },
  {
    value: 5,
    label: "Thứ Sáu",
  },
  {
    value: 6,
    label: "Thứ Bảy",
  },
  {
    value: 7,
    label: "Chúa Nhật",
  },
];

/* =========================================================
   SECTION
========================================================= */

const FormSection = ({ icon, title, children, marginBottom = 16 }) => {
  return (
    <div
      style={{
        padding: 16,
        marginBottom,
        borderRadius: 16,
        background: "#FAFBFC",
        border: `1px solid ${borderColor}`,
      }}
    >
      <Space
        size={8}
        style={{
          marginBottom: 16,
        }}
      >
        <span
          style={{
            color: accentGold,
            fontSize: 14,
          }}
        >
          {icon}
        </span>

        <Text
          strong
          style={{
            color: primaryNavy,
            fontSize: 13,
          }}
        >
          {title}
        </Text>
      </Space>

      {children}
    </div>
  );
};

/* =========================================================
   TIME HELPERS
========================================================= */

const normalizeTime = (value) => {
  if (!value) return null;

  if (dayjs.isDayjs(value)) {
    return value;
  }

  const stringValue = String(value);

  const parsed = dayjs(
    stringValue.length >= 8 ? stringValue.slice(0, 8) : stringValue,
    "HH:mm:ss",
  );

  return parsed.isValid() ? parsed : null;
};

/* =========================================================
   CLASS FORM
========================================================= */

const ClassForm = ({
  form,

  editingClass = null,

  loading = false,

  onFinish,

  onValuesChange,
}) => {
  /*
   * -------------------------------------------------------
   * RESET / SET EDIT DATA
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!form) return;

    if (!editingClass) {
      form.resetFields();

      form.setFieldsValue({
        category: "Vui lòng chọn chương trình",
        status: "active",
        name: undefined,
        description: undefined,
        room: undefined,
        day_of_week: undefined,
        start_time: null,
        end_time: null,
        start_date: null,
        end_date: null,
      });

      return;
    }

    form.setFieldsValue({
      name: editingClass.name || "",

      category: editingClass.category || "Giáo lý Hôn Nhân",

      description: editingClass.description || "",

      room: editingClass.room || "",

      day_of_week: editingClass.day_of_week
        ? Number(editingClass.day_of_week)
        : undefined,

      start_time: normalizeTime(editingClass.start_time),

      end_time: normalizeTime(editingClass.end_time),

      start_date: editingClass.start_date
        ? dayjs(editingClass.start_date)
        : null,

      end_date: editingClass.end_date ? dayjs(editingClass.end_date) : null,

      status: editingClass.status || "active",
    });
  }, [editingClass, form]);

  /* =======================================================
     DATE DISABLED
  ======================================================= */

  const disableStartDate = (current) => {
    if (!current) return false;

    /*
     * Không cho chọn ngày bắt đầu trong quá khứ.
     *
     * Nếu muốn cho phép sửa lớp cũ mà vẫn chọn ngày cũ,
     * có thể bỏ đoạn này.
     */

    const today = dayjs().startOf("day");

    return current.isBefore(today);
  };

  const disableEndDate = (current) => {
    if (!current) return false;

    const startDate = form?.getFieldValue("start_date");

    if (!startDate) {
      return false;
    }

    return current.isBefore(dayjs(startDate).startOf("day"));
  };

  /* =======================================================
     TIME DISABLED
  ======================================================= */

  const disableStartTime = () => {
    return {};
  };

  const disableEndTime = () => {
    const startTime = form?.getFieldValue("start_time");

    if (!startTime) {
      return {};
    }

    const hour = dayjs(startTime).hour();
    const minute = dayjs(startTime).minute();

    return {
      disabledHours: () => {
        return Array.from({ length: hour }, (_, index) => index);
      },

      disabledMinutes: (selectedHour) => {
        if (selectedHour !== hour) {
          return [];
        }

        return Array.from({ length: minute }, (_, index) => index);
      },
    };
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onValuesChange={onValuesChange}
      disabled={loading}
    >
      {/* ===================================================
          BASIC INFORMATION
      =================================================== */}

      <FormSection icon={<InfoCircleOutlined />} title="Thông tin cơ bản">
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item
              name="name"
              label="Tên lớp học"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên lớp",
                },
                {
                  whitespace: true,
                  message: "Tên lớp không được để trống",
                },
                {
                  max: 150,
                  message: "Tên lớp không được vượt quá 150 ký tự",
                },
              ]}
              style={{
                marginBottom: 16,
              }}
            >
              <Input
                size="large"
                placeholder="Ví dụ: Lớp Hôn Nhân K01"
                style={{
                  borderRadius: 10,
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Mã lớp"
              style={{
                marginBottom: 16,
              }}
            >
              <Input
                size="large"
                disabled
                value={editingClass?.code || "Tự động tạo"}
                prefix={<IdcardOutlined />}
                style={{
                  borderRadius: 10,
                  background: "#F3F5F7",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="category"
              label="Chương trình giáo lý"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn chương trình",
                },
              ]}
              style={{
                marginBottom: 0,
              }}
            >
              <Select
                size="large"
                options={categoryOptions}
                placeholder="Chọn chương trình"
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn trạng thái",
                },
              ]}
              style={{
                marginBottom: 0,
              }}
            >
              <Select
                size="large"
                options={statusOptions}
                placeholder="Chọn trạng thái"
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      {/* ===================================================
          SCHEDULE
      =================================================== */}

      <FormSection icon={<ScheduleOutlined />} title="Lịch học">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="room" label="Phòng học">
              <Input
                size="large"
                prefix={<EnvironmentOutlined />}
                placeholder="Ví dụ: Phòng A01"
                style={{
                  borderRadius: 10,
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="day_of_week" label="Ngày học">
              <Select
                size="large"
                placeholder="Chọn ngày học"
                options={dayOptions}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* TIME */}

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="start_time" label="Giờ bắt đầu">
              <TimePicker
                size="large"
                format="HH:mm"
                minuteStep={5}
                disabledTime={disableStartTime}
                style={{
                  width: "100%",
                  borderRadius: 10,
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="end_time"
              label="Giờ kết thúc"
              dependencies={["start_time"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue("start_time");

                    if (!value || !startTime) {
                      return Promise.resolve();
                    }

                    const start = dayjs(startTime);

                    const end = dayjs(value);

                    if (end.isAfter(start)) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("Giờ kết thúc phải sau giờ bắt đầu"),
                    );
                  },
                }),
              ]}
            >
              <TimePicker
                size="large"
                format="HH:mm"
                minuteStep={5}
                disabledTime={disableEndTime}
                style={{
                  width: "100%",
                  borderRadius: 10,
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* DATE */}

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="start_date"
              label="Ngày bắt đầu"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const endDate = getFieldValue("end_date");

                    if (!value || !endDate) {
                      return Promise.resolve();
                    }

                    if (
                      dayjs(value).isSame(dayjs(endDate), "day") ||
                      dayjs(value).isBefore(dayjs(endDate), "day")
                    ) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc",
                      ),
                    );
                  },
                }),
              ]}
              style={{
                marginBottom: 0,
              }}
            >
              <DatePicker
                size="large"
                format="DD/MM/YYYY"
                disabledDate={disableStartDate}
                placeholder="Chọn ngày bắt đầu"
                style={{
                  width: "100%",
                  borderRadius: 10,
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="end_date"
              label="Ngày kết thúc"
              dependencies={["start_date"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("start_date");

                    if (!value || !startDate) {
                      return Promise.resolve();
                    }

                    if (
                      dayjs(value).isSame(dayjs(startDate), "day") ||
                      dayjs(value).isAfter(dayjs(startDate), "day")
                    ) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
                      ),
                    );
                  },
                }),
              ]}
              style={{
                marginBottom: 0,
              }}
            >
              <DatePicker
                size="large"
                format="DD/MM/YYYY"
                disabledDate={disableEndDate}
                placeholder="Chọn ngày kết thúc"
                style={{
                  width: "100%",
                  borderRadius: 10,
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      {/* ===================================================
          DESCRIPTION
      =================================================== */}

      <FormSection icon={<FileTextOutlined />} title="Mô tả" marginBottom={0}>
        <Form.Item
          name="description"
          style={{
            marginBottom: 0,
          }}
        >
          <TextArea
            rows={4}
            showCount
            maxLength={500}
            placeholder="Nhập mô tả hoặc thông tin thêm về lớp học..."
            style={{
              borderRadius: 10,
            }}
          />
        </Form.Item>
      </FormSection>
    </Form>
  );
};

export default ClassForm;
