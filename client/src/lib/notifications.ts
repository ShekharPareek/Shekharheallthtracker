export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    throw new Error("This browser does not support notifications");
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function scheduleWaterReminder(intervalMinutes: number) {
  if (Notification.permission !== "granted") return;

  setInterval(() => {
    new Notification("Water Reminder", {
      body: "Time to drink some water! 💧",
      icon: "/icons/water.svg"
    });
  }, intervalMinutes * 60 * 1000);
}

export function sendStepReminder() {
  if (Notification.permission !== "granted") return;

  new Notification("Step Goal Reminder", {
    body: "Time to get up and move! 🚶‍♂️",
    icon: "/icons/steps.svg"
  });
}
