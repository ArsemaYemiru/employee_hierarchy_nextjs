"use client";

import { useState } from "react";
import { Button, Modal, TextInput, Card } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { addPosition, removePosition } from "@/app/redux/positionsSlice";
import { RootState } from "@/app/redux/store";

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState("");
  const dispatch = useDispatch();
  const positions = useSelector((state: RootState) => state.positions);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(addPosition({ id: Date.now(), name, parentId: null }));
    setOpened(false);
    setName("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Button onClick={() => setOpened(true)}>Add Position</Button>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Add a new position">
        <form onSubmit={handleSubmit}>
          <TextInput label="Position name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" className="mt-4">Add</Button>
        </form>
      </Modal>

      <div className="mt-6 w-full max-w-lg">
        {positions.map((pos) => (
          <Card key={pos.id} shadow="sm" className="mb-4 p-4 flex justify-between">
            <span>{pos.name}</span>
            <Button color="red" size="xs" onClick={() => dispatch(removePosition(pos.id))}>
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}