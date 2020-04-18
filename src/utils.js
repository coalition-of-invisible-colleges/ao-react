export const cancelablePromise = promise => {
  let isCanceled = false

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      value => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
      error => reject({ isCanceled, error })
    )
  })

  return {
    promise: wrappedPromise,
    cancel: () => (isCanceled = true)
  }
}
export const noop = () => {}

export const delay = n => new Promise(resolve => setTimeout(resolve, n))
