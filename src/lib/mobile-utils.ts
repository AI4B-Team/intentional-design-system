import { useCallback } from "react";

// Format phone number for display
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

// Create tel: link
export function getTelLink(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  return `tel:${cleaned.length === 10 ? "+1" : ""}${cleaned}`;
}

// Create SMS link
export function getSMSLink(phone: string | null | undefined, body?: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  const phoneNum = cleaned.length === 10 ? `+1${cleaned}` : cleaned;
  return body ? `sms:${phoneNum}?body=${encodeURIComponent(body)}` : `sms:${phoneNum}`;
}

// Create email link
export function getEmailLink(email: string | null | undefined, subject?: string, body?: string): string {
  if (!email) return "";
  const params = new URLSearchParams();
  if (subject) params.append("subject", subject);
  if (body) params.append("body", body);
  const queryString = params.toString();
  return `mailto:${email}${queryString ? `?${queryString}` : ""}`;
}

// Create map link (opens in device's default maps app)
export function getMapLink(address: string): string {
  const encoded = encodeURIComponent(address);
  // iOS and Android both handle this well
  return `https://maps.google.com/maps?q=${encoded}`;
}

// Create directions link
export function getDirectionsLink(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
}

// Hook for click-to-call
export function useClickToCall() {
  const call = useCallback((phone: string | null | undefined) => {
    if (!phone) return;
    window.location.href = getTelLink(phone);
  }, []);

  const sms = useCallback((phone: string | null | undefined, body?: string) => {
    if (!phone) return;
    window.location.href = getSMSLink(phone, body);
  }, []);

  const email = useCallback((emailAddress: string | null | undefined, subject?: string, body?: string) => {
    if (!emailAddress) return;
    window.location.href = getEmailLink(emailAddress, subject, body);
  }, []);

  const openMap = useCallback((address: string) => {
    window.open(getMapLink(address), "_blank");
  }, []);

  const getDirections = useCallback((address: string) => {
    window.open(getDirectionsLink(address), "_blank");
  }, []);

  return { call, sms, email, openMap, getDirections };
}

// Detect if device has touch
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// Format currency for mobile (shorter format)
export function formatCurrencyShort(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// Format number with commas
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

// Truncate text for mobile
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
