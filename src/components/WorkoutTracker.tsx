"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, GripVertical, Download } from "lucide-react";

type Set = {
  id: string;
  reps: string;
  weight: string;
};

type Exercise = {
  id: string;
  name: string;
  sets: Set[];
};

export default function WorkoutTracker() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newReps, setNewReps] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const addExercise = () => {
    if (newExerciseName.trim() === "") return;
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: newExerciseName,
      sets: [],
    };
    setExercises([...exercises, newExercise]);
    setNewExerciseName("");
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    if (newReps.trim() === "" || newWeight.trim() === "") return;
    const newSet: Set = {
      id: Date.now().toString(),
      reps: newReps,
      weight: newWeight,
    };
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    );
    setNewReps("");
    setNewWeight("");
  };

  const deleteSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise
      )
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setExercises(items);
  };

  const finishWorkout = () => {
    const workoutData = JSON.stringify(exercises, null, 2);
    const blob = new Blob([workoutData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `workout_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Gym Workout Tracker
      </h1>

      <div className="flex mb-6">
        <Input
          placeholder="New Exercise Name"
          value={newExerciseName}
          onChange={(e) => setNewExerciseName(e.target.value)}
          className="mr-2"
        />
        <Button onClick={addExercise}>Add Exercise</Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="exercises">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {exercises.map((exercise, index) => (
                <Draggable
                  key={exercise.id}
                  draggableId={exercise.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`mb-4 ${
                        snapshot.isDragging ? "shadow-lg" : ""
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              {...provided.dragHandleProps}
                              className="mr-2 cursor-move"
                            >
                              <GripVertical size={20} />
                            </div>
                            <CardTitle>{exercise.name}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteExercise(exercise.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {exercise.sets.map((set, setIndex) => (
                          <div key={set.id} className="flex items-center mb-2">
                            <span className="mr-2">Set {setIndex + 1}:</span>
                            <span className="mr-2">
                              {set.reps} reps x {set.weight} kg
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSet(exercise.id, set.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                        <div className="flex mt-4">
                          <Input
                            placeholder="Reps"
                            type="number"
                            value={newReps}
                            onChange={(e) => setNewReps(e.target.value)}
                            className="mr-2"
                          />
                          <Input
                            placeholder="Weight (kg)"
                            type="number"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            className="mr-2"
                          />
                          <Button onClick={() => addSet(exercise.id)}>
                            Add Set
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        onClick={finishWorkout}
        className="mt-6 w-full"
        disabled={exercises.length === 0}
      >
        <Download size={16} className="mr-2" />
        Finish Workout
      </Button>
    </div>
  );
}
