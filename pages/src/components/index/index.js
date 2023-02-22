import './index.css'
import Header from '../headerBox/header.js'
import Content from '../contentBox/content.js'
import Footer from '../footerBox/footer.js'


function App() {
  return (
    <div className="indexBox">
        {/* header */}
        <Header></Header>
        {/* content */}
        <Content></Content>
        {/* chouti */}
        {/* <LeftBox></LeftBox> */}
        {/* footer */}
        <Footer></Footer>

    </div>
  );
}

export default App;
