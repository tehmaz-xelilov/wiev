/**
 * Robust post-install patch for @whiskeysockets/baileys
 * Forces Android spoofing regardless of current state.
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
            secondary: 24,
            tertiary: 13,
            quaternary: 77
        },
        platform: proto.ClientPayload.UserAgent.Platform.ANDROID,
        releaseChannel: proto.ClientPayload.UserAgent.ReleaseChannel.RELEASE,
        osVersion: '14',
        manufacturer: 'Google',
        device: 'Pixel 8 Pro', 
        osBuildNumber: 'UD1A.231105.004',
        deviceBoard: 'shiba',
        deviceType: proto.ClientPayload.UserAgent.DeviceType.PHONE,
        phoneId: crypto.randomUUID(),
        localeLanguageIso6391: 'en',
        mnc: '001',
        mcc: '310',
        localeCountryIso31661Alpha2: 'US'
    };
};`

src = src.replace(/const getUserAgent = \(config\) => \{[\s\S]*?\};/, newUserAgent)

// 3. Force replacement of getWebInfo
const newWebInfo = `const getWebInfo = (config) => {
    return undefined;
};`

src = src.replace(/const getWebInfo = \(config\) => \{[\s\S]*?\};/, newWebInfo)

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
};`

src = src.replace(/const getClientPayload = \(config\) => \{[\s\S]*?\};/, newClientPayload)

// 5. Force replacement of getPlatformType
const newGetPlatformType = `const getPlatformType = (platform) => {
    return proto.DeviceProps.PlatformType.ANDROID_PHONE;
};`

src = src.replace(/const getPlatformType = \(platform\) => \{[\s\S]*?\};/, newGetPlatformType)

writeFileSync(TARGET, src)

console.log('--------------------------------------------------')
console.log('SUCCESS: Baileys patched successfully (Robust Mode).')
console.log(`Target: ${TARGET}`)
console.log('Current Spoof: Android, Pixel 8 Pro, v2.24.13.77')
console.log('--------------------------------------------------\n')
