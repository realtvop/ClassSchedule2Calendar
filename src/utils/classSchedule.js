export default class ClassSchedule {
    constructor(config) {
        const data = typeof config === 'string' ? JSON.parse(config) : config;
        this.subjects = data.subjects;
        this.timeTable = data.timeTable;
        this.classes = data.classes;
        this.defaultLocation = data.defaultLocation;
        this.settings = data.settings;
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
            defaultLocation: this.defaultLocation,
            settings: this.settings
        }, null, 2);
    }

    // 导出课程表到文件
    export(format = 'json') {
        if (format === 'csv') {
            return this.exportCSV();
        }
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

    // 导出为CSV格式
    exportCSV() {
        // 生成CSV表头
        let csv = '时间,';
        this.timeTable.days.forEach(day => {
            csv += `周${['日', '一', '二', '三', '四', '五', '六'][day]},`;
        });
        csv = csv.slice(0, -1) + '\n';

        // 生成每节课的数据
        this.timeTable.classes.forEach((classTime, index) => {
            // 添加时间
            csv += `${this.formatTime(classTime.startsAt)}-${this.formatTime(classTime.endsAt)},`;
            
            // 添加每天的课程
            this.timeTable.days.forEach(day => {
                const classData = this.classes[day]?.[index];
                if (classData && classData.subjects && classData.subjects.length > 0) {
                    const subjectKey = classData.subjects[0];
                    const subject = this.subjects[subjectKey];
                    csv += subject.name;
                }
                csv += ',';
            });
            csv = csv.slice(0, -1) + '\n';
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'class_schedule.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 格式化时间为字符串
    formatTime([hours, minutes]) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // 从文件导入课程表
    static async import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result.trim();
                    // 检查内容是否以花括号开头来判断是否为 JSON
                    if (content.startsWith('{')) {
                        const data = JSON.parse(content);
                        if (data.timeTable && data.classes && data.subjects) {
                            resolve(new ClassSchedule(data));
                        } else {
                            reject(new Error('Invalid schedule format'));
                        }
                    } else {
                        resolve(this.importCSV(content));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // 从CSV导入课程表
    static importCSV(csvContent) {
        // 生成UUID
        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        // 移除 BOM 标记
        csvContent = csvContent.replace(/^\ufeff/, '');
        const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
        
        // 解析表头获取星期
        const headers = lines[0].split(',').map(h => h.trim());
        const days = headers.slice(1).map(day => {
            const match = day.match(/周([日一二三四五六])/);
            if (!match) return null;
            return ['日', '一', '二', '三', '四', '五', '六'].indexOf(match[1]);
        }).filter(day => day !== null);

        // 初始化数据结构
        const timeTable = {
            name: "Weekdays",
            days: days,
            classes: []
        };

        // 创建一个最大长度为7的数组，用null填充
        const classes = new Array(7).fill(null);

        // 创建基础科目
        const subjects = {};
        const ssId = generateUUID();
        subjects[ssId] = { 
            "name": "自习", 
            "teacher": null, 
            "location": null 
        };
        const subjectMap = new Map();

        // 为每个工作日创建课程数组
        days.forEach(day => {
            classes[day] = [];
        });

        // 解析每行数据
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;

            const cells = line.split(',').map(cell => cell.trim());
            if (cells.length < days.length + 1) continue;

            // 解析时间
            const [timeStr, ...subjectCells] = cells;
            const [startTime, endTime] = timeStr.split('-').map(t => t.trim());
            if (!startTime || !endTime) continue;

            const parseTimeStr = (timeStr) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return [hours || 0, minutes || 0];
            };

            const startsAt = parseTimeStr(startTime);
            const endsAt = parseTimeStr(endTime);

            // 添加时间段
            timeTable.classes.push({
                name: null,
                startsAt,
                endsAt
            });

            // 处理每天的课程
            days.forEach((day, index) => {
                const subjectName = subjectCells[index];
                let subjectKey = ssId; // 默认使用自习的UUID

                if (subjectName && subjectName.length > 0) {
                    if (!subjectMap.has(subjectName)) {
                        subjectKey = generateUUID();
                        subjectMap.set(subjectName, subjectKey);
                        subjects[subjectKey] = {
                            name: subjectName,
                            teacher: null,
                            location: null
                        };
                    } else {
                        subjectKey = subjectMap.get(subjectName);
                    }
                }

                classes[day].push({
                    type: 0,
                    subjects: [subjectKey]
                });
            });
        }

        // 返回新的课程表实例，完全重置所有设置
        return new ClassSchedule({
            subjects,         // 使用新生成的带UUID的科目
            timeTable,       // 使用从CSV解析的时间表
            classes,         // 使用新生成的课程安排（数组格式）
            defaultLocation: null  // 重置默认位置
        });
    }
}