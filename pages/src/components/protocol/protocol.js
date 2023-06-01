import './protocol.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'
import Request from '../../request.ts';
import { useHistory } from 'react-router-dom';


function App() {
  const [language, setLanguage] = useState(get_default_language());
  const navigate = useHistory()

  const goToHome = () => {
    navigate.push('/')
  }

  return (
    <div className='protocol-container'>
      <div className='protocol-header' onClick={goToHome}><img src={require("../../assets/logo.png")} alt=""/></div>
      <div>
        <p className='protocol-title'>免责声明</p>
        <div className='protocol-content'>
            <p>感谢您使用我们开发的AI工具ChatTEN（以下简称“ChatTEN”）。在使用ChatTEN之前，请仔细阅读并理解以下免责声明。您使用ChatTEN即表示您同意并接受本免责声明的条款和条件。</p>
            <br />
            <p>1.工具性质</p>
            <p>ChatTEN是基于OpenAI的ChatGPT API接口开发的，并接入了区块链技术作为底层支持。它旨在提供智能交互和信息辅助功能，但无法替代人类判断和专业意见。请注意，ChatTEN提供的信息仅供参考，并不构成法律、医疗、金融或任何其他专业领域的建议。在作出任何决策或行动之前，请咨询相关专业人士的意见。</p>
            
            <br />
            <p>2.免责声明</p>
            <p>2.1 准确性和完整性</p>
            <p>尽管我们已经努力确保ChatTEN提供的信息准确、及时和完整，但我们无法保证其准确性和完整性。ChatTEN的结果可能受到多种因素的影响，包括但不限于输入的问题、数据来源的可靠性和ChatTEN本身的局限性。因此，我们不承担因依赖ChatTEN提供的信息而导致的任何损失或损害的责任。</p>

            <br />
            <p>2.2 使用风险 </p>
            <p>使用ChatTEN的风险由用户自行承担。ChatTEN的使用可能会受到各种因素的干扰和中断，包括但不限于技术故障、网络连接问题和系统维护。我们不对因使用ChatTEN而导致的任何直接或间接损失或损害承担责任。</p>

            <br />
            <p>2.3 第三方内容和链接</p>
            <p>ChatTEN可能包含指向第三方网站、资源或信息的链接。这些链接仅为用户方便提供，并不意味着我们对链接指向的网站、资源或信息的认可或责任。用户在访问和使用这些链接时应自行判断和承担风险。</p>

            <br />
            <p>3.知识产权</p>
            <p>ChatTEN中的所有知识产权归我们或我们的许可方所有。未经我们明确授权，用户不得以任何方式复制、修改、传播、出售或利用ChatTEN中的任何部分。</p>

            <br />
            <p>4.隐私和数据安全</p>
            <p>我们致力于保护用户的隐私和数据安全。在使用ChatTEN过程中，我们可能会收集和处理用户的一些个人信息。我们将按照适用的隐私政策和法律规定处理和保护用户的个人信息。但请注意，由于技术的限制和互联网的不确定性，我们无法完全保证用户信息的绝对安全。用户在使用ChatTEN时应自行承担风险。</p>

            <br />
            <p>5.适用法律和管辖权</p>
            <p>本免责声明的解释、有效性、执行和纠纷解决应适用于您所在地的法律。任何因使用ChatTEN而产生的争议，双方应尽力通过友好协商解决。如协商不成，双方同意将争议提交至有管辖权的法院解决。</p>

            <br />
            <p>6.免责声明的变更</p>
            <p>我们保留随时修改或更新本免责声明的权利。任何修改或更新将在ChatTEN上公布，并自公布之时起生效。用户继续使用ChatTEN将被视为接受修改后的免责声明。</p>

            <br />
            <p>请您在使用ChatTEN之前认真阅读并理解本免责声明。如果您对本免责声明有任何疑问或异议，请立即停止使用。</p>
        </div>
      </div>
    </div>

  );
}

export default App;
