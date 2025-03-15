import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/user"]
  });

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      waterGoal: user?.waterGoal || 8,
      stepGoal: user?.stepGoal || 10000,
      waterInterval: user?.waterInterval || 60
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      await apiRequest("PATCH", "/api/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Settings updated",
        description: "Your health tracking settings have been saved."
      });
    }
  });

  const onSubmit = (data: InsertUser) => {
    updateUserMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="waterGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Water Goal (glasses)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stepGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Step Goal</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="waterInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water Reminder Interval (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={updateUserMutation.isPending}
            >
              Save Settings
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
