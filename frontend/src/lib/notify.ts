/**
 * notifyNoOsap
 * 
 * Sends a templated notification to a student when no OSAP application is on file.
 * Currently logs a message locally (mock API); can later integrate with real email service.
 */

export async function notifyNoOsap(email: string | undefined | null) {
    try {
      await fetch("/api/notify/no-osap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email ?? "",
          template: "no-osap-on-file",
        }),
      });
    } catch (e) {
      console.warn("notifyNoOsap failed", e);
    }
  }
  