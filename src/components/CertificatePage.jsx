import React, { useRef, useState } from "react";
import {
  Button,
  Space,
  message,
  ConfigProvider,
  Drawer,
  Form,
  Input,
  Select,
  Tag,
  Row,
  Col,
  Table,
  Upload,
  Modal,
  Progress,
} from "antd";
import {
  PrinterOutlined,
  DownloadOutlined,
  CompassOutlined,
  EditOutlined,
  FileExcelOutlined,
  TeamOutlined,
  FileZipOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import QRCode from "react-qr-code";
import * as XLSX from "xlsx";
import JSZip from "jszip";

const { Option } = Select;

// BẢNG MẪU VĂN BẰNG PHỤNG VỤ
const CERT_TYPES = {
  marriage: {
    key: "marriage",
    title: "Chứng Chỉ Giáo Lý",
    subTitle: "GIÁO LÝ DỰ TÒNG & HÔN NHÂN",
    actionText: "ĐÃ HOÀN THÀNH CHƯƠNG TRÌNH KHÓA HỌC",
    themeColor: "#8B0000", // Đỏ son
  },
  baptism: {
    key: "baptism",
    title: "Chứng Nhận Bí Tích Rửa Tội",
    subTitle: "RỬA TỘI & GIA NHẬP HỘI THÁNH",
    actionText: "ĐÃ LĨNH NHẬN BÍ TÍCH RỬA TỘI TẠI GIÁO XỨ",
    themeColor: "#1B365D", // Xanh Navy
  },
  confirmation: {
    key: "confirmation",
    title: "Chứng Nhận Bí Tích Thêm Sức",
    subTitle: "BAN ƠN CHÚA THÁNH THẦN",
    actionText: "ĐÃ LĨNH NHẬN BÍ TÍCH THÊM SỨC TRONG CHÚA KHIÊM CUNG",
    themeColor: "#D4AF37", // Vàng Đồng
  },
};

const CertificatePage = () => {
  const certificateRef = useRef();
  const [exporting, setExporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  // Tiến trình xuất file Zip hàng loạt
  const [batchExporting, setBatchExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Mẫu văn bằng được chọn (marriage | baptism | confirmation)
  const [certType, setCertType] = useState("marriage");
  const [showSignature] = useState(true);
  const [showQRCode] = useState(true);

  // Danh sách học viên in hàng loạt (Nếu import Excel)
  const [studentsList, setStudentsList] = useState([]);

  // Dữ liệu chứng chỉ đơn hiện tại
  const [certData, setCertData] = useState({
    certNo: "CC-2026-8892",
    diocese: "THÁI BÌNH",
    parish: "ĐỒNG QUAN",
    fullName: "Nguyễn Văn A",
    godName: "Giuse",
    dobDay: "01",
    dobMonth: "01",
    dobYear: "1998",
    address: "Giáo xứ Đồng Quan, Thái Bình",
    course: "2025 – 2026",
    rank: "Xuất Sắc",
    godFather: "Trần Văn B",
    godMother: "Lê Thị C",
    issuedDate: "ngày 03 tháng 06 năm 2026",
    priestName: "Lm. Jos Vũ Văn Chiều",
  });

  const currentCertConfig = CERT_TYPES[certType];

  const handlePrint = () => {
    window.print();
  };

  // Xuất Single PDF A4
  const handleDownloadPDF = async () => {
    const element = certificateRef.current;
    if (!element) return;

    try {
      setExporting(true);
      message.loading({ content: "Đang tạo file PDF HD...", key: "pdf" });

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFDF7",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
      pdf.save(`Chung_Nhan_${certData.fullName.replace(/\s+/g, "_")}.pdf`);

      message.success({ content: "Tải file PDF thành công!", key: "pdf" });
    } catch (error) {
      console.error(error);
      message.error({ content: "Có lỗi khi xuất PDF!", key: "pdf" });
    } finally {
      setExporting(false);
    }
  };

  // Import danh sách từ File Excel
  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      if (parsedData.length > 0) {
        setStudentsList(parsedData);
        message.success(
          `Đã nạp thành công ${parsedData.length} học viên từ Excel!`,
        );
        setBatchModalOpen(true);
      } else {
        message.warning("File Excel không có dữ liệu hợp lệ!");
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  // HÀM XUẤT ZIP CHỨNG CHỈ HÀNG LOẠT CHO CẢ LỚP
  const handleExportBatchZIP = async () => {
    if (!studentsList.length) return;

    try {
      setBatchExporting(true);
      setExportProgress(0);
      const zip = new JSZip();

      for (let i = 0; i < studentsList.length; i++) {
        const student = studentsList[i];

        // Tách chuỗi ngày sinh nếu có dạng DD/MM/YYYY
        let dDay = certData.dobDay;
        let dMonth = certData.dobMonth;
        let dYear = certData.dobYear;

        if (
          student.dob &&
          typeof student.dob === "string" &&
          student.dob.includes("/")
        ) {
          const parts = student.dob.split("/");
          if (parts.length === 3) {
            dDay = parts[0];
            dMonth = parts[1];
            dYear = parts[2];
          }
        }

        // Cập nhật DOM tạm thời để html2canvas chụp ảnh
        setCertData((prev) => ({
          ...prev,
          certNo: student.code || `CC-2026-${String(i + 1).padStart(3, "0")}`,
          godName: student.godName || "",
          fullName: student.fullName || "Học viên",
          rank: student.rank || student.rankLevel || prev.rank,
          dobDay: dDay,
          dobMonth: dMonth,
          dobYear: dYear,
        }));

        // Đờ chờ React render lại DOM
        await new Promise((resolve) => setTimeout(resolve, 300));

        const element = certificateRef.current;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#FFFDF7",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);

        const pdfArrayBuffer = pdf.output("arraybuffer");
        const fileName = `ChungChi_${(student.fullName || `HocVien_${i + 1}`).replace(/\s+/g, "_")}.pdf`;
        zip.file(fileName, pdfArrayBuffer);

        setExportProgress(Math.round(((i + 1) / studentsList.length) * 100));
      }

      // Tạo & Tải file ZIP
      const zipContent = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipContent);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Danh_Sach_Chung_Chi_Lop_${certType.toUpperCase()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success("Xuất toàn bộ file PDF thành công!");
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi tạo gói file Zip!");
    } finally {
      setBatchExporting(false);
    }
  };

  // Đường dẫn xác thực QR công khai
  const qrVerificationUrl = `${window.location.origin}/xac-thuc?code=${certData.certNo}&type=${certType}&student=${encodeURIComponent(
    certData.fullName,
  )}`;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1B365D",
          borderRadius: 8,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <div className="page-wrapper">
        {/* ACTION BAR */}
        <div className="no-print action-bar-container">
          <div className="action-bar">
            <span className="action-title">
              <CompassOutlined /> HỆ THỐNG CẤP BẰNG & MỤC VỤ GIÁO XỨ
            </span>

            <Space size="small">
              <Upload
                beforeUpload={handleExcelUpload}
                showUploadList={false}
                accept=".xlsx, .xls"
              >
                <Button
                  icon={<FileExcelOutlined style={{ color: "#10b981" }} />}
                  className="btn-custom-action"
                >
                  Nhập Excel Lớp
                </Button>
              </Upload>

              {studentsList.length > 0 && (
                <Button
                  icon={<TeamOutlined />}
                  onClick={() => setBatchModalOpen(true)}
                  className="btn-custom-action"
                >
                  Danh Sách Lớp ({studentsList.length})
                </Button>
              )}

              <Button
                icon={<EditOutlined />}
                onClick={() => setDrawerOpen(true)}
                className="btn-custom-action"
              >
                Cấu Hình Dữ Liệu
              </Button>

              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                disabled={exporting || batchExporting}
                className="btn-print"
              >
                In Chứng Chỉ
              </Button>

              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadPDF}
                loading={exporting}
                disabled={batchExporting}
                className="btn-download"
              >
                Xuất PDF A4
              </Button>
            </Space>
          </div>
        </div>

        {/* KHU VỰC VĂN BẰNG (A4 LANDSCAPE) */}
        <div className="certificate-container" ref={certificateRef}>
          <div
            className="watermark-cross"
            style={{ color: currentCertConfig.themeColor }}
          >
            🕇
          </div>

          <div className="outer-border" style={{ borderColor: "#D4AF37" }}>
            <div className="inner-border" style={{ borderColor: "#1B365D" }}>
              {/* TRANG TRÍ GÓC */}
              <div className="corner-decoration top-left"></div>
              <div className="corner-decoration top-right"></div>
              <div className="corner-decoration bottom-left"></div>
              <div className="corner-decoration bottom-right"></div>

              {/* HEADER */}
              <header className="cert-header">
                <div className="diocese-info">
                  <p className="diocese-title">GIÁO PHẬN {certData.diocese}</p>
                  <p
                    className="parish-title"
                    style={{ color: currentCertConfig.themeColor }}
                  >
                    GIÁO XỨ {certData.parish}
                  </p>
                </div>

                <div className="cert-logo-badge">
                  <span>🕇</span>
                </div>

                <div className="cert-no-badge">
                  <p className="cert-no-text">Mã Số: {certData.certNo}</p>
                </div>
              </header>

              {/* NỘI DUNG CHÍNH */}
              <main className="cert-body">
                <h1
                  className="main-title"
                  style={{ color: currentCertConfig.themeColor }}
                >
                  {currentCertConfig.title}
                </h1>
                <h2 className="sub-title">LINH MỤC QUẢN XỨ CHỨNG NHẬN</h2>

                <div className="recipient-info">
                  <p className="intro-text">
                    Tên Thánh & Họ Tên:{" "}
                    <span className="student-name">
                      {certData.godName ? `${certData.godName} ` : ""}
                      {certData.fullName}
                    </span>
                  </p>

                  <p className="details-line">
                    Sinh ngày:{" "}
                    <span className="val">
                      {certData.dobDay}/{certData.dobMonth}/{certData.dobYear}
                    </span>
                    <span className="spacer"></span>
                    Trực thuộc: <span className="val">{certData.address}</span>
                  </p>

                  <div className="achievement-box">
                    <p className="achievement-title">
                      {currentCertConfig.actionText}
                    </p>
                    <h3
                      className="course-name"
                      style={{ color: currentCertConfig.themeColor }}
                    >
                      {currentCertConfig.subTitle}
                    </h3>
                  </div>

                  {certType === "marriage" && (
                    <p className="details-line">
                      Niên khóa: <span className="val">{certData.course}</span>
                      <span className="spacer"></span>
                      Xếp loại: <span className="val">{certData.rank}</span>
                    </p>
                  )}

                  {(certType === "baptism" || certType === "confirmation") && (
                    <p className="details-line">
                      Người đỡ đầu:{" "}
                      <span className="val">
                        {certData.godFather || certData.godMother || "—"}
                      </span>
                    </p>
                  )}
                </div>
              </main>

              {/* FOOTER CHỮ KÝ VÀ MÃ QR */}
              <footer className="cert-footer">
                <div className="seal-qr-group">
                  {showQRCode && (
                    <div className="qr-code-box">
                      <QRCode
                        value={qrVerificationUrl}
                        size={60}
                        bgColor="transparent"
                        fgColor="#1B365D"
                      />
                      <span className="qr-label">QUÉT TRA CỨU</span>
                    </div>
                  )}

                  <div className="seal-placeholder">
                    <span>ẤN DẤU GIÁO XỨ</span>
                  </div>
                </div>

                <div className="signature-area">
                  <p className="date-line">Đồng Quan, {certData.issuedDate}</p>
                  <p className="signer-title">Linh mục Quản xứ</p>

                  <div className="signature-space">
                    {showSignature && (
                      <span className="sign-handwritten">
                        Jos. Vũ Văn Chiều
                      </span>
                    )}
                  </div>

                  <p className="signer-namechurch">{certData.priestName}</p>
                </div>
              </footer>
            </div>
          </div>
        </div>

        {/* DRAWER CẤU HÌNH VĂN BẰNG */}
        <Drawer
          title="Thông Tin Văn Bằng & Cá Nhân"
          width={420}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Form layout="vertical">
            <Form.Item label="Chọn Mẫu Văn Bằng Phụng Vụ">
              <Select value={certType} onChange={setCertType}>
                <Option value="marriage">
                  1. Chứng Chỉ Giáo Lý Hôn Nhân / Dự Tòng
                </Option>
                <Option value="baptism">2. Chứng Nhận Bí Tích Rửa Tội</Option>
                <Option value="confirmation">
                  3. Chứng Nhận Bí Tích Thêm Sức
                </Option>
              </Select>
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="Mã số văn bằng">
                  <Input
                    value={certData.certNo}
                    onChange={(e) =>
                      setCertData({ ...certData, certNo: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tên Thánh">
                  <Input
                    value={certData.godName}
                    onChange={(e) =>
                      setCertData({ ...certData, godName: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Họ và tên học viên / Tín hữu">
              <Input
                value={certData.fullName}
                onChange={(e) =>
                  setCertData({ ...certData, fullName: e.target.value })
                }
              />
            </Form.Item>

            <Row gutter={8}>
              <Col span={8}>
                <Form.Item label="Ngày sinh">
                  <Input
                    value={certData.dobDay}
                    onChange={(e) =>
                      setCertData({ ...certData, dobDay: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Tháng sinh">
                  <Input
                    value={certData.dobMonth}
                    onChange={(e) =>
                      setCertData({ ...certData, dobMonth: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Năm sinh">
                  <Input
                    value={certData.dobYear}
                    onChange={(e) =>
                      setCertData({ ...certData, dobYear: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Xếp loại toàn khóa">
              <Select
                value={certData.rank}
                onChange={(val) => setCertData({ ...certData, rank: val })}
              >
                <Option value="Xuất Sắc">Xuất Sắc</Option>
                <Option value="Giỏi">Giỏi</Option>
                <Option value="Khá">Khá</Option>
                <Option value="Trung Bình">Trung Bình</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Linh mục ký nhận">
              <Input
                value={certData.priestName}
                onChange={(e) =>
                  setCertData({ ...certData, priestName: e.target.value })
                }
              />
            </Form.Item>

            <Form.Item label="Ngày cấp bằng">
              <Input
                value={certData.issuedDate}
                onChange={(e) =>
                  setCertData({ ...certData, issuedDate: e.target.value })
                }
              />
            </Form.Item>
          </Form>
        </Drawer>

        {/* MODAL DANH SÁCH HỌC VIÊN IN HÀNG LOẠT & XUẤT ZIP */}
        <Modal
          title={`Danh Sách Lớp Tải Từ Excel (${studentsList.length} Học Viên)`}
          open={batchModalOpen}
          onCancel={() => setBatchModalOpen(false)}
          width={850}
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Tag
                color="blue"
                style={{ borderRadius: 10, padding: "4px 12px" }}
              >
                Đã sẵn sàng tạo {studentsList.length} văn bằng PDF
              </Tag>

              <Button
                type="primary"
                icon={<FileZipOutlined />}
                loading={batchExporting}
                onClick={handleExportBatchZIP}
                style={{
                  backgroundColor: "#10b981",
                  borderColor: "#10b981",
                  borderRadius: 8,
                  fontWeight: 700,
                }}
              >
                Tải ZIP Cả Lớp (.zip)
              </Button>
            </div>
          }
        >
          {batchExporting && (
            <div style={{ marginBottom: 16 }}>
              <Progress percent={exportProgress} status="active" />
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#64748B",
                  marginTop: 4,
                }}
              >
                Đang render & nén file PDF cho cả lớp... Vui lòng đợi trong giây
                lát.
              </p>
            </div>
          )}

          <Table
            dataSource={studentsList}
            rowKey={(r, i) => i}
            pagination={{ pageSize: 5 }}
            columns={[
              {
                title: "Mã Số",
                dataIndex: "code",
                render: (c, r, i) =>
                  c || `CC-2026-${String(i + 1).padStart(3, "0")}`,
              },
              { title: "Tên Thánh", dataIndex: "godName" },
              { title: "Họ và Tên", dataIndex: "fullName" },
              { title: "Ngày Sinh", dataIndex: "dob" },
              {
                title: "Xếp Loại",
                dataIndex: "rank",
                render: (r) => (
                  <Tag color={r === "Xuất Sắc" ? "gold" : "blue"}>
                    {r || "Xuất Sắc"}
                  </Tag>
                ),
              },
              {
                title: "Thao tác",
                render: (_, record) => (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      let dDay = certData.dobDay;
                      let dMonth = certData.dobMonth;
                      let dYear = certData.dobYear;

                      if (
                        record.dob &&
                        typeof record.dob === "string" &&
                        record.dob.includes("/")
                      ) {
                        const parts = record.dob.split("/");
                        if (parts.length === 3) {
                          dDay = parts[0];
                          dMonth = parts[1];
                          dYear = parts[2];
                        }
                      }

                      setCertData({
                        ...certData,
                        certNo: record.code || certData.certNo,
                        godName: record.godName || "",
                        fullName: record.fullName || "",
                        rank: record.rank || certData.rank,
                        dobDay: dDay,
                        dobMonth: dMonth,
                        dobYear: dYear,
                      });
                      setBatchModalOpen(false);
                      message.success(
                        `Đã nạp dữ liệu cho học viên: ${record.fullName}`,
                      );
                    }}
                  >
                    Xem & In
                  </Button>
                ),
              },
            ]}
          />
        </Modal>

        {/* STYLES SCOPED */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Alex+Brush&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

          * { box-sizing: border-box; margin: 0; padding: 0; }
          .page-wrapper { padding: 30px 0 60px 0; background: #ffffff; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
          .action-bar-container { margin-bottom: 24px; z-index: 10; }
          .action-bar { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 10px 24px; border-radius: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 20px; border: 1px solid rgba(212, 175, 55, 0.4); }
          .action-title { font-size: 11px; font-weight: 700; color: #1B365D; display: flex; align-items: center; gap: 6px; }
          .btn-print { background: #1B365D !important; color: #fff !important; font-weight: 700 !important; height: 38px !important; border-radius: 20px !important; }
          .btn-download, .btn-custom-action { border-color: #D4AF37 !important; color: #1B365D !important; font-weight: 700 !important; height: 38px !important; border-radius: 20px !important; }

          .certificate-container { width: 297mm; height: 210mm; padding: 12mm; position: relative; overflow: hidden; background: #FFFDF7; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4); border-radius: 4px; }
          .watermark-cross { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 260px; opacity: 0.04; pointer-events: none; }
          .outer-border { height: 100%; width: 100%; padding: 4px; position: relative; border: 3px solid #D4AF37; }
          .inner-border { height: 100%; width: 100%; position: relative; border: 1px solid #1B365D; }
          .corner-decoration { position: absolute; width: 36px; height: 36px; border: 2px solid #D4AF37; }
          .top-left { top: 6px; left: 6px; border-right: none; border-bottom: none; }
          .top-right { top: 6px; right: 6px; border-left: none; border-bottom: none; }
          .bottom-left { bottom: 6px; left: 6px; border-right: none; border-top: none; }
          .bottom-right { bottom: 6px; right: 6px; border-left: none; border-top: none; }

          .cert-header { position: absolute; top: 24px; left: 45px; right: 45px; display: flex; justify-content: space-between; align-items: center; }
          .diocese-title { font-family: 'Cinzel', serif; font-size: 13px; font-weight: 700; color: #1B365D; }
          .parish-title { font-family: 'Cinzel', serif; font-size: 15px; font-weight: 800; }
          .cert-logo-badge { width: 42px; height: 42px; border-radius: 50%; border: 1px solid #D4AF37; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #1B365D; }
          .cert-no-text { font-size: 11px; font-family: 'Cinzel', serif; font-weight: 700; color: #64748B; }

          .cert-body { position: absolute; top: 85px; left: 0; right: 0; text-align: center; padding: 0 50px; }
          .main-title { font-family: 'Great Vibes', cursive; font-size: 64px; margin-bottom: -6px; line-height: 1; }
          .sub-title { font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 4px; color: #1B365D; margin-bottom: 22px; font-weight: 700; }
          .recipient-info { font-family: 'Playfair Display', serif; font-size: 17px; color: #1E293B; }
          .student-name { font-size: 26px; font-weight: 700; color: #1B365D; border-bottom: 1.5px solid #D4AF37; padding: 0 16px; display: inline-block; text-transform: uppercase; }
          .details-line { margin-top: 10px; font-size: 16px; }
          .spacer { display: inline-block; width: 40px; }
          .val { font-weight: 700; font-style: italic; color: #1B365D; }

          .achievement-box { margin: 16px auto; padding: 10px 20px; border-top: 1px solid #D4AF37; border-bottom: 1px solid #D4AF37; max-width: 620px; }
          .achievement-title { font-size: 11px; letter-spacing: 2px; color: #64748B; font-family: 'Cinzel', serif; font-weight: 700; }
          .course-name { font-size: 22px; margin-top: 2px; font-family: 'Cinzel', serif; font-weight: 800; }

          .cert-footer { position: absolute; bottom: 24px; left: 45px; right: 45px; display: flex; justify-content: space-between; align-items: flex-end; }
          .seal-qr-group { display: flex; align-items: flex-end; gap: 16px; }
          .qr-code-box { display: flex; flex-direction: column; align-items: center; gap: 4px; }
          .qr-label { font-size: 8px; font-family: 'Cinzel', serif; font-weight: 700; color: #64748B; }
          .seal-placeholder { width: 80px; height: 80px; border: 1px dashed #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #64748B; font-size: 8px; font-weight: 700; font-family: 'Cinzel', serif; }

          .signature-area { text-align: center; min-width: 260px; }
          .date-line { font-style: italic; font-size: 14px; color: #475569; }
          .signer-title { font-weight: 700; font-size: 15px; text-transform: uppercase; color: #1B365D; font-family: 'Cinzel', serif; }
          .signature-space { height: 48px; display: flex; align-items: center; justify-content: center; }
          .sign-handwritten { font-family: 'Alex Brush', cursive; font-size: 32px; color: #1B365D; transform: rotate(-4deg); }
          .signer-namechurch { font-size: 17px; font-weight: 700; font-family: 'Playfair Display', serif; color: #1B365D; }

          @media print {
            @page { size: A4 landscape; margin: 0; }
            body { background: #FFFDF7 !important; }
            .page-wrapper { padding: 0; background: transparent; }
            .no-print { display: none !important; }
            .certificate-container { box-shadow: none !important; margin: 0 !important; width: 297mm !important; height: 210mm !important; position: absolute !important; top: 0 !important; left: 0 !important; }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default CertificatePage;
