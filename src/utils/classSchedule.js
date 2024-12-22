export default class ClassSchedule {
    constructor(config) {
        const data = typeof config === 'string' ? JSON.parse(config) : config;
        this.subjects = data.subjects;
        this.timeTable = data.timeTable;
        this.classes = data.classes;
        this.defaultLocation = data.defaultLocation;
    }
    
    getSubject(day, i) {
        if (day[this.timeTable.classes.indexOf(i)]) return this.subjects[day[this.timeTable.classes.indexOf(i)].subjects[0]];
        return i.default;
    }

    // 将当前实例转换为 JSON 字符串
    toJSON() {
        return JSON.stringify({
            subjects: this.subjects,
            timeTable: this.timeTable,
            classes: this.classes,
            defaultLocation: this.defaultLocation
        }, null, 2);
    }
}