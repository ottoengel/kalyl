"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserNumber } from "../_actions/get-number";
import { useSession } from "next-auth/react";

const CheckPhoneNumber = () => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const checkUserNumber = async () => {
      if (session?.user?.id) {
        try {
          // Call the server action to check if the user has a phone number
          const hasPhoneNumber = await getUserNumber(session.user.id);
          if (!hasPhoneNumber) {
            // Redirect to /phone-number if no phone number is registered
            router.push("/phone-number");
          }
        } catch (error) {
          console.error("Error checking phone number:", error);
          // Optionally handle the error (e.g., show a message or retry)
        }
      }
    };

    checkUserNumber();
  }, [session, router]);

  return null; // This component doesn't render anything
};

export default CheckPhoneNumber;