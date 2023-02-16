import { wrapper } from '../reducer'
import '../styles/main.scss'

function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
    </>
  )
}

export default wrapper.withRedux(App);