import React from "react";
import { Card, Skeleton, Row, Col, Space } from "antd";

const ClassDetailSkeleton = () => {
  return (
    <div
      style={{ padding: 20, backgroundColor: "#FFF5F7", minHeight: "100vh" }}
    >
      {/* 1. HEADER CARD SKELETON */}
      <Card
        bordered={false}
        style={{
          borderRadius: 26,
          marginBottom: 16,
          background: "#FFFFFF",
          border: "2px solid #FFE4E6",
          boxShadow: "0 10px 25px rgba(255, 182, 193, 0.18)",
          overflow: "hidden",
        }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Avatar vuông bo tròn Chibi */}
          <Skeleton.Button
            active
            shape="square"
            style={{ width: 64, height: 64, borderRadius: 20 }}
          />

          <div style={{ flex: 1 }}>
            <Skeleton.Input
              active
              size="small"
              style={{
                width: "40%",
                height: 24,
                borderRadius: 12,
                marginBottom: 8,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Skeleton.Button
                active
                size="small"
                style={{ width: 80, height: 20, borderRadius: 10 }}
              />
              <Skeleton.Button
                active
                size="small"
                style={{ width: 100, height: 20, borderRadius: 10 }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 2. GRID INFO CARD SKELETON */}
      <Card
        bordered={false}
        style={{
          borderRadius: 26,
          marginBottom: 16,
          background: "#FFFFFF",
          border: "2px solid #FFE4E6",
          boxShadow: "0 10px 25px rgba(255, 182, 193, 0.18)",
        }}
        styles={{ body: { padding: 24 } }}
      >
        {/* Tiêu đề mục */}
        <Skeleton.Input
          active
          size="small"
          style={{ width: 140, height: 20, borderRadius: 10, marginBottom: 16 }}
        />

        {/* Lưới 4 ô thông tin */}
        <Row gutter={[12, 12]}>
          {[1, 2, 3, 4].map((item) => (
            <Col span={12} key={item}>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 18,
                  background: "#FFF9FA",
                  border: "1.5px dashed #FFE4E6",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Skeleton.Avatar
                  active
                  size="small"
                  shape="circle"
                  style={{ width: 32, height: 32 }}
                />
                <div style={{ flex: 1 }}>
                  <Skeleton.Input
                    active
                    style={{
                      width: "50%",
                      height: 12,
                      borderRadius: 6,
                      marginBottom: 4,
                    }}
                  />
                  <Skeleton.Input
                    active
                    style={{ width: "80%", height: 16, borderRadius: 8 }}
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 3. LIST CATECHISTS / STUDENTS SKELETON */}
      <Card
        bordered={false}
        style={{
          borderRadius: 26,
          background: "#FFFFFF",
          border: "2px solid #FFE4E6",
          boxShadow: "0 10px 25px rgba(255, 182, 193, 0.18)",
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Space
          align="center"
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Skeleton.Input
            active
            size="small"
            style={{ width: 160, height: 20, borderRadius: 10 }}
          />
          <Skeleton.Button
            active
            size="small"
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
        </Space>

        {/* Danh sách 3 hàng item */}
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 16,
                background: "#FFF9FA",
                border: "1px solid #FFE4E6",
              }}
            >
              <Space size={12}>
                <Skeleton.Avatar active size={36} shape="circle" />
                <div>
                  <Skeleton.Input
                    active
                    style={{
                      width: 120,
                      height: 14,
                      borderRadius: 7,
                      marginBottom: 4,
                    }}
                  />
                  <Skeleton.Input
                    active
                    style={{ width: 80, height: 10, borderRadius: 5 }}
                  />
                </div>
              </Space>

              <Skeleton.Button
                active
                size="small"
                style={{ width: 60, height: 22, borderRadius: 12 }}
              />
            </div>
          ))}
        </Space>
      </Card>
    </div>
  );
};

export default ClassDetailSkeleton;
