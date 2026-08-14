import { RestaurantSettings } from '@/lib/types';
import { toZonedTime } from 'date-fns-tz';

export function isRestaurantOpen(settings: RestaurantSettings): {
  isOpen: boolean;
  message: string;
  opensAt?: string;
  isTomorrow?: boolean;
} {
  const {
    is_open,
    opening_time,
    closing_time,
    manual_override,
    timezone = "Africa/Algiers",
    forced_closed,
    custom_message
  } = settings;

  // 1. Check open/closed status
  let isOpen = true;
  if (forced_closed) {
    isOpen = false;
  } else if (manual_override) {
    isOpen = is_open;
  } else {
    const now = new Date();
    const zonedNow = toZonedTime(now, timezone);

    const [openH, openM, openS = 0] = opening_time.split(':').map(Number);
    const [closeH, closeM, closeS = 0] = closing_time.split(':').map(Number);

    const openTime = new Date(zonedNow);
    openTime.setHours(openH, openM, openS, 0);

    const closeTime = new Date(zonedNow);
    closeTime.setHours(closeH, closeM, closeS, 0);

    if (openTime.getTime() > closeTime.getTime()) {
      // Overnight hours (e.g. 10:00 to 02:00 next day)
      if (zonedNow.getTime() >= openTime.getTime()) {
        closeTime.setDate(closeTime.getDate() + 1);
      } else {
        openTime.setDate(openTime.getDate() - 1);
      }
    }

    isOpen = zonedNow.getTime() >= openTime.getTime() && zonedNow.getTime() <= closeTime.getTime();
  }

  // 2. Build message if open
  if (isOpen) {
    return {
      isOpen: true,
      message: "Restaurant is currently open."
    };
  }

  // 3. Build message if closed
  if (forced_closed) {
    return {
      isOpen: false,
      message: custom_message || "Restaurant is temporarily closed."
    };
  }

  if (manual_override) {
    return {
      isOpen: false,
      message: custom_message || "Restaurant is currently closed."
    };
  }

  // Scheduled closure calculation
  try {
    const now = new Date();
    const zonedNow = toZonedTime(now, timezone);
    const [openH, openM] = opening_time.split(':').map(Number);
    const pad = (num: number) => String(num).padStart(2, '0');
    const formattedOpenTime = `${pad(openH)}:${pad(openM)}`;

    const openTimeToday = new Date(zonedNow);
    openTimeToday.setHours(openH, openM, 0, 0);

    let isTomorrow = false;
    if (zonedNow.getTime() > openTimeToday.getTime()) {
      isTomorrow = true;
    }

    const nextDayText = isTomorrow ? "Opens tomorrow at" : "Opens today at";
    const statusMsg = custom_message 
      ? `${custom_message} (${nextDayText} ${formattedOpenTime})`
      : `Restaurant is currently closed. ${nextDayText} ${formattedOpenTime}`;

    return {
      isOpen: false,
      message: statusMsg,
      opensAt: formattedOpenTime,
      isTomorrow
    };
  } catch (err) {
    console.error("[STATUS_ENGINE_ERROR]: Failed to calculate next opening time", err);
    return {
      isOpen: false,
      message: "Restaurant is currently closed."
    };
  }
}
