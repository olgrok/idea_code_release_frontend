export function ParseCookie() {
  const decodedCookie: string = decodeURIComponent(document.cookie)
  const ca: string[] = decodedCookie.split(';')
  const CookieMap: Map<string, string> = new Map()

  for (let i = 0; i < ca.length; i++) {
    const ca_elem: string[] = ca[i].split('=')
    while (ca_elem[0][0] == ' ' && ca_elem[0].length > 0) {
      ca_elem[0] = ca_elem[0].substring(1)
    }

    CookieMap.set(ca_elem[0], ca_elem[1])
  }

  return CookieMap
}

export function SetCookie(key: string, value: string) {
  document.cookie = key + '=' + value
}

export function CheckCookie(key: string) {
  return ParseCookie().get(key) != undefined
}

export function GetCookie(key: string) {
  return ParseCookie().get(key)
}
