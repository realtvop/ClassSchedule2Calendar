import { Calendar, Event } from "./ics.js";

export function generateIcs(classSchedule) {
    const cal = new Calendar();

    for (const day in classSchedule.classes) {
        if (!classSchedule.classes[day]) continue;

        for (const thisClass in classSchedule.classes[day]) {
            const classTime = classSchedule.timeTable.classes[thisClass];

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
                summary: classSchedule.getSubject(classSchedule.classes[day], classTime).name,
            })
        }
    }

    return cal.toICSString();
}

export function downloadIcs(classSchedule) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([generateIcs(classSchedule)], { type: 'text/plain' }));
    link.download = `fuck.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
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
