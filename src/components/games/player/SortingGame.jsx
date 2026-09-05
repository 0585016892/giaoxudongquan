// SortingGame.jsx
import React from "react";
import { Button, Result } from "antd";

const SortingGame = ({ game, onExit }) => (
  <Result
    status="info"
    title={`Sắp xếp - ${game.name}`}
    subTitle="Màn chơi đang được xây dựng."
    extra={<Button onClick={onExit}>Quay lại</Button>}
  />
);

export default SortingGame;
