export class Calendar {
    constructor() {
        this.version = "2.0";
        this.prodid = ["realtvop", "ClassSchedule2Calendar", "EN"];
        this.calscale = "GREGORIAN";
        this.events = [];
    }
    appendEvent(event) {
        this.events.push(event);
    }
    appendNewEvent(eventInfo) {
        this.events.push(new Event(eventInfo));
    }
    toICSString() {
        let result = `BEGIN:VCALENDAR\nVERSION:${
            this.version
        }\nPRODID:-//${
            this.prodid.join("//")
        }\nCALSCALE:${
            this.calscale
        }`;
        for (const event of this.events) result += `\n${event.toICSString()}\n`;
        result += 'END:VCALENDAR';

        return result;
    }
}

export class Event {
    constructor({
        uid,
        summary,
        dtStartDate,
        dtEndDate,
        alarms = []
    }) {
        this.uid = uid;
        this.summary = summary;
        this.dtStart = dtStartDate.toISOString().replaceAll("-", "").replaceAll(":",  "").slice(0, 15);
        this.dtEnd = dtEndDate.toISOString().replaceAll("-", "").replaceAll(":",  "").slice(0, 15);
        this.alarms = alarms;
    }
    toICSString() {
        let result = "BEGIN:VEVENT";
        result += `\nUID:${this.uid}`;
        result += `\nSUMMARY:${this.summary}`;
        result += `\nDTSTART;TZID=UTC:${this.dtStart}`;
        result += `\nDTEND;TZID=UTC:${this.dtEnd}`;
        
        // Add alarms
        for (const alarm of this.alarms) {
            result += "\nBEGIN:VALARM";
            result += "\nACTION:DISPLAY";
            result += `\nDESCRIPTION:${alarm.description}`;
            result += `\nTRIGGER:${alarm.trigger}`;
            result += "\nEND:VALARM";
        }
        
        result += `\nEND:VEVENT`;
        return result;
    }
}
