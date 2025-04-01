"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Home } from "lucide-react"

type Event = {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  isHotelBooking?: boolean
  kennelId?: string
  kennelSize?: "small" | "large"
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
  })
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  useEffect(() => {
    // Load events from localStorage
    const savedEvents = localStorage.getItem("calendarEvents")
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }
  }, [])

  const saveEvents = (updatedEvents: Event[]) => {
    localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))
    setEvents(updatedEvents)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowEventForm(true)
  }

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDate && newEvent.title) {
      const dateStr = selectedDate.toISOString().split("T")[0]
      const newEventObj: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description,
        date: dateStr,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
      }

      const updatedEvents = [...events, newEventObj]
      saveEvents(updatedEvents)

      setNewEvent({ title: "", description: "", startTime: "09:00", endTime: "10:00" })
      setShowEventForm(false)
    }
  }

  const hasEventOnDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return events.some((event) => event.date === dateStr)
  }

  const hasHotelBookingOnDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return events.some((event) => event.date === dateStr && event.isHotelBooking)
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return events.filter((event) => event.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const handleDeleteEvent = (eventId: string) => {
    // Check if this is a hotel booking
    const eventToDelete = events.find((event) => event.id === eventId)

    if (eventToDelete?.isHotelBooking) {
      if (!confirm("This is a hotel booking. Deleting it here will not remove the actual hotel booking. Continue?")) {
        return
      }
    }

    const updatedEvents = events.filter((event) => event.id !== eventId)
    saveEvents(updatedEvents)
  }

  // Format time from 24h to 12h format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Format time range
  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }

  // Calendar generation logic
  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay()

    // Total days in the month
    const daysInMonth = lastDay.getDate()

    // Calendar rows
    const rows = []
    let days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push(date)

      // Start a new row every 7 days
      if ((firstDayOfWeek + day) % 7 === 0 || day === daysInMonth) {
        rows.push(days)
        days = []
      }
    }

    // If the last row is not complete, add empty cells
    if (days.length > 0) {
      while (days.length < 7) {
        days.push(null)
      }
      rows.push(days)
    }

    return rows
  }

  const calendar = generateCalendar()
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link
          href="/"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Dashboard
        </Link>
        <h2 className="text-2xl font-semibold">My Calendar</h2>
        <div></div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendar.flat().map((date, index) => (
            <div key={index} className="aspect-square relative">
              {date ? (
                <>
                  <button
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                    className={`w-full h-full flex flex-col items-center justify-center rounded-lg border ${
                      hasHotelBookingOnDate(date)
                        ? "bg-purple-100 border-purple-300 hover:bg-purple-200"
                        : hasEventOnDate(date)
                          ? "bg-blue-100 border-blue-300 hover:bg-blue-200"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-sm font-medium">{date.getDate()}</span>
                    {hasEventOnDate(date) && (
                      <div className="mt-1 flex space-x-1">
                        {hasHotelBookingOnDate(date) && <div className="w-2 h-2 rounded-full bg-purple-500"></div>}
                        {events.filter((e) => e.date === date.toISOString().split("T")[0] && !e.isHotelBooking).length >
                          0 && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                      </div>
                    )}
                  </button>

                  {/* Hover tooltip */}
                  {hoverDate && date.getTime() === hoverDate.getTime() && hasEventOnDate(date) && (
                    <div className="absolute z-10 w-64 bg-white border rounded-md shadow-lg p-3 top-full left-1/2 transform -translate-x-1/2 mt-1">
                      <h4 className="font-medium text-sm mb-2">Events on {date.toLocaleDateString()}</h4>
                      <div className="max-h-48 overflow-y-auto">
                        {getEventsForDate(date).map((event) => (
                          <div
                            key={event.id}
                            className={`mb-2 pb-2 border-b last:border-b-0 last:mb-0 last:pb-0 ${
                              event.isHotelBooking ? "bg-purple-50 p-2 rounded" : ""
                            }`}
                          >
                            <p className="font-medium text-sm flex items-center">
                              {event.isHotelBooking && <Home className="h-3 w-3 mr-1 text-purple-500" />}
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-600">{formatTimeRange(event.startTime, event.endTime)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Events for {selectedDate.toLocaleDateString()}</h3>

          {getEventsForDate(selectedDate).length > 0 ? (
            <div className="space-y-4 mb-6">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className={`p-4 border rounded-lg ${event.isHotelBooking ? "border-purple-300 bg-purple-50" : ""}`}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium flex items-center">
                      {event.isHotelBooking && <Home className="h-4 w-4 mr-1 text-purple-500" />}
                      {event.title}
                      {event.isHotelBooking && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          Hotel Booking
                        </span>
                      )}
                    </h4>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={event.isHotelBooking}
                      title={
                        event.isHotelBooking ? "Hotel bookings must be deleted from the Hotel page" : "Delete event"
                      }
                    >
                      {!event.isHotelBooking && "Delete"}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{formatTimeRange(event.startTime, event.endTime)}</p>
                  {event.description && <p className="text-gray-600 mt-2">{event.description}</p>}
                  {event.isHotelBooking && event.kennelSize && (
                    <p className="text-xs text-purple-600 mt-1">
                      {event.kennelSize.charAt(0).toUpperCase() + event.kennelSize.slice(1)} Kennel
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-6">No events scheduled for this day.</p>
          )}

          {showEventForm ? (
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Event Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Event
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowEventForm(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add New Event
            </button>
          )}
        </div>
      )}
    </div>
  )
}

