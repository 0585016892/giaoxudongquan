import api from "./axios";

/**
 * =========================================================
 * 1. GET ATTENDANCE THEO LỚP + NGÀY
 * =========================================================
 *
 * GET /attendance
 *
 * params:
 * {
 *   class_id: 17,
 *   date: "2026-09-01"
 * }
 */
export const getAttendance = async ({ class_id, date }) => {
  if (!class_id) {
    throw new Error("class_id không hợp lệ");
  }

  if (!date) {
    throw new Error("Ngày điểm danh không hợp lệ");
  }

  const response = await api.get("/attendance", {
    params: {
      class_id,
      date,
    },
  });

  return response.data;
};

/**
 * =========================================================
 * 2. SAVE BULK ATTENDANCE
 * =========================================================
 *
 * POST /attendance/bulk
 *
 * Backend yêu cầu:
 *
 * {
 *   class_id: 17,
 *   attendance_date: "2026-09-01",
 *   students: [
 *     {
 *       student_id: 1,
 *       status: "present",
 *       check_in_time: "07:30:00",
 *       note: "Đi học đúng giờ"
 *     }
 *   ]
 * }
 */
export const saveBulkAttendance = async ({
  class_id,
  date,
  attendance_date,
  students,
}) => {
  if (!class_id) {
    throw new Error("class_id không hợp lệ");
  }

  const finalDate = attendance_date || date;

  if (!finalDate) {
    throw new Error("Ngày điểm danh không hợp lệ");
  }

  if (!Array.isArray(students)) {
    throw new Error("Danh sách học sinh không hợp lệ");
  }

  const response = await api.post("/attendance/bulk", {
    class_id,
    attendance_date: finalDate,
    students,
  });

  return response.data;
};

/**
 * =========================================================
 * 3. SCAN QR ATTENDANCE
 * =========================================================
 *
 * POST /attendance/scan-qr
 *
 * Body:
 *
 * {
 *   qr_token:
 *     "846cee63a74f11f19cdce0d55eb860a8",
 *   class_id: 17
 * }
 */
export const scanQRCode = async ({ qr_token, class_id }) => {
  if (!class_id) {
    throw new Error("Vui lòng chọn lớp trước khi quét QR");
  }

  if (typeof qr_token !== "string" || !qr_token.trim()) {
    throw new Error("Mã QR không hợp lệ");
  }

  const response = await api.post("/attendance/scan-qr", {
    qr_token: qr_token.trim(),
    class_id: Number(class_id),
  });

  return response.data;
};

/**
 =========================================================
 * 4. UPDATE ONE ATTENDANCE
 * =========================================================
 *
 * PUT /attendance/:id
 *
 * {
 *   status: "late",
 *   check_in_time: "07:45:00",
 *   note: "Đến muộn"
 * }
 */
export const updateAttendance = async (id, { status, check_in_time, note }) => {
  if (!id) {
    throw new Error("ID điểm danh không hợp lệ");
  }

  if (!status) {
    throw new Error("Trạng thái điểm danh không hợp lệ");
  }

  const response = await api.put(`/attendance/${id}`, {
    status,
    check_in_time: check_in_time || null,
    note: typeof note === "string" ? note.trim() || null : null,
  });

  return response.data;
};

/**
 * =========================================================
 * 5. DELETE ATTENDANCE
 * =========================================================
 *
 * DELETE /attendance/:id
 */
export const deleteAttendance = async (id) => {
  if (!id) {
    throw new Error("ID điểm danh không hợp lệ");
  }

  const response = await api.delete(`/attendance/${id}`);

  return response.data;
};

/**
 * =========================================================
 * 6. GET STUDENT ATTENDANCE
 * =========================================================
 *
 * GET /attendance/student/:studentId
 *
 * Có thể truyền:
 *
 * {
 *   month: 9,
 *   year: 2026
 * }
 */
export const getStudentAttendance = async (studentId, { month, year } = {}) => {
  if (!studentId) {
    throw new Error("studentId không hợp lệ");
  }

  const params = {};

  if (month) {
    params.month = month;
  }

  if (year) {
    params.year = year;
  }

  const response = await api.get(`/attendance/student/${studentId}`, {
    params,
  });

  return response.data;
};

/**
 * =========================================================
 * 7. GET CLASS STATISTICS
 * =========================================================
 *
 * GET /attendance/statistics/:classId
 *
 * params:
 *
 * {
 *   from: "2026-09-01",
 *   to: "2026-09-30"
 * }
 */
export const getClassStatistics = async (classId, { from, to } = {}) => {
  if (!classId) {
    throw new Error("classId không hợp lệ");
  }

  const params = {};

  if (from) {
    params.from = from;
  }

  if (to) {
    params.to = to;
  }

  const response = await api.get(`/attendance/statistics/${classId}`, {
    params,
  });

  return response.data;
};

/**
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */

const attendanceApi = {
  getAttendance,
  saveBulkAttendance,
  scanQRCode,
  updateAttendance,
  deleteAttendance,
  getStudentAttendance,
  getClassStatistics,
};

export default attendanceApi;
