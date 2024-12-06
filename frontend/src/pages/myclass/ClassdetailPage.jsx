import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const ClassDetailPage = () => {
  const { id } = useParams(); // Get the cluster ID from URL parameters
  const [className, setClassName] = useState(""); // State to store the class name
  const [inClassItems, setInClassItems] = useState([]); // State to store the in-class items
  const [members, setMembers] = useState([]); // State to store the members of the cluster
  const [nonClassMembers, setNonClassMembers] = useState([]); // State to store the users not in the class
  const [filteredMembers, setFilteredMembers] = useState([]); // Filtered members for the search bar
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering members
  const [error, setError] = useState(null);

  // Fetch the authenticated user
  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch authenticated user");
      return res.json();
    },
  });

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
      setInClassItems(
        data.data.map((item) => ({
          title: item.type,
          start: `${item.date}T${item.starttime}`,
          end: `${item.date}T${item.endtime}`,
          extendedProps: {
            description: item.description,
            classroom: item.classroom,
            type: item.type,
            endtime: item.endtime,
          },
        }))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch all users to get the list of non-class members
  const fetchAllUsers = async () => {
    try {
      const response = await fetch("/api/users/all");
      if (!response.ok) throw new Error("Failed to fetch all users");
      const data = await response.json();

      // Filter users who are NOT in the current class
      const nonClassUsers = data.data.filter(
        (user) => !members.some((member) => member._id === user._id)
      );

      setNonClassMembers(nonClassUsers); // Set users not in class
      setFilteredMembers(nonClassUsers); // Initialize the filtered list with all non-class members
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchClassDetails();
    fetchInClassItems();
    fetchAllUsers();
  }, [id]);

  // Add/remove student from the class
  const { mutate: addRemoveMember } = useMutation({
    mutationFn: async (studentId) => {
      const isMember = members.some((member) => member._id === studentId);

      try {
        const response = await fetch(`/api/clusters/${id}/members`, {
          method: isMember ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentId }),
        });

        if (!response.ok) throw new Error("Failed to update class members");
        toast.success(isMember ? "Member removed" : "Member added");
        fetchClassDetails(); // Refresh the class details
        fetchAllUsers(); // Refresh the non-class users
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  // Filter members based on the search term
  useEffect(() => {
    const filtered = nonClassMembers.filter((member) =>
      member.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm, nonClassMembers]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full px-8 py-10 mt-12">
      <div className="flex gap-4">
        {/* Left Column: Calendar */}
        <div
          className="flex-grow p-4 shadow rounded-lg"
          style={{ backgroundColor: "rgb(51, 140, 195)" }}
        >
          <h1 className="text-2xl font-bold mb-4">{className}</h1>
          {inClassItems.length === 0 ? (
            <div className="text-2xl font-medium text-center">此班级没有课程</div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={inClassItems}
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
            />
          )}
        </div>

        {/* Right Column: Members and Add/Remove Functionality */}
        <div
          className="w-1/3 p-4 shadow rounded-lg overflow-auto"
          style={{
            backgroundColor: "rgb(51, 140, 195)",
            maxHeight: "500px", // Shorten the height of the stack
            padding: "20px",
          }}
        >
          {/* Current Members List */}
          <h2 className="text-lg font-bold mb-4 text-white text-center">当前成员</h2>
          {members.length > 0 ? (
            <ul className="list-disc pl-4">
              {members.map((member) => (
                <li
                  key={member._id}
                  className="text-white cursor-pointer hover:bg-gray-200 p-2"
                  onClick={() => addRemoveMember(member._id)} // Clicking name removes from class
                >
                  {member.username}
                  {member.usertype === "isTeacher" && (
                    <span className="text-blue-500 font-bold"> (教师)</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-white text-center">此班级没有成员</div>
          )}

          {/* Search Bar and Add/Remove Members */}
          {authUser?.usertype === "isAdmin" && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-white">管理成员</h2>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索学生或教师"
                className="input input-bordered w-full mt-2"
              />
              <ul className="list-disc pl-4 mt-2">
                {filteredMembers.map((member) => (
                  <li
                    key={member._id}
                    className="cursor-pointer hover:bg-gray-200 p-2"
                    onClick={() => addRemoveMember(member._id)} // Clicking name adds to class
                  >
                    {member.username}
                    {member.usertype === "isTeacher" && (
                      <span className="text-blue-500 font-bold"> (教师)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;
