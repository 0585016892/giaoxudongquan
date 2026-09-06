import React from "react";
import { Card, Statistic } from "antd";

const primaryNavy = "#1B365D";

export default function StatCard({
  title,
  value = 0,
  prefix,
  valueColor = primaryNavy,
  className = "",
}) {
  return (
    <>
      <Card bordered={false} className={`faith-stat-card ${className}`}>
        <Statistic
          title={title}
          value={value}
          prefix={prefix}
          valueStyle={{
            fontWeight: 700,
            color: valueColor,
            fontFamily: "'Playfair Display', serif",
          }}
        />
      </Card>

      <style>
        {`
          .faith-stat-card {
            border-radius: 16px !important;

            background: #ffffff !important;

            border: 1px solid
              rgba(27, 54, 93, 0.08) !important;

            box-shadow:
              0 4px 16px
              rgba(27, 54, 93, 0.035) !important;

            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease,
              border-color 0.2s ease;

            overflow: hidden;
          }

          .faith-stat-card:hover {
            transform: translateY(-2px);

            border-color:
              rgba(212, 175, 55, 0.28) !important;

            box-shadow:
              0 8px 24px
              rgba(27, 54, 93, 0.07) !important;
          }

          .faith-stat-card .ant-statistic-title {
            color: #64748b !important;

            font-size: 12px !important;

            font-weight: 600 !important;

            margin-bottom: 8px !important;
          }

          .faith-stat-card .ant-statistic-content {
            display: flex;

            align-items: center;

            gap: 8px;
          }

          .faith-stat-card .ant-statistic-content-prefix {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            font-size: 21px;
          }

          @media (max-width: 480px) {
            .faith-stat-card {
              border-radius: 14px !important;
            }
          }
        `}
      </style>
    </>
  );
}
