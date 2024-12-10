import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const ClassDetailPage = () => {
  const { id } = useParams(); // Get the cluster ID from URL
  const [className, setClassName] = useState(""); // State to store the class name
  const [members, setMembers] = useState([]); // State to store the members of the cluster
  const [nonMembers, setNonMembers] = useState([]); // State for non-members
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering users
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]); // State to store the events for FullCalendar
  const [currentView, setCurrentView] = useState("dayGridMonth"); // Track the current calendar view

  // Fetch the authenticated user
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch authenticated user");
      return res.json();
    },
  });

  // Fetch cluster details to get the name, members, and non-members
  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await fetch(`/api/clusters/${id}`);
        if (!response.ok) throw new Error("Failed to fetch class details");

        const data = await response.json();
        setClassName(data.data.name);
        setMembers(data.data.students); // Class members
        // Fetch non-members (those not in the current class)
        const nonMembersResponse = await fetch("/api/users/students");
        const nonMembersData = await nonMembersResponse.json();
        const nonMembers = nonMembersData.data.filter(
          (user) => !data.data.students.some((student) => student._id === user._id)
        );
        setNonMembers(nonMembers); // Students not in the current class
      } catch (err) {
        setError(err.message);
      }
    };

    fetchClassDetails();
  }, [id]);

  // Fetch the events (classes) for this cluster and format them for FullCalendar
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/inclasses/cluster/${id}`);
        const data = await res.json();

        if (res.ok && data?.data) {
          const formattedEvents = data.data.map((classItem) => ({
            title: classItem.type, // Use class type as the event title
            start: `${classItem.date}T${classItem.starttime}`, // Format as YYYY-MM-DDTHH:mm
            end: `${classItem.date}T${classItem.endtime}`, // Format as YYYY-MM-DDTHH:mm
            description: classItem.description, // Additional info
            classroom: classItem.classroom, // Classroom info
            teacher: classItem.teachers.map((t) => t.username).join(", "), // Extract usernames
            classType: classItem.type, // Class type for custom styling
          }));

          setEvents(formattedEvents);
        }
      } catch (err) {
        setError("Failed to load events");
      }
    };

    fetchEvents();
  }, [id]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full px-8 py-14">
      <div className="px-4 py-2">
        <h1 className="text-2xl font-bold">{className}</h1>
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
              switch (event.event.extendedProps.classType) {
                case "阅读":
                  return ["event-reading"];
                case "写作":
                  return ["event-writing"];
                case "口语":
                  return ["event-speaking"];
                case "听力":
                  return ["event-listening"];
                default:
                  return ["event-default"];
              }
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

              if (arg.view.type === "timeGridWeek") {
                return (
                  <div>
                    <div><b>{arg.timeText}</b></div>
                    <div><b>{title}</b></div>
                    <div><b>{teacher}</b></div>
                    <div><b>{classroom}</b></div>
                  </div>
                );
              }

              if (arg.view.type === "timeGridDay") {
                return (
                  <div>
                    <div><b>{arg.timeText}</b></div>
                    <div><b>{title} {teacher} {classroom}</b></div>
                    <div>{description}</div>
                  </div>
                );
              }
            }}
          />
        </div>

        {/* Members Section */}
        <div className="w-1/3 p-4 shadow rounded-lg overflow-auto" style={{ backgroundColor: "rgb(51, 140, 195)" }}>
          <h2 className="text-lg font-bold mb-4 text-white">班级成员</h2>
          <ul className="list-disc pl-4 text-white">
            {members.map((member) => (
              <li
                key={member._id}
                className={authUser?.usertype === "isAdmin" ? "cursor-pointer" : ""}
              >
                {member.username}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;
