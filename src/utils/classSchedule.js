export default class ClassSchedule {
    constructor({
                    subjects
    }) {
        this.subjects = subjects;
        this.timeTable =
            {
                name: "Weekdays",
                days: [1, 2, 3, 4, 5],
                classes: [
                    { name: null, startsAt: [ 7, 10], endsAt: [ 7, 40] },
                    { name: null, startsAt: [ 7, 45], endsAt: [ 8, 25] },
                    { name: null, startsAt: [ 8, 35], endsAt: [ 9, 15] },
                    { name: null, startsAt: [ 9, 45], endsAt: [10, 25] },
                    { name: null, startsAt: [10, 35], endsAt: [11, 15] },
                    { name: null, startsAt: [11, 25], endsAt: [12,  5] },

                    { name: null, startsAt: [14, 10], endsAt: [14, 50] },
                    { name: null, startsAt: [15,  0], endsAt: [15, 40] },
                    { name: null, startsAt: [15, 55], endsAt: [16, 35] },
                    { name: null, startsAt: [16, 40], endsAt: [17, 20] },

                    { name: null, startsAt: [18, 50], endsAt: [20, 20], default: "第一节晚自习" },
                    { name: null, startsAt: [20, 35], endsAt: [22, 10], default: "第二节晚自习" },
                ]
            };
        this.classes = [
            null,
            [ { type: 0, subjects: [this.subjects.eng] }, { type: 0, subjects: [this.subjects.chn] }, { type: 0, subjects: [this.subjects.phy] }, { type: 0, subjects: [this.subjects.mth] }, { type: 0, subjects: [this.subjects.eng] }, { type: 0, subjects: [this.subjects.mus] }, { type: 0, subjects: [this.subjects.ss] }, { type: 0, subjects: [this.subjects.bio] }, { type: 0, subjects: [this.subjects.ity] }, { type: 0, subjects: [this.subjects.td] }, ],
            [ { type: 0, subjects: [this.subjects.chn] }, { type: 0, subjects: [this.subjects.eng] }, { type: 0, subjects: [this.subjects.chn] }, { type: 0, subjects: [this.subjects.mth] }, { type: 0, subjects: [this.subjects.mth] }, { type: 0, subjects: [this.subjects.phe] }, { type: 0, subjects: [this.subjects.his] }, { type: 0, subjects: [this.subjects.geo] }, { type: 0, subjects: [this.subjects.chs] }, { type: 0, subjects: [this.subjects.phyExam] }, ],
        ]
    }
    getSubject(day, i) {
        if (day[this.timeTable.classes.indexOf(i)]) return day[this.timeTable.classes.indexOf(i)].subjects[0];
        return i.default;
    }
}