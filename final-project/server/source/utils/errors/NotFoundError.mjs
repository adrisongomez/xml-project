const NOT_FOUND_TYPE = "NotFoundError";
export default class NotFoundError extends Error {
  __error_type = NOT_FOUND_TYPE;
  constructor() {
    super("Error not found resource on DB");
  }
}

/**
 *
 * @param {*} error
 * @returns {error is NotFoundError}
 */
export function isNotFoundError(error) {
  return error?.__error_type === NOT_FOUND_TYPE;
}
