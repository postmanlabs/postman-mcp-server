export class TestDataFactory {
    static TEST_CALENDAR_ID = process.env.TEST_CALENDAR_ID || 'primary';
    createdEventIds = [];
    createdWorkspaceIds = [];
    performanceMetrics = [];
    static getTestCalendarId() {
        return TestDataFactory.TEST_CALENDAR_ID;
    }
    static createWorkspace(overrides = {}) {
        return {
            name: '[Integration Test] Test Workspace',
            description: 'Created by integration test suite',
            type: 'personal',
            ...overrides,
        };
    }
    static formatDateTimeRFC3339(date) {
        const isoString = date.toISOString();
        return isoString.replace(/\.\d{3}Z$/, '');
    }
    static formatDateTimeRFC3339WithTimezone(date) {
        return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
    }
    static createSingleEvent(overrides = {}) {
        const now = new Date();
        const start = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        return {
            summary: 'Test Integration Event',
            description: 'Created by integration test suite',
            start: this.formatDateTimeRFC3339(start),
            end: this.formatDateTimeRFC3339(end),
            timeZone: 'America/Los_Angeles',
            location: 'Test Conference Room',
            reminders: {
                useDefault: false,
                overrides: [{ method: 'popup', minutes: 15 }],
            },
            ...overrides,
        };
    }
    static createAllDayEvent(overrides = {}) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);
        dayAfter.setHours(0, 0, 0, 0);
        return {
            summary: 'Test All-Day Event',
            description: 'All-day test event',
            start: this.formatDateTimeRFC3339(tomorrow),
            end: this.formatDateTimeRFC3339(dayAfter),
            timeZone: 'America/Los_Angeles',
            ...overrides,
        };
    }
    static createRecurringEvent(overrides = {}) {
        const start = new Date();
        start.setDate(start.getDate() + 1);
        start.setHours(10, 0, 0, 0);
        const end = new Date(start);
        end.setHours(11, 0, 0, 0);
        return {
            summary: 'Test Recurring Meeting',
            description: 'Weekly recurring test meeting',
            start: this.formatDateTimeRFC3339(start),
            end: this.formatDateTimeRFC3339(end),
            timeZone: 'America/Los_Angeles',
            location: 'Recurring Meeting Room',
            recurrence: ['RRULE:FREQ=WEEKLY;COUNT=5'],
            reminders: {
                useDefault: false,
                overrides: [{ method: 'email', minutes: 1440 }],
            },
            ...overrides,
        };
    }
    static createEventWithAttendees(overrides = {}) {
        const invitee1 = process.env.INVITEE_1;
        const invitee2 = process.env.INVITEE_2;
        if (!invitee1 || !invitee2) {
            throw new Error('INVITEE_1 and INVITEE_2 environment variables are required for creating events with attendees');
        }
        return this.createSingleEvent({
            summary: 'Test Meeting with Attendees',
            attendees: [{ email: invitee1 }, { email: invitee2 }],
            ...overrides,
        });
    }
    static createColoredEvent(colorId, overrides = {}) {
        return this.createSingleEvent({
            summary: `Test Event - Color ${colorId}`,
            colorId,
            ...overrides,
        });
    }
    static getTimeRanges() {
        const now = new Date();
        return {
            pastWeek: {
                timeMin: this.formatDateTimeRFC3339WithTimezone(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
                timeMax: this.formatDateTimeRFC3339WithTimezone(now),
            },
            nextWeek: {
                timeMin: this.formatDateTimeRFC3339WithTimezone(now),
                timeMax: this.formatDateTimeRFC3339WithTimezone(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
            },
            nextMonth: {
                timeMin: this.formatDateTimeRFC3339WithTimezone(now),
                timeMax: this.formatDateTimeRFC3339WithTimezone(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)),
            },
            threeMonths: {
                timeMin: this.formatDateTimeRFC3339WithTimezone(now),
                timeMax: this.formatDateTimeRFC3339WithTimezone(new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)),
            },
        };
    }
    startTimer(operation) {
        return Date.now();
    }
    endTimer(operation, startTime, success, error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        this.performanceMetrics.push({
            operation,
            startTime,
            endTime,
            duration,
            success,
            error,
        });
    }
    getPerformanceMetrics() {
        return [...this.performanceMetrics];
    }
    clearPerformanceMetrics() {
        this.performanceMetrics = [];
    }
    addCreatedEventId(eventId) {
        this.createdEventIds.push(eventId);
    }
    getCreatedEventIds() {
        return [...this.createdEventIds];
    }
    clearCreatedEventIds() {
        this.createdEventIds = [];
    }
    addCreatedWorkspaceId(workspaceId) {
        this.createdWorkspaceIds.push(workspaceId);
    }
    getCreatedWorkspaceIds() {
        return [...this.createdWorkspaceIds];
    }
    clearCreatedWorkspaceIds() {
        this.createdWorkspaceIds = [];
    }
    static getSearchQueries() {
        return [
            'Test Integration',
            'meeting',
            'recurring',
            'attendees',
            'Conference Room',
            'nonexistent_query_should_return_empty',
        ];
    }
    static validateEventResponse(response) {
        if (!response || !response.content || !Array.isArray(response.content)) {
            return false;
        }
        const text = response.content[0]?.text;
        return typeof text === 'string';
    }
    static validateWorkspaceResponse(response) {
        if (!response || !response.content || !Array.isArray(response.content)) {
            return false;
        }
        const text = response.content[0]?.text;
        console.log('🚀 ~ validateWorkspaceResponse ~ text:', text);
        return typeof text === 'string';
    }
    static extractWorkspaceIdFromResponse(response) {
        const text = response.content[0]?.text;
        if (!text)
            return null;
        const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
        const match = text.match(pattern);
        return match ? match[1] : null;
    }
    static getInvalidTestData() {
        return {
            invalidCalendarId: 'invalid_calendar_id',
            invalidEventId: 'invalid_event_id',
            invalidTimeFormat: '2024-13-45T25:99:99Z',
            invalidTimezone: 'Invalid/Timezone',
            invalidEmail: 'not-an-email',
            invalidColorId: '999',
            malformedRecurrence: ['INVALID:RRULE'],
            futureDateInPast: '2020-01-01T10:00:00Z',
        };
    }
}
