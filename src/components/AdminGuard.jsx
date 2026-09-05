import MobileBlocked from "./MobileBlocked";

const AdminGuard = ({ children }) => {
  const isMobile = () => {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ||
      window.innerWidth < 992
    );
  };

  if (isMobile()) {
    return <MobileBlocked />;
  }

  return children;
};

export default AdminGuard;
