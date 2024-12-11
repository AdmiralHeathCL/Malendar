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
        const response = await fetch(/api/clusters/${id});
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
        const res = await fetch(/api/inclasses/cluster/${id});
        const data = await res.json();
  
        if (res.ok && data?.data) {
          const formattedEvents = data.data.map((classItem) => ({
            title: classItem.type, // Use class type as the event title
            start: ${classItem.date}T${classItem.starttime}, // Format as YYYY-MM-DDTHH:mm
            end: ${classItem.date}T${classItem.endtime}, // Format as YYYY-MM-DDTHH:mm
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
  

  // Mutation to add/remove student
  const { mutate: addStudent } = useMutation({
    mutationFn: async (studentId) => {
      const response = await fetch(/api/clusters/${id}/addStudent, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId }),
      });

      if (!response.ok) throw new Error("Failed to add member to class");

      toast.success("Member added");

      // Update the members and non-members immediately
      const addedMember = nonMembers.find((user) => user._id === studentId);
      setMembers((prevMembers) => [...prevMembers, addedMember]);
      setNonMembers((prevNonMembers) =>
        prevNonMembers.filter((user) => user._id !== studentId)
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: removeStudent } = useMutation({
    mutationFn: async (studentId) => {
      const response = await fetch(/api/clusters/${id}/removeStudent, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId }),
      });

      if (!response.ok) throw new Error("Failed to remove member from class");

      toast.success("Member removed");

      // Update the members and non-members immediately
      const removedMember = members.find((user) => user._id === studentId);
      setMembers((prevMembers) => prevMembers.filter((user) => user._id !== studentId));
      setNonMembers((prevNonMembers) => [...prevNonMembers, removedMember]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
          initialView="dayGridMonth"
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
                onClick={
                  authUser?.usertype === "isAdmin" ? () => removeStudent(member._id) : null
                }
              >
                {member.username}
              </li>
            ))}
          </ul>
          {members.length === 0 && <div className="text-white text-center">此班级没有成员</div>}

          {/* Search and Add Members - Only visible to admins */}
          {authUser?.usertype === "isAdmin" && (
            <>
              <h3 className="text-lg font-bold mt-4 mb-2 text-white">搜索并添加成员</h3>
              <input
                type="text"
                className="input input-bordered w-full mb-4"
                placeholder="搜索成员"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <ul className="list-disc pl-4 text-white">
                {nonMembers
                  .filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((user) => (
                    <li
                      key={user._id}
                      className="cursor-pointer"
                      onClick={() => addStudent(user._id)}
                    >
                      {user.username}
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;