import { create } from "zustand";

export interface ColorComboType {
  text: string;
}

export type CalendarItem = {
  id: string;
  title: string;
  desc: string;
  date: string;
  startTime: string;
  endTime: string;
  height: number;
  location: string;
  type: "CalendarItem";
};

interface CalendarItemsStore {
  items: CalendarItem[];
  addItem: (item: CalendarItem) => void;
  removeItem: (id: string) => void;
}

const calendarItems: CalendarItem[] = [
  {
    id: "1",
    title: "Meeting 1",
    desc: "Discuss project updates",
    date: "2023-07-31",
    startTime: "09:00 AM",
    endTime: "10:30 AM",
    height: 90,
    location: "Meeting Room 1",
    type: "CalendarItem",
  },
  {
    id: "2",
    title: "Lunch",
    desc: "Lunch with colleagues",
    date: "2023-07-31",
    startTime: "12:30 PM",
    endTime: "01:30 PM",
    height: 60,
    location: "Cafeteria",
    type: "CalendarItem",
  },
  {
    id: "3",
    title: "Workshop",
    desc: "Team workshop on new tools",
    date: "2023-07-31",
    startTime: "02:00 PM",
    endTime: "04:00 PM",
    height: 120,
    location: "Conference Room B",
    type: "CalendarItem",
  },
  {
    id: "4",
    title: "Team Huddle",
    desc: "Quick team huddle",
    date: "2023-08-01",
    startTime: "04:30 PM",
    endTime: "05:00 PM",
    height: 30,
    location: "Team Area",
    type: "CalendarItem",
  },
  {
    id: "5",
    title: "Training Session",
    desc: "Training on new software",
    date: "2023-08-01",
    startTime: "09:30 AM",
    endTime: "12:00 PM",
    height: 150,
    location: "Training Room 2",
    type: "CalendarItem",
  },
  {
    id: "6",
    title: "Client Call",
    desc: "Call with important client",
    date: "2023-08-02",
    startTime: "03:00 PM",
    endTime: "03:45 PM",
    height: 45,
    location: "Online",
    type: "CalendarItem",
  },
  {
    id: "7",
    title: "Team Building Activity",
    desc: "Outdoor team building event",
    date: "2023-08-02",
    startTime: "11:00 AM",
    endTime: "02:00 PM",
    height: 180,
    location: "Outdoor Area",
    type: "CalendarItem",
  },
  {
    id: "8",
    title: "Project Discussion",
    desc: "Discussing new project proposal",
    date: "2023-08-02",
    startTime: "05:30 PM",
    endTime: "06:30 PM",
    height: 60,
    location: "Meeting Room 3",
    type: "CalendarItem",
  },
  {
    id: "9",
    title: "Breakfast Meeting",
    desc: "Meeting with business partners",
    date: "2023-08-02",
    startTime: "08:00 AM",
    endTime: "09:00 AM",
    height: 60,
    location: "Restaurant",
    type: "CalendarItem",
  },
  {
    id: "10",
    title: "Product Demo",
    desc: "Demo of new product features",
    date: "2023-08-03",
    startTime: "02:30 PM",
    endTime: "03:30 PM",
    height: 60,
    location: "Showroom",
    type: "CalendarItem",
  },
  {
    id: "11",
    title: "Meeting 2",
    desc: "Discuss project updates",
    date: "2023-08-03",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    height: 60,
    location: "Meeting Room 4",
    type: "CalendarItem",
  },
  {
    id: "12",
    title: "Coffee Break",
    desc: "Coffee break with team",
    date: "2023-08-04",
    startTime: "10:30 AM",
    endTime: "10:45 AM",
    height: 15,
    location: "Break Room",
    type: "CalendarItem",
  },
  {
    id: "13",
    title: "Presentation",
    desc: "Presenting sales strategies",
    date: "2023-08-04",
    startTime: "01:00 PM",
    endTime: "02:00 PM",
    height: 60,
    location: "Conference Room A",
    type: "CalendarItem",
  },
  {
    id: "14",
    title: "Team Lunch",
    desc: "Lunch with the whole team",
    date: "2023-08-04",
    startTime: "12:00 PM",
    endTime: "01:00 PM",
    height: 60,
    location: "Cafeteria",
    type: "CalendarItem",
  },
  {
    id: "15",
    title: "Design Review",
    desc: "Reviewing new design concepts",
    date: "2023-08-05",
    startTime: "03:45 PM",
    endTime: "04:45 PM",
    height: 60,
    location: "Design Studio",
    type: "CalendarItem",
  },
  {
    id: "16",
    title: "Brainstorming Session",
    desc: "Generating new ideas",
    date: "2023-08-05",
    startTime: "01:30 PM",
    endTime: "02:30 PM",
    height: 60,
    location: "Meeting Room 5",
    type: "CalendarItem",
  },
  {
    id: "17",
    title: "Client Meeting",
    desc: "Meeting with potential client",
    date: "2023-08-05",
    startTime: "04:00 PM",
    endTime: "05:00 PM",
    height: 60,
    location: "Client Office",
    type: "CalendarItem",
  },
  {
    id: "18",
    title: "Internal Presentation",
    desc: "Presenting quarterly results",
    date: "2023-08-06",
    startTime: "05:30 PM",
    endTime: "06:30 PM",
    height: 60,
    location: "Conference Room C",
    type: "CalendarItem",
  },
  {
    id: "19",
    title: "Coding Session",
    desc: "Collaborative coding session",
    date: "2023-08-06",
    startTime: "02:00 PM",
    endTime: "03:00 PM",
    height: 60,
    location: "Meeting Room 6",
    type: "CalendarItem",
  },
  {
    id: "20",
    title: "Team Celebration",
    desc: "Celebrating successful project",
    date: "2023-08-06",
    startTime: "06:45 PM",
    endTime: "08:00 PM",
    height: 75,
    location: "Party Room",
    type: "CalendarItem",
  },
];

const useCalendarState = create<CalendarItemsStore>(set => ({
  items: calendarItems,
  addItem: (item: CalendarItem) =>
    set((state: CalendarItemsStore) => ({
      items: [...state.items, item],
    })),
  removeItem: (id: string) =>
    set((state: CalendarItemsStore) => ({
      items: state.items.filter(item => item.id !== id),
    })),
}));

export { useCalendarState };
