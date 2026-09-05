import React from "react";
import {
  CalendarOutlined,
  DesktopOutlined,
  FormOutlined,
} from "@ant-design/icons";
import {
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from "antd";

const { Text } = Typography;

const COLORS = {
  primary: "#1B365D",
  primaryLight: "#F3F6FA",
  text: "#1E293B",
  textSecondary: "#64748B",
};

const ResultForm = ({
  form,
  students = [],
  studentsLoading = false,
  editingResult = null,
  submitting = false,
  onFinish,
}) => {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {/* STUDENT */}
      <div
        style={{
          padding: "14px 15px",
          marginBottom: 18,
          borderRadius: 12,
          background: COLORS.primaryLight,
          border: "1px solid #E0E7FF",
        }}
      >
        <Text
          strong
          style={{
            display: "block",
            color: COLORS.primary,
            marginBottom: 10,
            fontSize: 12,
          }}
        >
          THÔNG TIN HỌC VIÊN
        </Text>

        <Form.Item
          name="student_id"
          label={<Text strong>Học viên</Text>}
          style={{
            marginBottom: 0,
          }}
          rules={[
            {
              required: true,
              message: "Vui lòng chọn học viên",
            },
          ]}
        >
          <Select
            showSearch
            loading={studentsLoading}
            disabled={!!editingResult || submitting}
            placeholder="Tìm theo mã hoặc tên..."
            optionFilterProp="label"
            options={students.map((student) => {
              const name = student.name || student.full_name || "Học viên";

              return {
                value: student.id,
                label: `#${student.id} - ${name}`,
              };
            })}
          />
        </Form.Item>
      </div>

      {/* SCORE */}
      <Text
        strong
        style={{
          display: "block",
          marginBottom: 12,
          fontSize: 12,
          color: COLORS.textSecondary,
        }}
      >
        KẾT QUẢ KIỂM TRA
      </Text>

      <Row gutter={14}>
        <Col span={12}>
          <Form.Item
            name="score"
            label={<Text strong>Điểm số</Text>}
            rules={[
              {
                required: true,
                message: "Vui lòng nhập điểm",
              },
              {
                type: "number",
                min: 0,
                max: 10,
                message: "Điểm từ 0 đến 10",
              },
            ]}
          >
            <InputNumber
              min={0}
              max={10}
              step={0.1}
              disabled={submitting}
              style={{
                width: "100%",
                height: 42,
              }}
              placeholder="VD: 8.5"
              addonAfter="/ 10"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="exam_type"
            label={<Text strong>Hình thức</Text>}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn hình thức",
              },
            ]}
          >
            <Select
              disabled={submitting}
              style={{
                height: 42,
              }}
              options={[
                {
                  value: "paper",
                  label: (
                    <Space>
                      <FormOutlined />
                      Làm bài giấy
                    </Space>
                  ),
                },
                {
                  value: "online",
                  label: (
                    <Space>
                      <DesktopOutlined />
                      Kiểm tra Online
                    </Space>
                  ),
                },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* DATE */}
      <Form.Item name="exam_date" label={<Text strong>Ngày kiểm tra</Text>}>
        <DatePicker
          disabled={submitting}
          format="DD/MM/YYYY"
          style={{
            width: "100%",
            height: 42,
          }}
          placeholder="Chọn ngày kiểm tra"
          suffixIcon={<CalendarOutlined />}
        />
      </Form.Item>

      {/* NOTE */}
      <Form.Item name="note" label={<Text strong>Ghi chú / nhận xét</Text>}>
        <Input.TextArea
          disabled={submitting}
          rows={4}
          maxLength={500}
          showCount
          placeholder="Nhập nhận xét về kết quả học tập..."
          style={{
            borderRadius: 9,
          }}
        />
      </Form.Item>
    </Form>
  );
};

export default ResultForm;
