"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Minus, X } from "lucide-react"
import Link from "next/link"

type BookingInfo = {
  dogName: string
  contactPerson: string
  contactNumber: string
  checkInDate: string
  checkOutDate: string
}

type Kennel = {
  id: string
  size: "small" | "large"
  isOccupied: boolean
  bookingInfo?: BookingInfo
  calendarEventId?: string // Add reference to calendar event
}

type BookingHistoryItem = BookingInfo & {
  id: string
  kennelSize: "small" | "large"
  completedDate: string
  calendarEventId?: string // Add reference to calendar event
}

// Calendar event type (shared with calendar page)
type Event = {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  isHotelBooking?: boolean // Flag to identify hotel bookings
  kennelId?: string // Reference to kennel
  kennelSize?: "small" | "large" // Size of kennel
}

export default function HotelPage() {
  const [smallKennels, setSmallKennels] = useState<Kennel[]>([])
  const [largeKennels, setLargeKennels] = useState<Kennel[]>([])
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>([])
  const [selectedKennel, setSelectedKennel] = useState<Kennel | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingInfo, setBookingInfo] = useState<BookingInfo>({
    dogName: "",
    contactPerson: "",
    contactNumber: "",
    checkInDate: "",
    checkOutDate: "",
  })

  // Initialize kennels and booking history on first load
  useEffect(() => {
    const savedSmallKennels = localStorage.getItem("smallKennels")
    const savedLargeKennels = localStorage.getItem("largeKennels")
    const savedBookingHistory = localStorage.getItem("bookingHistory")

    if (savedSmallKennels) {
      setSmallKennels(JSON.parse(savedSmallKennels))
    } else {
      // Create 5 initial small kennels
      const initialSmallKennels = Array.from({ length: 5 }, (_, index) => ({
        id: `small-${Date.now()}-${index}`,
        size: "small" as const,
        isOccupied: false,
      }))
      setSmallKennels(initialSmallKennels)
    }

    if (savedLargeKennels) {
      setLargeKennels(JSON.parse(savedLargeKennels))
    } else {
      // Create 5 initial large kennels
      const initialLargeKennels = Array.from({ length: 5 }, (_, index) => ({
        id: `large-${Date.now()}-${index}`,
        size: "large" as const,
        isOccupied: false,
      }))
      setLargeKennels(initialLargeKennels)
    }

    if (savedBookingHistory) {
      setBookingHistory(JSON.parse(savedBookingHistory))
    }
  }, [])

  // Check for expired bookings and update kennels
  useEffect(() => {
    const checkExpiredBookings = () => {
      const today = new Date().toISOString().split("T")[0]
      let hasExpiredBookings = false
      const updatedHistory: BookingHistoryItem[] = [...bookingHistory]
      let calendarEvents = getCalendarEvents()

      // Check small kennels
      const updatedSmallKennels = smallKennels.map((kennel) => {
        if (kennel.isOccupied && kennel.bookingInfo && kennel.bookingInfo.checkOutDate <= today) {
          // Add to history
          if (kennel.bookingInfo) {
            updatedHistory.push({
              ...kennel.bookingInfo,
              id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              kennelSize: "small",
              completedDate: today,
              calendarEventId: kennel.calendarEventId,
            })
          }

          // Remove from calendar if there's a linked event
          if (kennel.calendarEventId) {
            calendarEvents = calendarEvents.filter((event) => event.id !== kennel.calendarEventId)
            saveCalendarEvents(calendarEvents)
          }

          hasExpiredBookings = true
          return { ...kennel, isOccupied: false, bookingInfo: undefined, calendarEventId: undefined }
        }
        return kennel
      })

      // Check large kennels
      const updatedLargeKennels = largeKennels.map((kennel) => {
        if (kennel.isOccupied && kennel.bookingInfo && kennel.bookingInfo.checkOutDate <= today) {
          // Add to history
          if (kennel.bookingInfo) {
            updatedHistory.push({
              ...kennel.bookingInfo,
              id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              kennelSize: "large",
              completedDate: today,
              calendarEventId: kennel.calendarEventId,
            })
          }

          // Remove from calendar if there's a linked event
          if (kennel.calendarEventId) {
            calendarEvents = calendarEvents.filter((event) => event.id !== kennel.calendarEventId)
            saveCalendarEvents(calendarEvents)
          }

          hasExpiredBookings = true
          return { ...kennel, isOccupied: false, bookingInfo: undefined, calendarEventId: undefined }
        }
        return kennel
      })

      if (hasExpiredBookings) {
        setSmallKennels(updatedSmallKennels)
        setLargeKennels(updatedLargeKennels)
        setBookingHistory(updatedHistory)
      }
    }

    // Check on initial load and set up interval
    checkExpiredBookings()
    const interval = setInterval(checkExpiredBookings, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [smallKennels, largeKennels, bookingHistory])

  // Save kennels and booking history to localStorage whenever they change
  useEffect(() => {
    if (smallKennels.length > 0) {
      localStorage.setItem("smallKennels", JSON.stringify(smallKennels))
    }
    if (largeKennels.length > 0) {
      localStorage.setItem("largeKennels", JSON.stringify(largeKennels))
    }
    localStorage.setItem("bookingHistory", JSON.stringify(bookingHistory))
  }, [smallKennels, largeKennels, bookingHistory])

  // Helper functions for calendar integration
  const getCalendarEvents = (): Event[] => {
    const savedEvents = localStorage.getItem("calendarEvents")
    return savedEvents ? JSON.parse(savedEvents) : []
  }

  const saveCalendarEvents = (events: Event[]) => {
    localStorage.setItem("calendarEvents", JSON.stringify(events))
  }

  const createCalendarEvent = (kennel: Kennel, bookingInfo: BookingInfo): string => {
    const events = getCalendarEvents()

    // Create a new event ID
    const eventId = `hotel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create the calendar event
    const newEvent: Event = {
      id: eventId,
      title: `Hotel: ${bookingInfo.dogName} (${kennel.size})`,
      description: `Dog Hotel Booking\nContact: ${bookingInfo.contactPerson} (${bookingInfo.contactNumber})`,
      date: bookingInfo.checkInDate,
      startTime: "09:00", // Default check-in time
      endTime: "17:00", // Default check-out time
      isHotelBooking: true,
      kennelId: kennel.id,
      kennelSize: kennel.size,
    }

    // Add to calendar events
    events.push(newEvent)
    saveCalendarEvents(events)

    return eventId
  }

  const updateCalendarEvent = (eventId: string, kennel: Kennel, bookingInfo: BookingInfo) => {
    const events = getCalendarEvents()
    const eventIndex = events.findIndex((event) => event.id === eventId)

    if (eventIndex !== -1) {
      // Update the existing event
      events[eventIndex] = {
        ...events[eventIndex],
        title: `Hotel: ${bookingInfo.dogName} (${kennel.size})`,
        description: `Dog Hotel Booking\nContact: ${bookingInfo.contactPerson} (${bookingInfo.contactNumber})`,
        date: bookingInfo.checkInDate,
        kennelId: kennel.id,
        kennelSize: kennel.size,
      }

      saveCalendarEvents(events)
    }
  }

  const deleteCalendarEvent = (eventId: string) => {
    const events = getCalendarEvents()
    const updatedEvents = events.filter((event) => event.id !== eventId)
    saveCalendarEvents(updatedEvents)
  }

  const addKennel = (size: "small" | "large") => {
    const newKennel = {
      id: `${size}-${Date.now()}`,
      size,
      isOccupied: false,
    }

    if (size === "small") {
      setSmallKennels([...smallKennels, newKennel])
    } else {
      setLargeKennels([...largeKennels, newKennel])
    }
  }

  const removeKennel = (size: "small" | "large") => {
    if (size === "small" && smallKennels.length > 0) {
      // Find the last unoccupied kennel to remove
      const lastUnoccupiedIndex = [...smallKennels].reverse().findIndex((k) => !k.isOccupied)

      if (lastUnoccupiedIndex !== -1) {
        const indexToRemove = smallKennels.length - 1 - lastUnoccupiedIndex
        setSmallKennels(smallKennels.filter((_, index) => index !== indexToRemove))
      } else {
        alert("Cannot remove occupied kennels")
      }
    } else if (size === "large" && largeKennels.length > 0) {
      // Find the last unoccupied kennel to remove
      const lastUnoccupiedIndex = [...largeKennels].reverse().findIndex((k) => !k.isOccupied)

      if (lastUnoccupiedIndex !== -1) {
        const indexToRemove = largeKennels.length - 1 - lastUnoccupiedIndex
        setLargeKennels(largeKennels.filter((_, index) => index !== indexToRemove))
      } else {
        alert("Cannot remove occupied kennels")
      }
    }
  }

  const handleKennelClick = (kennel: Kennel) => {
    setSelectedKennel(kennel)

    if (kennel.isOccupied && kennel.bookingInfo) {
      // Pre-fill form with existing booking info
      setBookingInfo(kennel.bookingInfo)
    } else {
      // Reset form for new booking
      setBookingInfo({
        dogName: "",
        contactPerson: "",
        contactNumber: "",
        checkInDate: "",
        checkOutDate: "",
      })
    }

    setShowBookingForm(true)
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedKennel) return

    let calendarEventId = selectedKennel.calendarEventId

    // If this is a new booking or an update without an existing calendar event
    if (!calendarEventId) {
      calendarEventId = createCalendarEvent(selectedKennel, bookingInfo)
    } else {
      // Update existing calendar event
      updateCalendarEvent(calendarEventId, selectedKennel, bookingInfo)
    }

    const updatedKennel = {
      ...selectedKennel,
      isOccupied: true,
      bookingInfo,
      calendarEventId,
    }

    if (selectedKennel.size === "small") {
      setSmallKennels(smallKennels.map((k) => (k.id === selectedKennel.id ? updatedKennel : k)))
    } else {
      setLargeKennels(largeKennels.map((k) => (k.id === selectedKennel.id ? updatedKennel : k)))
    }

    setShowBookingForm(false)
    setSelectedKennel(null)
  }

  const handleDeleteBooking = () => {
    if (!selectedKennel) return

    // Remove from calendar if there's a linked event
    if (selectedKennel.calendarEventId) {
      deleteCalendarEvent(selectedKennel.calendarEventId)
    }

    // Add to history before deleting
    if (selectedKennel.bookingInfo) {
      const historyItem: BookingHistoryItem = {
        ...selectedKennel.bookingInfo,
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        kennelSize: selectedKennel.size,
        completedDate: new Date().toISOString().split("T")[0],
        calendarEventId: selectedKennel.calendarEventId,
      }
      setBookingHistory([...bookingHistory, historyItem])
    }

    const updatedKennel = {
      ...selectedKennel,
      isOccupied: false,
      bookingInfo: undefined,
      calendarEventId: undefined,
    }

    if (selectedKennel.size === "small") {
      setSmallKennels(smallKennels.map((k) => (k.id === selectedKennel.id ? updatedKennel : k)))
    } else {
      setLargeKennels(largeKennels.map((k) => (k.id === selectedKennel.id ? updatedKennel : k)))
    }

    setShowBookingForm(false)
    setSelectedKennel(null)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link
          href="/"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Dashboard
        </Link>
        <h2 className="text-2xl font-semibold">Dog Hotel Vacancies</h2>
        <div></div>
      </div>

      {/* Small Kennels Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Small Dog Kennels</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => addKennel("small")}
              className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
              aria-label="Add small kennel"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => removeKennel("small")}
              className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
              aria-label="Remove small kennel"
              disabled={smallKennels.length === 0}
            >
              <Minus size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {smallKennels.map((kennel) => (
            <button
              key={kennel.id}
              onClick={() => handleKennelClick(kennel)}
              className={`aspect-square w-full rounded-lg border-2 flex items-center justify-center transition-colors ${
                kennel.isOccupied
                  ? "bg-red-100 border-red-500 hover:bg-red-200"
                  : "bg-green-100 border-green-500 hover:bg-green-200"
              }`}
            >
              <div className="text-center">
                <div className="w-8 h-8 mx-auto"></div>
                {kennel.isOccupied && kennel.bookingInfo && (
                  <p className="text-sm font-bold truncate max-w-[90px] mx-auto">{kennel.bookingInfo.dogName}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Large Kennels Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Large Dog Kennels</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => addKennel("large")}
              className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
              aria-label="Add large kennel"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => removeKennel("large")}
              className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
              aria-label="Remove large kennel"
              disabled={largeKennels.length === 0}
            >
              <Minus size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {largeKennels.map((kennel) => (
            <button
              key={kennel.id}
              onClick={() => handleKennelClick(kennel)}
              className={`aspect-square w-full rounded-lg border-2 flex items-center justify-center transition-colors ${
                kennel.isOccupied
                  ? "bg-red-100 border-red-500 hover:bg-red-200"
                  : "bg-green-100 border-green-500 hover:bg-green-200"
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto"></div>
                {kennel.isOccupied && kennel.bookingInfo && (
                  <p className="text-sm font-bold truncate max-w-[110px] mx-auto">{kennel.bookingInfo.dogName}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedKennel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {selectedKennel.isOccupied ? "Edit Booking" : "New Booking"} -{" "}
                {selectedKennel.size.charAt(0).toUpperCase() + selectedKennel.size.slice(1)} Kennel
              </h3>
              <button onClick={() => setShowBookingForm(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label htmlFor="dogName" className="block text-sm font-medium text-gray-700">
                  Dog Name
                </label>
                <input
                  type="text"
                  id="dogName"
                  value={bookingInfo.dogName}
                  onChange={(e) => setBookingInfo({ ...bookingInfo, dogName: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  value={bookingInfo.contactPerson}
                  onChange={(e) => setBookingInfo({ ...bookingInfo, contactPerson: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  value={bookingInfo.contactNumber}
                  onChange={(e) => setBookingInfo({ ...bookingInfo, contactNumber: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    id="checkInDate"
                    value={bookingInfo.checkInDate}
                    onChange={(e) => setBookingInfo({ ...bookingInfo, checkInDate: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    id="checkOutDate"
                    value={bookingInfo.checkOutDate}
                    onChange={(e) => setBookingInfo({ ...bookingInfo, checkOutDate: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                {selectedKennel.isOccupied && (
                  <button
                    type="button"
                    onClick={handleDeleteBooking}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Booking
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {selectedKennel.isOccupied ? "Update Booking" : "Schedule Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Current Bookings Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Current Bookings</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kennel
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Dog Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-in
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-out
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...smallKennels, ...largeKennels]
                .filter((kennel) => kennel.isOccupied && kennel.bookingInfo)
                .map((kennel) => (
                  <tr key={kennel.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {kennel.size.charAt(0).toUpperCase() + kennel.size.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {kennel.bookingInfo?.dogName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {kennel.bookingInfo?.contactPerson} ({kennel.bookingInfo?.contactNumber})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {kennel.bookingInfo?.checkInDate && formatDate(kennel.bookingInfo.checkInDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {kennel.bookingInfo?.checkOutDate && formatDate(kennel.bookingInfo.checkOutDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleKennelClick(kennel)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}

              {[...smallKennels, ...largeKennels].filter((kennel) => kennel.isOccupied).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No current bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking History Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Booking History</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kennel Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Dog Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-in
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-out
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookingHistory
                .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
                .map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.kennelSize.charAt(0).toUpperCase() + booking.kennelSize.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{booking.dogName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.contactPerson} ({booking.contactNumber})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.checkInDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.checkOutDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.completedDate)}
                    </td>
                  </tr>
                ))}

              {bookingHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No booking history
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

