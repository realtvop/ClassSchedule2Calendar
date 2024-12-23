import { Calendar } from "./ics.js";

function getCurrentWeekDates() {
    const now = new Date();
    const currentDay = now.getDay();
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - currentDay + 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - currentDay + 6);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
}

function createAlarms(settings, subject, duration) {
    const alarms = [];
    
    // 添加上课前提醒
    if (settings?.beforeClass?.enabled) {
        const seconds = settings.beforeClass.minutes * 60;
        alarms.push({
            description: `即将上课：${subject.name}`,
            trigger: `-PT${seconds}S`
        });
    }
    
    // 添加下课前提醒
    if (settings?.afterClass?.enabled) {
        const beforeEndMinutes = settings.afterClass.minutes;
        const beforeStartMinutes = duration - beforeEndMinutes;
        const seconds = beforeStartMinutes * 60;
        alarms.push({
            description: `即将下课：${subject.name}`,
            trigger: `PT${seconds}S`
        });
    }
    
    return alarms;
}

export function generateIcs(classSchedule, startDate, endDate) {
    const cal = new Calendar();
    
    if (!startDate && !endDate) {
        const { startDate: weekStart, endDate: weekEnd } = getCurrentWeekDates();
        startDate = weekStart;
        endDate = weekEnd;
    }
    
    const startTime = startDate ? startDate.getTime() : 0;
    const endTime = endDate ? endDate.getTime() : Infinity;

    // 获取启用的日期列表
    const enabledDays = classSchedule.timeTable.days;

    for (const day in classSchedule.classes) {
        // 跳过未启用的日期
        if (!enabledDays.includes(Number(day))) continue;
        if (!classSchedule.classes[day]) continue;

        for (const thisClass in classSchedule.classes[day]) {
            const classTime = classSchedule.timeTable.classes[thisClass];

            const dtStartDate = getDateOfWeekWithTime(
                day,
                classTime.startsAt,
            );
            
            if (dtStartDate.getTime() < startTime || dtStartDate.getTime() > endTime) {
                continue;
            }

            const dtEndDate = getDateOfWeekWithTime(
                day,
                classTime.endsAt,
            );

            const subject = classSchedule.getSubject(classSchedule.classes[day], classTime);
            const alarms = createAlarms(classSchedule.settings, subject, classTime.duration);

            cal.appendNewEvent({
                uid: `${dtStartDate.toISOString()}@ClassSchedule`,
                dtStartDate,
                dtEndDate,
                summary: subject.name,
                alarms
            });
        }
    }

    return cal.toICSString();
}

export function downloadIcs(classSchedule, startDate, endDate) {
    const formatDate = date => date.toISOString().split('T')[0];
    const fileName = startDate && endDate ? 
        `课程表_${formatDate(startDate)}_${formatDate(endDate)}.ics` : 
        `课程表_本周.ics`;
        
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([generateIcs(classSchedule, startDate, endDate)], { type: 'text/plain' }));
    link.download = fileName;
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
