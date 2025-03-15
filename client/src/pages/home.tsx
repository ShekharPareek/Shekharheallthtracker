import { useEffect } from "react";
import { WaterTracker } from "@/components/water-tracker";
import { StepCounter } from "@/components/step-counter";
import { TaskList } from "@/components/task-list";
import { useQuery } from "@tanstack/react-query";
import { requestNotificationPermission, scheduleWaterReminder } from "@/lib/notifications";

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"]
  });

  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission && user) {
        scheduleWaterReminder(user.waterInterval);
      }
    };

    setupNotifications();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Health Tracker</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <WaterTracker />
        <StepCounter />
      </div>
      
      <div className="mt-6">
        <TaskList />
      </div>
    </div>
  );
}
