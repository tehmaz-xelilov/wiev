/**
 * Samsung S21 Profile Patch for @whiskeysockets/baileys
 * More common device profile to avoid detection.
 */
import { readFileSync, writeFileSync } from 'fs'

const TARGET = './node_modules/@whiskeysockets/baileys/lib/Utils/validate-connection.js'
let src = readFileSync(TARGET, 'utf-8')

// 1. Add crypto import if missing
if (!src.includes("import crypto") && !src.includes("import { randomUUID }")) {
    src = `import crypto from 'crypto';\n` + src
}

// 2. Force replacement of getUserAgent (Samsung S21)
const newUserAgent = `const getUserAgent = (config) => {
    return {
        appVersion: {
            primary: 2,
            secondary: 24,
            tertiary: 12,
            quaternary: 78
        },
        platform: proto.ClientPayload.UserAgent.Platform.ANDROID,
        releaseChannel: proto.ClientPayload.UserAgent.ReleaseChannel.RELEASE,
        osVersion: '13',
        manufacturer: 'Samsung',
        device: 'SM-G991B', 
        osBuildNumber: 'TP1A.220624.014',
        deviceBoard: 'exynos2100',
        deviceType: proto.ClientPayload.UserAgent.DeviceType.PHONE,
        phoneId: '5f3e4e1a-8c9d-4b2a-a1b2-c3d4e5f6g7h8',
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

// 6. Force replacement of companion version in generateRegistrationNode
const oldCompanionVersion = `version: {
            primary: 10,
            secondary: 15,
            tertiary: 7
        }`
const newCompanionVersion = `version: {
            primary: 2,
            secondary: 24,
            tertiary: 12
        }`

if (src.includes(oldCompanionVersion)) {
    src = src.replace(oldCompanionVersion, newCompanionVersion)
    console.log('Patched generateRegistrationNode: updated companion version to 2.24.12')
}

writeFileSync(TARGET, src)

console.log('--------------------------------------------------')
console.log('SUCCESS: Baileys patched successfully (Samsung S21 Mode).')
console.log(`Target: ${TARGET}`)
console.log('Current Spoof: Android, Samsung SM-G991B, v2.24.12.78')
console.log('--------------------------------------------------\n')
