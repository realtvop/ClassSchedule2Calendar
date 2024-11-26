import { Calendar, Event } from "./ics.js";

export function generateIcs(timeTable, classList) {
    const cal = new Calendar();

    for (const day in classList) {
        if (!classList[day]) continue;

        for (const thisClass in classList[day]) {
            const classTime = timeTable.classes[thisClass];

            const dtStartDate = getDateOfWeekWithTime(
                day,
                classTime.startsAt,
            );
            const dtEndDate = getDateOfWeekWithTime(
                day,
                classTime.endsAt,
            );

            cal.appendNewEvent({
                uid: `${dtStartDate.toISOString()}@ClassSchedule`,
                dtStartDate,
                dtEndDate,
                summary: classList[day][thisClass].subjects[0],
            })
        }
    }

    return cal.toICSString();
}

function getDateOfWeekWithTime(targetWeekday, time) {
    const now = new Date();
    const currentWeekday = now.getDay();
    const diff = targetWeekday - currentWeekday;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    targetDate.setHours(time[0], time[1], 0);
    return targetDate;
}
