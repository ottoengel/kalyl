export async function checkEmail(email: string): Promise<boolean> {
    const response = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  
    const data = await response.json();
    return data.valid;
  }
  