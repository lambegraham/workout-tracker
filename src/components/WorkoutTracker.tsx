"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trash2,
  GripVertical,
  Download,
  Plus,
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  Share2,
  Save,
  Video,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/hooks/use-toast";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Types
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

type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
  date: string;
};

// Mock database (this should be replaced with actual database calls)
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

function SortableExercise({
  exercise,
  deleteExercise,
  addSet,
  deleteSet,
  newReps,
  setNewReps,
  newWeight,
  setNewWeight,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <Card
        ref={setNodeRef}
        style={style}
        className="mb-4 bg-white dark:bg-gray-800 shadow-md"
      >
        <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div {...attributes} {...listeners} className="mr-2 cursor-move">
                <GripVertical size={20} className="text-gray-400" />
              </div>
              <CardTitle className="text-lg font-semibold">
                {exercise.name}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteExercise(exercise.id)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {exercise.sets.map((set: Set, setIndex: number) => (
            <div
              key={set.id}
              className="flex items-center justify-between mb-2 bg-gray-50 dark:bg-gray-700 p-2 rounded"
            >
              <span className="font-medium">Set {setIndex + 1}:</span>
              <span>
                {set.reps} reps x {set.weight} kg
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteSet(exercise.id, set.id)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Trash2 size={14} />
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
            <Button
              onClick={() => addSet(exercise.id)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
              <Plus size={16} className="mr-1" /> Add Set
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function WorkoutTracker() {
  const [workoutName, setWorkoutName] = useState("My Workout");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newReps, setNewReps] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [restPeriod, setRestPeriod] = useState(60);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(restPeriod);
  const [exerciseLibrary, setExerciseLibrary] = useState(mockExerciseDB);
  const { theme, setTheme } = useTheme();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!timerActive && timerSeconds !== 0) {
      clearInterval(interval!);
    }
    return () => clearInterval(interval!);
  }, [timerActive, timerSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showRestTimer && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (restSeconds === 0) {
      setShowRestTimer(false);
      setRestSeconds(restPeriod);
      toast({
        title: "Rest period finished!",
        description: "Time to start your next set.",
      });
    }
    return () => clearInterval(interval!);
  }, [showRestTimer, restSeconds, restPeriod]);

  useEffect(() => {
    // This effect simulates fetching from a database
    setExerciseLibrary(mockExerciseDB);
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
    setShowRestTimer(true);
    setRestSeconds(restPeriod); // Reset the rest timer
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const finishWorkout = () => {
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: workoutName,
      exercises: exercises,
      date: new Date().toISOString(),
    };
    setWorkoutHistory([...workoutHistory, newWorkout]);

    const workoutData = JSON.stringify(newWorkout, null, 2);
    const blob = new Blob([workoutData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workoutName.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Workout finished!",
      description: "Your workout has been saved and  downloaded.",
    });

    // Reset the current workout
    setExercises([]);
    setWorkoutName("My Workout");
    setTimerSeconds(0);
    setTimerActive(false);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const chartData = {
    labels: workoutHistory.map((workout) =>
      new Date(workout.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Total Volume (kg)",
        data: workoutHistory.map((workout) =>
          workout.exercises.reduce(
            (total, exercise) =>
              total +
              exercise.sets.reduce(
                (setTotal, set) =>
                  setTotal + parseInt(set.reps) * parseFloat(set.weight),
                0
              ),
            0
          )
        ),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white">
          Gym Workout Tracker
        </h1>
        <div className="flex items-center justify-center">
          <Dumbbell
            size={24}
            className="mr-2 text-gray-600 dark:text-gray-300"
          />
          <Input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="text-xl font-semibold text-center bg-transparent border-b-2 border-gray-300 focus:border-gray-500 focus:ring-0 placeholder-gray-400 text-gray-800 dark:text-white"
            placeholder="Enter workout name"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          {formatTime(timerSeconds)}
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => setTimerActive(!timerActive)}
            variant="outline"
          >
            {timerActive ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button onClick={() => setTimerSeconds(0)} variant="outline">
            <RotateCcw size={16} />
          </Button>
        </div>
        <Select onValueChange={(value) => setTheme(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showRestTimer && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Rest Timer</h3>
            <Progress
              value={(restSeconds / restPeriod) * 100}
              className="mb-2"
            />
            <p className="text-center">{formatTime(restSeconds)}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex mb-4">
            <Select onValueChange={(value) => setNewExerciseName(value)}>
              <SelectTrigger className="w-full mr-2">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {exerciseLibrary.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.name}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={addExercise}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
              <Plus size={16} className="mr-1" /> Add Exercise
            </Button>
          </div>
          <div className="flex justify-center">
            <Link href="/exercises">
              <Button variant="outline">Manage Custom Exercises</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {exercises.map((exercise) => (
              <SortableExercise
                key={exercise.id}
                exercise={exercise}
                deleteExercise={deleteExercise}
                addSet={addSet}
                deleteSet={deleteSet}
                newReps={newReps}
                setNewReps={setNewReps}
                newWeight={newWeight}
                setNewWeight={setNewWeight}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      <div className="flex space-x-4 mt-6">
        <Button
          onClick={finishWorkout}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 text-lg font-semibold dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
          disabled={exercises.length === 0}
        >
          <Save size={20} className="mr-2" />
          Finish Workout
        </Button>
        <Button
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 text-lg font-semibold dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
          onClick={() => {
            // Implement social sharing functionality
            toast({
              title: "Sharing coming soon!",
              description: "This feature is under development.",
            });
          }}
        >
          <Share2 size={20} className="mr-2" />
          Share Workout
        </Button>
      </div>

      {workoutHistory.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Workout Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={chartData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
