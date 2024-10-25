import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery } from "@tanstack/react-query";

const Calendar = () => {
  const [events, setEvents] = useState([]); // State to store events

  // Fetch user data to get the classes/clusters the user is part of
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    },
  });

  // Fetch classes/clusters and in-class items
  const { data: clustersData, isLoading: isClustersLoading, error: clustersError } = useQuery({
    queryKey: ["clusters"],
    queryFn: async () => {
      const res = await fetch("/api/clusters");
      if (!res.ok) throw new Error("Failed to fetch clusters");
      return res.json();
    },
    enabled: !!userData, // Only fetch clusters if user data is loaded
  });

  useEffect(() => {
    if (clustersData && userData) {
      const userClasses = clustersData.data.filter((cluster) => userData.inCluster.includes(cluster._id));
      const allEvents = userClasses.flatMap((classItem) => {
        return classItem.inClass.map((item) => {
          const startTime = item.starttime?.substring(0, 2) + ":" + item.starttime?.substring(2, 4);
          const endTime = item.endtime?.substring(0, 2) + ":" + item.endtime?.substring(2, 4);

          return {
            title: item.type,
            start: `${item.date}T${startTime || '00:00'}`, // Default to '00:00' if no startTime
            end: `${item.date}T${endTime || '23:59'}`,     // Default to '23:59' if no endTime
            extendedProps: {
              description: item.description,
              classroom: item.classroom,
              type: item.type,
            },
          };
        });
      });
      setEvents(allEvents);
    }
  }, [clustersData, userData]);

  if (isUserLoading || isClustersLoading) return <div>Loading...</div>;
  if (userError || clustersError) return <div>Error: {userError?.message || clustersError?.message}</div>;

  return (
    <div className="w-full px-8 py-2">
      <h1 className="text-2xl font-bold mb-4">我的课表</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events} // Pass user-specific events here
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        eventClassNames={(arg) => {
          // Assign a class based on the event type (similar to classdetailpage)
          switch (arg.event.extendedProps.type) {
            case "Reading":
              return "event-reading";
            case "Listening":
              return "event-listening";
            case "Writing":
              return "event-writing";
            case "Speaking":
              return "event-speaking";
            default:
              return "event-default";
          }
        }}
        eventContent={(arg) => {
          // Customize event content similar to classdetailpage
          if (arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay') {
            return (
              <div className="event-custom-content">
                <div>
                  <b>{arg.timeText}</b>
                  <div>{arg.event.title}</div>
                </div>
                <div className="text-sm">
                  {arg.event.extendedProps.classroom && `Room: ${arg.event.extendedProps.classroom}`}
                </div>
              </div>
            );
          } else {
            return <div><b>{arg.timeText}</b> {arg.event.title}</div>;
          }
        }}
        eventClick={(info) =>
          alert(`Event: ${info.event.title}\nDescription: ${info.event.extendedProps.description}\nClassroom: ${info.event.extendedProps.classroom}`)
        }
      />
    </div>
  );
};

export default Calendar;
