export class TestDataFactory {
    createdIds = [];
    addCreatedId(id) {
        this.createdIds.push(id);
    }
    getCreatedIds() {
        return [...this.createdIds];
    }
    clearCreatedIds() {
        this.createdIds = [];
    }
}
export class WorkspaceDataFactory extends TestDataFactory {
    static createWorkspace(overrides = {}) {
        return {
            name: '[Integration Test] Test Workspace',
            description: 'Created by integration test suite',
            type: 'personal',
            ...overrides,
        };
    }
    static validateResponse(response) {
        if (!response || !response.content || !Array.isArray(response.content)) {
            return false;
        }
        const text = response.content[0]?.text;
        return typeof text === 'string';
    }
    static extractIdFromResponse(response) {
        const text = response.content[0]?.text;
        if (!text)
            return null;
        try {
            const parsed = JSON.parse(text);
            if (parsed.workspace?.id) {
                return parsed.workspace.id;
            }
            else if (parsed.id) {
                return parsed.id;
            }
            const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
            const match = text.match(pattern);
            return match ? match[1] : null;
        }
        catch {
            const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
            const match = text.match(pattern);
            return match ? match[1] : null;
        }
    }
}
export class EnvironmentDataFactory extends TestDataFactory {
    static createEnvironment(overrides = {}) {
        return {
            name: '[Integration Test] Test Environment',
            values: [
                { enabled: true, key: 'test_var', value: 'test_value', type: 'default' },
                { enabled: true, key: 'api_url', value: 'https://api.example.com', type: 'default' },
            ],
            ...overrides,
        };
    }
    static createMinimalEnvironment(overrides = {}) {
        return {
            name: '[Integration Test] Minimal Environment',
            ...overrides,
        };
    }
    static validateResponse(response) {
        if (!response || !response.content || !Array.isArray(response.content)) {
            return false;
        }
        const text = response.content[0]?.text;
        return typeof text === 'string';
    }
    static extractIdFromResponse(response) {
        const text = response.content[0]?.text;
        if (!text)
            return null;
        try {
            const parsed = JSON.parse(text);
            if (parsed.environment?.id) {
                return parsed.environment.id;
            }
            else if (parsed.id) {
                return parsed.id;
            }
            const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
            const match = text.match(pattern);
            return match ? match[1] : null;
        }
        catch {
            const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
            const match = text.match(pattern);
            return match ? match[1] : null;
        }
    }
}
