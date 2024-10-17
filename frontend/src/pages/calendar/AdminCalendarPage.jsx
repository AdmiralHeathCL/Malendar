import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const AdminCalendarPage = () => {
  const calendarRef = useRef(null);
  const [classData, setClassData] = useState({});
  const [currentViewDate, setCurrentViewDate] = useState(""); // State to track the date in the current view
  const [newClass, setNewClass] = useState({
    classroom: "",
    className: "",
    content: "",
    teacher: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    // Set the initial date based on the current view in the calendar
    const calendarApi = calendarRef.current.getApi();
    setCurrentViewDate(calendarApi.getDate().toISOString().split("T")[0]);
  }, []);

  const handleDatesSet = (arg) => {
    // Update the current date whenever the view changes
    setCurrentViewDate(arg.startStr.split("T")[0]);
  };

  const handleInputChange = (e) => {
    setNewClass({ ...newClass, [e.target.name]: e.target.value });
  };

  const handleAddClass = () => {
    if (!newClass.startTime) return;

    const start = `${currentViewDate}T${newClass.startTime}`;
    const end = newClass.endTime
      ? `${currentViewDate}T${newClass.endTime}`
      : `${currentViewDate}T${String(Number(newClass.startTime.split(":")[0]) + 2).padStart(2, "0")}:${newClass.startTime.split(":")[1]}`;

    setClassData((prevData) => {
      const existingClasses = prevData[start] || [];
      return {
        ...prevData,
        [start]: [...existingClasses, { ...newClass, start, end }],
      };
    });

    // Reset the input fields
    setNewClass({
      classroom: "",
      className: "",
      content: "",
      teacher: "",
      startTime: "",
      endTime: "",
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mt-10">
        {/* Form for adding new class data */}
        <div className="w-full lg:w-1/4 p-5 bg-base-200 rounded shadow-md">
          <p className="text-lg font-bold mb-4">Add Class</p>

          <select
            name="classroom"
            value={newClass.classroom}
            onChange={handleInputChange}
            className="select select-bordered w-full mb-2"
          >
            <option value="" disabled>Select Classroom</option>
            <option value="VIP1">VIP1</option>
            <option value="VIP2">VIP2</option>
            <option value="VIP3">VIP3</option>
            {/* Add more classrooms as needed */}
          </select>

          <select
            name="className"
            value={newClass.className}
            onChange={handleInputChange}
            className="select select-bordered w-full mb-2"
          >
            <option value="" disabled>Select Class Name</option>
            <option value="雅思强化">雅思强化</option>
            <option value="剑桥英语">剑桥英语</option>
            {/* Add more class names as needed */}
          </select>

          <input
            type="text"
            name="content"
            value={newClass.content}
            onChange={handleInputChange}
            placeholder="Class Content"
            className="input input-bordered w-full mb-2"
          />

          <select
            name="teacher"
            value={newClass.teacher}
            onChange={handleInputChange}
            className="select select-bordered w-full mb-2"
          >
            <option value="" disabled>Select Teacher</option>
            <option value="Zoe">Zoe</option>
            <option value="Cathy">Cathy</option>
            <option value="Brian">Brian</option>
            {/* Add more teachers as needed */}
          </select>

          <div className="flex gap-2">
            <div className="flex-1">
              <label>Start Time:</label>
              <input
                type="time"
                name="startTime"
                value={newClass.startTime}
                onChange={handleInputChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex-1">
              <label>End Time:</label>
              <input
                type="time"
                name="endTime"
                value={newClass.endTime}
                onChange={handleInputChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <button className="btn btn-primary w-full mt-4" onClick={handleAddClass}>
            Add
          </button>
        </div>

        {/* Calendar */}
        <div id="calendar-container" className="w-full lg:w-3/4 p-5">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            editable={false}
            droppable={false} 
            datesSet={handleDatesSet} // Track the current view's date
            events={Object.entries(classData).flatMap(([start, events]) =>
              events.map((event) => ({
                title: `${event.className} - ${event.teacher}`,
                start: event.start,
                end: event.end,
                extendedProps: {
                  content: event.content,
                  classroom: event.classroom,
                },
              }))
            )}
            eventContent={(arg) => (
              <div className="p-2 shadow rounded">
                <b>{arg.event.extendedProps.classroom}</b>
                <div>{arg.event.title}</div>
                <div>{arg.event.extendedProps.content}</div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminCalendarPage;




