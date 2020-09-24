export default function deconstructPath(
  path: string
): [string, string | undefined] {
  let endpoint: string
  let queryParam: string | undefined = undefined
  if (path.includes(':')) {
    ;[endpoint, queryParam] = path.split(':')
  } else {
    endpoint = path
  }
  return [endpoint.toLowerCase(), queryParam]
}
