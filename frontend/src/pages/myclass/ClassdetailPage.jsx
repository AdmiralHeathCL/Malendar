import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const ClassDetailPage = () => {
  const { id } = useParams(); // Get the cluster ID from URL parameters
  const [className, setClassName] = useState(""); // State to store the class name
  const [inClassItems, setInClassItems] = useState([]); // State to store the in-class items
  const [members, setMembers] = useState([]); // State to store the members of the cluster
  const [error, setError] = useState(null);

  // Fetch the authenticated user
  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch authenticated user");
      return res.json();
    }
  });

  useEffect(() => {
    // Fetch cluster details to get the name and members
    const fetchClassDetails = async () => {
      try {
        const response = await fetch(`/api/clusters/${id}`);
        if (!response.ok) throw new Error("Failed to fetch class details");

        const data = await response.json();
        setClassName(data.data.name);
        setMembers(data.data.students); // Use populated 'students' field
      } catch (err) {
        setError(err.message);
      }
    };

    // Fetch in-class items associated with this cluster
    const fetchInClassItems = async () => {
      try {
        const response = await fetch(`/api/inclasses/cluster/${id}`);
        if (!response.ok) throw new Error("Failed to fetch in-class items");

        const data = await response.json();
        // Directly use the time format provided (e.g., "17:00")
        setInClassItems(
          data.data.map((item) => ({
            title: item.type, // Title will display the class type
            start: `${item.date}T${item.starttime}`, // Use starttime directly
            end: `${item.date}T${item.endtime}`, // Use endtime directly
            extendedProps: {
              description: item.description,
              classroom: item.classroom,
              type: item.type, // Pass class type for customized event colors
              endtime: item.endtime, // End time for display
            },
          }))
        );
      } catch (err) {
        setError(err.message);
      }
    };

    fetchClassDetails();
    fetchInClassItems();
  }, [id]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full p-8">
      <div className="p-4">
        <h1 className="text-2xl font-bold">{className}</h1>
      </div>

      {/* Calendar Collapse */}
      <div className="collapse collapse-arrow bg-base-200 mt-4">
        <input type="checkbox" defaultChecked /> {/* Calendar is open by default */}
        <div className="collapse-title text-lg font-medium">班级课表</div>
        <div className="collapse-content">
          <div id="calendar-container" className="w-full px-5 py-2">
            {inClassItems.length === 0 ? (
              <div className="text-2xl font-medium text-center">此班级没有课程</div>
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
                    case "阅读":
                      return "event-reading";
                    case "听力":
                      return "event-listening";
                    case "写作":
                      return "event-writing";
                    case "口语":
                      return "event-speaking";
                    default:
                      return "event-default";
                  }
                }}
                eventContent={(arg) => {
                  return (
                    <div className="event-custom-content">
                      <b>{arg.timeText} - {arg.event.extendedProps.endtime}</b> {/* Add end time */}
                      <div>{arg.event.title}</div>
                      {arg.event.extendedProps.classroom && (
                        <div className="text-sm">{arg.event.extendedProps.classroom}</div>
                      )}
                    </div>
                  );
                }}
                eventClick={(info) =>
                  alert(
                    `Event: ${info.event.title}\nDescription: ${info.event.extendedProps.description}\nClassroom: ${info.event.extendedProps.classroom}`
                  )
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Members Collapse */}
      <div className="collapse collapse-arrow bg-base-200 mt-2">
        <input type="checkbox" /> {/* Members are collapsed by default */}
        <div className="collapse-title text-lg font-medium">班级成员</div>
        <div className="collapse-content">
          <ul className="list-disc pl-4 mt-2">
            {members.length === 0 ? (
              <li>此班级没有成员</li>
            ) : (
              members
                .sort((a, b) => a.usertype === 'isTeacher' ? -1 : 1) // Move teachers to the top
                .map((member) => (
                  <li key={member._id}>
                    {member.username} {/* Display the username */}
                    {member.usertype === 'isTeacher' && (
                      <span className="text-blue-500 font-bold"> (教师)</span>
                    )}
                  </li>
                ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;
 