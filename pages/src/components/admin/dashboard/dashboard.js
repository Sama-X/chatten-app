import './dashboard.css'

import React, { useEffect, useState } from 'react';
import Request from '../../../requestAdmin.ts';
import * as echarts from 'echarts/core';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  } from 'echarts/components';
import { LineChart} from 'echarts/charts';
echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    LineChart,
    CanvasRenderer,
    LabelLayout,
    GridComponent
  ]);


const App = () => {
  let request = new Request({});

  const [overviewData, setOverviewData] = useState({});

  const overview = () => {
    request.get('/api/v1/admin/summary/').then((res)=>{
      console.log("overview=", res.data)
      setOverviewData({...res.data})
    })
  }

  const dailyTrend = () => {
    
    let dailyTrend_exist = echarts.getInstanceByDom(document.getElementById("overview-top-item-chart"));
    if (dailyTrend_exist !== undefined) {
        return
    }

    let dailyTrend = echarts.init(document.getElementById("overview-top-item-chart"), {renderer: 'svg'}, {devicePixelRatio: 2.5})

    request.get('/api/v1/admin/summary/daily/').then((res)=>{

        console.log(res.data)
        // console.log(res,'waterUnitwaterUnit')
        var data = []
        var data1 = []
        var data2 = []
        var data3 = []
        var data4 = []

        for(var i=0; i<res.data.length; i++){
          data.push(res.data[i].date)
          data1.push(res.data[i].register_user)
          data2.push(res.data[i].usage_total)
          data3.push(res.data[i].recharge_count)
          data4.push(res.data[i].recharge_amount)
        }

        // let data1 = [820, 932, 901, 934, 1290, 1330, 1320];
        // let data2 = [300, 400, 200, 100, 600, 380, 540];

        let option = {
            title: {
              text: '数据趋势'
            },
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              data: ['注册用户数', '咨询使用次数', '充值订单数', '充值金额']
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: data
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                name: '注册用户数',
                type: 'line',
                data: data1
              },
              {
                name: '咨询使用次数',
                type: 'line',
                data: data2
              },
              {
                name: '充值订单数',
                type: 'line',
                data: data3
              },
              {
                name: '充值金额',
                type: 'line',
                data: data4
              }
            ]
        };
      
      dailyTrend.setOption(option)
    })
  }

  useEffect(()=>{
    overview()
    dailyTrend()
  }, [])

  return (

    <div className='overview-container'>
      <div className="overview-header">
        <div className="overview-title">数据概览</div>
        <div className="overview-num-list">
          <div className="overview-num-item">
            <div className="overview-num-item-title">注册用户数</div>
            <div className="overview-num-item-value">{overviewData.register_user}</div>
          </div>
          <div className="overview-num-item">
            <div className="overview-num-item-title">咨询使用次数</div>
            <div className="overview-num-item-value">{overviewData.usage_total}</div>
          </div>
          <div className="overview-num-item">
            <div className="overview-num-item-title">充值订单数</div>
            <div className="overview-num-item-value">{overviewData.recharge_count}</div>
          </div>
          <div className="overview-num-item">
            <div className="overview-num-item-title">充值金额</div>
            <div className="overview-num-item-value">{overviewData.recharge_amount}</div>
          </div>
        </div>
      </div>

      <div className="overview-trend">
            <div className="overview-topn-item-title">每日趋势</div>
            <div className="overview-topn-item-chart" id="overview-top-item-chart" style={{width: '100%', height: '280px'}}></div>
      </div>

    </div>

  );
};

export default App;


