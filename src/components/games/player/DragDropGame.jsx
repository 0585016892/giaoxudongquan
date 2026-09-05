// DragDropGame.jsx
import React from "react";
import { Button, Result } from "antd";

const DragDropGame = ({ game, onExit }) => (
  <Result
    status="info"
    title={`Kéo thả - ${game.name}`}
    subTitle="Màn chơi đang được xây dựng."
    extra={<Button onClick={onExit}>Quay lại</Button>}
  />
);

export default DragDropGame;
