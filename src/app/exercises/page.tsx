"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/hooks/use-toast";
import Link from "next/link";

// Mock database
let mockExerciseDB = [
  {
    id: "1",
    name: "Squat",
    description: "A compound exercise that targets the legs and core.",
  },
  {
    id: "2",
    name: "Bench Press",
    description:
      "A compound exercise that targets the chest, shoulders, and triceps.",
  },
  {
    id: "3",
    name: "Deadlift",
    description: "A compound exercise that targets the back, legs, and core.",
  },
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState(mockExerciseDB);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");

  const addExercise = () => {
    if (newExerciseName.trim() === "" || newExerciseDescription.trim() === "") {
      toast({
        title: "Error",
        description: "Please fill in both name and description.",
        variant: "destructive",
      });
      return;
    }

    const newExercise = {
      id: (exercises.length + 1).toString(),
      name: newExerciseName,
      description: newExerciseDescription,
    };

    mockExerciseDB = [...mockExerciseDB, newExercise];
    setExercises(mockExerciseDB);
    setNewExerciseName("");
    setNewExerciseDescription("");

    toast({
      title: "Exercise added",
      description: `${newExerciseName} has been added to the exercise library.`,
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exercise Library</h1>
        <Link href="/">
          <Button variant="outline">Back to Workout Tracker</Button>
        </Link>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6">Add New Exercise</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Exercise Name"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
            />
            <Input
              placeholder="Exercise Description"
              value={newExerciseDescription}
              onChange={(e) => setNewExerciseDescription(e.target.value)}
            />
            <Button onClick={addExercise}>Add Exercise</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        {exercises.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader>
              <CardTitle>{exercise.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{exercise.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
