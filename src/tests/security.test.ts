import { describe, it, expect, vi } from 'vitest';
import { handler as getEnvironmentHandler } from '../tools/getEnvironment';
import { handler as getEnvironmentsHandler } from '../tools/getEnvironments';
import { handler as deleteCollectionHandler } from '../tools/deleteCollection';

describe('MCP Postman Server Security Hardening', () => {
  
  const mockClient = {
    get: vi.fn(),
    delete: vi.fn(),
  };

  describe('Secret Redaction (getEnvironment - Singular)', () => {
    // 1. Positive: Basic Redaction
    it('should redact variables marked as secret', async () => {
      mockClient.get.mockResolvedValue({
        environment: {
          values: [{ key: 'api_key', value: 'secret-123', type: 'secret' }]
        }
      });
      const result = await getEnvironmentHandler({ environmentId: '123' }, { client: mockClient as any });
      expect(result.content[0].text).toContain('***REDACTED BY MCP SERVER***');
      expect(result.content[0].text).not.toContain('secret-123');
    });

    // 2. Positive: Initial Value Redaction
    it('should redact both value AND initial_value for secrets', async () => {
      mockClient.get.mockResolvedValue({
        environment: {
          values: [
            { 
              key: 'db_pass', 
              value: 'current-top-secret', 
              initial_value: 'original-top-secret', 
              type: 'secret' 
            }
          ]
        }
      });

      const result = await getEnvironmentHandler(
        { environmentId: '123' }, 
        { client: mockClient as any }
      );

      const text = result.content[0].text;
      
      // Check for the unique secret values, not substrings of keys
      expect(text).not.toContain('current-top-secret');
      expect(text).not.toContain('original-top-secret');
      
      // Verify redaction markers are present
      const matches = text.match(/\*\*\*REDACTED BY MCP SERVER\*\*\*/g);
      expect(matches?.length).toBe(2);
    });

    // 3. Negative: Integrity Check
    it('should NOT redact variables with type "text"', async () => {
      mockClient.get.mockResolvedValue({
        environment: {
          values: [{ key: 'url', value: 'https://api.com', type: 'text' }]
        }
      });
      const result = await getEnvironmentHandler({ environmentId: '123' }, { client: mockClient as any });
      expect(result.content[0].text).toContain('https://api.com');
    });

    // 4. Edge Case: Missing Type Field
    it('should handle variables missing the type field safely', async () => {
      mockClient.get.mockResolvedValue({
        environment: { values: [{ key: 'unknown', value: 'some-data' }] }
      });
      const result = await getEnvironmentHandler({ environmentId: '123' }, { client: mockClient as any });
      expect(result.content[0].text).toContain('some-data');
    });

    // 5. Edge Case: Missing Values Array
    it('should handle environment object with missing values array gracefully', async () => {
      mockClient.get.mockResolvedValue({ environment: { name: 'Empty' } });
      const result = await getEnvironmentHandler({ environmentId: '123' }, { client: mockClient as any });
      expect(result.content[0].text).toContain('Empty');
    });

    // 6. Edge Case: Non-JSON Response
    it('should return raw string if API returns non-JSON', async () => {
      mockClient.get.mockResolvedValue("Error 500");
      const result = await getEnvironmentHandler({ environmentId: '123' }, { client: mockClient as any });
      expect(result.content[0].text).toBe("Error 500");
    });
  });

  describe('Bulk Redaction (getEnvironments - Plural)', () => {
    // 7. Positive: Multi-Environment Redaction
    it('should redact secrets across all environments in a list', async () => {
      mockClient.get.mockResolvedValue({
        environments: [
          { name: 'Env1', values: [{ key: 'k1', value: 's1', type: 'secret' }] },
          { name: 'Env2', values: [{ key: 'k2', value: 's2', type: 'secret' }] }
        ]
      });
      const result = await getEnvironmentsHandler({ workspace: 'ws1' }, { client: mockClient as any });
      expect(result.content[0].text).not.toContain('s1');
      expect(result.content[0].text).not.toContain('s2');
      expect(result.content[0].text.match(/\*\*\*REDACTED/g)).toHaveLength(2);
    });
  });

  describe('Destructive Action Guardrails (deleteCollection)', () => {
    // 8. Positive: Block if False
    it('should throw an error if confirmDeletion is false', async () => {
      await expect(deleteCollectionHandler({ collectionId: '123', confirmDeletion: false }, { client: mockClient as any }))
        .rejects.toThrow('Destructive Action Blocked');
    });

    // 9. Negative: Block if Truthy String
    it('should block if confirmDeletion is a string "true"', async () => {
      await expect(deleteCollectionHandler({ collectionId: '123', confirmDeletion: "true" as any }, { client: mockClient as any }))
        .rejects.toThrow('Destructive Action Blocked');
    });

    // 10. Negative: Block if Omitted
    it('should block if confirmDeletion is omitted', async () => {
      await expect(deleteCollectionHandler({ collectionId: '123' } as any, { client: mockClient as any }))
        .rejects.toThrow('Destructive Action Blocked');
    });

    // 11. Positive: Pass if True
    it('should proceed only when confirmDeletion is strictly true', async () => {
      mockClient.delete.mockResolvedValue({ status: 'deleted' });
      const result = await deleteCollectionHandler({ collectionId: '123', confirmDeletion: true }, { client: mockClient as any });
      expect(result.content[0].text).toContain('deleted');
    });
  });
});