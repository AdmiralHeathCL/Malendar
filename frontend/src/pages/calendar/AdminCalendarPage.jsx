import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const AdminCalendarPage = () => {
  // Default values for a class
  const defaultClass = {
    classroom: "",
    className: "",
    content: "",
    teacher: "",
    startTime: "",
    endTime: "",
    type: "",
  };

  const [classes, setClasses] = useState([{ ...defaultClass }]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [teachers, setTeachers] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [activeClusters, setActiveClusters] = useState([]); // Active clusters for class dropdown

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/users/teachers");
        const data = await res.json();
        if (res.ok && data && data.data) {
          setTeachers(data.data);
        } else {
          toast.error("Failed to fetch teachers");
        }
      } catch (error) {
        console.error("Error fetching teachers:", error.message);
        toast.error("Error fetching teachers");
      }
    };

    fetchTeachers();
  }, []);

  // Fetch clusters and filter only active ones
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await fetch("/api/clusters");
        const data = await res.json();
        if (res.ok && data && data.data) {
          const activeClusters = data.data.filter(cluster => cluster.isActive[0]); // Filter active clusters
          setClusters(data.data); // Set all clusters
          setActiveClusters(activeClusters); // Set only active clusters for dropdown
        } else {
          toast.error("Failed to fetch clusters");
        }
      } catch (error) {
        console.error("Error fetching clusters:", error.message);
        toast.error("Error fetching clusters");
      }
    };

    fetchClusters();
  }, []);

  // Fetch classes by date
  useEffect(() => {
    const fetchClassesForDate = async () => {
      try {
        const res = await fetch(`/api/inclasses/date/${selectedDate.replace(/-/g, "")}`);
        const data = await res.json();
        if (res.ok && data && data.data) {
          const formattedClasses = data.data.map((classItem) => ({
            classroom: classItem.classroom || "",
            className: classItem.classcodes ? classItem.classcodes[0] : "",
            content: classItem.description || "",
            teacher: classItem.teachers ? classItem.teachers[0] : "",
            startTime: classItem.starttime || "",
            endTime: classItem.endtime || "",
            type: classItem.type || "",
            _id: classItem._id || null, // Include _id for existing classes
          }));

          // Add an empty row for admin to fill in
          setClasses([...formattedClasses, { ...defaultClass }]);
        } else {
          toast.error("Failed to fetch classes for the selected date");
        }
      } catch (error) {
        console.error("Error fetching classes:", error.message);
        toast.error("Error fetching classes");
      }
    };

    fetchClassesForDate();
  }, [selectedDate]);

  // Handle input changes for class creation
  const handleInputChange = (index, field, value) => {
    const updatedClasses = [...classes];
    updatedClasses[index][field] = value || "";

    if (field === "startTime") {
      const startTime = value;
      const endTime = updatedClasses[index].endTime;

      if (!endTime) {
        const [hours, minutes] = startTime.split(":");
        const defaultEndTime = `${String(Number(hours) + 2).padStart(2, "0")}:${minutes}`;
        updatedClasses[index].endTime = defaultEndTime;
      } else if (endTime <= startTime) {
        toast.error("End time cannot be earlier than start time");
        updatedClasses[index].endTime = "";
      }
    }

    if (field === "endTime") {
      const startTime = updatedClasses[index].startTime;
      if (value <= startTime) {
        toast.error("End time cannot be earlier than start time");
        updatedClasses[index].endTime = "";
      } else {
        updatedClasses[index].endTime = value;
      }
    }

    setClasses(updatedClasses);
  };

  // Handle adding a class
  const handleAddClass = async () => {
    const lastClass = classes[classes.length - 1];

    if (lastClass.className && lastClass.startTime && lastClass.endTime) {
      try {
        const newClass = {
          classroom: lastClass.classroom,
          classcodes: [lastClass.className],
          description: lastClass.content,
          teachers: [lastClass.teacher],
          starttime: lastClass.startTime,
          endtime: lastClass.endTime,
          date: selectedDate.replace(/-/g, ""),
          type: lastClass.type,
        };

        const res = await fetch("/api/inclasses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newClass),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success("Class added successfully");

          // Append the added class and add a new blank row for next input
          setClasses([...classes, { ...defaultClass }]);
        } else {
          console.error("Error from server:", data);
          toast.error(`Failed to add class: ${data.message}`);
        }
      } catch (error) {
        console.error("Error adding class:", error.message);
        toast.error("Error adding class");
      }
    } else {
      toast.error("Please fill all required fields");
    }
  };

  // Handle deleting a class
  const handleDeleteClass = async (index, classId) => {
    try {
      if (classId) {
        const res = await fetch(`/api/inclasses/${classId}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          toast.success("Class deleted successfully");
        } else {
          toast.error("Failed to delete class");
          return;
        }
      }

      if (classes.length > 1) {
        const updatedClasses = [...classes];
        updatedClasses.splice(index, 1);
        setClasses(updatedClasses);
      }
    } catch (error) {
      toast.error("Error deleting class");
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">课程安排</h1>
      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input input-bordered w-full lg:w-1/4"
        />
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg p-5" style={{ backgroundColor: "rgb(51, 140, 195)" }}>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 border">上课时间</th>
              <th className="px-4 py-2 border">下课时间</th>
              <th className="px-4 py-2 border">教室</th>
              <th className="px-4 py-2 border">班级</th>
              <th className="px-4 py-2 border">课程内容</th>
              <th className="px-4 py-2 border">助教及任课老师</th>
              <th className="px-4 py-2 border">课程</th>
              <th className="px-4 py-2 border">操作</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem, index) => (
              <tr key={index} style={{ backgroundColor: classItem.type === "教辅" ? "rgba(51, 140, 195, 0.5)" : "rgb(51, 140, 195)" }}>
                <td className="px-4 py-2 border">
                  <input
                    type="time"
                    value={classItem.startTime || ""}
                    onChange={(e) => handleInputChange(index, "startTime", e.target.value)}
                    className="input input-bordered w-full"
                    step="600"
                    style={{ backgroundColor: "rgb(51, 140, 195)" }}
                  />
                </td>
                <td className="px-4 py-2 border">
                  <input
                    type="time"
                    value={classItem.endTime || ""}
                    onChange={(e) => handleInputChange(index, "endTime", e.target.value)}
                    className="input input-bordered w-full"
                    step="600"
                    style={{ backgroundColor: "rgb(51, 140, 195)" }}
                  />
                </td>

                <td className="px-4 py-2 border">
                  <select
                    value={classItem.classroom || ""}
                    onChange={(e) => handleInputChange(index, "classroom", e.target.value)}
                    className="select select-bordered w-full"
                    style={{ backgroundColor: "rgb(51, 140, 195)" }}
                  >
                    <option value="" disabled>选择教室</option>
                    <option value="VIP1">VIP1</option>
                    <option value="VIP2">VIP2</option>
                    <option value="VIP3">VIP3</option>
                    <option value="阳光房">阳光房</option>
                    <option value="阶梯教室">阶梯教室</option>
                  </select>
                </td>
                <td className="px-4 py-2 border">
                  <select
                    value={classItem.className || ""}
                    onChange={(e) => handleInputChange(index, "className", e.target.value)}
                    className="select select-bordered w-full"
                    style={{ backgroundColor: "rgb(51, 140, 195)" }}
                  >
                    <option value="" disabled>选择班级</option>
                    {activeClusters.map((cluster) => (
                      <option key={cluster._id} value={cluster._id}>{cluster.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 border">
                  <input
                    type="text"
                    value={classItem.content || ""}
                    onChange={(e) => handleInputChange(index, "content", e.target.value)}
                    placeholder="Enter content"
                    className="input input-bordered w-full"
                    style={{ backgroundColor: "rgb(51, 140, 195)" }}
                  />
                </td>
                <td className="px-4 py-2 border">
                  <select
                    value={classItem.teacher || ""}
                    onChange={(e) => handleInputChange(index, "teacher", e.target.value)}
                    className="select select-bordered w-full"
                    style={{ backgroundColor: "rgb(51, 140, 195)" }}
                  >
                    <option value="" disabled>选择教师</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>{teacher.username}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 border">
                  <select
                    value={classItem.type || ""}
                    onChange={(e) => handleInputChange(index, "type", e.target.value)}
                    className="select select-bordered w-full"
                    style={{ backgroundColor: "rgb(51, 140, 195)" }}
                  >
                    <option value="" disabled>选择课程</option>
                    <option value="阅读">阅读</option>
                    <option value="写作">写作</option>
                    <option value="口语">口语</option>
                    <option value="听力">听力</option>
                    <option value="教辅">教辅</option>
                  </select>
                </td>
                <td className="px-4 py-2 border">
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => handleDeleteClass(index, classItem._id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="8" className="text-right px-4 py-2">
                <button className="btn btn-primary" onClick={handleAddClass}>
                  添加课程
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCalendarPage;
