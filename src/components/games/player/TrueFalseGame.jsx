// TrueFalseGame.jsx
import React from "react";
import { Button, Result } from "antd";

const TrueFalseGame = ({ game, onExit }) => (
  <Result
    status="info"
    title={`Đúng / Sai - ${game.name}`}
    subTitle="Màn chơi đang được xây dựng."
    extra={<Button onClick={onExit}>Quay lại</Button>}
  />
);

export default TrueFalseGame;
