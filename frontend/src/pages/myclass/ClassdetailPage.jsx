import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const ClassDetailPage = () => {
  const { id } = useParams(); // Get the cluster ID from URL parameters
  const [className, setClassName] = useState(""); // State to store the class name
  const [inClassItems, setInClassItems] = useState([]); // State to store the in-class items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch cluster details to get the name
    const fetchClassDetails = async () => {
      try {
        const response = await fetch(`/api/clusters/${id}`);
        if (!response.ok) throw new Error("Failed to fetch class details");

        const data = await response.json();
        setClassName(data.data.name);
      } catch (err) {
        setError(err.message);
      }
    };

    // Fetch in-class items associated with this cluster
    const fetchInClassItems = async () => { 
      try {
        const response = await fetch(`/api/inclasses/cluster/${id}`); // Fetch in-class items for the cluster
        if (!response.ok) throw new Error("Failed to fetch in-class items");

        const data = await response.json();
        setInClassItems(
          data.data.map((item) => ({
            title: item.type,
            start: `${item.date}T${item.starttime.substring(0, 2)}:${item.starttime.substring(2, 4)}`, // Format start time
            end: `${item.date}T${item.endtime.substring(0, 2)}:${item.endtime.substring(2, 4)}`, // Format end time
            extendedProps: {
              description: item.description,
              classroom: item.classroom,
              type: item.type,
            },
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
    fetchInClassItems();
  }, [id]);

  if (loading) return <div>Loading class details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Class Details for Class: {className}</h1>
      </div>

      <div className="flex flex-col lg:flex-row mt-1 items-center justify-center">
        <div id="calendar-container" className="w-full lg:w-3/4 p-5">
          {inClassItems.length === 0 ? (
            <div className="text-2xl font-medium text-center">
              此班级没有课程
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={inClassItems} // Pass your events here
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
                if (arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay') {
                  return (
                    <div className="event-custom-content">
                      <div>
                        <b>{arg.timeText}</b>
                        <div>{arg.event.title}</div>
                      </div>
                      <div className="text-sm">
                        {arg.event.extendedProps.classroom && `Room: ${arg.event.extendedProps.classroom}`} {/* Display the classroom for week/day views */}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;

