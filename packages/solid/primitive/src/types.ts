/** Handle returned by `setTimeout`, for clearTimeout bookkeeping. */
export type Timeout = ReturnType<typeof setTimeout>;
/** Handle returned by `setInterval`, for clearInterval bookkeeping. */
export type Interval = ReturnType<typeof setInterval>;
/** Handle returned by `setImmediate`, for clearImmediate bookkeeping. */
export type Immediate = ReturnType<typeof setImmediate>;
