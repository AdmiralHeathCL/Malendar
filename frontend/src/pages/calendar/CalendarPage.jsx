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

  // Fetch clusters data, but only if userData is present
  const { data: clustersData, isLoading: isClustersLoading, error: clustersError } = useQuery({
    queryKey: ["clusters"],
    queryFn: async () => {
      const res = await fetch("/api/clusters");
      if (!res.ok) throw new Error("Failed to fetch clusters");
      return res.json();
    },
    enabled: !!userData, // Only run this query if userData is present
  });

  useEffect(() => {
    if (clustersData && userData) {
      const userClasses = clustersData.data.filter((cluster) =>
        userData.inCluster.includes(cluster._id)
      );
      const allEvents = userClasses.flatMap((classItem) => {
        return classItem.inClass.map((item) => {
          const startTime =
            item.starttime?.substring(0, 2) + ":" + item.starttime?.substring(2, 4);
          const endTime =
            item.endtime?.substring(0, 2) + ":" + item.endtime?.substring(2, 4);

          return {
            title: item.type,
            start: `${item.date}T${startTime || "00:00"}`, // Default to '00:00' if no startTime
            end: `${item.date}T${endTime || "23:59"}`, // Default to '23:59' if no endTime
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

  // Filter user classes
  const userClasses =
    clustersData?.data?.filter((cluster) =>
      userData?.inCluster?.includes(cluster._id)
    ) || [];

  if (isUserLoading || isClustersLoading) return <div>Loading...</div>;
  if (userError || clustersError)
    return <div>Error: {userError?.message || clustersError?.message}</div>;

  return (
    <div className="w-full px-8 py-10 mt-12">
      <div className="flex gap-4">
        {/* Calendar Section */}
        <div
          className="flex-grow p-4 shadow rounded-lg"
          style={{ backgroundColor: "rgb(51, 140, 195)" }}
        >
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
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            eventClassNames={(arg) => {
              // Assign a class based on the event type
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
              // Customize event content
              if (arg.view.type === "timeGridWeek" || arg.view.type === "timeGridDay") {
                return (
                  <div className="event-custom-content">
                    <div>
                      <b>{arg.timeText}</b>
                      <div>{arg.event.title}</div>
                    </div>
                    <div className="text-sm">
                      {arg.event.extendedProps.classroom &&
                        `Room: ${arg.event.extendedProps.classroom}`}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div>
                    <b>{arg.timeText}</b> {arg.event.title}
                  </div>
                );
              }
            }}
            eventClick={(info) =>
              alert(
                `Event: ${info.event.title}\nDescription: ${info.event.extendedProps.description}\nClassroom: ${info.event.extendedProps.classroom}`
              )
            }
          />
        </div>

        {/* Classes Section - Stack Layout */}
        <div
          className="w-1/3 p-4 shadow rounded-lg overflow-auto"
          style={{
            backgroundColor: "rgb(51, 140, 195)",
            maxHeight: "500px", // Shorten the height of the stack
            padding: "20px",
          }}
        >
          <h2 className="text-lg font-bold mb-4 text-white text-center">我的班级</h2>
          {userClasses.length > 0 ? (
            <div className="flex flex-col space-y-2">
              {userClasses.map((classItem) => (
                <div
                  key={classItem._id}
                  className="bg-transparent shadow-md rounded-lg p-4 flex items-start text-left hover:bg-[rgb(51,123,195)] hover:text-white transition-all duration-200 cursor-pointer"
                  // Keeping it clickable for later functionality
                  onClick={() => {
                    // Placeholder for future navigation
                    console.log(`Clicked on class: ${classItem.name}`);
                  }}
                >
                  <div className="text-xl text-white font-semibold">{classItem.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white text-center">您当前还没有加入任何班级。</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
