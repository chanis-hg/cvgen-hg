const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|TikTok|musical_ly|Snapchat|Line\/|; wv\)/i;

export function isInAppBrowser(userAgent = navigator.userAgent) {
  return IN_APP.test(userAgent);
}
