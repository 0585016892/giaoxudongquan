import React, { useState } from "react";
import { Col, DatePicker, Divider, Form, Input, Row, Select, Tabs } from "antd";

const StudentForm = ({ form, classes = [], saving = false, onFinish }) => {
  const [activeTab, setActiveTab] = useState("basic");

  // Quy tắc validate Số điện thoại Việt Nam
  const phoneRule = {
    pattern: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
    message: "Số điện thoại không đúng định dạng (VD: 0912345678)!",
  };

  // Tự động chuyển đến Tab chứa trường bị lỗi validation đầu tiên
  const handleFinishFailed = ({ errorFields }) => {
    if (errorFields && errorFields.length > 0) {
      const firstErrorField = errorFields[0].name[0];

      const basicFields = [
        "name",
        "gender",
        "date_of_birth",
        "phone",
        "email",
        "class_id",
        "address",
        "parish",
      ];
      const familyFields = [
        "father_name",
        "father_phone",
        "mother_name",
        "mother_phone",
        "guardian_name",
        "guardian_phone",
      ];
      const sacramentsFields = [
        "baptism_name",
        "baptism_date",
        "baptism_place",
        "baptism_parish",
        "baptism_certificate_no",
        "first_communion_date",
        "first_communion_place",
        "confirmation_date",
        "confirmation_place",
        "confirmation_saint_name",
      ];

      if (basicFields.includes(firstErrorField)) {
        setActiveTab("basic");
      } else if (familyFields.includes(firstErrorField)) {
        setActiveTab("family");
      } else if (sacramentsFields.includes(firstErrorField)) {
        setActiveTab("sacraments");
      } else {
        setActiveTab("catechism");
      }
    }
  };

  const tabItems = [
    {
      key: "basic",
      label: "Thông tin cá nhân",
      children: (
        <>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="code" label="Mã học sinh">
                <Input disabled placeholder="Tự động tạo" />
              </Form.Item>
            </Col>

            <Col xs={24} md={10}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                  { min: 2, message: "Họ và tên phải ít nhất 2 ký tự!" },
                ]}
              >
                <Input
                  disabled={saving}
                  placeholder="Nhập họ và tên học sinh"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Select
                  disabled={saving}
                  placeholder="Chọn giới tính"
                  allowClear
                  options={[
                    { value: "male", label: "Nam" },
                    { value: "female", label: "Nữ" },
                    { value: "other", label: "Khác" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="date_of_birth"
                label="Ngày sinh"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  disabled={saving}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="birth_place" label="Nơi sinh">
                <Input
                  disabled={saving}
                  placeholder="Nhập nơi sinh (Tỉnh/Thành phố)"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="nationality"
                label="Quốc tịch"
                initialValue="Việt Nam"
              >
                <Input disabled={saving} placeholder="Việt Nam" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="phone" label="Số điện thoại" rules={[phoneRule]}>
                <Input
                  disabled={saving}
                  placeholder="Nhập số điện thoại"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: "email", message: "Email không đúng định dạng!" },
                ]}
              >
                <Input
                  disabled={saving}
                  placeholder="example@email.com"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="class_id"
                label="Lớp học"
                rules={[{ required: true, message: "Vui lòng chọn lớp học!" }]}
              >
                <Select
                  disabled={saving}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  placeholder="Chọn lớp"
                  options={classes.map((item) => ({
                    value: String(item.id),
                    label: item.name || item.class_name || `Lớp ${item.id}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item name="address" label="Địa chỉ thường trú">
                <Input
                  disabled={saving}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="parish" label="Giáo xứ">
                <Input
                  disabled={saving}
                  placeholder="Nhập tên giáo xứ hiện tại"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },

    {
      key: "family",
      label: "Gia đình",
      children: (
        <>
          <Divider orientation="left" plain>
            <b>Thông tin cha</b>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="father_name" label="Họ và tên cha">
                <Input
                  disabled={saving}
                  placeholder="Nhập họ và tên cha"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="father_phone"
                label="Số điện thoại cha"
                rules={[phoneRule]}
              >
                <Input
                  disabled={saving}
                  placeholder="Nhập số điện thoại cha"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" plain>
            <b>Thông tin mẹ</b>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="mother_name" label="Họ và tên mẹ">
                <Input
                  disabled={saving}
                  placeholder="Nhập họ và tên mẹ"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="mother_phone"
                label="Số điện thoại mẹ"
                rules={[phoneRule]}
              >
                <Input
                  disabled={saving}
                  placeholder="Nhập số điện thoại mẹ"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" plain>
            <b>Người giám hộ (nếu có)</b>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item name="guardian_name" label="Họ và tên người giám hộ">
                <Input
                  disabled={saving}
                  placeholder="Nhập họ và tên"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={7}>
              <Form.Item
                name="guardian_phone"
                label="Số điện thoại"
                rules={[phoneRule]}
              >
                <Input
                  disabled={saving}
                  placeholder="Nhập số điện thoại"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={7}>
              <Form.Item
                name="guardian_relationship"
                label="Quan hệ với học sinh"
              >
                <Input
                  disabled={saving}
                  placeholder="VD: Ông, bà, cô, chú..."
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },

    {
      key: "sacraments",
      label: "Bí tích",
      children: (
        <>
          <Divider orientation="left" plain>
            <b>Bí tích Rửa Tội</b>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="baptism_name" label="Tên thánh">
                <Input
                  disabled={saving}
                  placeholder="VD: Phêrô, Maria..."
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="baptism_date" label="Ngày Rửa tội">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  disabled={saving}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="baptism_place" label="Nơi Rửa tội">
                <Input
                  disabled={saving}
                  placeholder="Nhập nơi Rửa tội"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="baptism_parish" label="Giáo xứ Rửa tội">
                <Input
                  disabled={saving}
                  placeholder="Nhập giáo xứ"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="baptism_certificate_no"
                label="Số chứng thư Rửa tội"
              >
                <Input
                  disabled={saving}
                  placeholder="Nhập số chứng thư"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" plain>
            <b>Bí tích Rước Lễ Lần Đầu</b>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="first_communion_date"
                label="Ngày Rước lễ lần đầu"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  disabled={saving}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="first_communion_place"
                label="Nơi Rước lễ lần đầu"
              >
                <Input
                  disabled={saving}
                  placeholder="Nhập tên giáo xứ / nhà thờ"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" plain>
            <b>Bí tích Thêm Sức</b>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="confirmation_saint_name"
                label="Tên thánh Thêm sức"
              >
                <Input
                  disabled={saving}
                  placeholder="Tên thánh nhận khi Thêm sức"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="confirmation_date" label="Ngày Thêm sức">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  disabled={saving}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="confirmation_place" label="Nơi Thêm sức">
                <Input
                  disabled={saving}
                  placeholder="Nhập nơi Thêm sức"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },

    {
      key: "catechism",
      label: "Giáo lý & Khác",
      children: (
        <>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="catechism_level" label="Cấp giáo lý">
                <Input
                  disabled={saving}
                  placeholder="VD: Khai tâm 1, Rước lễ 2..."
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="catechism_status"
                label="Trạng thái giáo lý"
                initialValue="studying"
              >
                <Select
                  disabled={saving}
                  allowClear
                  placeholder="Chọn trạng thái"
                  options={[
                    { value: "new", label: "Mới đăng ký" },
                    { value: "studying", label: "Đang học" },
                    { value: "completed", label: "Hoàn thành cấp học" },
                    { value: "graduated", label: "Đã tốt nghiệp" },
                    { value: "dropped", label: "Đã nghỉ học" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="enrollment_date" label="Ngày nhập học">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày nhập học"
                  disabled={saving}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" plain>
            <b>Trạng thái & Ghi chú</b>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="status"
                label="Trạng thái hồ sơ"
                initialValue="active"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select
                  disabled={saving}
                  allowClear
                  placeholder="Chọn trạng thái"
                  options={[
                    { value: "active", label: "Đang hoạt động" },
                    { value: "inactive", label: "Tạm khóa" },
                    { value: "graduated", label: "Đã tốt nghiệp" },
                    { value: "transferred", label: "Đã chuyển giáo xứ" },
                    { value: "dropped", label: "Đã nghỉ" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={16}>
              <Form.Item name="note" label="Ghi chú thêm">
                <Input.TextArea
                  rows={4}
                  disabled={saving}
                  placeholder="Nhập thông tin lưu ý hoặc ghi chú khác..."
                  showCount
                  maxLength={1000}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={handleFinishFailed}
      preserve={true}
      requiredMark={(label, { required }) => (
        <span>
          {label}
          {required && (
            <span style={{ color: "#ff4d4f", marginLeft: 4 }}>*</span>
          )}
        </span>
      )}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Form>
  );
};

export default StudentForm;
