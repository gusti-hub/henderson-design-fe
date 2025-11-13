import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { backendServer } from "../../utils/info";

/* ============================================================
   HELPER: format YYYY-MM-DD (hilangkan timezone effect)
   ============================================================ */
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/* ============================================================
   HELPER: normalize date → HST date string YYYY-MM-DD
   ============================================================ */
const toHawaiiDateStr = (date) => {
  // shift to Hawaii: UTC-10
  const h = new Date(date.getTime() - 10 * 60 * 60 * 1000);
  return h.toISOString().split("T")[0];
};

/* ============================================================
   HELPER: compare HST-based past date
   ============================================================ */
const isPastHawaii = (date) => {
  const todayHST = toHawaiiDateStr(new Date());
  const dateHST = toHawaiiDateStr(date);
  return dateHST < todayHST;
};

/* ============================================================
   HELPER: Monday–Friday only
   ============================================================ */
const isWeekday = (date) => {
  const d = date.getDay();
  return d >= 1 && d <= 5; // Mon–Fri
};

/* ============================================================
   Convert HST slot → Local user time
   ============================================================ */
const convertHSTtoLocal = (date, time) => {
  const [hour, minute] = time.split(":").map(Number);

  const utc = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour + 10,
      minute
    )
  );

  return new Intl.DateTimeFormat([], {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    day: "numeric",
  }).format(utc);
};

/* ============================================================
   Local difference text
   ============================================================ */
const getTimeDifferenceText = () => {
  const local = new Date().getTimezoneOffset() / -60;
  const hawaii = -10;
  const diff = local - hawaii;

  return `Hawaii is ${diff} hours behind your local time`;
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

const SchedulingComponent = ({
  formData,
  selectedOption,
  nextStepsSubmissionId,
  onBack,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [config, setConfig] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [notes, setNotes] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(45);

  /* Load config */
  useEffect(() => {
    (async () => {
      const res = await fetch(`${backendServer}/api/scheduling/config`);
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setSelectedDuration(data.data.defaultDuration);
      }
    })();
  }, []);

  /* Load available dates */
  useEffect(() => {
    if (!config) return;

    (async () => {
      const res = await fetch(
        `${backendServer}/api/scheduling/available-dates?days=60`
      );
      const data = await res.json();
      if (data.success) {
        // normalize each date to YYYY-MM-DD
        const normalized = data.data.map((d) => ({
          date: d.date, // already YYYY-MM-DD from backend
        }));
        setAvailableDates(normalized);
      }
    })();
  }, [config, currentMonth]);

  /* Load slots */
  useEffect(() => {
    if (!selectedDate) return;

    (async () => {
      const dateStr = formatDate(selectedDate);

      const res = await fetch(
        `${backendServer}/api/scheduling/available-slots?date=${dateStr}`
      );
      const data = await res.json();
      if (data.success) {
        setAvailableSlots(data.data);
      }
    })();
  }, [selectedDate]);

  /* BOOK */
  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      setError("Please select date and time");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch(`${backendServer}/api/scheduling/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        unitNumber: formData.unitNumber,
        appointmentDate: formatDate(selectedDate),
        appointmentTime: selectedSlot.time,
        duration: selectedDuration,
        optionType: selectedOption,
        nextStepsSubmissionId,
        clientNotes: notes,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (res.ok && data.success) {
      setSuccess(true);
      setTimeout(() => onSuccess?.(data.data), 1500);
    } else {
      setError(data.message);
    }
  };

  /* Calendar Helpers */
  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isAvailable = (date) =>
    availableDates.some((d) => d.date === formatDate(date));

  const isSelected = (date) =>
    selectedDate &&
    date.toDateString() === selectedDate.toDateString();

  const renderCalendar = () => {
    const total = getDaysInMonth(currentMonth);
    const first = getFirstDayOfMonth(currentMonth);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = [];

    /* Empty cells */
    for (let i = 0; i < first; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    /* Days */
    for (let d = 1; d <= total; d++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        d
      );
      date.setHours(0, 0, 0, 0);

      const weekday = isWeekday(date);
      const past = isPastHawaii(date);
      const available = isAvailable(date);
      const selected = isSelected(date);

      const disabled = !weekday || past || !available;

      days.push(
        <button
          key={d}
          disabled={disabled}
          onClick={() => !disabled && setSelectedDate(date)}
          className={`
            p-3 rounded-xl font-semibold text-center transition 
            ${
              selected
                ? "bg-[#005670] text-white scale-105 shadow-md"
                : !disabled
                ? "bg-white border-2 border-[#005670]/20 text-[#005670] hover:bg-[#005670]/10"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl border">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
            <ChevronLeft className="w-6 h-6 text-[#005670]" />
          </button>

          <h3 className="text-2xl font-bold text-[#005670]">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
            <ChevronRight className="w-6 h-6 text-[#005670]" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayNames.map((n) => (
            <div
              key={n}
              className="text-center font-bold text-gray-600 text-sm"
            >
              {n}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">{days}</div>

        <p className="text-center mt-6 text-gray-500 text-sm border-t pt-4">
          {getTimeDifferenceText()}
        </p>
      </div>
    );
  };

  /* SUCCESS SCREEN */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-[#005670] mb-4">
            Appointment Booked!
          </h1>

          <p className="text-gray-700 text-lg mb-4">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <p className="text-[#005670] text-xl font-bold">
            {selectedSlot?.displayTime} HST
          </p>
        </div>
      </div>
    );
  }

  /* MAIN UI */
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        {renderCalendar()}

        {/* Right side */}
        <div>
          <h2 className="text-2xl font-bold text-[#005670] mb-6">
            Select Time
          </h2>

          {!selectedDate ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <p className="text-gray-600 text-lg">
                Please select a date first.
              </p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <p className="text-gray-600 text-lg">
                No available slots for this date.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow border">
              <div className="space-y-4 mb-6">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedSlot(slot)}
                    className={`
                      w-full px-6 py-4 rounded-xl font-semibold text-lg transition
                      ${
                        selectedSlot?.time === slot.time
                          ? "bg-[#005670] text-white shadow scale-105"
                          : "bg-white border-2 border-[#005670]/20 text-[#005670]"
                      }
                    `}
                  >
                    <Clock className="w-5 h-5 inline mr-2" />
                    {slot.displayTime} HST
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="bg-blue-50 p-4 rounded-xl border mb-6">
                  <p className="text-blue-800 font-bold mb-1">
                    Your Local Time:
                  </p>
                  <p className="text-blue-700">
                    {convertHSTtoLocal(selectedDate, selectedSlot.time)}
                  </p>
                </div>
              )}

              {selectedSlot && config && (
                <>
                  <label className="block text-gray-700 font-bold mb-3">
                    Meeting Duration
                  </label>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {config.durationOptions.map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDuration(d)}
                        className={`
                          p-3 rounded-xl font-semibold
                          ${
                            selectedDuration === d
                              ? "bg-[#005670] text-white"
                              : "bg-gray-50 border border-[#005670]/20 text-[#005670]"
                          }
                        `}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>

                  <label className="block text-gray-700 font-bold mb-3">
                    Notes
                  </label>
                  <textarea
                    className="w-full border rounded-xl p-4"
                    rows="4"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 flex gap-6">
        <button
          onClick={onBack}
          className="px-8 py-4 border rounded-xl font-bold text-[#005670]"
        >
          Back
        </button>

        <button
          disabled={!selectedDate || !selectedSlot || loading}
          onClick={handleBook}
          className="flex-1 px-10 py-4 bg-[#005670] text-white rounded-xl font-bold shadow disabled:opacity-50"
        >
          {loading ? "Booking..." : "Confirm Appointment"}
        </button>
      </div>
    </div>
  );
};

export default SchedulingComponent;
