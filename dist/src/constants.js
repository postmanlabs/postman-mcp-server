import packageJson from '../package.json' with { type: 'json' };
export const SERVER_NAME = packageJson.name;
export const APP_VERSION = packageJson.version;
export const USER_AGENT = `${packageJson.name}/${packageJson.version}`;
