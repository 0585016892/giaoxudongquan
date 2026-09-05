import React from "react";
import { Card, Button, Space, Tag, Typography } from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const DocumentCard = ({ item, onDownload }) => {
  return (
    <Card hoverable>
      <Space direction="vertical" style={{ width: "100%" }}>
        <FilePdfOutlined
          style={{
            fontSize: 50,
            color: "#d4380d",
          }}
        />

        <Text strong>{item.title}</Text>

        <Text type="secondary">{item.description}</Text>

        <Tag color="blue">{item.category}</Tag>

        <Space>
          <Tag icon={<EyeOutlined />}>{item.view_count}</Tag>

          <Tag icon={<DownloadOutlined />}>{item.download_count}</Tag>
        </Space>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => onDownload(item)}
        >
          Tải xuống
        </Button>
      </Space>
    </Card>
  );
};

export default DocumentCard;
