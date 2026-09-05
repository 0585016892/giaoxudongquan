import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Select, Spin, Tag, message } from "antd";
import {
  StarFilled,
  CrownFilled,
  GlobalOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import {
  getResultsLeaderBoard,
  getClassLeaderboard,
} from "../../api/resultApi";

import classApi from "../../api/classApi";

// =========================================================
// ASSETS
// =========================================================

import l1 from "../../assets/images/l1.png";
import l2 from "../../assets/images/l2.png";
import l3 from "../../assets/images/l3.png";
import jesusImg from "../../assets/images/jesusImg.png";
import background from "../../assets/images/background.png";
import bocau from "../../assets/images/bocau.png";

const IMAGE_CONFIG = {
  BACKGROUND: background,
  DOVE_LEFT: bocau,
  DOVE_RIGHT: bocau,
  JESUS_CHARACTER: jesusImg,
};

// =========================================================
// HELPERS
// =========================================================

const normalizeListResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.classes)) {
    return response.classes;
  }

  return [];
};

const normalizeLeaderboardData = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.leaderboard)) {
    return response.leaderboard;
  }

  return [];
};

const getStudentName = (student) => {
  return (
    student?.student_name ||
    student?.name ||
    student?.full_name ||
    student?.student?.name ||
    "Chưa có học sinh"
  );
};

const getStudentScore = (student) => {
  if (!student) return 0;

  const score =
    student?.average_score ??
    student?.averageScore ??
    student?.score ??
    student?.total_score ??
    student?.average ??
    0;

  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) {
    return 0;
  }

  return numericScore % 1 === 0 ? numericScore : numericScore.toFixed(2);
};

const getStudentRank = (student, index) => {
  const rank = Number(student?.rank);

  return Number.isFinite(rank) && rank > 0 ? rank : index + 1;
};

const getClassId = (item) => {
  return item?.id ?? item?.class_id ?? item?.classId;
};

const getClassName = (item) => {
  return (
    item?.name ||
    item?.class_name ||
    item?.className ||
    item?.title ||
    `Lớp ${getClassId(item)}`
  );
};

// =========================================================
// COMPONENT
// =========================================================

const LeaderboardGame = () => {
  // =======================================================
  // STATE
  // =======================================================

  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);

  const [leaderboardMode, setLeaderboardMode] = useState("all");

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedClassName, setSelectedClassName] = useState("");

  // =======================================================
  // LOAD CLASSES
  // =======================================================

  const fetchClasses = useCallback(async () => {
    try {
      setClassesLoading(true);

      const response = await classApi.getAll();

      const data = normalizeListResponse(response);

      setClassesList(data);
    } catch (error) {
      console.error("GET CLASSES ERROR:", error);

      setClassesList([]);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách lớp học",
      );
    } finally {
      setClassesLoading(false);
    }
  }, []);

  // =======================================================
  // LOAD GLOBAL LEADERBOARD
  // =======================================================

  const loadGlobalLeaderboard = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getResultsLeaderBoard();

      if (response?.success) {
        const data = normalizeLeaderboardData(response);

        setStudents(data);
        setLeaderboardMode("all");
        setSelectedClassId(null);
        setSelectedClassName("");
      } else {
        setStudents([]);

        message.error(response?.message || "Không thể lấy bảng thành tích");
      }
    } catch (error) {
      console.error("LOAD GLOBAL LEADERBOARD ERROR:", error);

      setStudents([]);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể kết nối máy chủ",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // LOAD CLASS LEADERBOARD
  // =======================================================

  const loadClassLeaderboard = useCallback(
    async (classId) => {
      if (!classId) {
        return;
      }

      try {
        setLoading(true);

        const response = await getClassLeaderboard(classId);

        if (response?.success) {
          const data = normalizeLeaderboardData(response);

          setStudents(data);
          setLeaderboardMode("class");

          const selectedClass = classesList.find(
            (item) => String(getClassId(item)) === String(classId),
          );

          const className = selectedClass
            ? getClassName(selectedClass)
            : `Lớp ${classId}`;

          setSelectedClassName(className);
        } else {
          setStudents([]);

          message.error(
            response?.message || "Không thể lấy bảng xếp hạng của lớp",
          );
        }
      } catch (error) {
        console.error("LOAD CLASS LEADERBOARD ERROR:", error);

        setStudents([]);

        message.error(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể tải bảng xếp hạng lớp",
        );
      } finally {
        setLoading(false);
      }
    },
    [classesList],
  );

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchClasses();
    loadGlobalLeaderboard();
  }, [fetchClasses, loadGlobalLeaderboard]);

  // =======================================================
  // CLASS OPTIONS
  // =======================================================

  const classOptions = useMemo(() => {
    return classesList
      .filter((item) => getClassId(item))
      .map((item) => ({
        value: getClassId(item),
        label: getClassName(item),
      }));
  }, [classesList]);

  // =======================================================
  // TOP STUDENTS
  // =======================================================

  const getTopStudent = useCallback(
    (rankNumber) => {
      return (
        students.find(
          (student, index) => getStudentRank(student, index) === rankNumber,
        ) || null
      );
    },
    [students],
  );

  const top1 = getTopStudent(1);
  const top2 = getTopStudent(2);
  const top3 = getTopStudent(3);

  // =======================================================
  // HANDLE CLASS CHANGE
  // =======================================================

  const handleClassChange = (classId) => {
    if (!classId) {
      loadGlobalLeaderboard();
      return;
    }

    setSelectedClassId(classId);

    loadClassLeaderboard(classId);
  };

  // =======================================================
  // GLOBAL
  // =======================================================

  const handleGlobalLeaderboard = () => {
    loadGlobalLeaderboard();
  };

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = async () => {
    try {
      if (leaderboardMode === "class" && selectedClassId) {
        await Promise.all([
          fetchClasses(),
          loadClassLeaderboard(selectedClassId),
        ]);
      } else {
        await Promise.all([fetchClasses(), loadGlobalLeaderboard()]);
      }
    } catch (error) {
      console.error("REFRESH ERROR:", error);
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div
      className="chibi-leaderboard-container"
      style={{
        backgroundImage: `url(${IMAGE_CONFIG.BACKGROUND})`,
      }}
    >
      {/* ===================================================
          DECOR
      =================================================== */}

      <img
        src={IMAGE_CONFIG.DOVE_LEFT}
        alt="Dove Left"
        className="dove-img dove-left"
      />

      <img
        src={IMAGE_CONFIG.DOVE_RIGHT}
        alt="Dove Right"
        className="dove-img dove-right"
      />

      <div className="sparkle s1">✨</div>
      <div className="sparkle s2">🌸</div>
      <div className="sparkle s3">⭐</div>
      <div className="sparkle s4">💖</div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="pastel-header-banner">
        <div className="ribbon-pill">
          <CrownFilled className="ribbon-trophy-icon" />

          <span className="ribbon-title-text">Bảng Vàng Giáo Lý</span>

          <CrownFilled className="ribbon-trophy-icon" />
        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        <div className="leaderboard-filter-panel">
          {/* TOÀN GIÁO XỨ */}

          <Button
            type={leaderboardMode === "all" ? "primary" : "default"}
            icon={<GlobalOutlined />}
            onClick={handleGlobalLeaderboard}
            loading={loading && leaderboardMode === "all"}
            className={`leaderboard-mode-btn ${
              leaderboardMode === "all" ? "active" : ""
            }`}
          >
            Toàn giáo xứ
          </Button>

          {/* CHỌN LỚP */}

          <Select
            allowClear
            showSearch
            placeholder="🏫 Xem theo lớp"
            value={selectedClassId}
            onChange={handleClassChange}
            options={classOptions}
            optionFilterProp="label"
            loading={classesLoading}
            className="leaderboard-class-select"
            notFoundContent={
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có lớp"
              />
            }
            suffixIcon={<TeamOutlined />}
          />

          {/* CLASS TAG */}

          {leaderboardMode === "class" && selectedClassName && (
            <Tag className="selected-class-tag">🏫 {selectedClassName}</Tag>
          )}

          {/* REFRESH */}

          <Button
            type="text"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={handleRefresh}
            className="refresh-btn"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      {loading ? (
        <div className="chibi-loading-card">
          <Spin size="large" />

          <div className="loading-text">Đang tải Bảng Vàng Chibi...</div>
        </div>
      ) : students.length === 0 ? (
        <div className="chibi-empty-card">
          <Empty
            image={<div className="empty-icon">🏆</div>}
            description={
              <div>
                <div className="empty-title">Chưa có thành tích</div>

                <div className="empty-description">
                  {leaderboardMode === "class"
                    ? `Lớp ${selectedClassName || "này"} chưa có kết quả.`
                    : "Chưa có học sinh nào có kết quả trong bảng xếp hạng."}
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <div className="game-stage">
          {/* =================================================
              TOP 2
          ================================================= */}

          <div className="podium-column top2-col">
            <div className="rank-badge badge-top2">🥈 HẠNG 2</div>

            <div className="character-area float-anim-2">
              {top2 ? (
                <img src={l2} alt="Top 2" className="full-stand-img img-top2" />
              ) : (
                <div className="empty-character">👤</div>
              )}
            </div>

            <div className="podium-base base-top2">
              <div className="podium-shine" />

              <div className="rank-number-text">2</div>

              <div className="chibi-name-card">
                <div className="student-name-text">
                  {top2 ? getStudentName(top2) : "Chưa có"}
                </div>

                {top2 && (
                  <div className="score-badge badge-mint">
                    <StarFilled
                      style={{
                        color: "#FFB800",
                        marginRight: 4,
                      }}
                    />

                    <span>{getStudentScore(top2)} đ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              TOP 1
          ================================================= */}

          <div className="podium-column top1-col">
            <div className="crown-wrapper">
              <div className="crown-glow-ring" />

              <CrownFilled className="crown-icon" />
            </div>

            <div className="rank-badge badge-top1">👑 QUÁN QUÂN</div>

            <div className="character-area float-anim-1">
              <div className="winner-glow" />

              {top1 ? (
                <img src={l1} alt="Top 1" className="full-stand-img img-top1" />
              ) : (
                <div className="empty-character winner-empty">👤</div>
              )}
            </div>

            <div className="podium-base base-top1">
              <div className="podium-shine" />

              <div className="rank-number-text">1</div>

              <div className="chibi-name-card card-top1">
                <div className="student-name-text highlight">
                  {top1 ? getStudentName(top1) : "Chưa có"}
                </div>

                {top1 && (
                  <div className="score-badge badge-gold">
                    <StarFilled
                      style={{
                        color: "#FFD700",
                        marginRight: 4,
                      }}
                    />

                    <span>{getStudentScore(top1)} đ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              TOP 3
          ================================================= */}

          <div className="podium-column top3-col">
            <div className="rank-badge badge-top3">🥉 HẠNG 3</div>

            <div className="character-area float-anim-3">
              {top3 ? (
                <img src={l3} alt="Top 3" className="full-stand-img img-top3" />
              ) : (
                <div className="empty-character">👤</div>
              )}
            </div>

            <div className="podium-base base-top3">
              <div className="podium-shine" />

              <div className="rank-number-text">3</div>

              <div className="chibi-name-card">
                <div className="student-name-text">
                  {top3 ? getStudentName(top3) : "Chưa có"}
                </div>

                {top3 && (
                  <div className="score-badge badge-pink">
                    <StarFilled
                      style={{
                        color: "#FFB800",
                        marginRight: 4,
                      }}
                    />

                    <span>{getStudentScore(top3)} đ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              JESUS
          ================================================= */}

          <div className="jesus-wrapper">
            <img
              src={IMAGE_CONFIG.JESUS_CHARACTER}
              alt="Chibi Jesus"
              className="chibi-jesus-img"
            />
          </div>
        </div>
      )}

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        .chibi-leaderboard-container {
          width: 100%;
          min-height: 92vh;

          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;

          position: relative;

          display: flex;
          flex-direction: column;
          align-items: center;

          justify-content: space-between;

          font-family: "Quicksand", sans-serif;

          overflow: hidden;

          background-color: #fff5f7;

          padding: 18px 12px 0;

          isolation: isolate;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .pastel-header-banner {
          z-index: 10;

          width: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 12px;

          flex-shrink: 0;
        }

        .ribbon-pill {
          max-width: calc(100vw - 32px);

          background: linear-gradient(
            135deg,
            #ff9eaa 0%,
            #ffd1d9 100%
          );

          padding: 8px 28px;

          border-radius: 30px;

          box-shadow:
            0 8px 20px
            rgba(255, 158, 170, 0.35);

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 10px;

          border: 3px solid #ffffff;

          white-space: nowrap;
        }

        .ribbon-trophy-icon {
          color: #ffd166;

          font-size: 22px;

          flex-shrink: 0;

          filter:
            drop-shadow(
              0 2px 4px
              rgba(255, 182, 193, 0.6)
            );
        }

        .ribbon-title-text {
          font-family:
            "Fredoka",
            cursive,
            sans-serif;

          font-size: 24px;

          font-weight: 700;

          color: #ffffff;

          letter-spacing: 0.8px;

          text-shadow:
            0 2px 4px
            rgba(225, 112, 133, 0.4);
        }

        /* =====================================================
           FILTER
        ===================================================== */

        .leaderboard-filter-panel {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          max-width: 100%;

          padding: 7px;

          background:
            rgba(255, 255, 255, 0.94);

          border: 2px solid #ffe4e6;

          border-radius: 22px;

          box-shadow:
            0 8px 22px
            rgba(255, 182, 193, 0.18);

          backdrop-filter: blur(12px);
        }

        .leaderboard-mode-btn {
          height: 38px !important;

          border-radius: 15px !important;

          font-weight: 700;

          border-color:
            #fbcfe8 !important;

          flex-shrink: 0;
        }

        .leaderboard-mode-btn.active {
          background:
            linear-gradient(
              135deg,
              #ff6b8b,
              #f472b6
            ) !important;

          border-color:
            #ff6b8b !important;

          color: #ffffff !important;
        }

        .leaderboard-class-select {
          min-width: 190px;

          max-width: 100%;
        }

        .leaderboard-class-select
          .ant-select-selector {
          border-radius:
            15px !important;

          border-color:
            #e9d5ff !important;

          min-height:
            38px !important;

          display: flex;

          align-items: center;

          font-weight: 700;
        }

        .selected-class-tag {
          margin: 0 !important;

          border-radius:
            12px !important;

          padding:
            5px 10px !important;

          background:
            #f3e8ff !important;

          border-color:
            #e9d5ff !important;

          color:
            #9333ea !important;

          font-weight: 700;

          max-width: 220px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .refresh-btn {
          border-radius: 12px;

          font-weight: 700;

          color: #64748b;

          flex-shrink: 0;
        }

        .refresh-btn:hover {
          color:
            #ff6b8b !important;

          background:
            #fff1f2 !important;
        }

        /* =====================================================
           DECOR
        ===================================================== */

        .sparkle {
          position: absolute;

          font-size: 22px;

          z-index: 2;

          pointer-events: none;

          animation:
            sparkleFloat
            3s
            infinite
            ease-in-out
            alternate;
        }

        .s1 {
          top: 12%;
          left: 12%;
        }

        .s2 {
          top: 18%;
          right: 15%;

          animation-delay: 0.6s;
        }

        .s3 {
          top: 42%;
          left: 6%;

          animation-delay: 1.2s;
        }

        .s4 {
          top: 48%;
          right: 8%;

          animation-delay: 0.4s;
        }

        @keyframes sparkleFloat {
          0% {
            transform:
              scale(0.8)
              translateY(0)
              rotate(0deg);

            opacity: 0.5;
          }

          100% {
            transform:
              scale(1.2)
              translateY(-14px)
              rotate(15deg);

            opacity: 1;
          }
        }

        /* =====================================================
           DOVE
        ===================================================== */

        .dove-img {
          position: absolute;

          width: 75px;

          z-index: 3;

          pointer-events: none;

          filter:
            drop-shadow(
              0 6px 12px
              rgba(255, 182, 193, 0.3)
            );

          animation:
            floatDove
            4s
            ease-in-out
            infinite
            alternate;
        }

        .dove-left {
          top: 35px;
          left: 4%;
        }

        .dove-right {
          top: 25px;
          right: 6%;

          animation-delay: -2s;
        }

        @keyframes floatDove {
          0% {
            transform:
              translateY(0)
              rotate(0deg);
          }

          100% {
            transform:
              translateY(-12px)
              rotate(5deg);
          }
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .chibi-loading-card {
          margin: auto;

          background:
            rgba(255, 255, 255, 0.9);

          padding: 24px 40px;

          border-radius: 28px;

          box-shadow:
            0 12px 30px
            rgba(255, 182, 193, 0.25);

          border: 2px solid #ffe4e6;

          text-align: center;

          max-width:
            calc(100vw - 30px);
        }

        .loading-text {
          margin-top: 12px;

          color: #ff6b8b;

          font-weight: 800;

          font-size: 14px;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .chibi-empty-card {
          margin: auto;

          background:
            rgba(255, 255, 255, 0.94);

          padding: 45px 70px;

          border-radius: 30px;

          border: 2px solid #ffe4e6;

          box-shadow:
            0 12px 30px
            rgba(255, 182, 193, 0.2);

          text-align: center;

          width: auto;

          max-width:
            calc(100vw - 30px);
        }

        .empty-icon {
          font-size: 60px;
        }

        .empty-title {
          font-size: 18px;

          font-weight: 800;

          color: #4a5568;
        }

        .empty-description {
          margin-top: 5px;

          color: #a093ad;

          font-size: 13px;

          line-height: 1.5;
        }

        /* =====================================================
           STAGE
        ===================================================== */

        .game-stage {
          display: flex;

          align-items: flex-end;

          justify-content: center;

          width: 100%;

          max-width: 900px;

          min-height: 480px;

          position: relative;

          z-index: 3;

          margin-top: auto;

          margin-bottom: 25px;

          gap: 18px;

          flex-shrink: 1;
        }

        .podium-column {
          display: flex;

          flex-direction: column;

          align-items: center;

          position: relative;

          transition:
            transform
            0.3s
            cubic-bezier(
              0.34,
              1.56,
              0.64,
              1
            );

          flex-shrink: 0;
        }

        .podium-column:hover {
          transform:
            translateY(-8px);
        }

        /* =====================================================
           RANK BADGE
        ===================================================== */

        .rank-badge {
          padding:
            4px 14px;

          border-radius: 16px;

          font-family:
            "Fredoka",
            sans-serif;

          font-size: 12px;

          font-weight: 700;

          color: #ffffff;

          margin-bottom: 8px;

          box-shadow:
            0 4px 12px
            rgba(0, 0, 0, 0.08);

          z-index: 6;

          border: 2px solid #ffffff;

          white-space: nowrap;
        }

        .badge-top1 {
          background:
            linear-gradient(
              135deg,
              #ffb703 0%,
              #fb8500 100%
            );
        }

        .badge-top2 {
          background:
            linear-gradient(
              135deg,
              #3a86ff 0%,
              #00b4d8 100%
            );
        }

        .badge-top3 {
          background:
            linear-gradient(
              135deg,
              #ff006e 0%,
              #ff595e 100%
            );
        }

        /* =====================================================
           CROWN
        ===================================================== */

        .crown-wrapper {
          position: absolute;

          top: -58px;

          z-index: 7;

          display: flex;

          align-items: center;

          justify-content: center;
        }

        .crown-icon {
          font-size: 42px;

          color: #ffd166;

          filter:
            drop-shadow(
              0 4px 10px
              rgba(255, 209, 102, 0.8)
            );

          animation:
            crownFloat
            2s
            infinite
            alternate
            ease-in-out;
        }

        @keyframes crownFloat {
          0% {
            transform:
              translateY(0)
              scale(1);
          }

          100% {
            transform:
              translateY(-6px)
              scale(1.08);
          }
        }

        /* =====================================================
           CHARACTER
        ===================================================== */

        .character-area {
          position: relative;

          display: flex;

          justify-content: center;

          align-items: flex-end;

          z-index: 5;

          margin-bottom: -12px;

          min-height: 30px;
        }

        .float-anim-1 {
          animation:
            charFloat
            3s
            ease-in-out
            infinite
            alternate;
        }

        .float-anim-2 {
          animation:
            charFloat
            3.4s
            ease-in-out
            infinite
            alternate
            0.3s;
        }

        .float-anim-3 {
          animation:
            charFloat
            3.8s
            ease-in-out
            infinite
            alternate
            0.6s;
        }

        @keyframes charFloat {
          0% {
            transform:
              translateY(0);
          }

          100% {
            transform:
              translateY(-6px);
          }
        }

        .winner-glow {
          position: absolute;

          width: 170px;

          height: 170px;

          background:
            radial-gradient(
              circle,
              rgba(255, 224, 138, 0.6) 0%,
              rgba(255, 255, 255, 0) 70%
            );

          bottom: 10px;

          border-radius: 50%;

          z-index: -1;

          animation:
            pulseGlow
            2.5s
            infinite
            alternate;
        }

        @keyframes pulseGlow {
          0% {
            transform: scale(0.85);

            opacity: 0.5;
          }

          100% {
            transform: scale(1.25);

            opacity: 1;
          }
        }

        .empty-character {
          display: flex;

          align-items: center;

          justify-content: center;

          width: 80px;

          height: 80px;

          font-size: 45px;

          opacity: 0.45;
        }

        /* =====================================================
           IMAGES
        ===================================================== */

        .full-stand-img {
          object-fit: contain;

          filter:
            drop-shadow(
              0 8px 16px
              rgba(255, 182, 193, 0.4)
            );

          max-width: 100%;
        }

        .img-top1 {
          height: 220px;
        }

        .img-top2 {
          height: 185px;
        }

        .img-top3 {
          height: 165px;
        }

        /* =====================================================
           PODIUM
        ===================================================== */

        .podium-base {
          border-radius:
            28px 28px 20px 20px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: space-between;

          padding:
            10px 10px 12px;

          box-shadow:
            0 14px 28px
            rgba(255, 182, 193, 0.35);

          position: relative;

          overflow: hidden;
        }

        .podium-shine {
          position: absolute;

          top: 0;
          left: 0;
          right: 0;

          height: 38%;

          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.5) 0%,
              rgba(255, 255, 255, 0) 100%
            );

          pointer-events: none;

          border-radius:
            24px 24px 0 0;
        }

        .top1-col {
          z-index: 5;
        }

        .base-top1 {
          height: 225px;

          width: 210px;

          background:
            linear-gradient(
              180deg,
              #ffe89c 0%,
              #ffc048 100%
            );

          border:
            3.5px solid #fff8d6;
        }

        .top2-col {
          z-index: 4;
        }

        .base-top2 {
          height: 175px;

          width: 185px;

          background:
            linear-gradient(
              180deg,
              #b5e2fa 0%,
              #70c1b3 100%
            );

          border:
            3.5px solid #e8f7ff;
        }

        .top3-col {
          z-index: 4;
        }

        .base-top3 {
          height: 145px;

          width: 185px;

          background:
            linear-gradient(
              180deg,
              #ffcad4 0%,
              #ff9eaa 100%
            );

          border:
            3.5px solid #fff0f3;
        }

        /* =====================================================
           RANK NUMBER
        ===================================================== */

        .rank-number-text {
          font-family:
            "Fredoka",
            cursive,
            sans-serif;

          font-size: 68px;

          font-weight: 700;

          color:
            rgba(255, 255, 255, 0.55);

          text-shadow:
            0 2px 4px
            rgba(0, 0, 0, 0.05);

          line-height: 1;

          margin-top: -2px;

          user-select: none;
        }

        /* =====================================================
           NAME CARD
        ===================================================== */

        .chibi-name-card {
          width: 100%;

          background:
            rgba(255, 255, 255, 0.95);

          border-radius: 18px;

          padding: 6px 8px;

          text-align: center;

          box-shadow:
            0 6px 14px
            rgba(255, 182, 193, 0.2);

          border:
            1.5px solid #ffffff;

          z-index: 2;

          box-sizing: border-box;

          min-width: 0;
        }

        .student-name-text {
          font-size: 13px;

          font-weight: 800;

          color: #4a5568;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

          max-width: 100%;
        }

        .student-name-text.highlight {
          color: #d97706;
        }

        .score-badge {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          font-size: 12px;

          font-weight: 800;

          padding:
            2px 10px;

          border-radius: 12px;

          margin-top: 3px;

          white-space: nowrap;
        }

        .badge-gold {
          background: #fef3c7;

          color: #d97706;
        }

        .badge-mint {
          background: #e0f2fe;

          color: #0284c7;
        }

        .badge-pink {
          background: #ffe4e6;

          color: #e11d48;
        }

        /* =====================================================
           JESUS
        ===================================================== */

        .jesus-wrapper {
          position: absolute;

          right: -16%;

          bottom: -10px;

          z-index: 6;

          pointer-events: none;

          animation:
            jesusWave
            3s
            ease-in-out
            infinite
            alternate;
        }

        .chibi-jesus-img {
          height: 290px;

          max-width: 100%;

          filter:
            drop-shadow(
              0 10px 20px
              rgba(255, 182, 193, 0.35)
            );
        }

        @keyframes jesusWave {
          0% {
            transform:
              translateY(0)
              rotate(0deg);
          }

          100% {
            transform:
              translateY(-8px)
              rotate(2deg);
          }
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {
          .chibi-leaderboard-container {
            min-height: 90vh;

            padding-top: 14px;
          }

          .ribbon-title-text {
            font-size: 21px;
          }

          .ribbon-pill {
            padding:
              7px 20px;
          }

          .leaderboard-filter-panel {
            max-width:
              calc(100vw - 30px);

            flex-wrap: wrap;
          }

          .game-stage {
            gap: 8px;

            max-width: 760px;

            transform:
              scale(0.86);

            transform-origin:
              bottom center;

            margin-bottom: 5px;
          }

          .jesus-wrapper {
            right: -55px;
          }

          .chibi-jesus-img {
            height: 235px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {
          .chibi-leaderboard-container {
            min-height: 100vh;

            height: auto;

            padding:
              10px 8px 0;

            background-position:
              center bottom;

            overflow: hidden;
          }

          /* HEADER */

          .pastel-header-banner {
            gap: 9px;
          }

          .ribbon-pill {
            padding:
              6px 13px;

            border-width: 2px;

            max-width:
              calc(100vw - 30px);

            gap: 7px;
          }

          .ribbon-title-text {
            font-size: 17px;

            letter-spacing: 0.3px;
          }

          .ribbon-trophy-icon {
            font-size: 17px;
          }

          /* FILTER */

          .leaderboard-filter-panel {
            width:
              calc(100vw - 20px);

            max-width:
              calc(100vw - 20px);

            padding: 6px;

            gap: 6px;

            border-radius: 18px;

            flex-wrap: wrap;
          }

          .leaderboard-mode-btn {
            height: 36px !important;

            padding:
              4px 10px !important;

            border-radius:
              13px !important;

            font-size: 12px;
          }

          .leaderboard-class-select {
            flex: 1 1 150px;

            min-width: 150px;

            max-width: 100%;
          }

          .leaderboard-class-select
            .ant-select-selector {
            min-height:
              36px !important;

            height: 36px !important;

            border-radius:
              13px !important;

            font-size: 12px;
          }

          .selected-class-tag {
            max-width: 150px;

            font-size: 11px;

            padding:
              4px 8px !important;
          }

          .refresh-btn {
            height: 34px;

            padding:
              4px 8px;

            font-size: 12px;
          }

          /* DECOR */

          .dove-img {
            width: 42px;

            opacity: 0.85;
          }

          .dove-left {
            top: 18px;

            left: 2%;
          }

          .dove-right {
            top: 15px;

            right: 2%;
          }

          .sparkle {
            font-size: 15px;
          }

          .s1 {
            top: 17%;

            left: 5%;
          }

          .s2 {
            top: 22%;

            right: 5%;
          }

          .s3 {
            top: 46%;

            left: 3%;
          }

          .s4 {
            top: 50%;

            right: 3%;
          }

          /* LOADING */

          .chibi-loading-card {
            padding:
              22px 28px;

            border-radius: 22px;
          }

          .loading-text {
            font-size: 12px;
          }

          /* EMPTY */

          .chibi-empty-card {
            width:
              calc(100vw - 28px);

            padding:
              30px 18px;

            border-radius: 24px;
          }

          .empty-icon {
            font-size: 48px;
          }

          .empty-title {
            font-size: 16px;
          }

          .empty-description {
            font-size: 12px;
          }

          /* STAGE */

          .game-stage {
            width: 100%;

            max-width: none;

            min-height: 410px;

            margin-top: auto;

            margin-bottom: 0;

            gap: 3px;

            transform:
              scale(0.70);

            transform-origin:
              bottom center;
          }

          /* JESUS */

          .jesus-wrapper {
            right: -65px;

            bottom: -4px;

            z-index: 8;
          }

          .chibi-jesus-img {
            height: 190px;
          }

          /* PODIUM */

          .podium-column:hover {
            transform: none;
          }
        }

        /* =====================================================
           MOBILE NHỎ
        ===================================================== */

        @media (max-width: 430px) {
          .chibi-leaderboard-container {
            padding:
              8px 6px 0;
          }

          .ribbon-title-text {
            font-size: 15px;
          }

          .ribbon-trophy-icon {
            font-size: 15px;
          }

          .ribbon-pill {
            padding:
              5px 10px;
          }

          .leaderboard-filter-panel {
            width:
              calc(100vw - 14px);

            max-width:
              calc(100vw - 14px);
          }

          .leaderboard-mode-btn {
            font-size: 11px;

            padding:
              4px 8px !important;
          }

          .leaderboard-class-select {
            min-width: 135px;

            flex-basis: 135px;
          }

          .leaderboard-class-select
            .ant-select-selector {
            font-size: 11px;
          }

          .refresh-btn {
            font-size: 11px;

            padding:
              4px 6px;
          }

          .game-stage {
            min-height: 370px;

            gap: 0;

            transform:
              scale(0.61);
          }

          .jesus-wrapper {
            right: -72px;
          }

          .chibi-jesus-img {
            height: 165px;
          }

          .dove-img {
            width: 35px;
          }
        }

        /* =====================================================
           ĐIỆN THOẠI RẤT NHỎ
        ===================================================== */

        @media (max-width: 360px) {
          .ribbon-title-text {
            font-size: 14px;
          }

          .leaderboard-filter-panel {
            padding: 5px;

            gap: 4px;
          }

          .leaderboard-mode-btn {
            font-size: 10px;

            padding:
              3px 7px !important;
          }

          .leaderboard-class-select {
            min-width: 125px;
          }

          .refresh-btn {
            font-size: 10px;
          }

          .game-stage {
            min-height: 340px;

            transform:
              scale(0.55);
          }

          .jesus-wrapper {
            right: -80px;
          }

          .chibi-jesus-img {
            height: 150px;
          }
        }

        /* =====================================================
           ACCESSIBILITY
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .sparkle,
          .dove-img,
          .float-anim-1,
          .float-anim-2,
          .float-anim-3,
          .crown-icon,
          .jesus-wrapper,
          .winner-glow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LeaderboardGame;
