export const ROLES = {
  ADMIN: "admin",

  PRIEST: "priest",

  LITURGY_MANAGER: "liturgy_manager",

  MEDIA_MANAGER: "media_manager",

  CATECHIST: "catechist",

  TEACHER: "teacher",
};

/**
 * =========================================================
 * CHECK ROLE
 * =========================================================
 */

export const hasRole = (user, roles = []) => {
  if (!user?.role) return false;

  return roles.includes(user.role);
};

/**
 * =========================================================
 * ATTENDANCE
 * =========================================================
 */

/**
 * Xem điểm danh
 * admin
 * catechist
 * teacher
 */
export const canViewAttendance = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST, ROLES.TEACHER].includes(user?.role);
};

/**
 * Thêm / sửa điểm danh
 * admin
 * catechist
 * teacher
 */
export const canEditAttendance = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST, ROLES.TEACHER].includes(user?.role);
};

/**
 * Xóa điểm danh
 * Chỉ catechist
 */
export const canDeleteAttendance = (user) => {
  return user?.role === ROLES.CATECHIST;
};

/**
 * =========================================================
 * CLASS
 * =========================================================
 */

/**
 * Xem danh sách lớp
 *
 * admin
 * catechist
 * teacher
 */
export const canViewClass = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST].includes(user?.role);
};

/**
 * Thêm lớp
 *
 * admin
 * catechist
 */
export const canCreateClass = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST].includes(user?.role);
};

/**
 * Sửa lớp
 *
 * admin
 * catechist
 */
export const canEditClass = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST].includes(user?.role);
};

/**
 * Xóa lớp
 *
 * Chỉ catechist
 */
export const canDeleteClass = (user) => {
  return user?.role === ROLES.CATECHIST;
};

/**
 * =========================================================
 * STUDENT
 * =========================================================
 */

/**
 * Xem danh sách học sinh
 *
 * admin
 * catechist
 */
export const canViewStudents = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST].includes(user?.role);
};

/**
 * Thêm học sinh
 *
 * admin
 * catechist
 */
export const canCreateStudent = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST].includes(user?.role);
};

/**
 * Sửa học sinh
 *
 * admin
 * catechist
 */
export const canEditStudent = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST].includes(user?.role);
};

/**
 * Xóa học sinh
 *
 * Chỉ catechist
 */
export const canDeleteStudent = (user) => {
  return user?.role === ROLES.CATECHIST;
};

/**
 * =========================================================
 * CATECHIST
 * =========================================================
 */

/**
 * Xem danh sách Giáo lý viên
 *
 * admin
 * catechist
 */
export const canViewCatechists = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST].includes(user?.role);
};

/**
 * Thêm Giáo lý viên
 *
 * admin
 * catechist
 */
export const canCreateCatechist = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST].includes(user?.role);
};

/**
 * Sửa Giáo lý viên
 *
 * admin
 * catechist
 */
export const canEditCatechist = (user) => {
  return [ROLES.ADMIN, ROLES.CATECHIST].includes(user?.role);
};

/**
 * Xóa Giáo lý viên
 *
 * Chỉ catechist
 */
export const canDeleteCatechist = (user) => {
  return user?.role === ROLES.CATECHIST;
};
