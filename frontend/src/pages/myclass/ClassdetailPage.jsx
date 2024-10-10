import React, { useRef, useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Navbar from '../../components/common/Navbar';

const ClassDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="w-full">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Class Details for Class ID: {id}</h1>
      </div>

      <div className="flex flex-col lg:flex-row mt-1 items-center justify-center">
        <div id="calendar-container" className="w-full lg:w-3/4 p-5">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;
