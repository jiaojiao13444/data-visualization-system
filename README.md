# 数据可视化电商平台监控系统
## 效果展示
### 全屏（明亮主题）
![全屏-light](https://user-images.githubusercontent.com/56499398/159119128-d05d9e7b-f940-46e7-aea4-5e669cb674e4.gif)
### 全屏（黑暗主题）
![全屏-dark](https://user-images.githubusercontent.com/56499398/159119157-17d5d34f-1f33-48c1-a552-3e1be940959c.gif)
### 商品销量趋势组件
![trend-light](https://user-images.githubusercontent.com/56499398/159119185-4f0579fd-7c83-4b6d-881f-ecdc0e0a6520.gif)
### 商家分布组件
![map-light](https://user-images.githubusercontent.com/56499398/159119214-2fb33c29-b08b-48e2-ae2f-3db03640cdf5.gif)
### 热销商品销售占比组件
![hotproduct-light](https://user-images.githubusercontent.com/56499398/159119255-fa1a7055-99a7-437c-973f-24e9ff3a8368.gif)
### 商家销售统计组件
![sales-light](https://user-images.githubusercontent.com/56499398/159119269-57a56902-ce15-400f-afcc-8805c279259d.gif)
### 地区销量排行组件
![rank-light](https://user-images.githubusercontent.com/56499398/159119278-7825f47a-4afc-4c15-8461-4095747f233d.gif)
### 库存与销量统计组件
![stock-light](https://user-images.githubusercontent.com/56499398/159119286-5eb0cfe6-2bc7-438b-be47-baee5013c5d1.gif)
## 项目结构与技术栈
### 后端服务器
使用koa2（基于node.js平台的框架）搭建，一个比较简单的服务器
### 数据来源
事先准备好的/狗头，没有使用数据库，而是直接把数据文件放在服务器上
### 前端
- 使用vue2及vue脚手架搭建，使用Echarts绘制图表
- 组件结构：六个图表组件都是HomePage组件的子组件，切换全屏时没有路由跳转，而是直接修改css样式使其全屏展示并覆盖其他组件
- 皮肤主题切换：使用echarts的两套主题vintage（明亮）和chalk（黑暗），利用vuex保存主题状态，所有组件监视主题状态的变化(watch)，一旦变化就重新渲染，而使用原生html写的部分则使用computed监视主题变化并改变样式
```js
export default new Vuex.Store({
  state: {
    theme: 'vintage'
  },
  mutations: {
    changeTheme (state) {
      if (state.theme === 'chalk') {
        state.theme = 'vintage'
      } else {
        state.theme = 'chalk'
      }
    }
  },
  actions: {
  },
  modules: {
  }
})
```
