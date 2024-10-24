import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const ClassDetailPage = () => {
  const { id } = useParams(); // Get the cluster ID from URL parameters
  const [className, setClassName] = useState(""); // State to store the class name
  const [inClassItems, setInClassItems] = useState([]); // State to store the in-class items
  const [members, setMembers] = useState([]); // State to store the members of the cluster
  const [searchTerm, setSearchTerm] = useState(""); // State to store search term for adding members
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered user list for search
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch("/api/users/all");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: async (studentId) => {
      const res = await fetch(`/api/clusters/${id}/addStudent`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) {
        throw new Error('Failed to add member');
      }
    },
    onSuccess: (_, studentId) => {
      // Update the members state to include the new member
      const newMember = usersData.data.find(user => user._id === studentId);
      if (newMember) {
        setMembers(prevMembers => [...prevMembers, newMember]);
      }

      toast.success('成员添加成功');
      queryClient.invalidateQueries(['cluster', id]); // Refetch the cluster if needed
      setSearchTerm(""); // Clear the search bar
    },
    onError: () => {
      toast.error('添加成员失败');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (studentId) => {
      const res = await fetch(`/api/clusters/${id}/removeStudent`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) {
        throw new Error('Failed to remove member');
      }
    },
    onSuccess: (_, studentId) => {
      // Update the members state to remove the member
      setMembers(prevMembers => prevMembers.filter(member => member._id !== studentId));

      toast.success('成员已移除');
      queryClient.invalidateQueries(['cluster', id]); // Refetch the cluster if needed
    },
    onError: () => {
      toast.error('移除成员失败');
    },
  });

  const handleAddMember = (studentId) => {
    addMemberMutation.mutate(studentId);
  };

  const handleRemoveMember = (studentId) => {
    removeMemberMutation.mutate(studentId);
  };

  useEffect(() => {
    if (usersData && searchTerm) {
      const filtered = usersData.data
        .filter((user) => user.username.toLowerCase().startsWith(searchTerm.toLowerCase()))
        .sort((a, b) => a.username.localeCompare(b.username));
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, usersData]);

  if (loading) return <div>Loading class details...</div>;
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
                  <li key={member._id} className="flex items-center justify-between">
                    <span>
                      {member.username} {/* Display the username */}
                      {member.usertype === 'isTeacher' && (
                        <span className="text-blue-500 font-bold"> (教师)</span>
                      )}
                    </span>
                    {/* Show Remove button only for admin */}
                    {authUser?.usertype === 'isAdmin' && (
                      <button
                        className="ml-auto text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveMember(member._id)}
                      >
                        移除
                      </button>
                    )}
                  </li>
                ))
            )}
          </ul>
        </div>
      </div>

      {/* Add Member Collapse */}
      {authUser?.usertype === 'isAdmin' && (
        <div className="collapse collapse-arrow bg-base-200 mt-2">
          <input type="checkbox" /> {/* Add member collapsed by default */}
          <div className="collapse-title text-lg font-medium">添加成员</div>
          <div className="collapse-content">
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="搜索学生或教师"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70">
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd" />
              </svg>
            </label>

            <ul className="list-disc pl-4 mt-2">
              {filteredUsers.map((user) => (
                <li key={user._id} className="cursor-pointer hover:bg-gray-200 p-2" onClick={() => handleAddMember(user._id)}>
                  {user.username} {user.usertype === 'isTeacher' ? '(教师)' : '(学生)'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetailPage;
