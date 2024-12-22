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

    // 导出课程表到文件
    export() {
        const blob = new Blob([this.toJSON()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'class_schedule.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 从文件导入课程表
    static async import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.timeTable && data.classes && data.subjects) {
                        resolve(new ClassSchedule(data));
                    } else {
                        reject(new Error('Invalid schedule format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}