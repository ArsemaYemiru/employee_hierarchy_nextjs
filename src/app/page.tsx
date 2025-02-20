"use client";

import { useState, useEffect } from "react";
import { Button, Modal, TextInput, Select, Card } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { addPosition, removePosition, updatePosition, fetchPositions } from "@/app/redux/positionsSlice";
import { RootState, AppDispatch } from "@/app/redux/store";

interface Position {
  id: number;
  name: string;
  parentId: number | null;
}

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { positions, loading, error } = useSelector((state: RootState) => state.positions);

  useEffect(() => {
    dispatch(fetchPositions());
  }, [dispatch]);

  if (loading) return <p>Loading positions...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editMode && editingId !== null) {
      dispatch(updatePosition({ id: editingId, name, parentId: parentId ? parseInt(parentId) : null }));
    } else {
      dispatch(addPosition({ id: Date.now(), name, parentId: parentId ? parseInt(parentId) : null }));
    }
    if (positions.some((pos) => pos.name.toLowerCase() === name.toLowerCase())) {
      alert("This position already exists!");
      return;
    }
     let parsedParentId: number | null = null;
  if (parentId) {
    parsedParentId = parseInt(parentId, 10);
    if (isNaN(parsedParentId)) {
      parsedParentId = null; 
    }
  }

  if (editMode && editingId !== null) {
    dispatch(updatePosition({ id: editingId, name, parentId: parsedParentId }));
  } else {
    if (positions.some((pos) => pos.name.toLowerCase() === name.toLowerCase())) {
      alert("This position already exists!");
      return;
    }
    dispatch(addPosition({ id: Date.now(), name, parentId: parsedParentId }));
  }

    dispatch(addPosition({
      id: Date.now(),
      name,
      parentId: parsedParentId,
    }));
    setOpened(false);
    setEditMode(false);
    setName("");
    setParentId(null);
  };

  const handleEdit = (pos: Position |any ) => {
    setName(pos.name);
    setParentId(pos.parentId !== null ? pos.parentId.toString() : null);
    setEditingId(pos.id);
    setEditMode(true);
    setOpened(true);
  };

  const buildTree = (parentId: number | null) => {
    return positions
      .filter((pos) => pos.parentId === parentId)
      .map((pos) => {
        const newLocal = <Button size="xs" onClick={() => handleEdit(pos)}>Edit</Button>;
        return (
          <div key={pos.id} className="ml-6 border-l pl-4">
            <Card shadow="sm" className="mb-2 p-3 flex justify-between items-center">
              <span>{pos.name}</span>
              <div className="space-x-2">
                {newLocal}
                <Button size="xs" color="red" onClick={() => dispatch(removePosition(pos.id))}>Delete</Button>
              </div>
            </Card>
            {buildTree(pos.id)}
          </div>
        );
      });
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Button onClick={() => { setOpened(true); setEditMode(false); }}>Add Position</Button>

      <Modal opened={opened} onClose={() => setOpened(false)} title={editMode ? "Edit Position" : "Add a new position"}>
        <form onSubmit={handleSubmit}>
          <TextInput label="Position name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Select
            label="Parent Position (Optional)"
            value={parentId}
            onChange={setParentId}
            data={[{ value: "", label: "No Parent" }, ...positions.map((pos) => ({ value: pos.id.toString(), label: pos.name }))]}
            clearable
          />

          <Button type="submit" className="mt-4">
            {editMode ? "Update" : "Add"}
          </Button>
        </form>
      </Modal>

      <div className="mt-6 w-full max-w-lg">{buildTree(null)}</div>
    </div>
  );
}
