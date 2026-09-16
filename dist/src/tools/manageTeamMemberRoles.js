import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'manageTeamMemberRoles';
export const title = 'Manage team member roles';
export const description = "Adds or removes roles in bulk for users, groups, teams, and organizations within a team.\nRemoving a role from a group or a team strips that role's permissions from every member\nof it at once, so the blast radius is much larger than the size of the request body.\nThis changes who can do what. Only call it on an explicit instruction naming the\nentities and roles involved, and read the current state with getTeam\n(\\`include=userRoles\\`) first so you can describe what will change.\n";
export const parameters = z.object({
    teamId: z.number().int().describe("The team's ID."),
    identifierType: z
        .string()
        .describe('Use SCIM user and group IDs instead of Postman user IDs.')
        .optional(),
    add: z
        .object({
        users: z
            .object({
            '{{userId}}': z
                .array(z.preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum([
                'TEAM_MANAGER',
                'TEAM_DEVELOPER',
                'TEAM_GUEST_DEVELOPER',
                'TEAM_GUEST_VIEWER',
                'TEAM_PARTNER_MANAGER',
                'TEAM_PARTNER_LEAD',
                'TEAM_GUEST',
                'TEAM_PARTNER',
                'TEAM_COMMUNITY_MANAGER',
            ])))
                .describe("A list of the user's roles. The array's name is the user's ID.")
                .optional(),
        })
            .describe('The role assignments to add, keyed by user ID.')
            .optional(),
        groups: z
            .object({
            '{{userGroupId}}': z
                .array(z.preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum([
                'TEAM_MANAGER',
                'TEAM_DEVELOPER',
                'TEAM_GUEST_DEVELOPER',
                'TEAM_GUEST_VIEWER',
                'TEAM_PARTNER_MANAGER',
                'TEAM_PARTNER_LEAD',
                'TEAM_GUEST',
                'TEAM_PARTNER',
                'TEAM_COMMUNITY_MANAGER',
            ])))
                .describe("A list of the user group's roles. The array's name is the group's ID.")
                .optional(),
        })
            .describe('The role assignments to add, keyed by user group ID.')
            .optional(),
        orgs: z
            .object({
            '{{orgId}}': z
                .array(z.preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum([
                'TEAM_MANAGER',
                'TEAM_DEVELOPER',
                'TEAM_GUEST_DEVELOPER',
                'TEAM_GUEST_VIEWER',
                'TEAM_PARTNER_MANAGER',
                'TEAM_PARTNER_LEAD',
                'TEAM_GUEST',
                'TEAM_PARTNER',
                'TEAM_COMMUNITY_MANAGER',
            ])))
                .describe("A list of the organization's roles. The array's name is the organization's ID.")
                .optional(),
        })
            .describe('The role assignments to add, keyed by organization ID.')
            .optional(),
        teams: z
            .object({
            '{{teamId}}': z
                .array(z.preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum([
                'TEAM_MANAGER',
                'TEAM_DEVELOPER',
                'TEAM_GUEST_DEVELOPER',
                'TEAM_GUEST_VIEWER',
                'TEAM_PARTNER_MANAGER',
                'TEAM_PARTNER_LEAD',
                'TEAM_GUEST',
                'TEAM_PARTNER',
                'TEAM_COMMUNITY_MANAGER',
            ])))
                .describe("A list of the team's roles. The array's name is the team's ID.")
                .optional(),
        })
            .describe('The role assignments to add, keyed by team ID.')
            .optional(),
    })
        .describe('The role assignments to add.')
        .optional(),
    remove: z
        .object({
        users: z
            .object({
            '{{userId}}': z
                .array(z.preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum([
                'TEAM_MANAGER',
                'TEAM_DEVELOPER',
                'TEAM_GUEST_DEVELOPER',
                'TEAM_GUEST_VIEWER',
                'TEAM_PARTNER_MANAGER',
                'TEAM_PARTNER_LEAD',
                'TEAM_GUEST',
                'TEAM_PARTNER',
                'TEAM_COMMUNITY_MANAGER',
            ])))
                .describe("A list of the user's roles. The array's name is the user's ID.")
                .optional(),
        })
            .describe('The role assignments to remove, keyed by user ID.')
            .optional(),
        groups: z
            .object({
            '{{userGroupId}}': z
                .array(z.preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum([
                'TEAM_MANAGER',
                'TEAM_DEVELOPER',
                'TEAM_GUEST_DEVELOPER',
                'TEAM_GUEST_VIEWER',
                'TEAM_PARTNER_MANAGER',
                'TEAM_PARTNER_LEAD',
                'TEAM_GUEST',
                'TEAM_PARTNER',
                'TEAM_COMMUNITY_MANAGER',
            ])))
                .describe("A list of the user group's roles. The array's name is the group's ID.")
                .optional(),
        })
            .describe('The role assignments to remove, keyed by user group ID.')
            .optional(),
        orgs: z
            .object({
            '{{orgId}}': z
                .array(z.preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum([
                'TEAM_MANAGER',
                'TEAM_DEVELOPER',
                'TEAM_GUEST_DEVELOPER',
                'TEAM_GUEST_VIEWER',
                'TEAM_PARTNER_MANAGER',
                'TEAM_PARTNER_LEAD',
                'TEAM_GUEST',
                'TEAM_PARTNER',
                'TEAM_COMMUNITY_MANAGER',
            ])))
                .describe("A list of the organization's roles. The array's name is the organization's ID.")
                .optional(),
        })
            .describe('The role assignments to remove, keyed by organization ID.')
            .optional(),
        teams: z
            .object({
            '{{teamId}}': z
                .array(z.preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum([
                'TEAM_MANAGER',
                'TEAM_DEVELOPER',
                'TEAM_GUEST_DEVELOPER',
                'TEAM_GUEST_VIEWER',
                'TEAM_PARTNER_MANAGER',
                'TEAM_PARTNER_LEAD',
                'TEAM_GUEST',
                'TEAM_PARTNER',
                'TEAM_COMMUNITY_MANAGER',
            ])))
                .describe("A list of the team's roles. The array's name is the team's ID.")
                .optional(),
        })
            .describe('The role assignments to remove, keyed by team ID.')
            .optional(),
    })
        .describe('The role assignments to remove.')
        .optional(),
});
export const annotations = {
    title: 'Manage team member roles',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/teams/${encodeURIComponent(String(args.teamId))}/bulk-members`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.add !== undefined)
            bodyPayload.add = args.add;
        if (args.remove !== undefined)
            bodyPayload.remove = args.remove;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            headers: extra.headers,
        };
        const result = await extra.client.post(url, options);
        return {
            content: [
                {
                    type: 'text',
                    text: `${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`,
                },
            ],
        };
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
