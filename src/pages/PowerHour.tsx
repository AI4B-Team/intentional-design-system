import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Power Hour is now an execution mode within the unified Communications dialer.
 * This page redirects to /communications with the power-hour mode activated.
 */
export default function PowerHour() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/communications?mode=power-hour", { replace: true });
  }, [navigate]);

  return null;
}
