/**
 * @module
 * Cookie Helper for Hono.
 */

import type { Context } from '../../context'
import { parse, parseSigned, serialize, serializeSigned } from '../../utils/cookie'
import type { Cookie, CookieOptions, CookiePrefixOptions, SignedCookie } from '../../utils/cookie'

interface GetCookie {
  (c: Context, key: string): string | undefined
  (c: Context): Cookie
  (c: Context, key: string, prefixOptions?: CookiePrefixOptions): string | undefined
}

interface GetSignedCookie {
  (c: Context, secret: string | BufferSource, key: string): Promise<string | undefined | false>
  (c: Context, secret: string | BufferSource): Promise<SignedCookie>
  (
    c: Context,
    secret: string | BufferSource,
    key: string,
    prefixOptions?: CookiePrefixOptions
  ): Promise<string | undefined | false>
}

const getCookiePrefixName = (key: string, prefix?: CookiePrefixOptions): string => {
  if (prefix === 'secure') {
    return '__Secure-' + key
  }
  if (prefix === 'host') {
    return '__Host-' + key
  }
  if (prefix === 'http') {
    return '__Http-' + key
  }
  if (prefix === 'host-http') {
    return '__Host-Http-' + key
  }
  return key
}

export const getCookie: GetCookie = (c, key?, prefix?: CookiePrefixOptions) => {
  const cookie = c.req.raw.headers.get('Cookie')
  if (typeof key === 'string') {
    if (!cookie) {
      return undefined
    }
    const finalKey = getCookiePrefixName(key, prefix)
    const obj = parse(cookie, finalKey)
    return obj[finalKey]
  }
  if (!cookie) {
    return {}
  }
  const obj = parse(cookie)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj as any
}

export const getSignedCookie: GetSignedCookie = async (
  c,
  secret,
  key?,
  prefix?: CookiePrefixOptions
) => {
  const cookie = c.req.raw.headers.get('Cookie')
  if (typeof key === 'string') {
    if (!cookie) {
      return undefined
    }
    const finalKey = getCookiePrefixName(key, prefix)
    const obj = await parseSigned(cookie, secret, finalKey)
    return obj[finalKey]
  }
  if (!cookie) {
    return {}
  }
  const obj = await parseSigned(cookie, secret)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj as any
}

export const generateCookie = (name: string, value: string, opt?: CookieOptions): string => {
  // Cookie names prefixed with __Secure- can be used only if they are set with the secure attribute.
  // Cookie names prefixed with __Host- can be used only if they are set with the secure attribute, must have a path of / (meaning any path at the host)
  // and must not have a Domain attribute.
  // Cookie names prefixed with __Http- and __Host-Http- additionally require the HttpOnly attribute.
  // Read more at https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#cookie_prefixes'
  let cookie
  if (opt?.prefix === 'secure') {
    cookie = serialize('__Secure-' + name, value, { path: '/', ...opt, secure: true })
  } else if (opt?.prefix === 'host') {
    cookie = serialize('__Host-' + name, value, {
      ...opt,
      path: '/',
      secure: true,
      domain: undefined,
    })
  } else if (opt?.prefix === 'http') {
    cookie = serialize('__Http-' + name, value, {
      path: '/',
      ...opt,
      secure: true,
      httpOnly: true,
    })
  } else if (opt?.prefix === 'host-http') {
    cookie = serialize('__Host-Http-' + name, value, {
      ...opt,
      path: '/',
      secure: true,
      httpOnly: true,
      domain: undefined,
    })
  } else {
    cookie = serialize(name, value, { path: '/', ...opt })
  }
  return cookie
}

export const setCookie = (c: Context, name: string, value: string, opt?: CookieOptions): void => {
  const cookie = generateCookie(name, value, opt)
  c.header('Set-Cookie', cookie, { append: true })
}

export const generateSignedCookie = async (
  name: string,
  value: string,
  secret: string | BufferSource,
  opt?: CookieOptions
): Promise<string> => {
  let cookie
  if (opt?.prefix === 'secure') {
    cookie = await serializeSigned('__Secure-' + name, value, secret, {
      path: '/',
      ...opt,
      secure: true,
    })
  } else if (opt?.prefix === 'host') {
    cookie = await serializeSigned('__Host-' + name, value, secret, {
      ...opt,
      path: '/',
      secure: true,
      domain: undefined,
    })
  } else if (opt?.prefix === 'http') {
    cookie = await serializeSigned('__Http-' + name, value, secret, {
      path: '/',
      ...opt,
      secure: true,
      httpOnly: true,
    })
  } else if (opt?.prefix === 'host-http') {
    cookie = await serializeSigned('__Host-Http-' + name, value, secret, {
      ...opt,
      path: '/',
      secure: true,
      httpOnly: true,
      domain: undefined,
    })
  } else {
    cookie = await serializeSigned(name, value, secret, { path: '/', ...opt })
  }
  return cookie
}

export const setSignedCookie = async (
  c: Context,
  name: string,
  value: string,
  secret: string | BufferSource,
  opt?: CookieOptions
): Promise<void> => {
  const cookie = await generateSignedCookie(name, value, secret, opt)
  c.header('set-cookie', cookie, { append: true })
}

export const deleteCookie = (c: Context, name: string, opt?: CookieOptions): string | undefined => {
  const deletedCookie = getCookie(c, name, opt?.prefix)
  setCookie(c, name, '', { ...opt, maxAge: 0 })
  return deletedCookie
}
