/**
 * Fixed robust post-install patch for @whiskeysockets/baileys
 * Handles syntax correctly by avoiding leftover braces.
 */
import { readFileSync, writeFileSync } from 'fs'

const TARGET = './node_modules/@whiskeysockets/baileys/lib/Utils/validate-connection.js'
let src = readFileSync(TARGET, 'utf-8')

// 1. Add crypto import if missing
if (!src.includes("import crypto") && !src.includes("import { randomUUID }")) {
    src = `import crypto from 'crypto';\n` + src
}

// 2. Force replacement of getUserAgent (matching until PLATFORM_MAP)
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
        manufacturer: 'Google',
        device: 'Pixel 7 Pro', 
        osBuildNumber: 'TQ3A.230901.001',
        deviceBoard: 'cheetah',
        deviceType: proto.ClientPayload.UserAgent.DeviceType.PHONE,
        phoneId: crypto.randomUUID(),
        localeLanguageIso6391: 'en',
        mnc: '001',
        mcc: '310',
        localeCountryIso31661Alpha2: 'US'
    };
};
`
src = src.replace(/const getUserAgent = \(config\) => \{[\s\S]*?const PLATFORM_MAP/, newUserAgent + 'const PLATFORM_MAP')

// 3. Force replacement of getWebInfo (matching until getClientPayload)
const newWebInfo = `const getWebInfo = (config) => {
    return undefined;
};
`
src = src.replace(/const getWebInfo = \(config\) => \{[\s\S]*?const getClientPayload/, newWebInfo + 'const getClientPayload')

// 4. Force replacement of getClientPayload (matching until generateLoginNode)
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

// 5. Force replacement of getPlatformType (matching until generateRegistrationNode)
const newGetPlatformType = `const getPlatformType = (platform) => {
    return proto.DeviceProps.PlatformType.ANDROID_PHONE;
};
`
src = src.replace(/const getPlatformType = \(platform\) => \{[\s\S]*?export const generateRegistrationNode/, newGetPlatformType + 'export const generateRegistrationNode')

writeFileSync(TARGET, src)

console.log('--------------------------------------------------')
console.log('SUCCESS: Baileys patched successfully (Fixed Robust Mode).')
console.log(`Target: ${TARGET}`)
console.log('Current Spoof: Android, Pixel 7 Pro, v2.24.12.78')
console.log('--------------------------------------------------\n')
