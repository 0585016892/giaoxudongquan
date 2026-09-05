import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  IdcardOutlined,
  LockOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  SwapOutlined,
  TeamOutlined,
  UnlockOutlined,
  UserOutlined,
  UserSwitchOutlined,
  QrcodeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import studentApi from "../../api/studentApi";
import classStudentApi from "../../api/classStudentApi";
import classApi from "../../api/classApi";

import AppFormModal from "../../components/common/AppFormModal";
import StudentForm from "../../components/forms/StudentForm";
import StatCard from "../../components/common/StatCard";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import AppButton from "../../components/common/AppButton";

import { QRCodeCanvas } from "qrcode.react";

const { Text } = Typography;

const primaryNavy = "#1B365D";

const EMPTY_VALUE = "-";

/* =====================================================
   HELPERS
===================================================== */

const getResponseData = (response, keys = []) => {
  const data = response?.data;

  if (data?.data !== undefined) {
    return data.data;
  }

  for (const key of keys) {
    if (data?.[key] !== undefined) {
      return data[key];
    }
  }

  return data ?? [];
};

const displayValue = (value) => {
  return value === null ||
    value === undefined ||
    value === "" ||
    value === EMPTY_VALUE
    ? EMPTY_VALUE
    : value;
};

const formatDate = (value) => {
  if (!value) return EMPTY_VALUE;

  const date = dayjs(value);

  return date.isValid() ? date.format("DD/MM/YYYY") : EMPTY_VALUE;
};

/* =====================================================
   COMPONENT
===================================================== */

export default function StudentManagement() {
  /* ===================================================
     DATA
  =================================================== */

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  /* ===================================================
     LOADING
  =================================================== */

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [actionLoading, setActionLoading] = useState({
    delete: null,
    toggle: null,
    changeClass: null,
  });

  const didInitialFetch = useRef(false);
  const mountedRef = useRef(true);

  /* ===================================================
     UI STATE
  =================================================== */

  const [activeClassTab, setActiveClassTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /* ===================================================
     FORM MODAL
  =================================================== */

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  /* ===================================================
     DETAIL MODAL
  =================================================== */

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState(null);

  /* ===================================================
     CHANGE CLASS
  =================================================== */

  const [isChangeClassModalOpen, setIsChangeClassModalOpen] = useState(false);

  const [changeClassStudent, setChangeClassStudent] = useState(null);

  /* ===================================================
     QR
  =================================================== */

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrStudent, setQrStudent] = useState(null);

  const handleOpenQR = useCallback((student) => {
    if (!student?.qr_token) {
      message.warning("Học sinh này chưa có mã QR. Vui lòng tạo mã QR trước!");
      return;
    }

    setQrStudent(student);
    setIsQRModalOpen(true);
  }, []);
  const handleDownloadQR = useCallback(() => {
    if (!qrStudent?.qr_token) {
      message.warning("Không có mã QR để tải!");
      return;
    }

    const qrCanvas = document.getElementById(`student-qr-${qrStudent.id}`);

    if (!qrCanvas) {
      message.error("Không tìm thấy ảnh QR!");
      return;
    }

    try {
      // ==============================
      // THÔNG TIN HỌC SINH
      // ==============================
      const studentName = qrStudent.full_name || qrStudent.name || "Học sinh";

      const studentCode = qrStudent.code || `HS-${qrStudent.id}`;

      const className =
        qrStudent.class_name ||
        qrStudent.className ||
        qrStudent.class?.name ||
        qrStudent.class?.class_name ||
        "Chưa xếp lớp";

      // ==============================
      // KÍCH THƯỚC
      // ==============================
      const qrSize = qrCanvas.width || 300;

      const padding = 30;

      const nameFontSize = 24;
      const codeFontSize = 19;
      const classFontSize = 18;

      const nameHeight = 40;
      const codeHeight = 32;
      const classHeight = 32;

      const canvasWidth = qrSize + padding * 2;

      const canvasHeight =
        qrSize + padding * 2 + nameHeight + codeHeight + classHeight + 20;

      // ==============================
      // TẠO CANVAS
      // ==============================
      const canvas = document.createElement("canvas");

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Không thể tạo Canvas Context");
      }

      // ==============================
      // NỀN
      // ==============================
      ctx.fillStyle = "#FFFFFF";

      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // ==============================
      // VẼ QR
      // ==============================
      ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

      // ==============================
      // CĂN GIỮA TEXT
      // ==============================
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // ==============================
      // TÊN HỌC SINH
      // ==============================
      ctx.fillStyle = "#1E293B";

      ctx.font = `600 ${nameFontSize}px Arial`;

      ctx.fillText(studentName, canvasWidth / 2, qrSize + padding + 20);

      // ==============================
      // MÃ HỌC SINH
      // ==============================
      ctx.fillStyle = "#64748B";

      ctx.font = `500 ${codeFontSize}px Arial`;

      ctx.fillText(studentCode, canvasWidth / 2, qrSize + padding + 52);

      // ==============================
      // TÊN LỚP
      // ==============================
      ctx.fillStyle = "#1B365D";

      ctx.font = `600 ${classFontSize}px Arial`;

      ctx.fillText(`Lớp: ${className}`, canvasWidth / 2, qrSize + padding + 84);

      // ==============================
      // DOWNLOAD
      // ==============================
      const link = document.createElement("a");

      link.download = `${studentCode}-QR.png`;

      link.href = canvas.toDataURL("image/png");

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      message.success("Đã tải mã QR!");
    } catch (error) {
      console.error("DOWNLOAD QR ERROR:", error);

      message.error("Không thể tải mã QR!");
    }
  }, [qrStudent]);

  /* ===================================================
     FORMS
  =================================================== */

  const [form] = Form.useForm();
  const [changeClassForm] = Form.useForm();

  /* ===================================================
     ACTION LOADING HELPERS
  =================================================== */

  const setActionLoadingState = useCallback((type, id) => {
    setActionLoading((prev) => ({
      ...prev,
      [type]: id,
    }));
  }, []);

  const clearActionLoadingState = useCallback((type) => {
    setActionLoading((prev) => ({
      ...prev,
      [type]: null,
    }));
  }, []);

  /* ===================================================
     FORMAT STUDENT
  =================================================== */

  const formatStudent = useCallback((student, relation, classData) => {
    const classId =
      relation?.class_id ??
      relation?.classId ??
      student?.class_id ??
      student?.classId ??
      null;

    const matchedClass = classData.find(
      (item) => String(item.id) === String(classId),
    );

    return {
      key: student.id,
      id: student.id,

      qr_token: student.qr_token || null,

      code: student.code || EMPTY_VALUE,
      name: student.name || "Chưa có tên",
      gender: student.gender || "Khác",

      date_of_birth: student.date_of_birth || null,

      birth_place: student.birth_place || EMPTY_VALUE,

      nationality: student.nationality || "Việt Nam",

      phone: student.phone || EMPTY_VALUE,
      email: student.email || EMPTY_VALUE,
      address: student.address || EMPTY_VALUE,
      parish: student.parish || EMPTY_VALUE,

      father_name: student.father_name || EMPTY_VALUE,

      father_phone: student.father_phone || EMPTY_VALUE,

      mother_name: student.mother_name || EMPTY_VALUE,

      mother_phone: student.mother_phone || EMPTY_VALUE,

      guardian_name: student.guardian_name || EMPTY_VALUE,

      guardian_phone: student.guardian_phone || EMPTY_VALUE,

      guardian_relationship: student.guardian_relationship || EMPTY_VALUE,

      baptism_name: student.baptism_name || EMPTY_VALUE,

      baptism_date: student.baptism_date || null,

      baptism_place: student.baptism_place || EMPTY_VALUE,

      baptism_parish: student.baptism_parish || EMPTY_VALUE,

      baptism_certificate_no: student.baptism_certificate_no || EMPTY_VALUE,

      saint_name: student.saint_name || EMPTY_VALUE,

      first_communion_date: student.first_communion_date || null,

      first_communion_place: student.first_communion_place || EMPTY_VALUE,

      confirmation_date: student.confirmation_date || null,

      confirmation_place: student.confirmation_place || EMPTY_VALUE,

      confirmation_saint_name: student.confirmation_saint_name || EMPTY_VALUE,

      catechism_level: student.catechism_level || EMPTY_VALUE,

      catechism_status: student.catechism_status || "new",

      enrollment_date: student.enrollment_date || null,

      note: student.note || EMPTY_VALUE,

      status: student.status || "active",

      avatar: student.avatar || null,

      created_at: student.created_at || null,

      updated_at: student.updated_at || null,

      classId: matchedClass?.id || classId || null,

      className: matchedClass?.name || relation?.class_name || "Chưa xếp lớp",
    };
  }, []);

  /* ===================================================
     LOAD DATA
  =================================================== */

  const fetchStudents = useCallback(
    async (options = {}) => {
      const { silent = false } = options;

      try {
        // =====================================================
        // LOADING
        // =====================================================
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        // =====================================================
        // CHỈ 2 REQUEST
        // =====================================================
        const [studentRes, classRes] = await Promise.all([
          studentApi.getAll(),
          classApi.getAll(),
        ]);

        if (!mountedRef.current) {
          return;
        }

        // =====================================================
        // DATA
        // =====================================================
        const studentData = getResponseData(studentRes, ["students"]);

        const classData = getResponseData(classRes, ["classes"]);

        // =====================================================
        // FORMAT CLASSES
        // =====================================================
        const formattedClasses = Array.isArray(classData)
          ? classData.map((item) => ({
              id: item.id,
              name: item.name || item.className || `Lớp #${item.id}`,
              code: item.code || null,
            }))
          : [];

        setClasses(formattedClasses);

        // =====================================================
        // KHÔNG CÓ HỌC SINH
        // =====================================================
        if (!Array.isArray(studentData)) {
          setStudents([]);
          setSelectedRowKeys([]);
          return;
        }

        // =====================================================
        // FORMAT STUDENTS
        //
        // KHÔNG GỌI:
        // classStudentApi.getByStudent()
        //
        // Vì /students đã trả:
        // class_id
        // class_name
        // class_code
        // class_student_status
        // joined_at
        // =====================================================
        const formattedStudents = studentData.map((student) => {
          const relation = {
            class_id: student.class_id,
            class_name: student.class_name,
            class_code: student.class_code,
            status: student.class_student_status,
            joined_at: student.joined_at,
          };

          return formatStudent(student, relation, formattedClasses);
        });

        // =====================================================
        // SET DATA
        // =====================================================
        if (!mountedRef.current) {
          return;
        }

        setStudents(formattedStudents);

        // Reset checkbox
        setSelectedRowKeys([]);
      } catch (error) {
        console.error("GET STUDENTS ERROR:", error);

        if (mountedRef.current) {
          message.error(
            error?.response?.data?.message ||
              "Không thể tải danh sách học sinh!",
          );
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [formatStudent],
  );

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    mountedRef.current = true;

    if (!didInitialFetch.current) {
      didInitialFetch.current = true;
      fetchStudents();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchStudents]);

  /* ===================================================
     FILTER
  =================================================== */

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (activeClassTab === "unassigned") {
      result = result.filter((student) => !student.classId);
    } else if (activeClassTab !== "all") {
      result = result.filter(
        (student) => String(student.classId) === String(activeClassTab),
      );
    }

    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      result = result.filter(
        (student) =>
          student.name?.toLowerCase().includes(keyword) ||
          student.code?.toLowerCase().includes(keyword) ||
          student.phone?.toLowerCase().includes(keyword) ||
          student.email?.toLowerCase().includes(keyword),
      );
    }

    if (selectedStatus !== "all") {
      result = result.filter((student) => student.status === selectedStatus);
    }

    return result;
  }, [students, activeClassTab, searchText, selectedStatus]);

  /* ===================================================
     PAGINATION
  =================================================== */

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  /* ===================================================
     STATISTICS
  =================================================== */

  const statistics = useMemo(() => {
    const total = students.length;

    const active = students.filter(
      (student) => student.status === "active",
    ).length;

    const inactive = students.filter(
      (student) => student.status !== "active",
    ).length;

    const unassigned = students.filter((student) => !student.classId).length;

    return {
      total,
      active,
      inactive,
      unassigned,
    };
  }, [students]);

  /* ===================================================
     TAB CHANGE
  =================================================== */

  const handleTabChange = (key) => {
    setActiveClassTab(key);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  /* ===================================================
     RESET FILTER
  =================================================== */

  const resetFilters = () => {
    setSearchText("");
    setSelectedStatus("all");
    setActiveClassTab("all");
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  /* ===================================================
     CREATE
  =================================================== */

  const handleOpenCreateModal = () => {
    if (saving || loading || bulkDeleting) {
      return;
    }

    setEditingStudent(null);

    form.resetFields();

    form.setFieldsValue({
      gender: "Nam",
      nationality: "Việt Nam",
      status: "active",
      catechism_status: "new",
    });

    setIsFormModalOpen(true);
  };

  /* ===================================================
     EDIT
  =================================================== */

  const handleOpenEditModal = useCallback(
    (student) => {
      setEditingStudent(student);

      const value = (item) => (item === EMPTY_VALUE ? "" : item);

      form.setFieldsValue({
        code: value(student.code),
        name: student.name,
        gender: student.gender,

        date_of_birth: student.date_of_birth
          ? dayjs(student.date_of_birth)
          : null,

        birth_place: value(student.birth_place),

        nationality: value(student.nationality),

        phone: value(student.phone),
        email: value(student.email),
        address: value(student.address),
        parish: value(student.parish),

        class_id: student.classId ? String(student.classId) : undefined,

        father_name: value(student.father_name),

        father_phone: value(student.father_phone),

        mother_name: value(student.mother_name),

        mother_phone: value(student.mother_phone),

        guardian_name: value(student.guardian_name),

        guardian_phone: value(student.guardian_phone),

        guardian_relationship: value(student.guardian_relationship),

        baptism_name: value(student.baptism_name),

        baptism_date: student.baptism_date ? dayjs(student.baptism_date) : null,

        baptism_place: value(student.baptism_place),

        baptism_parish: value(student.baptism_parish),

        baptism_certificate_no: value(student.baptism_certificate_no),

        saint_name: value(student.saint_name),

        first_communion_date: student.first_communion_date
          ? dayjs(student.first_communion_date)
          : null,

        first_communion_place: value(student.first_communion_place),

        confirmation_date: student.confirmation_date
          ? dayjs(student.confirmation_date)
          : null,

        confirmation_place: value(student.confirmation_place),

        confirmation_saint_name: value(student.confirmation_saint_name),

        catechism_level: value(student.catechism_level),

        catechism_status: student.catechism_status || "new",

        enrollment_date: student.enrollment_date
          ? dayjs(student.enrollment_date)
          : null,

        status: student.status || "active",

        note: value(student.note),
      });

      setIsFormModalOpen(true);
    },
    [form],
  );

  /* ===================================================
     BUILD PAYLOAD
  =================================================== */

  const buildStudentPayload = (values) => {
    return {
      name: values.name?.trim(),

      gender: values.gender || "Khác",

      date_of_birth: values.date_of_birth
        ? values.date_of_birth.format("YYYY-MM-DD")
        : null,

      birth_place: values.birth_place?.trim() || null,

      nationality: values.nationality?.trim() || "Việt Nam",

      phone: values.phone?.trim() || null,

      email: values.email?.trim() || null,

      address: values.address?.trim() || null,

      parish: values.parish?.trim() || null,

      father_name: values.father_name?.trim() || null,

      father_phone: values.father_phone?.trim() || null,

      mother_name: values.mother_name?.trim() || null,

      mother_phone: values.mother_phone?.trim() || null,

      guardian_name: values.guardian_name?.trim() || null,

      guardian_phone: values.guardian_phone?.trim() || null,

      guardian_relationship: values.guardian_relationship?.trim() || null,

      baptism_name: values.baptism_name?.trim() || null,

      baptism_date: values.baptism_date
        ? values.baptism_date.format("YYYY-MM-DD")
        : null,

      baptism_place: values.baptism_place?.trim() || null,

      baptism_parish: values.baptism_parish?.trim() || null,

      baptism_certificate_no: values.baptism_certificate_no?.trim() || null,

      saint_name: values.saint_name?.trim() || null,

      first_communion_date: values.first_communion_date
        ? values.first_communion_date.format("YYYY-MM-DD")
        : null,

      first_communion_place: values.first_communion_place?.trim() || null,

      confirmation_date: values.confirmation_date
        ? values.confirmation_date.format("YYYY-MM-DD")
        : null,

      confirmation_place: values.confirmation_place?.trim() || null,

      confirmation_saint_name: values.confirmation_saint_name?.trim() || null,

      catechism_level: values.catechism_level?.trim() || null,

      catechism_status: values.catechism_status || "new",

      enrollment_date: values.enrollment_date
        ? values.enrollment_date.format("YYYY-MM-DD")
        : null,

      note: values.note?.trim() || null,

      status: values.status || "active",

      class_id: values.class_id || null,
    };
  };

  /* ===================================================
     SAVE STUDENT
  =================================================== */

  const handleSaveStudent = async (values) => {
    if (saving) return;

    try {
      setSaving(true);

      const payload = buildStudentPayload(values);

      if (!editingStudent) {
        await studentApi.create(payload);

        message.success("Thêm học sinh thành công!");
      } else {
        await studentApi.update(editingStudent.id, payload);

        message.success("Cập nhật học sinh thành công!");
      }

      setIsFormModalOpen(false);
      setEditingStudent(null);

      form.resetFields();

      await fetchStudents({
        silent: true,
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu học sinh!",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================
     DETAIL
  =================================================== */

  const handleOpenDetail = useCallback((student) => {
    setDetailStudent(student);
    setIsDetailModalOpen(true);
  }, []);

  /* ===================================================
     CHANGE CLASS
  =================================================== */

  const handleOpenChangeClass = useCallback(
    (student) => {
      setChangeClassStudent(student);

      changeClassForm.setFieldsValue({
        new_class_id: student.classId ? String(student.classId) : undefined,
      });

      setIsChangeClassModalOpen(true);
    },
    [changeClassForm],
  );

  const handleChangeClassSubmit = async (values) => {
    if (!changeClassStudent || saving) {
      return;
    }

    const studentId = changeClassStudent.id;

    try {
      setSaving(true);

      setActionLoadingState("changeClass", studentId);

      const newClassId = values.new_class_id;

      if (!newClassId) {
        throw new Error("Vui lòng chọn lớp mới");
      }

      if (
        changeClassStudent.classId &&
        String(changeClassStudent.classId) === String(newClassId)
      ) {
        message.info("Học sinh đã ở lớp này.");

        return;
      }

      const hide = message.loading(
        changeClassStudent.classId
          ? "Đang chuyển lớp..."
          : "Đang thêm vào lớp...",
        0,
      );

      try {
        if (changeClassStudent.classId) {
          await classStudentApi.changeClass(
            changeClassStudent.classId,
            studentId,
            newClassId,
          );
        } else {
          await classStudentApi.add({
            class_id: newClassId,
            student_id: studentId,
            status: "studying",
          });
        }
      } finally {
        hide();
      }

      message.success(
        changeClassStudent.classId
          ? "Chuyển lớp thành công!"
          : "Đã xếp lớp thành công!",
      );

      setIsChangeClassModalOpen(false);

      setChangeClassStudent(null);

      changeClassForm.resetFields();

      await fetchStudents({
        silent: true,
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể chuyển lớp!",
      );
    } finally {
      clearActionLoadingState("changeClass");

      setSaving(false);
    }
  };

  /* ===================================================
     TOGGLE STATUS
  =================================================== */

  const handleToggleStatus = useCallback(
    async (student) => {
      try {
        setSaving(true);

        setActionLoadingState("toggle", student.id);

        const newStatus = student.status === "active" ? "inactive" : "active";

        await studentApi.update(student.id, {
          name: student.name,
          status: newStatus,
        });

        message.success(
          newStatus === "active" ? "Đã mở khóa học sinh!" : "Đã khóa học sinh!",
        );

        await fetchStudents();
      } catch (error) {
        message.error(
          error?.response?.data?.message || "Không thể cập nhật trạng thái!",
        );
      } finally {
        clearActionLoadingState("toggle");

        setSaving(false);
      }
    },
    [fetchStudents, setActionLoadingState, clearActionLoadingState],
  );

  /* ===================================================
     DELETE
  =================================================== */

  const handleDeleteStudent = useCallback(
    async (id) => {
      try {
        setSaving(true);

        setActionLoadingState("delete", id);

        await studentApi.delete(id);

        message.success("Đã xóa học sinh!");

        const nextTotal = filteredStudents.length - 1;

        const maxPage = Math.max(1, Math.ceil(nextTotal / pageSize));

        if (currentPage > maxPage) {
          setCurrentPage(maxPage);
        }

        await fetchStudents();
      } catch (error) {
        message.error(
          error?.response?.data?.message || "Không thể xóa học sinh!",
        );
      } finally {
        clearActionLoadingState("delete");

        setSaving(false);
      }
    },
    [
      filteredStudents.length,
      pageSize,
      currentPage,
      fetchStudents,
      setActionLoadingState,
      clearActionLoadingState,
    ],
  );

  /* ===================================================
     BULK DELETE
  =================================================== */

  const handleBulkDelete = async () => {
    if (!selectedRowKeys.length || bulkDeleting) {
      return;
    }

    const deleteCount = selectedRowKeys.length;

    try {
      setBulkDeleting(true);

      const hide = message.loading(`Đang xóa ${deleteCount} học sinh...`, 0);

      try {
        await Promise.all(selectedRowKeys.map((id) => studentApi.delete(id)));
      } finally {
        hide();
      }

      message.success(`Đã xóa ${deleteCount} học sinh!`);

      setSelectedRowKeys([]);

      const nextTotal = filteredStudents.length - deleteCount;

      const maxPage = Math.max(1, Math.ceil(nextTotal / pageSize));

      if (currentPage > maxPage) {
        setCurrentPage(maxPage);
      }

      await fetchStudents({
        silent: true,
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể xóa một số học sinh!",
      );

      await fetchStudents({
        silent: true,
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  /* ===================================================
     STATUS TAG
  =================================================== */

  const renderStatus = (status) => {
    const config = {
      active: {
        text: "Hoạt động",
        bg: "#ecfdf5",
        color: "#059669",
      },

      inactive: {
        text: "Tạm khóa",
        bg: "#fff7ed",
        color: "#ea580c",
      },

      graduated: {
        text: "Đã tốt nghiệp",
        bg: "#eff6ff",
        color: "#2563eb",
      },

      transferred: {
        text: "Đã chuyển đi",
        bg: "#f5f3ff",
        color: "#7c3aed",
      },

      dropped: {
        text: "Đã nghỉ",
        bg: "#fef2f2",
        color: "#dc2626",
      },
    };

    const item = config[status] || config.inactive;

    return (
      <Tag
        bordered={false}
        style={{
          borderRadius: 20,
          padding: "4px 12px",
          background: item.bg,
          color: item.color,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        ● {item.text}
      </Tag>
    );
  };

  /* ===================================================
     CATECHISM STATUS
  =================================================== */

  const renderCatechismStatus = (status) => {
    const map = {
      new: "Mới",
      studying: "Đang học",
      completed: "Hoàn thành",
      graduated: "Tốt nghiệp",
      dropped: "Đã nghỉ",
    };

    return (
      <Tag
        style={{
          whiteSpace: "nowrap",
        }}
      >
        {map[status] || status}
      </Tag>
    );
  };

  /* ===================================================
     TABLE COLUMNS
  =================================================== */

  const columns = useMemo(
    () => [
      {
        title: "Học sinh",
        key: "student",
        width: 270,

        render: (_, record) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 230,
            }}
          >
            <Avatar
              size={44}
              src={record.avatar}
              icon={<UserOutlined />}
              style={{
                flexShrink: 0,
                background: "#eef2ff",
                color: "#6366f1",
                fontWeight: 700,
              }}
            />

            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Text
                strong
                ellipsis
                style={{
                  display: "block",
                  maxWidth: 200,
                  cursor: "pointer",
                }}
                onClick={() => handleOpenDetail(record)}
              >
                {record.name}
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {record.code} • {record.gender === "male" ? "nam" : "nữ"}
              </Text>
            </div>
          </div>
        ),
      },

      {
        title: "Ngày sinh",
        dataIndex: "date_of_birth",
        width: 120,

        render: (value) => formatDate(value),
      },

      {
        title: "Lớp",
        key: "class",

        render: (_, record) =>
          record.classId ? (
            <Tag
              icon={<BookOutlined />}
              style={{
                borderRadius: 8,
                whiteSpace: "nowrap",
              }}
            >
              {record.className}
            </Tag>
          ) : (
            <Text
              type="secondary"
              style={{
                whiteSpace: "nowrap",
              }}
            >
              Chưa xếp lớp
            </Text>
          ),
      },

      {
        title: "Trạng thái",
        dataIndex: "status",
        width: 140,

        render: (value) => renderStatus(value),
      },

      {
        title: "",
        key: "action",
        width: 150,
        fixed: "right",

        render: (_, record) => (
          <Space size={2}>
            <Tooltip title="Xem QR">
              <Button
                type="text"
                shape="circle"
                icon={<QrcodeOutlined />}
                onClick={() => handleOpenQR(record)}
                style={{
                  color: primaryNavy,
                }}
              />
            </Tooltip>

            <Tooltip title="Xem">
              <Button
                type="text"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => handleOpenDetail(record)}
              />
            </Tooltip>

            <Tooltip title="Sửa">
              <Button
                type="text"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>

            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "qr",
                    icon: <QrcodeOutlined />,
                    label: "Xem mã QR",
                    onClick: () => handleOpenQR(record),
                  },

                  {
                    key: "change",
                    icon: <SwapOutlined />,
                    label: "Chuyển lớp",
                    onClick: () => handleOpenChangeClass(record),
                  },

                  {
                    key: "status",
                    icon:
                      record.status === "active" ? (
                        <LockOutlined />
                      ) : (
                        <UnlockOutlined />
                      ),

                    label:
                      record.status === "active" ? "Khóa học sinh" : "Mở khóa",

                    onClick: () => handleToggleStatus(record),
                  },

                  {
                    type: "divider",
                  },

                  {
                    key: "delete",
                    danger: true,
                    icon: <DeleteOutlined />,

                    label: (
                      <Popconfirm
                        title="Xóa học sinh?"
                        description="Dữ liệu sau khi xóa không thể khôi phục."
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{
                          danger: true,
                        }}
                        onConfirm={() => handleDeleteStudent(record.id)}
                      >
                        <span>Xóa học sinh</span>
                      </Popconfirm>
                    ),
                  },
                ],
              }}
            >
              <Button type="text" shape="circle" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        ),
      },
    ],
    [
      handleDeleteStudent,
      handleOpenChangeClass,
      handleOpenDetail,
      handleOpenEditModal,
      handleToggleStatus,
      handleOpenQR,
    ],
  );

  /* ===================================================
     CLASS TABS
  =================================================== */

  const classTabs = useMemo(() => {
    const items = [
      {
        key: "all",

        label: (
          <Space size={6}>
            <TeamOutlined />

            <span>Tất cả</span>

            <Badge
              count={statistics.total}
              overflowCount={999}
              style={{
                background: "#6366f1",
              }}
            />
          </Space>
        ),
      },
    ];

    classes.forEach((classItem) => {
      const count = students.filter(
        (student) => String(student.classId) === String(classItem.id),
      ).length;

      items.push({
        key: String(classItem.id),

        label: (
          <Space size={6}>
            <BookOutlined />

            <span>{classItem.name}</span>

            <Badge
              count={count}
              showZero
              style={{
                background: "#94a3b8",
              }}
            />
          </Space>
        ),
      });
    });

    items.push({
      key: "unassigned",

      label: (
        <Space size={6}>
          <IdcardOutlined />

          <span>Chưa xếp lớp</span>

          <Badge
            count={statistics.unassigned}
            showZero
            style={{
              background: "#f59e0b",
            }}
          />
        </Space>
      ),
    });

    return items;
  }, [classes, students, statistics]);

  /* ===================================================
     DETAIL TABS
  =================================================== */

  const detailTabs = detailStudent
    ? [
        {
          key: "general",
          label: "Thông tin chung",

          children: (
            <Descriptions
              bordered
              size="small"
              column={{
                xs: 1,
                sm: 2,
              }}
            >
              <Descriptions.Item label="Mã học sinh">
                {displayValue(detailStudent.code)}
              </Descriptions.Item>

              <Descriptions.Item label="Họ tên">
                <strong>{detailStudent.name}</strong>
              </Descriptions.Item>

              <Descriptions.Item label="Giới tính">
                {detailStudent.gender}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày sinh">
                {formatDate(detailStudent.date_of_birth)}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi sinh">
                {detailStudent.birth_place}
              </Descriptions.Item>

              <Descriptions.Item label="Quốc tịch">
                {detailStudent.nationality}
              </Descriptions.Item>

              <Descriptions.Item label="Lớp">
                {detailStudent.className}
              </Descriptions.Item>

              <Descriptions.Item label="Giáo xứ">
                {detailStudent.parish}
              </Descriptions.Item>

              <Descriptions.Item label="SĐT">
                {detailStudent.phone}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                {detailStudent.email}
              </Descriptions.Item>

              <Descriptions.Item label="Địa chỉ" span={2}>
                {detailStudent.address}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {renderStatus(detailStudent.status)}
              </Descriptions.Item>

              <Descriptions.Item label="Giáo lý">
                {renderCatechismStatus(detailStudent.catechism_status)}
              </Descriptions.Item>
            </Descriptions>
          ),
        },

        {
          key: "church",
          label: "Bí tích",

          children: (
            <Descriptions
              bordered
              size="small"
              column={{
                xs: 1,
                sm: 2,
              }}
            >
              <Descriptions.Item label="Tên thánh Rửa tội">
                {detailStudent.baptism_name}
              </Descriptions.Item>

              <Descriptions.Item label="Tên thánh">
                {detailStudent.saint_name}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày Rửa tội">
                {formatDate(detailStudent.baptism_date)}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi Rửa tội">
                {detailStudent.baptism_place}
              </Descriptions.Item>

              <Descriptions.Item label="Giáo xứ Rửa tội">
                {detailStudent.baptism_parish}
              </Descriptions.Item>

              <Descriptions.Item label="Số chứng thư">
                {detailStudent.baptism_certificate_no}
              </Descriptions.Item>

              <Descriptions.Item label="Rước lễ lần đầu">
                {formatDate(detailStudent.first_communion_date)}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi Rước lễ">
                {detailStudent.first_communion_place}
              </Descriptions.Item>

              <Descriptions.Item label="Thêm sức">
                {formatDate(detailStudent.confirmation_date)}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi Thêm sức">
                {detailStudent.confirmation_place}
              </Descriptions.Item>

              <Descriptions.Item label="Tên thánh Thêm sức">
                {detailStudent.confirmation_saint_name}
              </Descriptions.Item>
            </Descriptions>
          ),
        },

        {
          key: "family",
          label: "Gia đình",

          children: (
            <Descriptions
              bordered
              size="small"
              column={{
                xs: 1,
                sm: 2,
              }}
            >
              <Descriptions.Item label="Bố">
                {detailStudent.father_name}
              </Descriptions.Item>

              <Descriptions.Item label="SĐT bố">
                {detailStudent.father_phone}
              </Descriptions.Item>

              <Descriptions.Item label="Mẹ">
                {detailStudent.mother_name}
              </Descriptions.Item>

              <Descriptions.Item label="SĐT mẹ">
                {detailStudent.mother_phone}
              </Descriptions.Item>

              <Descriptions.Item label="Người giám hộ">
                {detailStudent.guardian_name}
              </Descriptions.Item>

              <Descriptions.Item label="SĐT giám hộ">
                {detailStudent.guardian_phone}
              </Descriptions.Item>

              <Descriptions.Item label="Quan hệ">
                {detailStudent.guardian_relationship}
              </Descriptions.Item>
            </Descriptions>
          ),
        },

        {
          key: "catechism",
          label: "Giáo lý",

          children: (
            <Descriptions
              bordered
              size="small"
              column={{
                xs: 1,
                sm: 2,
              }}
            >
              <Descriptions.Item label="Cấp giáo lý">
                {detailStudent.catechism_level}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {renderCatechismStatus(detailStudent.catechism_status)}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày nhập học">
                {formatDate(detailStudent.enrollment_date)}
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú">
                {detailStudent.note}
              </Descriptions.Item>
            </Descriptions>
          ),
        },
      ]
    : [];

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <>
      <style>
        {`
          /* =====================================================
             GLOBAL RESPONSIVE
          ===================================================== */

          .student-management-page {
            min-height: 100vh;
            padding: 28px;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          /* =====================================================
             TABS
          ===================================================== */

          .student-class-tabs {
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: thin;
          }

          .student-class-tabs .ant-tabs-nav {
            margin-bottom: 22px !important;
          }

          .student-class-tabs .ant-tabs-tab {
            white-space: nowrap;
          }

          /* =====================================================
             MAIN CARD
          ===================================================== */

          .student-main-card .ant-card-body {
            padding: 24px;
          }

          /* =====================================================
             FILTER
          ===================================================== */

          .student-filter-row {
            width: 100%;
          }

          .student-filter-control {
            width: 100%;
          }

          /* =====================================================
             TABLE
          ===================================================== */

          .student-table .ant-table {
            border-radius: 12px;
          }

          .student-table .ant-table-container {
            border-radius: 12px;
          }

          .student-table .ant-table-thead > tr > th {
            white-space: nowrap;
          }

          .student-table .ant-table-cell {
            vertical-align: middle;
          }

          /* =====================================================
             BOTTOM PAGINATION
          ===================================================== */

          .student-pagination-row {
            width: 100%;
          }

          .student-pagination-controls {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 10px;
          }

          /* =====================================================
             QR
          ===================================================== */

          .student-qr-card {
            width: 330px;
            max-width: 100%;
            margin: 0 auto 20px;
          }

          .student-qr-wrapper {
            max-width: 100%;
            overflow: hidden;
          }

          .student-qr-canvas {
            max-width: 100%;
            height: auto !important;
          }

          .student-qr-actions {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
          }

          /* =====================================================
             MODAL
          ===================================================== */

          .student-responsive-modal .ant-modal-content {
            border-radius: 18px;
            overflow: hidden;
          }

          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 992px) {
            .student-management-page {
              padding: 20px;
            }

            .student-main-card .ant-card-body {
              padding: 20px;
            }
          }

          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 767px) {
            .student-management-page {
              padding: 12px;
            }

            .student-main-card {
              border-radius: 16px !important;
            }

            .student-main-card .ant-card-body {
              padding: 14px !important;
            }

            /* Tabs */

            .student-class-tabs {
              margin-left: -4px;
              margin-right: -4px;
            }

            .student-class-tabs .ant-tabs-nav {
              margin-bottom: 16px !important;
            }

            .student-class-tabs .ant-tabs-tab {
              padding: 8px 10px !important;
              font-size: 13px;
            }

            /* Filter */

            .student-filter-row {
              margin-bottom: 16px !important;
            }

            /* Table */

            .student-table .ant-table {
              font-size: 13px;
            }

            .student-table .ant-table-thead > tr > th {
              padding: 10px 12px !important;
              font-size: 12px;
            }

            .student-table .ant-table-tbody > tr > td {
              padding: 10px 12px !important;
            }

            /* Bottom */

            .student-pagination-row {
              display: flex !important;
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .student-pagination-info {
              width: 100%;
              text-align: center;
            }

            .student-pagination-controls {
              width: 100%;
              justify-content: center;
            }

            .student-pagination-controls
              .ant-pagination {
              max-width: 100%;
            }

            /* Modal */

            .student-responsive-modal {
              max-width: calc(100vw - 16px) !important;
              margin: 8px auto !important;
            }

            .student-responsive-modal
              .ant-modal-content {
              border-radius: 16px;
            }

            /* QR */

            .student-qr-card {
              width: 100%;
              padding: 0 !important;
            }

            .student-qr-card
              .ant-card-body {
              padding: 12px !important;
            }

            .student-qr-wrapper {
              padding: 10px !important;
            }

            .student-qr-actions {
              width: 100%;
            }

            .student-qr-actions
              .ant-btn {
              flex: 1 1 140px;
              min-width: 0 !important;
            }

            /* Description */

            .ant-descriptions {
              overflow: hidden;
            }

            .ant-descriptions-item-label,
            .ant-descriptions-item-content {
              word-break: break-word;
            }
          }

          /* =====================================================
             SMALL MOBILE
          ===================================================== */

          @media (max-width: 480px) {
            .student-management-page {
              padding: 8px;
            }

            .student-main-card .ant-card-body {
              padding: 10px !important;
            }

            .student-class-tabs .ant-tabs-tab {
              padding: 7px 8px !important;
              font-size: 12px;
            }

            .student-table .ant-table-thead > tr > th,
            .student-table .ant-table-tbody > tr > td {
              padding: 9px 10px !important;
            }

            .student-pagination-controls {
              flex-direction: column;
            }

            .student-pagination-controls
              .ant-select {
              width: 100%;
            }

            .student-pagination-controls
              .ant-pagination {
              width: 100%;
              justify-content: center;
            }

            .student-pagination-controls
              .ant-pagination-options {
              display: none;
            }

            .student-qr-actions {
              flex-direction: column;
            }

            .student-qr-actions
              .ant-btn {
              width: 100%;
            }
          }

          /* =====================================================
             VERY SMALL
          ===================================================== */

          @media (max-width: 360px) {
            .student-management-page {
              padding: 6px;
            }

            .student-main-card .ant-card-body {
              padding: 8px !important;
            }

            .student-class-tabs .ant-tabs-tab {
              padding: 6px !important;
              font-size: 11px;
            }
          }
        `}
      </style>

      <div
        className="student-management-page"
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <PageHeroHeader
          icon={<UserOutlined />}
          badgeText="🌸 QUẢN LÝ HỌC SINH"
          title="Quản lý học sinh"
          description="Quản lý thông tin, lớp học và quá trình giáo lý của học sinh"
          selectedCount={selectedRowKeys.length}
          onBulkDelete={handleBulkDelete}
          bulkDeleting={bulkDeleting}
          onRefresh={() =>
            fetchStudents({
              silent: true,
            })
          }
          refreshLoading={refreshing}
          primaryButtonText={
            saving && !editingStudent ? "Đang thêm..." : "Thêm học sinh"
          }
          primaryButtonIcon={<PlusOutlined />}
          onPrimaryClick={handleOpenCreateModal}
          primaryLoading={saving && !editingStudent}
          primaryDisabled={loading || saving}
        />

        {/* =================================================
            STATISTICS
        ================================================= */}

        <Row
          gutter={[18, 18]}
          style={{
            marginBottom: 26,
          }}
        >
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Tổng học sinh"
              value={statistics.total}
              loading={loading}
              icon={<TeamOutlined />}
              iconColor={primaryNavy}
              description="Tất cả học sinh"
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Đang hoạt động"
              value={statistics.active}
              loading={loading}
              icon={<UserSwitchOutlined />}
              iconColor="#059669"
              description="Học sinh đang hoạt động"
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Tạm khóa"
              value={statistics.inactive}
              loading={loading}
              icon={<LockOutlined />}
              iconColor="#ea580c"
              description="Học sinh tạm khóa"
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Chưa xếp lớp"
              value={statistics.unassigned}
              loading={loading}
              icon={<BookOutlined />}
              iconColor="#d97706"
              description="Chưa được phân lớp"
            />
          </Col>
        </Row>

        {/* =================================================
            MAIN
        ================================================= */}

        <Card
          className="student-main-card"
          bordered={false}
          style={{
            borderRadius: 22,
            overflow: "hidden",
          }}
        >
          <div className="student-class-tabs">
            <Tabs
              activeKey={activeClassTab}
              onChange={handleTabChange}
              type="card"
              items={classTabs}
            />
          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <Row className="student-filter-row" gutter={[12, 12]} align="middle">
            <Col xs={24} md={12} lg={9}>
              <Input
                className="student-filter-control"
                allowClear
                size="large"
                prefix={
                  <SearchOutlined
                    style={{
                      color: "#94a3b8",
                    }}
                  />
                }
                placeholder="Tìm tên, mã, số điện thoại, email..."
                value={searchText}
                disabled={loading || bulkDeleting}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  borderRadius: 12,
                }}
              />
            </Col>

            <Col xs={24} md={6} lg={4}>
              <Select
                className="student-filter-control"
                size="large"
                value={selectedStatus}
                disabled={loading || bulkDeleting}
                onChange={(value) => {
                  setSelectedStatus(value);
                  setCurrentPage(1);
                }}
                options={[
                  {
                    value: "all",
                    label: "Tất cả trạng thái",
                  },
                  {
                    value: "active",
                    label: "Đang hoạt động",
                  },
                  {
                    value: "inactive",
                    label: "Tạm khóa",
                  },
                  {
                    value: "graduated",
                    label: "Đã tốt nghiệp",
                  },
                  {
                    value: "transferred",
                    label: "Đã chuyển đi",
                  },
                  {
                    value: "dropped",
                    label: "Đã nghỉ",
                  },
                ]}
              />
            </Col>

            <Col xs={24} md={6} lg={3}>
              <Button
                size="large"
                block
                disabled={loading || saving || bulkDeleting}
                onClick={resetFilters}
                style={{
                  borderRadius: 12,
                }}
              >
                Đặt lại
              </Button>
            </Col>
          </Row>

          <Divider
            style={{
              margin: "0 0 18px",
            }}
          />

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="student-table">
            <Table
              rowKey="id"
              loading={{
                spinning: loading,
                indicator: <Spin size="large" />,
              }}
              columns={columns}
              dataSource={paginatedStudents}
              pagination={false}
              scroll={{
                x: 1150,
              }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      searchText || selectedStatus !== "all"
                        ? "Không tìm thấy học sinh phù hợp"
                        : "Chưa có học sinh"
                    }
                  />
                ),
              }}
              rowSelection={{
                selectedRowKeys,

                onChange: setSelectedRowKeys,

                getCheckboxProps: (record) => ({
                  disabled:
                    actionLoading.delete === record.id ||
                    actionLoading.toggle === record.id ||
                    actionLoading.changeClass === record.id ||
                    saving ||
                    bulkDeleting,
                }),
              }}
            />
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <Row
            className="student-pagination-row"
            justify="space-between"
            align="middle"
            gutter={[16, 16]}
            style={{
              marginTop: 24,
            }}
          >
            <Col className="student-pagination-info">
              <Text type="secondary">
                Hiển thị <strong>{filteredStudents.length}</strong> học sinh
              </Text>
            </Col>

            <Col>
              <div className="student-pagination-controls">
                <Select
                  value={String(pageSize)}
                  disabled={loading || saving || bulkDeleting}
                  onChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                  options={[
                    {
                      value: "10",
                      label: "10 / trang",
                    },
                    {
                      value: "20",
                      label: "20 / trang",
                    },
                    {
                      value: "50",
                      label: "50 / trang",
                    },
                  ]}
                />

                <Pagination
                  responsive
                  current={currentPage}
                  total={filteredStudents.length}
                  pageSize={pageSize}
                  disabled={loading || saving || bulkDeleting}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  showTotal={(total) => `${total} học sinh`}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* =================================================
            CREATE / EDIT
        ================================================= */}

        <AppFormModal
          open={isFormModalOpen}
          loading={saving}
          editing={!!editingStudent}
          form={form}
          width={900}
          title="Học sinh"
          createTitle="Thêm học sinh mới"
          editTitle="Chỉnh sửa học sinh"
          subtitle="Thiết lập thông tin và lưu thay đổi."
          icon={<UserOutlined />}
          createText="Thêm học sinh"
          editText="Lưu thay đổi"
          onCancel={() => {
            if (saving) return;

            setIsFormModalOpen(false);

            setEditingStudent(null);

            form.resetFields();
          }}
        >
          <StudentForm
            form={form}
            classes={classes}
            saving={saving}
            onFinish={handleSaveStudent}
          />
        </AppFormModal>

        {/* =================================================
            DETAIL
        ================================================= */}

        <AppDetailModal
          open={isDetailModalOpen}
          width={850}
          title="Thông tin học sinh"
          subtitle={
            detailStudent
              ? `Thông tin chi tiết học sinh #${detailStudent.id}`
              : undefined
          }
          avatar={detailStudent?.avatar}
          loading={saving || bulkDeleting}
          onCancel={() => setIsDetailModalOpen(false)}
          onEdit={() => {
            setIsDetailModalOpen(false);

            handleOpenEditModal(detailStudent);
          }}
        >
          {detailStudent && (
            <Tabs
              style={{
                marginTop: 20,
              }}
              items={detailTabs}
            />
          )}
        </AppDetailModal>

        {/* =================================================
            CHANGE CLASS
        ================================================= */}

        <Modal
          className="student-responsive-modal"
          title="Chuyển lớp học"
          open={isChangeClassModalOpen}
          maskClosable={!saving}
          closable={!saving}
          keyboard={!saving}
          onCancel={() => {
            if (saving) return;

            setIsChangeClassModalOpen(false);

            setChangeClassStudent(null);

            changeClassForm.resetFields();
          }}
          onOk={() => changeClassForm.submit()}
          confirmLoading={saving}
          okText="Chuyển lớp"
          cancelText="Hủy"
          okButtonProps={{
            disabled: saving,
          }}
          cancelButtonProps={{
            disabled: saving,
          }}
          width={500}
        >
          <Form
            form={changeClassForm}
            layout="vertical"
            onFinish={handleChangeClassSubmit}
            style={{
              marginTop: 20,
            }}
          >
            <Card
              size="small"
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 0,
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    flexShrink: 0,
                  }}
                />

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <Text type="secondary">Học sinh</Text>

                  <div>
                    <Text strong>{changeClassStudent?.name}</Text>
                  </div>

                  <Text
                    type="secondary"
                    style={{
                      wordBreak: "break-word",
                    }}
                  >
                    Lớp hiện tại:{" "}
                    {changeClassStudent?.className || "Chưa xếp lớp"}
                  </Text>
                </div>
              </div>
            </Card>

            <Form.Item
              name="new_class_id"
              label="Lớp mới"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn lớp!",
                },
              ]}
            >
              <Select
                size="large"
                showSearch
                optionFilterProp="label"
                placeholder="Chọn lớp học"
                loading={loading}
                disabled={saving || loading}
                options={classes.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* =================================================
            QR MODAL
        ================================================= */}

        <Modal
          className="student-responsive-modal"
          open={isQRModalOpen}
          onCancel={() => {
            setIsQRModalOpen(false);

            setQrStudent(null);
          }}
          footer={null}
          centered
          width={430}
          destroyOnClose
          title={
            <Space>
              <QrcodeOutlined
                style={{
                  color: primaryNavy,
                  fontSize: 20,
                }}
              />

              <span>Mã QR học sinh</span>
            </Space>
          }
        >
          {qrStudent && (
            <div
              style={{
                textAlign: "center",
                padding: "10px 0 20px",
              }}
            >
              {/* INFO */}

              <Avatar
                size={64}
                src={qrStudent.avatar}
                icon={<UserOutlined />}
                style={{
                  background: "#eef2ff",
                  color: "#6366f1",
                  marginBottom: 12,
                }}
              />

              <Typography.Title
                level={4}
                style={{
                  margin: "0 0 4px",
                  color: "#1E293B",
                  wordBreak: "break-word",
                }}
              >
                {qrStudent.name}
              </Typography.Title>

              <Typography.Text
                type="secondary"
                style={{
                  display: "block",
                  marginBottom: 20,
                }}
              >
                {qrStudent.code}
              </Typography.Text>

              {/* QR */}

              <Card
                className="student-qr-card"
                bordered={false}
                style={{
                  background: "#F8FAFC",
                  borderRadius: 20,
                  border: "1px solid #E2E8F0",
                }}
                bodyStyle={{
                  padding: 20,
                }}
              >
                <div
                  className="student-qr-wrapper"
                  style={{
                    background: "#FFFFFF",
                    padding: 16,
                    borderRadius: 16,
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <QRCodeCanvas
                    id={`student-qr-${qrStudent.id}`}
                    value={qrStudent.qr_token}
                    size={260}
                    level="H"
                    includeMargin
                    className="student-qr-canvas"
                  />
                </div>
              </Card>

              <Typography.Text
                type="secondary"
                style={{
                  display: "block",
                  fontSize: 12,
                  marginBottom: 20,
                }}
              >
                Mã này dùng để điểm danh bằng QR
              </Typography.Text>

              {/* ACTION */}

              <div className="student-qr-actions">
                <AppButton
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadQR}
                  style={{
                    borderRadius: 14,
                    height: 40,
                    padding: "0 16px",
                    fontWeight: 800,
                    boxShadow: "0 8px 18px rgba(255, 107, 139, 0.3)",
                  }}
                >
                  Tải QR
                </AppButton>
                <AppButton
                  type="primary"
                  size="large"
                  onClick={() => {
                    setIsQRModalOpen(false);
                    setQrStudent(null);
                  }}
                  style={{
                    borderRadius: 12,
                    minWidth: 100,
                  }}
                >
                  Đóng
                </AppButton>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}
