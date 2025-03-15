import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { FootprintsIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type StepLog } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { sendStepReminder } from "@/lib/notifications";

export function StepCounter() {
  const queryClient = useQueryClient();
  const [steps, setSteps] = useState(0);

  const { data: stepLogs = [] } = useQuery<StepLog[]>({
    queryKey: ["/api/steps"]
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"]
  });

  const addStepsMutation = useMutation({
    mutationFn: async (count: number) => {
      await apiRequest("POST", "/api/steps", { count });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/steps"] });
    }
  });

  useEffect(() => {
    // Check if step counter API is available
    if ('pedometer' in navigator) {
      // @ts-ignore - Pedometer API is experimental
      navigator.pedometer.watchStep((step: number) => {
        setSteps(step);
        if (step % 100 === 0) {
          addStepsMutation.mutate(100);
        }
      });
    }
  }, []);

  const totalSteps = stepLogs.reduce((sum, log) => sum + log.count, 0) + steps;
  const stepGoal = user?.stepGoal || 10000;
  const progress = Math.min((totalSteps / stepGoal) * 100, 100);

  return (
    <div className="p-4 bg-card rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FootprintsIcon className="h-5 w-5 text-green-500" />
          Step Counter
        </h2>
        <span className="text-sm text-muted-foreground">
          {totalSteps.toLocaleString()} / {stepGoal.toLocaleString()} steps
        </span>
      </div>

      <Progress value={progress} className="mb-4" />
    </div>
  );
}
