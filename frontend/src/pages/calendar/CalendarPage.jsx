import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarPage = () => {
  const [events, setEvents] = useState([]); // State to store the events for FullCalendar
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [upcomingClasses, setUpcomingClasses] = useState([]); // State for upcoming classes

  // Fetch user data to get the clusters the user is part of
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    },
  });

  // Fetch all classes for admins or user-specific classes for others
  const { data: inClassesData, isLoading: isInClassesLoading, error: inClassesError } = useQuery({
    queryKey: ["allInClasses"],
    queryFn: async () => {
      if (userData?.usertype === "isAdmin") {
        const res = await fetch("/api/inclasses");
        if (!res.ok) throw new Error("Failed to fetch all classes");
        const result = await res.json();
        return result.data || [];
      } else if (userData?.inCluster?.length) {
        const classPromises = userData.inCluster.map((clusterId) =>
          fetch(`/api/inclasses/cluster/${clusterId}`).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch inclasses for cluster ${clusterId}`);
            return res.json();
          })
        );
        const responses = await Promise.all(classPromises);
        return responses.flatMap((response) => response.data || []);
      }
      return [];
    },
    enabled: !!userData, // Only fetch when userData is available
  });

  useEffect(() => {
    if (Array.isArray(inClassesData)) {
      console.log("Fetched InClasses:", inClassesData);
      // Map inclasses into events
      const allEvents = inClassesData.map((classItem) => {
        const formattedDate = `${classItem.date.substring(0, 4)}-${classItem.date.substring(4, 6)}-${classItem.date.substring(6, 8)}`;
        const startTime = classItem.starttime?.padStart(5, "0"); // Ensure format HH:mm
        const endTime = classItem.endtime?.padStart(5, "0"); // Ensure format HH:mm

        return {
          title: classItem.type,
          start: `${formattedDate}T${startTime || "00:00"}`,
          end: `${formattedDate}T${endTime || "23:59"}`,
          extendedProps: {
            description: classItem.description,
            classroom: classItem.classroom,
            type: classItem.type,
            teacher: classItem.teachers?.map((teacher) => teacher.username).join(", ") || "",
            clusterName: classItem.classcodes?.[0]?.name || "Unknown Cluster",
          },
        };
      });

      console.log("Mapped Events:", allEvents);
      setEvents(allEvents);

      // Extract upcoming classes
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      const upcoming = allEvents.filter((event) => new Date(event.start) > now && new Date(event.start) <= nextWeek);
      const sortedUpcoming = upcoming.sort((a, b) => new Date(a.start) - new Date(b.start));

      const limitedUpcoming = sortedUpcoming.slice(0, 5); // Limit to next 5 classes if less than a week
      setUpcomingClasses(limitedUpcoming);
    }
  }, [inClassesData]);

  if (isUserLoading || isInClassesLoading) return <div>Loading...</div>;
  if (userError || inClassesError)
    return <div>Error: {userError?.message || inClassesError?.message}</div>;

  return (
    <div className="w-full px-8 py-14">
      <div className="px-4 py-2">
      </div>

      {/* Calendar Section */}
      <div className="flex gap-4">
        <div className="flex-grow p-4 shadow rounded-lg" style={{ backgroundColor: "rgb(51, 140, 195)" }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            events={events} // Pass the formatted events
            eventClassNames={(event) => {
              // Apply custom class based on the event type
              switch (event.event.extendedProps.type) {
                case "阅读":
                  return "event-reading";
                case "写作":
                  return "event-writing";
                case "口语":
                  return "event-speaking";
                case "听力":
                  return "event-listening";
                default:
                  return "event-default";
              }
            }}
            eventDidMount={(info) => {
              info.el.title = `${new Date(info.event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}-${new Date(info.event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n` +
                `${info.event.title}\n` +
                `${info.event.extendedProps.clusterName}\n` +
                `${info.event.extendedProps.classroom}\n` +
                `${info.event.extendedProps.teacher}\n` +
                `${info.event.extendedProps.description}`;
            }}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            eventOverlap={true} // Allow overlapping events
            slotEventOverlap={false} // Stack them side by side
            eventDisplay="block" // Ensure events are displayed as blocks
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            dateClick={(info) => {
              setCurrentView("timeGridDay"); // Switch to day view
              setTimeout(() => {
                const calendarApi = info.view.calendar;
                calendarApi.changeView("timeGridDay", info.dateStr); // Navigate to the selected day
              }, 0);
            }}
            eventContent={(arg) => {
              const { extendedProps, title } = arg.event;
              const { classroom, teacher, description } = extendedProps;

              if (arg.view.type === "dayGridMonth") {
                return (
                  <div>
                    <b>{arg.timeText} {title}</b>
                  </div>
                );
              }

              return (
                <div>
                  <div><b>{arg.timeText}</b></div>
                  <div><b>{title} {classroom} {teacher}</b></div>
                  <div>{description}</div>
                </div>
              );
            }}
          />
        </div>

        {/* Upcoming Classes Section */}
        <div
          className="w-1/3 p-4 shadow rounded-lg overflow-auto"
          style={{
            backgroundColor: "rgb(51, 140, 195)",
            maxHeight: "500px",
            padding: "20px",
          }}
        >
          <h2 className="text-lg font-bold mb-4 text-white text-center">近期课程</h2>
          {upcomingClasses.length > 0 ? (
            <div className="flex flex-col space-y-2">
              {upcomingClasses.map((classItem, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg p-4 flex flex-col text-left hover:bg-[rgba(255,255,255,0.74)] hover:text-black transition-all duration-200"
                >
                  <div className="text-lg font-semibold" style={{ color: "rgba(0,0,0,0.6)" }}>
                    {classItem.title} {new Date(classItem.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}-{new Date(classItem.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm" style={{ color: "rgba(0,0,0,0.6)" }}>
                    {classItem.extendedProps.clusterName}
                  </div>
                  <div className="text-sm flex justify-between" style={{ color: "rgba(0,0,0,0.6)" }}>
                    <span>{classItem.extendedProps.classroom} {classItem.extendedProps.teacher}</span>
                    <span>{new Date(classItem.start).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white text-center">无课程</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
