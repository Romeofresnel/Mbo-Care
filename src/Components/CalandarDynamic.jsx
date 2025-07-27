import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export default function CalandarDynamic({ appointmentDates = [] }) {
    const currentDateRef = useRef(null);
    const currentDaysRef = useRef(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Fonction pour convertir une date dd/mm/yyyy en objet Date
    const parseAppointmentDate = (dateString) => {
        if (!dateString) return null;
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day); // month - 1 car les mois commencent à 0
    };

    // Fonction pour vérifier si une date a un rendez-vous (seulement les dates futures)
    const hasAppointmentOnDate = (day, month, year) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour comparer seulement les dates

        return appointmentDates.some(dateStr => {
            const appointmentDate = parseAppointmentDate(dateStr);
            if (!appointmentDate) return false;

            // Vérifier si la date correspond
            const dateMatches = appointmentDate.getDate() === day &&
                appointmentDate.getMonth() === month &&
                appointmentDate.getFullYear() === year;

            // Vérifier si la date est dans le futur (après aujourd'hui)
            const isFutureDate = appointmentDate > today;

            return dateMatches && isFutureDate;
        });
    };

    const renderCalendar = () => {
        const currYear = currentDate.getFullYear();
        const currMonth = currentDate.getMonth();
        const months = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];

        const lastDateOfMonth = new Date(currYear, currMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currYear, currMonth, 1).getDay();
        const lastDayOfMonth = new Date(currYear, currMonth, lastDateOfMonth).getDay();
        const lastDateOfLastMonth = new Date(currYear, currMonth, 0).getDate();

        let liTag = "";

        // Jours du mois précédent
        for (let i = firstDayOfMonth; i > 0; i--) {
            const day = lastDateOfLastMonth - i + 1;
            const prevMonth = currMonth - 1;
            const prevYear = prevMonth < 0 ? currYear - 1 : currYear;
            const adjustedMonth = prevMonth < 0 ? 11 : prevMonth;

            const hasAppointment = hasAppointmentOnDate(day, adjustedMonth, prevYear);
            const classes = hasAppointment ? "inactive has-appointment" : "inactive";

            liTag += `<li class="${classes}">${day}</li>`;
        }

        // Jours du mois actuel
        const today = new Date();
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const isToday = i === today.getDate() && currMonth === today.getMonth() && currYear === today.getFullYear();
            const hasAppointment = hasAppointmentOnDate(i, currMonth, currYear);

            let classes = "";
            if (isToday) classes += "active ";
            if (hasAppointment) classes += "has-appointment";

            liTag += `<li class="${classes.trim()}">${i}</li>`;
        }

        // Jours du mois suivant
        const remainingDays = 42 - (firstDayOfMonth + lastDateOfMonth);
        for (let i = 1; i <= remainingDays; i++) {
            const nextMonth = currMonth + 1;
            const nextYear = nextMonth > 11 ? currYear + 1 : currYear;
            const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;

            const hasAppointment = hasAppointmentOnDate(i, adjustedMonth, nextYear);
            const classes = hasAppointment ? "inactive has-appointment" : "inactive";

            liTag += `<li class="${classes}">${i}</li>`;
        }

        if (currentDateRef.current) {
            currentDateRef.current.innerText = `${months[currMonth]} ${currYear}`;
        }
        if (currentDaysRef.current) {
            currentDaysRef.current.innerHTML = liTag;
        }
    };

    useEffect(() => {
        renderCalendar();
    }, [currentDate, appointmentDates]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <>
            <div className='wrapper'>
                <header>
                    <p ref={currentDateRef} className='current-date'></p>
                    <div className='icons'>
                        <span onClick={handlePrevMonth}>
                            <ChevronLeft />
                        </span>
                        <span onClick={handleNextMonth}>
                            <ChevronRight />
                        </span>
                    </div>
                </header>
                <div className='calandar'>
                    <ul className='weeks'>
                        <li>Dim</li>
                        <li>Lun</li>
                        <li>Mar</li>
                        <li>Mer</li>
                        <li>Jeu</li>
                        <li>Ven</li>
                        <li>Sam</li>
                    </ul>
                    <ul ref={currentDaysRef} className='days'>
                    </ul>
                </div>
            </div>
        </>
    )
}