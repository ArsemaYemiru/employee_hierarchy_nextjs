"use client";

import { useState, useEffect } from "react";
import { Button, Modal, TextInput, Select, Card,Stack,Paper } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { removePosition, updatePosition, fetchPositions, addPositionAsync } from "@/app/redux/positionsSlice"; // Replaced addPosition with addPositionAsync
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      try {
        await dispatch(
          addPositionAsync({
            name,
            parentId: parsedParentId, 
          })
        ).unwrap(); 
      } catch (error) {
        console.error("Failed to add position:", error);
        alert("Failed to add position. Please try again.");
        return;
      }
    }

    // Reset modal state
    setOpened(false);
    setEditMode(false);
    setName("");
    setParentId(null);
  };

  const handleEdit = (pos: Position|any
  ) => {
    setName(pos.name);
    setParentId(pos.parentId !== null ? pos.parentId.toString() : null);
    setEditingId(pos.id);
    setEditMode(true);
    setOpened(true);
  };

  const buildTree = (parentId: number | null) => {
  return (
    <Stack>
      {positions
        .filter((pos) => pos.parentId === parentId)
        .map((pos) => (
          <Paper key={pos.id} shadow="xs" p="xs" withBorder className="relative ml-6 bg-gray-800">
            
            <div className="absolute top-0 left-0 w-0.5 h-full bg-gray-500 -ml-3"></div>

            <Card withBorder shadow="sm" radius="md" className="p-3 flex justify-between items-center">
              <span className="font-medium">{pos.name}</span>
              <div className="space-x-2">
                <Button size="xs" variant="light" onClick={() => handleEdit(pos)}>
                  Edit
                </Button>
                <Button size="xs" color="red" variant="light" onClick={() => dispatch(removePosition(pos.id))}>
                  Delete
                </Button>
              </div>
            </Card>

            
            <div className="pl-6 border-l-2 border-gray-950">{buildTree(pos.id)}</div>
          </Paper>
        ))}
    </Stack>
  );
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 ">
      <Button onClick={() => { setOpened(true); setEditMode(false); }}>Add Position</Button>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editMode ? "Edit Position" : "Add a new position"}
      >
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Position name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select
            label="Parent Position (Optional)"
            value={parentId}
            onChange={setParentId}
            data={[
              { value: "0", label: "No Parent" },
              ...positions.map((pos) => ({
                value: pos.id?.toString()??"",
                label: pos.name,
              })),
            ]}
            clearable
          />

          <Button type="submit" className="mt-4">
            {editMode ? "Update" : "Add"}
          </Button>
        </form>
      </Modal>

      <div className="mt-6 w-full max-w-lg">{buildTree(0)}</div>
    </div>
  );
}