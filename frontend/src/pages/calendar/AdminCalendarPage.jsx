import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const AdminCalendarPage = () => {
  const defaultClass = {
    classroom: "",
    className: "",
    content: "",
    teacher: "",
    startTime: "",
    endTime: "",
    type: "",
  };

  const [classes, setClasses] = useState([defaultClass]); // Initially one row
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [teachers, setTeachers] = useState([]);
  const [activeClusters, setActiveClusters] = useState([]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/users/teachers");
        const data = await res.json();
        if (res.ok && data?.data) {
          setTeachers(data.data);
        } else {
          toast.error("Failed to fetch teachers");
        }
      } catch (error) {
        toast.error("Error fetching teachers");
      }
    };
    fetchTeachers();
  }, []);

  // Fetch active clusters (classes)
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await fetch("/api/clusters");
        const data = await res.json();
        if (res.ok && data?.data) {
          const activeClusters = data.data.filter((cluster) => cluster.isActive[0]);
          setActiveClusters(activeClusters);
        } else {
          toast.error("Failed to fetch clusters");
        }
      } catch (error) {
        toast.error("Error fetching clusters");
      }
    };
    fetchClusters();
  }, []);

  // Fetch classes by date
  const fetchClassesForDate = async () => {
    try {
      const res = await fetch(`/api/inclasses/date/${selectedDate.replace(/-/g, "")}`);
      const data = await res.json();
      if (res.ok && data?.data) {
        const formattedClasses = data.data.map((classItem) => ({
          classroom: classItem.classroom || "",
          className: classItem.classcodes?.[0] || "",
          content: classItem.description || "",
          teacher: classItem.teachers?.[0] || "",
          startTime: classItem.starttime || "",
          endTime: classItem.endtime || "",
          type: classItem.type || "",
          _id: classItem._id || null,
        }));
        setClasses(formattedClasses);
      } else {
        setClasses([defaultClass]);
        toast.error("Failed to fetch classes for the selected date");
      }
    } catch (error) {
      setClasses([defaultClass]);
      toast.error("Error fetching classes for the selected date");
    }
  };

  useEffect(() => {
    fetchClassesForDate();
  }, [selectedDate]);

  const handleInputChange = (index, field, value) => {
    const updatedClasses = [...classes];
    updatedClasses[index][field] = value || "";

    // Automatically adjust end time if needed
    if (field === "startTime") {
      const startTime = value;
      const endTime = updatedClasses[index].endTime;

      if (!endTime || endTime <= startTime) {
        const [hours, minutes] = startTime.split(":");
        const adjustedEndTime = `${String(Number(hours) + 1).padStart(2, "0")}:${minutes}`;
        updatedClasses[index].endTime = adjustedEndTime;
      }
    }

    if (field === "endTime") {
      const startTime = updatedClasses[index].startTime;
      if (value <= startTime) {
        toast.error("End time cannot be earlier than start time");
        updatedClasses[index].endTime = "";
      }
    }

    setClasses(updatedClasses);
  };

  const handleAddRow = () => {
    setClasses([...classes, defaultClass]);
  };

  const handleDeleteRow = (index) => {
    const updatedClasses = [...classes];
    updatedClasses.splice(index, 1);
    setClasses(updatedClasses);
  };

  const handleSaveChanges = async () => {
    try {
      // Remove incomplete rows (ignoring 课程内容)
      const validClasses = classes.filter(
        (classItem) =>
          classItem.startTime &&
          classItem.endTime &&
          classItem.classroom &&
          classItem.className &&
          classItem.teacher &&
          classItem.type
      );
      setClasses(validClasses);

      // Delete existing classes for the selected date
      const deleteRes = await fetch(`/api/inclasses/date/${selectedDate.replace(/-/g, "")}`, {
        method: "DELETE",
      });

      if (deleteRes.ok) {
        // Save new classes
        for (const classItem of validClasses) {
          const newClass = {
            classroom: classItem.classroom,
            classcodes: [classItem.className],
            description: classItem.content,
            teachers: [classItem.teacher],
            starttime: classItem.startTime,
            endtime: classItem.endTime,
            date: selectedDate.replace(/-/g, ""),
            type: classItem.type,
          };

          const res = await fetch("/api/inclasses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newClass),
          });

          if (!res.ok) {
            toast.error("Failed to save some classes");
            return;
          }
        }

        // Sort classes by start time and class name
        const sortedClasses = [...validClasses].sort((a, b) => {
          if (a.startTime === b.startTime) {
            return a.className.localeCompare(b.className);
          }
          return a.startTime.localeCompare(b.startTime);
        });
        setClasses(sortedClasses);

        toast.success("修改成功");
      } else {
        toast.error("删除失败");
      }
    } catch (error) {
      toast.error("修改失败");
    }
  };

  return (
    <div className="p-5">
      <div className="mb-4">
        <label className="block text-lg font-medium mt-12 mb-2">选择日期</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input input-bordered w-full lg:w-1/4"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-black">上课时间</th>
              <th className="px-4 py-2 border text-black">下课时间</th>
              <th className="px-4 py-2 border text-black">教室</th>
              <th className="px-4 py-2 border text-black">班级</th>
              <th className="px-4 py-2 border text-black">课程内容</th>
              <th className="px-4 py-2 border text-black">助教及任课老师</th>
              <th className="px-4 py-2 border text-black">课程</th>
              <th className="px-4 py-2 border text-black">操作</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem, index) => (
              <tr key={index} className="bg-white text-black">
                {/* Start Time */}
                <td className="px-2 py-2 border align-top">
                  <div style={{ height: "100%" }}>
                    <input
                      type="time"
                      value={classItem.startTime || ""}
                      onChange={(e) => handleInputChange(index, "startTime", e.target.value)}
                      className="input input-bordered w-full"
                      style={{ backgroundColor: "white", borderColor: "black", color: "black" }}
                    />
                  </div>
                </td>

                {/* End Time */}
                <td className="px-2 py-2 border align-top">
                  <div style={{ height: "100%" }}>
                    <input
                      type="time"
                      value={classItem.endTime || ""}
                      onChange={(e) => handleInputChange(index, "endTime", e.target.value)}
                      className="input input-bordered w-full"
                      style={{ backgroundColor: "white", borderColor: "black", color: "black" }}
                    />
                  </div>
                </td>

                {/* Classroom */}
                <td className="px-2 py-2 border align-top">
                  <div style={{ height: "100%" }}>
                    <select
                      value={classItem.classroom || ""}
                      onChange={(e) => handleInputChange(index, "classroom", e.target.value)}
                      className="select select-bordered w-full"
                      style={{ backgroundColor: "white", borderColor: "black", color: "black" }}
                    >
                      <option value="" disabled>选择教室</option>
                      {[...["VIP1", "VIP2", "VIP3", "VIP5", "VIP6", "阳光房", "咨询室", "玻璃办公室", "Robin办公室", "阶梯教室"]].sort().map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* Class Name */}
                <td className="px-2 py-2 border align-top">
                  <div style={{ height: "100%" }}>
                    <select
                      value={classItem.className || ""}
                      onChange={(e) => handleInputChange(index, "className", e.target.value)}
                      className="select select-bordered w-full"
                      style={{ backgroundColor: "white", borderColor: "black", color: "black" }}
                    >
                      <option value="" disabled>选择班级</option>
                      {[...activeClusters].sort((a, b) => a.name.localeCompare(b.name)).map((cluster) => (
                        <option key={cluster._id} value={cluster._id}>{cluster.name}</option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* Course Content */}
                <td className="px-2 py-2 border align-top">
                  <textarea
                    value={classItem.content || ""}
                    onChange={(e) => handleInputChange(index, "content", e.target.value)}
                    className="textarea textarea-bordered w-full"
                    style={{
                      backgroundColor: "white",
                      borderColor: "black",
                      color: "black",
                      resize: "none", // Disables manual resizing
                      overflow: "hidden", // Hides overflowed content that doesn't fit
                    }}
                    rows="1" // Starts with one row height
                    onInput={(e) => {
                      e.target.style.height = "auto"; // Reset height
                      e.target.style.height = `${e.target.scrollHeight}px`; // Set height to fit content
                    }}
                  />
                </td>

                {/* Teacher */}
                <td className="px-2 py-2 border align-top">
                  <div style={{ height: "100%" }}>
                    <select
                      value={classItem.teacher || ""}
                      onChange={(e) => handleInputChange(index, "teacher", e.target.value)}
                      className="select select-bordered w-full"
                      style={{ backgroundColor: "white", borderColor: "black", color: "black" }}
                    >
                      <option value="" disabled>选择教师</option>
                      {[...teachers].sort((a, b) => a.username.localeCompare(b.username)).map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>{teacher.username}</option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* Course Type */}
                <td className="px-2 py-2 border align-top">
                  <div style={{ height: "100%" }}>
                    <select
                      value={classItem.type || ""}
                      onChange={(e) => handleInputChange(index, "type", e.target.value)}
                      className="select select-bordered w-full"
                      style={{ backgroundColor: "white", borderColor: "black", color: "black" }}
                    >
                      <option value="" disabled>选择课程</option>
                      {["阅读", "写作", "口语", "听力", "教辅"].sort().map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-2 py-2 border align-top">
                  <div style={{ height: "100%" }}>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDeleteRow(index)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            <tr>
              <td colSpan="8" className="text-right px-2 py-2">
                <button className="btn btn-primary" style={{marginRight: '8px' }}onClick={handleAddRow}>
                  添加行
                </button>
                <button className="btn btn-primary" onClick={handleSaveChanges}>
                  保存更改
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
