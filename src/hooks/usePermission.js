import { useUser } from "../context/UserContext";

import {
  canViewAttendance,
  canEditAttendance,
  canDeleteAttendance,
  canViewClass,
  canCreateClass,
  canEditClass,
  canDeleteClass,
  canViewStudents,
  canCreateStudent,
  canEditStudent,
  canDeleteStudent,
  canViewCatechists,
  canCreateCatechist,
  canEditCatechist,
  canDeleteCatechist,
} from "../utils/permissions";

const usePermission = () => {
  const { user } = useUser();

  return {
    user,

    // =========================
    // ATTENDANCE
    // =========================
    canViewAttendance: canViewAttendance(user),
    canEditAttendance: canEditAttendance(user),
    canDeleteAttendance: canDeleteAttendance(user),

    // =========================
    // CLASS
    // =========================
    canViewClass: canViewClass(user),
    canCreateClass: canCreateClass(user),
    canEditClass: canEditClass(user),
    canDeleteClass: canDeleteClass(user),

    // =========================
    // STUDENT
    // =========================
    canViewStudents: canViewStudents(user),
    canCreateStudent: canCreateStudent(user),
    canEditStudent: canEditStudent(user),
    canDeleteStudent: canDeleteStudent(user),

    // =========================
    // CATECHIST
    // =========================
    canViewCatechists: canViewCatechists(user),
    canCreateCatechist: canCreateCatechist(user),
    canEditCatechist: canEditCatechist(user),
    canDeleteCatechist: canDeleteCatechist(user),
  };
};

export default usePermission;
