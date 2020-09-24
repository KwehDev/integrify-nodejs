export default function deconstructUrl(
  url: string
): [string, string | undefined] {
  let endpoint: string
  let queryVal: string | undefined = undefined
  if (!url.endsWith('/')) {
    const arr = url.split('/')
    queryVal = arr.pop()
    endpoint = arr.join('/') + '/'
  } else {
    endpoint = url
  }
  return [endpoint.toLowerCase(), queryVal]
}
