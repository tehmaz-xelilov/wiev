/**
 * Fixed robust post-install patch for @whiskeysockets/baileys
 * Uses a static phoneId to avoid session rejection.
 */
import { readFileSync, writeFileSync } from 'fs'

const TARGET = './node_modules/@whiskeysockets/baileys/lib/Utils/validate-connection.js'
let src = readFileSync(TARGET, 'utf-8')

// 1. Add crypto import if missing
if (!src.includes("import crypto") && !src.includes("import { randomUUID }")) {
    src = `import crypto from 'crypto';\n` + src
}

// 2. Force replacement of getUserAgent
const newUserAgent = `const getUserAgent = (config) => {
    return {
        appVersion: {
            primary: 2,
            secondary: 26,
            tertiary: 16,
            quaternary: 73
        },
        platform: proto.ClientPayload.UserAgent.Platform.ANDROID,
        releaseChannel: proto.ClientPayload.UserAgent.ReleaseChannel.RELEASE,
        osVersion: '13',
        manufacturer: 'Google',
        device: 'Pixel 7', 
        osBuildNumber: 'TQ3A.230901.001',
        deviceBoard: 'cheetah',
        deviceType: proto.ClientPayload.UserAgent.DeviceType.PHONE,
        phoneId: '5f3e4e1a-8c9d-4b2a-a1b2-c3d4e5f6g7h8', // Static ID
        localeLanguageIso6391: 'en',
        mnc: '001',
        mcc: '310',
        localeCountryIso31661Alpha2: 'US'
    };
};
`
src = src.replace(/const getUserAgent = \(config\) => \{[\s\S]*?const PLATFORM_MAP/, newUserAgent + 'const PLATFORM_MAP')

// 3. Force replacement of getWebInfo
const newWebInfo = `const getWebInfo = (config) => {
    return undefined;
};
`
src = src.replace(/const getWebInfo = \(config\) => \{[\s\S]*?const getClientPayload/, newWebInfo + 'const getClientPayload')

// 4. Force replacement of getClientPayload
const newClientPayload = `const getClientPayload = (config) => {
    const payload = {
        connectType: proto.ClientPayload.ConnectType.WIFI_UNKNOWN,
        connectReason: proto.ClientPayload.ConnectReason.USER_ACTIVATED,
        userAgent: getUserAgent(config)
    };
    const webInfo = getWebInfo(config);
    if (webInfo) payload.webInfo = webInfo;
    return payload;
};
`
src = src.replace(/const getClientPayload = \(config\) => \{[\s\S]*?export const generateLoginNode/, newClientPayload + 'export const generateLoginNode')

// 5. Force replacement of getPlatformType
const newGetPlatformType = `const getPlatformType = (platform) => {
    return proto.DeviceProps.PlatformType.ANDROID_PHONE;
};
`
src = src.replace(/const getPlatformType = \(platform\) => \{[\s\S]*?export const generateRegistrationNode/, newGetPlatformType + 'export const generateRegistrationNode')

writeFileSync(TARGET, src)

console.log('--------------------------------------------------')
console.log('SUCCESS: Baileys patched successfully (Static ID Mode).')
console.log(`Target: ${TARGET}`)
console.log('Current Spoof: Android, Pixel 7, v2.26.16.73')
console.log('--------------------------------------------------\n')
