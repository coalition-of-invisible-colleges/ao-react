// import { Stream } from '@most/types'
// import { UserSession } from './types'

// export function makeApiDriver(
//   sessionR: Stream<UserSession>,
//   name: string = 'AO'
// ) {
//   // : Driver<Stream<AoAction>, ApiSelector>
//   function driver(req$: Stream<AoAction>, name: string = 'AO'):  {
//     const readR: Subject<AoResponseRead> = new Subject()
//     const session$: Stream<UserSession> = fromObservable(sessionR)
//     combine(
//       (req, session) => {
//         const { _namespace, ...act } = req
//         request
//           .post('http://localhost:8003/events')
//           .set('Authorization', session.token)
//           .send(act)
//           .then(res => {
//             readR.next({
//               _namespace,
//               type: 'ao-response',
//               payload: { ...res }
//             })
//           })
//       },
//       [req$, session$]
//     )
//     const sel = new ApiSelector(fromObservable(readR), name, [])
//     return sel
//   }
//   return driver
// }
