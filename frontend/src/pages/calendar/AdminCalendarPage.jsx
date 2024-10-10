import React, { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import Navbar from "../../components/common/Navbar"; 

const AdminCalendarPage = () => {
  const calendarRef = useRef(null);
  const externalEventsRef = useRef(null);
  const checkboxRef = useRef(null);

  const [selectedEvent, setSelectedEvent] = useState(null); // State for dropdown

  useEffect(() => {
    // Initialize draggable for external events
    new Draggable(externalEventsRef.current, {
      itemSelector: ".fc-event",
      eventData: function(eventEl) {
        return {
          title: eventEl.innerText,
        };
      },
    });
  }, []);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event); // Set the selected event when clicked
  };

  return (
    <div className="w-full">

      <div className="flex flex-col lg:flex-row mt-10">
        {/* Draggable Events */}
        <div id="external-events" ref={externalEventsRef} className="p-5 bg-base-200 rounded shadow-md w-full lg:w-1/4">
          <p className="text-lg font-bold mb-4">Draggable Events</p>
          <div className="fc-event btn btn-outline w-full mb-2">My Event 1</div>
          <div className="fc-event btn btn-outline w-full mb-2">My Event 2</div>
          <div className="fc-event btn btn-outline w-full mb-2">My Event 3</div>
          <div className="fc-event btn btn-outline w-full mb-2">My Event 4</div>
          <div className="fc-event btn btn-outline w-full mb-2">My Event 5</div>
          <p className="mt-4">
            <input type="checkbox" id="drop-remove" ref={checkboxRef} className="checkbox checkbox-primary" />
            <label htmlFor="drop-remove" className="ml-2">Remove after drop</label>
          </p>
        </div>

        {/* Calendar */}
        <div id="calendar-container" className="w-full lg:w-3/4 p-5">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            editable={true}
            droppable={true} // Enable drag-and-drop
            eventClick={handleEventClick} // Handle event clicks
            drop={(info) => {
              // Remove the event from the external list if the checkbox is checked
              if (checkboxRef.current.checked) {
                info.draggedEl.parentNode.removeChild(info.draggedEl);
              }
            }}
          />
        </div>
      </div>

      {/* Event Dropdown */}
      {selectedEvent && (
        <div className="dropdown dropdown-bottom dropdown-end">
          <label tabIndex={0} className="btn btn-secondary m-1">Event: {selectedEvent.title}</label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>Edit Event</a></li>
            <li><a>Delete Event</a></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminCalendarPage;





