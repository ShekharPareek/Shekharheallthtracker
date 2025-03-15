import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Minus, Droplet } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type WaterLog } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function WaterTracker() {
  const [adding, setAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: waterLogs = [] } = useQuery<WaterLog[]>({
    queryKey: ["/api/water"]
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"]
  });

  const addWaterMutation = useMutation({
    mutationFn: async (amount: number) => {
      await apiRequest("POST", "/api/water", { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water"] });
    }
  });

  const totalWater = waterLogs.reduce((sum, log) => sum + log.amount, 0);
  const waterGoal = user?.waterGoal || 8;
  const progress = Math.min((totalWater / waterGoal) * 100, 100);

  return (
    <div className="p-4 bg-card rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          Water Intake
        </h2>
        <span className="text-sm text-muted-foreground">
          {totalWater} / {waterGoal} glasses
        </span>
      </div>

      <Progress value={progress} className="mb-4" />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => addWaterMutation.mutate(1)}
          disabled={addWaterMutation.isPending}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Glass
        </Button>
      </div>
    </div>
  );
}
