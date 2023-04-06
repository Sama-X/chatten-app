import './index.css'
import Header from '../headerBox/header.js'
import Content from '../contentBox/content.js'
import Footer from '../footerBox/footer.js'


function App() {
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);
  return (
    <div className="indexBox">
        {/* header */}
        <Header></Header>
        {/* content */}
        {
          isPhone ? <Content></Content> : ''
        }

        {/* chouti */}
        {/* <LeftBox></LeftBox> */}
        {/* footer */}
        {
          isPhone ? <Footer></Footer> : ''
        }
        {/* <Footer></Footer> */}

    </div>
  );
}

export default App;
