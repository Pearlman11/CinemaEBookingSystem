"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./BookingPage.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import { ToastContainer, toast } from 'react-toastify';

interface Showtime {
  id: number;
  screentime: string;
  showDate?: string;
  startTime?: string;
}

interface Showdate {
  screeningDay: string;
  times: Showtime[];
  showroom?: {
    id: number;
    name?: string;
  };
}

interface Movie {
  id: number;
  title: string;
  poster: string;
  duration?: number;
  showTimes?: Showtime[];
}

interface GroupedShowtimes {
  [date: string]: string[];
}

const CombinedBookingPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showTimes, setShowTimes] = useState<Showdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adultTickets, setAdultTickets] = useState<number>(0);
  const [childTickets, setChildTickets] = useState<number>(0);
  const [seniorTickets, setSeniorTickets] = useState<number>(0);
  const totalTickets = adultTickets + childTickets + seniorTickets;

  const [groupedShowtimes, setGroupedShowtimes] = useState<GroupedShowtimes>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [showSeatSelection, setShowSeatSelection] = useState<boolean>(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const rows = ["A", "B", "C", "D", "E"];
  const cols = Array.from({ length: 8 }, (_, i) => i + 1);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hourNum = parseInt(hours, 10);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    } catch {
      return time;
    }
  };

  const handleTicketChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    if (value === '') {
      setter(0);
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setter(numValue);
    }
  };

  const groupShowtimesByDate = (showtimes: Showtime[] | undefined): GroupedShowtimes => {
    if (!showtimes || showtimes.length === 0) return {};
    const grouped: GroupedShowtimes = {};
    showtimes.forEach(showtime => {
      const date = showtime.showDate;
      const time = showtime.startTime;
      if (!date || !time) return;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(time);
    });
    return grouped;
  };

  useEffect(() => {
    fetch(`http://localhost:8080/api/movies/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data: Movie) => {
        setMovie(data);
        if (data.showTimes && data.showTimes.length > 0) {
          const grouped = groupShowtimesByDate(data.showTimes);
          setGroupedShowtimes(grouped);
          const dates = Object.keys(grouped);
          setAvailableDates(dates);
          if (dates.length > 0) {
            setSelectedDate(dates[0]);
            const times = grouped[dates[0]];
            if (times.length > 0) {
              setSelectedTime(times[0]);
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load movie details.");
        setLoading(false);
      });

    fetch(`http://localhost:8080/api/showtimes/movie/${id}`)
      .then(res => res.json())
      .then((data: any[]) => {
        const grouped = data.reduce((acc: Record<string, Showtime[]>, show) => {
          const date = show.showDate;
          const time = show.startTime?.substring(0, 5);
          if (!date || !time) return acc;
          if (!acc[date]) acc[date] = [];
          acc[date].push({ id: show.id, screentime: time, showDate: date, startTime: time });
          return acc;
        }, {});

        const formatted: Showdate[] = Object.entries(grouped).map(([screeningDay, times]) => ({
          screeningDay,
          times,
        }));

        setShowTimes(formatted);
        if (formatted.length > 0) {
          setSelectedDate(formatted[0].screeningDay);
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load showtimes.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const newTimes = showTimes.find(s => s.screeningDay === selectedDate)?.times;
    if (newTimes && newTimes.length > 0) {
      setSelectedTime(newTimes[0].screentime);
    } else {
      setSelectedTime("");
    }
  }, [selectedDate, showTimes]);

  const toggleSeat = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      if (selectedSeats.length < totalTickets) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        toast.error("You have already selected all required seats.", { className: styles['custom-toast'] });
      }
    }
  };

  const handleSeatSelectionConfirm = (e: FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length !== totalTickets) {
      toast.error(`Please select exactly ${totalTickets} seat${totalTickets !== 1 ? "s" : ""}.`, { className: styles['custom-toast'] });
      return;
    }

    const selectedShowtime = showTimes
      .find(s => s.screeningDay === selectedDate)
      ?.times.find(t => t.screentime === selectedTime);

    if (!selectedShowtime) {
      toast.error("Invalid showtime selected.");
      return;
    }

    const params = new URLSearchParams();
    params.set("adult", adultTickets.toString());
    params.set("child", childTickets.toString());
    params.set("senior", seniorTickets.toString());
    params.set("showtime", `${selectedDate} ${selectedTime}`);
    params.set("showtimeId", selectedShowtime.id.toString());

    router.push(`/movies/${id}/seatSelection?${params.toString()}`);
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const selectedShowDate = showTimes.find(s => s.screeningDay === selectedDate);

  return (
    <div>
      <NavBar />
      <ToastContainer
        aria-label="Notification"
        progressClassName={styles.customProgress}
        hideProgressBar={true}
        autoClose={4000}
        className={styles.toastContainer}
        limit={2}
      />
      {/* Continue rendering booking form and seat selection UI here */}
    </div>
  );
};

export default CombinedBookingPage;
